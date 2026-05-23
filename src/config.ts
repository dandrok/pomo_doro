import Conf from "conf";
import type { Mode } from "./helpers";

export type Session = {
  timeOut: number;
  mode: Mode;
  time: number;
  pomodoroCount: number;
};

export type DailyStats = {
  date: string;              // "YYYY-MM-DD"
  totalFocusSeconds: number; // Cumulative work time
  completedPomodoros: number;// Natural completions
};

type ConfigSchema = {
  pomodoroCount: number;
  activeSession?: Session;
  history: DailyStats[];
};

const IS_TEST_MODE = process.env["NODE_ENV"] === "test";

export const config = new Conf<ConfigSchema>({
  projectName: IS_TEST_MODE ? "pomo-doro-test" : "pomo-doro",
  defaults: {
    pomodoroCount: 0,
    history: [],
  },
});

