import fs from "node:fs";
import path from "node:path";
import {
  config,
  stateFile,
  FOCUS_TIME,
  SHORT_BREAK_TIME,
  LONG_BREAK_TIME,
} from "@utils";
import type { DailyStats, Mode } from "@types";

/** One day in the widget's heatmap. Flattened so QML never parses config.json. */
export type PomoStateDay = {
  date: string; // "YYYY-MM-DD"
  focusSeconds: number;
  completedPomodoros: number;
};

/**
 * The on-disk contract between the session engine and any external reader
 * (the Omarchy bar widget, a waybar module, a shell script). Written
 * atomically once per tick; `running: false` is written on a clean exit so a
 * reader can tell "nobody is running a pomodoro" from "the file is stale".
 */
export type PomoState = {
  version: 1;
  running: boolean;
  paused: boolean;
  mode: Mode;
  secondsRemaining: number;
  totalSeconds: number;
  progress: number; // 0..1
  pomodoroCount: number;
  /** Configured phase lengths in minutes, so an attaching client knows the shape. */
  focus: number;
  shortBreak: number;
  longBreak: number;
  tag?: string | undefined;
  description?: string | undefined;
  owner: "tui" | "headless" | "none";
  pid: number;
  today: { focusSeconds: number; completedPomodoros: number };
  dailyGoal?: number | undefined;
  history14: PomoStateDay[];
  updatedAt: string;
};

export const HISTORY_WINDOW_DAYS = 14;

export const todayDate = (): string => new Date().toISOString().split("T")[0]!;

export const todayStatsOf = (
  history: DailyStats[],
  date: string = todayDate(),
): { focusSeconds: number; completedPomodoros: number } => {
  const day = history.find((h) => h.date === date);
  return {
    focusSeconds: day?.totalFocusSeconds ?? 0,
    completedPomodoros: day?.completedPomodoros ?? 0,
  };
};

/**
 * The last HISTORY_WINDOW_DAYS days ending today, zero-filled. Zero-filling
 * here rather than in QML keeps the widget's heatmap a straight map over the
 * array, with no gap handling of its own.
 */
export const buildHistoryWindow = (
  history: DailyStats[],
  date: string = todayDate(),
): PomoStateDay[] => {
  const byDate = new Map(history.map((h) => [h.date, h]));
  const end = new Date(`${date}T00:00:00Z`);
  const days: PomoStateDay[] = [];

  for (let i = HISTORY_WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split("T")[0]!;
    const found = byDate.get(key);
    days.push({
      date: key,
      focusSeconds: found?.totalFocusSeconds ?? 0,
      completedPomodoros: found?.completedPomodoros ?? 0,
    });
  }

  return days;
};

/** The state of a machine with no session running, stats still intact. */
export const idleState = (history?: DailyStats[]): PomoState => {
  const days = history ?? config.get("history") ?? [];
  const date = todayDate();
  const last = config.get("activeSession");

  return {
    version: 1,
    running: false,
    paused: false,
    mode: "work",
    secondsRemaining: 0,
    totalSeconds: 0,
    progress: 0,
    pomodoroCount: config.get("pomodoroCount") ?? 0,
    focus: last?.focus ?? FOCUS_TIME,
    shortBreak: last?.shortBreak ?? SHORT_BREAK_TIME,
    longBreak: last?.longBreak ?? LONG_BREAK_TIME,
    owner: "none",
    pid: 0,
    today: todayStatsOf(days, date),
    dailyGoal: config.get("dailyGoal"),
    history14: buildHistoryWindow(days, date),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Write via a temp file plus rename, so a reader watching this path never sees
 * a half-written document. The temp name carries the pid because two owners can
 * briefly overlap while one is shutting down.
 */
export const writeState = (state: PomoState): void => {
  const tmp = path.join(
    path.dirname(stateFile),
    `.state.${process.pid}.${Date.now()}.tmp`,
  );

  try {
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    fs.writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
    fs.renameSync(tmp, stateFile);
  } catch {
    // A status file that cannot be written must never take the timer down.
    try {
      fs.unlinkSync(tmp);
    } catch {
      // Nothing to clean up.
    }
  }
};

export const writeIdleState = (history?: DailyStats[]): void => {
  writeState(idleState(history));
};

export const readState = (): PomoState | null => {
  try {
    const raw = fs.readFileSync(stateFile, "utf-8");
    const parsed = JSON.parse(raw) as PomoState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
};
