import type { ForegroundColorName } from "chalk";
import type { LiteralUnion } from "type-fest";

export type Mode = "work" | "shortBreak" | "longBreak";

export type Session = {
  timeOut: number;
  mode: Mode;
  time: number; // legacy work time in minutes
  focus: number; // focus time in minutes
  shortBreak: number; // short break time in minutes
  longBreak: number; // long break time in minutes
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
  isMuted?: boolean;
};

export type Screen =
  | "menu"
  | "time-select"
  | "custom-wizard"
  | "exit"
  | "resume"
  | "history"
  | "about";

export type MenuItems = { label: string; value: Screen };
export type TimeItems = { label: string; value: number };

export interface Preset {
  label: string;
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export interface TimeSelectItem {
  label: string;
  value: string;
}

export type InkColor = LiteralUnion<ForegroundColorName, string>;
