
export type Screen = "menu" | "time-select" | "exit" | "resume";
export type MenuItems = { label: string; value: Screen };
export type TimeItems = { label: string; value: number };

export const ONE_MINUTE = 60;
export const SHORT_BREAK_TIME = 5;
export const LONG_BREAK_TIME = 15;

export const textColor = {
  work: "system",
  shortBreak: "greenBright",
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
    label: "Exit",
    value: "exit",
  },
];

export const timeItems: TimeItems[] = [
  {
    label: ".1min",
    value: 0.1,
  },
  {
    label: "25min",
    value: 25,
  },
  {
    label: "35min",
    value: 35,
  },
  {
    label: "45min",
    value: 45,
  },
];
