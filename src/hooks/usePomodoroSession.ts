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
  /**
   * End any session already running and start this one instead. Set when the
   * user explicitly chose durations, where silently attaching to an older
   * session would ignore what they just picked.
   */
  replaceExisting?: boolean | undefined;
};

/**
 * The session this process owns, if any.
 *
 * Module scope rather than a ref, because the session deliberately outlives
 * the Timer screen: leaving for the menu pauses it, it does not end it. So the
 * next Timer needs to find it again, and a newly chosen session needs to be
 * able to end it.
 */
let owned: { server: net.Server; session: Session } | null = null;

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
    replaceExisting = false,
  } = props;

  const [state, setState] = useState<PomoState>(() => {
    // Durations the user just chose win over whatever is running; otherwise a
    // session already going wins over the props, so the screen opens on the
    // live countdown instead of restarting it at full duration.
    if (replaceExisting) return seedState(props);
    const existing = readState();
    return existing?.running ? existing : seedState(props);
  });

  const [isMuted, setIsMuted] = useState(() => config.get("isMuted") ?? false);
  const [isAutoTransition, setIsAutoTransition] = useState(
    () => config.get("autoTransition") ?? true,
  );

  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const serverRef = useRef<net.Server | null>(null);

  useEffect(() => {
    let cancelled = false;
    let teardown = () => {};

    void (async () => {
      try {
        await claimAndRun();
      } catch (err) {
        // claimOwnership refuses an unsafe socket directory by throwing. An
        // unhandled rejection here would take the whole app down mid-render;
        // falling back to a read-only view keeps the timer visible.
        setError(err instanceof Error ? err.message : String(err));
      }
    })();

    async function claimAndRun() {
      if (replaceExisting) {
        if (owned) {
          releaseOwnership(owned.server, owned.session);
          owned = null;
        } else {
          // Owned by another process - a headless session, or another
          // terminal. Ask it to stop so the socket frees up; a no-op when
          // nothing is listening.
          await sendCommand("stop");
        }
      }

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

        // Ink owns Ctrl+C, and exiting from under it would skip its terminal
        // restore; `pomo stop` from elsewhere should end the session without
        // closing the app someone is looking at. Both leave the release to
        // serve()'s exit handler.
        serve(server, session, {
          handleInterrupt: false,
          exitOnStop: false,
        });
        const off = session.onChange(setState);
        session.start();

        sessionRef.current = session;
        serverRef.current = server;
        owned = { server, session };

        teardown = () => {
          off();
          // Leaving the Timer screen detaches this view; it does not end the
          // session. The footer calls Escape "safely pauses the session and
          // returns to the main menu", and ending it here would also blank the
          // bar widget and lose the countdown behind a trip to the History
          // screen. Ownership is released when the process exits, in serve().
          session.pause();
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
    }

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
    /** Set when the clock could not be claimed at all; the view is read-only. */
    error,
    todayStats: {
      date: state.history14[state.history14.length - 1]?.date ?? "",
      totalFocusSeconds: state.today.focusSeconds,
      completedPomodoros: state.today.completedPomodoros,
    },
  };
};
