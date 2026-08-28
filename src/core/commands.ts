import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  config,
  ONE_MINUTE,
  padStr,
  formatTime,
  modeIcons,
  FOCUS_TIME,
  SHORT_BREAK_TIME,
  LONG_BREAK_TIME,
  HEADLESS_VERB,
} from "@utils";
import type { Mode } from "@types";
import { probeOwner, sendCommand, type CommandName } from "./client";
import { claimOwnership, serve, shutdown } from "./server";
import { Session, type SessionInit } from "./session";
import { readState, type PomoState } from "./state";

export type StartOptions = {
  focus?: number | undefined;
  shortBreak?: number | undefined;
  longBreak?: number | undefined;
  tag?: string | undefined;
  description?: string | undefined;
};

const MODE_LABELS: Record<Mode, string> = {
  work: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

const clock = (seconds: number): string =>
  `${padStr(Math.floor(seconds / ONE_MINUTE))}:${padStr(seconds % ONE_MINUTE)}`;

export const formatState = (state: PomoState): string => {
  const today = `Today: ${state.today.completedPomodoros} pomodoro(s) · ${formatTime(
    state.today.focusSeconds,
  )}`;

  if (!state.running) return `No session running.\n${today}`;

  const label = MODE_LABELS[state.mode];
  const tag = state.tag ? ` · ${state.tag}` : "";
  const paused = state.paused ? " (paused)" : "";
  const percent = Math.round(state.progress * 100);

  return [
    `${modeIcons[state.mode]} ${label}${tag}${paused}`,
    `${clock(state.secondsRemaining)} · ${percent}% · ${state.pomodoroCount} completed this session`,
    today,
  ].join("\n");
};

const resolveDurations = (options: StartOptions): SessionInit => {
  // An explicit flag wins; otherwise reuse the last session's shape so
  // `pomo start` from the bar matches how you actually work.
  const last = config.get("activeSession");

  const shortBreak = options.shortBreak ?? last?.shortBreak ?? SHORT_BREAK_TIME;

  return {
    focus: options.focus ?? last?.focus ?? FOCUS_TIME,
    shortBreak,
    longBreak:
      options.longBreak ??
      last?.longBreak ??
      (options.shortBreak ? options.shortBreak * 3 : LONG_BREAK_TIME),
    tag: options.tag ?? last?.tag,
    description: options.description ?? last?.description,
    owner: "headless",
  };
};

/**
 * Become the detached owner: claim the socket, run the clock, serve commands.
 * Never returns while the session is alive.
 */
export const runHeadless = async (options: StartOptions): Promise<void> => {
  const server = await claimOwnership();

  if (!server) {
    // Another owner won the race between the parent's probe and this spawn.
    process.exit(0);
  }

  const session = new Session(resolveDurations(options));
  serve(server, session);
  session.start();

  process.on("uncaughtException", (err) => {
    console.error(err);
    shutdown(server, session, 1);
  });
};

const headlessArgs = (options: StartOptions): string[] => {
  const args = [HEADLESS_VERB];
  if (options.focus !== undefined) args.push("--work", String(options.focus));
  if (options.shortBreak !== undefined)
    args.push("--break", String(options.shortBreak));
  if (options.longBreak !== undefined)
    args.push("--long-break", String(options.longBreak));
  if (options.tag !== undefined) args.push("--tag", options.tag);
  if (options.description !== undefined)
    args.push("--description", options.description);
  return args;
};

const entryScript = (): string => {
  const argv1 = process.argv[1];
  if (argv1) return argv1;
  // tsx / direct-import fallback: resolve this bundle's own entry.
  return fileURLToPath(new URL("../cli.js", import.meta.url));
};

const waitForOwner = async (attempts = 20): Promise<boolean> => {
  for (let i = 0; i < attempts; i++) {
    if (await probeOwner()) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
};

/**
 * Start a pomodoro with no terminal attached. This is what the Omarchy bar
 * widget's Start button runs, and it is deliberately the same code path as
 * starting one from a shell.
 */
export const startDetached = async (options: StartOptions): Promise<number> => {
  if (await probeOwner()) {
    const response = await sendCommand("status");
    console.log("A pomodoro is already running.");
    if (response?.ok) console.log(formatState(response.state));
    return 1;
  }

  const child = spawn(
    process.execPath,
    [entryScript(), ...headlessArgs(options)],
    { detached: true, stdio: "ignore" },
  );
  child.unref();

  if (!(await waitForOwner())) {
    console.error("Could not start the session - the timer never came up.");
    return 1;
  }

  const response = await sendCommand("status");
  console.log(response?.ok ? formatState(response.state) : "Session started.");
  return 0;
};

/**
 * Send a control verb to the running owner. Exits non-zero with a readable
 * message when nothing is running, so shell scripts and the bar widget can
 * both branch on it.
 */
export const runControlCommand = async (
  cmd: CommandName,
  asJson = false,
): Promise<number> => {
  const response = await sendCommand(cmd);

  if (!response) {
    // `status` describes an idle machine rather than failing: a widget asking
    // "what is happening" deserves an answer, not an error.
    if (cmd === "status") {
      const state = readState();
      console.log(
        asJson
          ? JSON.stringify(state, null, 2)
          : state
            ? formatState(state)
            : "No session running.",
      );
      return 0;
    }

    console.error("No pomodoro is running. Start one with `pomo start`.");
    return 1;
  }

  if (!response.ok) {
    console.error(response.error);
    return 1;
  }

  if (asJson) {
    console.log(JSON.stringify(response.state, null, 2));
    return 0;
  }

  // `formatState` would say "No session running", which reads as a failure
  // rather than as confirmation that the stop worked.
  console.log(
    cmd === "stop"
      ? `Session stopped.\nToday: ${response.state.today.completedPomodoros} pomodoro(s) · ${formatTime(
          response.state.today.focusSeconds,
        )}`
      : formatState(response.state),
  );
  return 0;
};
