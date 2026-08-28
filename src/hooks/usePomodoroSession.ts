import fs from "node:fs";
import type net from "node:net";
import { useState, useEffect, useCallback, useRef } from "react";
import { config, stateFile, ONE_MINUTE } from "@utils";
import {
  Session,
  claimOwnership,
  serve,
  releaseOwnership,
  sendCommand,
  readState,
  idleState,
  type CommandName,
  type PomoState,
} from "../core";
import type { Mode } from "@types";

type UsePomodoroSessionProps = {
  focus: number;
  shortBreak: number;
  longBreak: number;
  tag?: string | undefined;
  description?: string | undefined;
  initialSecondsRemaining?: number | undefined;
  initialMode?: Mode | undefined;
  initialPomodoroCount?: number | undefined;
};

/** How often an attached TUI re-reads the owner's state file. */
const WATCH_INTERVAL_MS = 250;

const seedState = (props: UsePomodoroSessionProps): PomoState => {
  const mode = props.initialMode ?? "work";
  const minutes =
    mode === "work"
      ? props.focus
      : mode === "shortBreak"
        ? props.shortBreak
        : props.longBreak;
  const total = minutes * ONE_MINUTE;

  return {
    ...idleState(),
    running: true,
    mode,
    totalSeconds: total,
    secondsRemaining: props.initialSecondsRemaining ?? total,
    pomodoroCount: props.initialPomodoroCount ?? 0,
    tag: props.tag,
    description: props.description,
    owner: "tui",
    pid: process.pid,
  };
};

/**
 * The Timer screen's view of the pomodoro clock.
 *
 * On mount this either becomes the owner of the clock or attaches to one that
 * already exists - started from another terminal, or from the Omarchy bar. An
 * attached screen renders the owner's state file and sends its keypresses over
 * the control socket, so the same session is visible and controllable from
 * everywhere at once.
 */
export const usePomodoroSession = (props: UsePomodoroSessionProps) => {
  const {
    focus,
    shortBreak,
    longBreak,
    tag,
    description,
    initialSecondsRemaining,
    initialMode = "work",
    initialPomodoroCount = 0,
  } = props;

  // A session already running elsewhere wins over the props: the screen should
  // open on the live countdown, not restart it at full duration.
  const [state, setState] = useState<PomoState>(() => {
    const existing = readState();
    return existing?.running ? existing : seedState(props);
  });

  const [isMuted, setIsMuted] = useState(() => config.get("isMuted") ?? false);
  const [isAutoTransition, setIsAutoTransition] = useState(
    () => config.get("autoTransition") ?? true,
  );

  const sessionRef = useRef<Session | null>(null);
  const serverRef = useRef<net.Server | null>(null);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};

    void (async () => {
      const server = await claimOwnership();

      if (cancelled) {
        if (server) releaseOwnership(server, null);
        return;
      }

      if (server) {
        const session = new Session({
          focus,
          shortBreak,
          longBreak,
          tag,
          description,
          mode: initialMode,
          secondsRemaining: initialSecondsRemaining,
          pomodoroCount: initialPomodoroCount,
          owner: "tui",
        });

        // Ink owns Ctrl+C; exiting from under it would skip its terminal
        // restore. The unmount cleanup below covers that path instead.
        serve(server, session, { handleInterrupt: false });
        const off = session.onChange(setState);
        session.start();

        sessionRef.current = session;
        serverRef.current = server;

        teardown = () => {
          off();
          releaseOwnership(server, session);
          sessionRef.current = null;
          serverRef.current = null;
        };
        return;
      }

      // Someone else owns the clock. Follow their state file rather than
      // running a second timer that would double-count the day.
      const sync = () => {
        const next = readState();
        if (next) setState(next);
      };

      sync();
      // watchFile rather than watch: the owner writes atomically via rename, so
      // a watcher bound to the original inode would go deaf after one update.
      fs.watchFile(stateFile, { interval: WATCH_INTERVAL_MS }, sync);
      teardown = () => fs.unwatchFile(stateFile, sync);
    })();

    return () => {
      cancelled = true;
      teardown();
    };
    // Deliberately mount-only: ownership is claimed once per Timer screen, and
    // re-running this on a prop change would tear down a live session.
  }, []);

  /** Route a command to the local session, or to the owner over the socket. */
  const dispatch = useCallback((cmd: CommandName) => {
    const session = sessionRef.current;

    if (!session) {
      void sendCommand(cmd).then((response) => {
        if (response?.ok) setState(response.state);
      });
      return;
    }

    switch (cmd) {
      case "pause":
        session.pause();
        break;
      case "resume":
        session.resume();
        break;
      case "toggle":
        session.toggle();
        break;
      case "skip":
        session.skip();
        break;
      case "reset":
        session.restart();
        break;
      default:
        break;
    }
  }, []);

  const pause = useCallback(() => dispatch("pause"), [dispatch]);
  const resume = useCallback(() => dispatch("resume"), [dispatch]);
  const togglePause = useCallback(() => dispatch("toggle"), [dispatch]);
  const skip = useCallback(() => dispatch("skip"), [dispatch]);
  const restart = useCallback(() => dispatch("reset"), [dispatch]);

  // Mute and auto-transition are settings rather than session state: the
  // engine reads them fresh from config on every use, so writing them here
  // reaches a headless owner without a round trip.
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      config.set("isMuted", !prev);
      return !prev;
    });
  }, []);

  const toggleAutoTransition = useCallback(() => {
    setIsAutoTransition((prev) => {
      config.set("autoTransition", !prev);
      return !prev;
    });
  }, []);

  return {
    secondsRemaining: state.secondsRemaining,
    progress: state.progress,
    isPaused: state.paused,
    mode: state.mode,
    pomodoroCount: state.pomodoroCount,
    isMuted,
    isAutoTransition,
    pause,
    resume,
    togglePause,
    skip,
    restart,
    toggleMute,
    toggleAutoTransition,
    todayStats: {
      date: state.history14[state.history14.length - 1]?.date ?? "",
      totalFocusSeconds: state.today.focusSeconds,
      completedPomodoros: state.today.completedPomodoros,
    },
    /** True while this screen is following a session owned by another process. */
    isAttached: sessionRef.current === null,
  };
};
