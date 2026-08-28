import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";

const paths = vi.hoisted(() => {
  // Built as plain strings: vi.hoisted runs before any import, and both
  // writeState and claimOwnership create their own directory anyway.
  const dir = `${process.env["TMPDIR"] ?? "/tmp"}/pomo-session-${process.pid}`;
  return {
    dir,
    statusFile: `${dir}/current.txt`,
    stateFile: `${dir}/state.json`,
    socketPath: `${dir}/s.sock`,
  };
});

const store = vi.hoisted(() => new Map<string, unknown>());

vi.mock("../utils/config", () => ({
  config: {
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    delete: (key: string) => store.delete(key),
    path: `${paths.dir}/config.json`,
  },
  configDir: paths.dir,
  statusFile: paths.statusFile,
  stateFile: paths.stateFile,
  socketPath: paths.socketPath,
}));

// Real notifications would shell out to notify-send once per phase change.
vi.mock("../utils/notifications", () => ({
  notifyUser: vi.fn(),
  playSound: vi.fn(),
  sendNotification: vi.fn(),
}));

const { Session } = await import("./session");
const { readState } = await import("./state");

const readStatusFile = () => fs.readFileSync(paths.statusFile, "utf-8");

describe("Session", () => {
  beforeEach(() => {
    store.clear();
    store.set("history", []);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T09:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const start = (overrides: Record<string, unknown> = {}) =>
    new Session({
      focus: 1,
      shortBreak: 1,
      longBreak: 2,
      tag: "Coding",
      owner: "headless",
      ...overrides,
    }).start();

  it("counts down and credits focus seconds to the tag", () => {
    const session = start();

    vi.advanceTimersByTime(3000);

    expect(session.secondsRemaining).toBe(57);
    // Focus seconds are published every tick and only reach config.json on the
    // 30s flush, which is the same trade the Ink app made.
    expect(readState()?.today.focusSeconds).toBe(3);

    session.stop();

    const history = store.get("history") as Array<{
      totalFocusSeconds: number;
      tags?: Record<string, { focusSeconds: number }>;
    }>;
    expect(history[0]?.totalFocusSeconds).toBe(3);
    expect(history[0]?.tags?.["Coding"]?.focusSeconds).toBe(3);
  });

  it("does not advance or accrue time while paused", () => {
    const session = start();

    vi.advanceTimersByTime(2000);
    session.pause();
    vi.advanceTimersByTime(10_000);

    expect(session.secondsRemaining).toBe(58);
    expect(readState()?.today.focusSeconds).toBe(2);

    session.stop();
  });

  it("skips from work to a short break without counting a pomodoro", () => {
    const session = start();

    vi.advanceTimersByTime(2000);
    session.skip();

    expect(session.mode).toBe("shortBreak");
    expect(session.pomodoroCount).toBe(0);

    session.stop();
  });

  it("counts a pomodoro and transitions when the focus phase completes", () => {
    const session = start();

    vi.advanceTimersByTime(60_000);

    expect(session.pomodoroCount).toBe(1);
    expect(session.mode).toBe("shortBreak");

    const history = store.get("history") as Array<{
      completedPomodoros: number;
      tags?: Record<string, { completedPomodoros: number }>;
    }>;
    expect(history[0]?.completedPomodoros).toBe(1);
    expect(history[0]?.tags?.["Coding"]?.completedPomodoros).toBe(1);

    session.stop();
  });

  it("takes a long break after the fourth pomodoro", () => {
    const session = start({ pomodoroCount: 3 });

    vi.advanceTimersByTime(60_000);

    expect(session.pomodoroCount).toBe(4);
    expect(session.mode).toBe("longBreak");

    session.stop();
  });

  it("starts the next phase paused when auto-transition is off", () => {
    store.set("autoTransition", false);
    const session = start();

    vi.advanceTimersByTime(60_000);

    expect(session.mode).toBe("shortBreak");
    expect(session.isPaused).toBe(true);

    session.stop();
  });

  it("restart returns the current phase to full duration", () => {
    const session = start();

    vi.advanceTimersByTime(5000);
    session.restart();

    expect(session.secondsRemaining).toBe(60);
    expect(session.mode).toBe("work");

    session.stop();
  });

  it("publishes state to disk for external readers", () => {
    const session = start({ description: "write the plugin" });

    vi.advanceTimersByTime(1000);

    const state = readState();
    expect(state).toMatchObject({
      version: 1,
      running: true,
      paused: false,
      mode: "work",
      secondsRemaining: 59,
      totalSeconds: 60,
      pomodoroCount: 0,
      focus: 1,
      shortBreak: 1,
      longBreak: 2,
      tag: "Coding",
      description: "write the plugin",
      owner: "headless",
    });
    expect(state?.progress).toBeCloseTo(1 / 60);
    expect(state?.history14).toHaveLength(14);
    expect(state?.history14.at(-1)?.date).toBe("2026-08-28");

    session.stop();
  });

  it("keeps writing the legacy status file for tmux and starship", () => {
    const session = start();

    vi.advanceTimersByTime(1000);
    // fs.promises.writeFile resolves on a microtask the fake clock does not run.
    return vi
      .waitFor(() => expect(readStatusFile()).toBe("◈ 00:59"))
      .finally(() => session.stop());
  });

  it("blanks the state and clears the resumable session on stop", () => {
    const session = start();

    vi.advanceTimersByTime(2000);
    expect(store.get("activeSession")).toBeDefined();

    session.stop();

    expect(store.get("activeSession")).toBeUndefined();
    expect(readState()).toMatchObject({ running: false, owner: "none" });
    // Stopping must not lose the time already earned.
    expect(readState()?.today.focusSeconds).toBe(2);
  });

  it("stops cleanly when called twice", () => {
    const session = start();
    session.stop();
    expect(() => session.stop()).not.toThrow();
  });
});
