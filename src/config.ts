import Conf from "conf";
import type { Mode } from "./app.tsx";

export type Session = {
  timeOut: number;
  mode: Mode;
  time: number;
  pomodoroCount: number;
}

type ConfigSchema = {
  pomodoroCount: number;
  activeSession?: Session;
}

export const config = new Conf<ConfigSchema>({ projectName: 'pomo-doro' });

