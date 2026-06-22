import path from "node:path";
import Conf from "conf";
import type { ConfigSchema } from "@types";

const IS_TEST_MODE = process.env["NODE_ENV"] === "test";

export const config = new Conf<ConfigSchema>({
  projectName: IS_TEST_MODE ? "pomo-doro-test" : "pomo-doro",
  defaults: {
    pomodoroCount: 0,
    history: [],
    isMuted: false,
  },
});

export const statusFile = path.join(path.dirname(config.path), "current.txt");
