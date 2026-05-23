import type { ForegroundColorName } from "chalk";
import type { LiteralUnion } from "type-fest";
import type { Mode } from "./helpers";

export type Screen = "menu" | "time-select" | "exit" | "resume" | "history";
export type MenuItems = { label: string; value: Screen };
export type TimeItems = { label: string; value: number };

/**
 * Valid colors supported by Ink (matches Text component props)
 */
export type InkColor = LiteralUnion<ForegroundColorName, string>;

export const IS_TEST_MODE = process.env["NODE_ENV"] === "test";

export const ONE_MINUTE = 60;
export const SHORT_BREAK_TIME = IS_TEST_MODE ? 0.05 : 5; // 3 seconds in test
export const LONG_BREAK_TIME = IS_TEST_MODE ? 0.1 : 15;  // 6 seconds in test

export const textColor: Record<Mode, InkColor> = {
  work: "system",
  shortBreak: "cyanBright",
  longBreak: "magentaBright",
};

export const modeIcons = {
  work: "◈",
  shortBreak: "◇",
  longBreak: "◆",
};

export const menuItems: MenuItems[] = [
  {
    label: "Start",
    value: "time-select",
  },
  {
    label: "Resume",
    value: "resume",
  },
  {
    label: "History",
    value: "history",
  },
  {
    label: "Exit",
    value: "exit",
  },
];

export const timeItems: TimeItems[] = IS_TEST_MODE
  ? [
    { label: "6 sec", value: 0.1 },
    { label: "12 sec", value: 0.2 },
  ]
  : [
    { label: "25min", value: 25 },
    { label: "35min", value: 35 },
    { label: "45min", value: 45 },
  ];
