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
  tag?: string | undefined;
  description?: string | undefined;
};

export type TagBreakdown = {
  [tagName: string]: {
    focusSeconds: number;
    completedPomodoros: number;
  };
};

export type DailyStats = {
  date: string; // "YYYY-MM-DD"
  totalFocusSeconds: number; // Cumulative work time
  completedPomodoros: number; // Natural completions
  tags?: TagBreakdown;
};

export type GoalDisplayMode = "sessions" | "time" | "both" | "hidden";

export type FontId =
  | "block"
  | "simpleBlock"
  | "simple3d"
  | "3d"
  | "chrome"
  | "slick"
  | "grid"
  | "tiny";

export type ThemeId =
  | "default"
  | "retro"
  | "hacker"
  | "cyberpunk"
  | "ocean"
  | "dracula";

export type ConfigSchema = {
  pomodoroCount: number;
  activeSession?: Session;
  history: DailyStats[];
  isMuted?: boolean;
  autoTransition?: boolean;
  recentTags?: string[];
  dailyGoal?: number;
  dailyFocusGoal?: number;
  goalDisplayMode?: GoalDisplayMode;
  timerFont?: FontId;
  timerTheme?: ThemeId;
};

export type Screen =
  | "menu"
  | "time-select"
  | "custom-wizard"
  | "task-setup"
  | "exit"
  | "resume"
  | "history"
  | "settings"
  | "appearance"
  | "about";

export type MenuItems = { label: string; value: Screen };
export type TimeItems = { label: string; value: number };

export type Preset = {
  label: string;
  focus: number;
  shortBreak: number;
  longBreak: number;
};

export type TimeSelectItem = {
  label: string;
  value: string;
};

export type InkColor = LiteralUnion<ForegroundColorName, string>;
