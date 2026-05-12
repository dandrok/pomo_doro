import Conf from "conf";
import type { Mode } from "./app.tsx";

export type Session = {
  timeOut: number;
  mode: Mode;
  time: number;
  pomodoroCount: number;
}

type ConfigSshema = {
  pomodoroCount: number;
  activeSession?: Session;
}

export const config = new Conf<ConfigSshema>({ projectName: 'pomo-doro' });

