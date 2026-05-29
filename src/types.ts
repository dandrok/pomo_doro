import type { ForegroundColorName } from "chalk";
import type { LiteralUnion } from "type-fest";

export type Mode = "work" | "shortBreak" | "longBreak";

export type Session = {
  timeOut: number;
  mode: Mode;
  time: number;
  pomodoroCount: number;
};

export type DailyStats = {
  date: string; // "YYYY-MM-DD"
  totalFocusSeconds: number; // Cumulative work time
  completedPomodoros: number; // Natural completions
};

export type ConfigSchema = {
  pomodoroCount: number;
  activeSession?: Session;
  history: DailyStats[];
};

export type Screen =
  | "menu"
  | "time-select"
  | "exit"
  | "resume"
  | "history"
  | "about";

export type MenuItems = { label: string; value: Screen };
export type TimeItems = { label: string; value: number };

export type InkColor = LiteralUnion<ForegroundColorName, string>;
