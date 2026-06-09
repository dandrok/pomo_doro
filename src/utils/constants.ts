import type {
  Mode,
  MenuItems,
  InkColor,
  Preset,
  TimeSelectItem,
} from "../types";
import packageJson from "../../package.json" with { type: "json" };

export const APP_VERSION = packageJson.version;
export const APP_AUTHOR = packageJson.author;
export const APP_DESCRIPTION = packageJson.description;

export const APP_LINKS = {
  github: "https://github.com/dandrok/pomo_doro",
  npm: "https://www.npmjs.com/package/pomo-doro-tui",
};

export const TECHNOLOGIES = [
  "React & Ink (Terminal UI)",
  "TypeScript",
  "Vitest (Testing)",
];

export const IS_TEST_MODE = process.env["NODE_ENV"] === "test";

export const ONE_MINUTE = 60;
export const SHORT_BREAK_TIME = IS_TEST_MODE ? 0.05 : 5; // 3 seconds in test
export const LONG_BREAK_TIME = IS_TEST_MODE ? 0.1 : 15; // 6 seconds in test

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
    label: "Settings",
    value: "settings",
  },
  {
    label: "About",
    value: "about",
  },
  {
    label: "Exit",
    value: "exit",
  },
];

export const PRESETS: Preset[] = IS_TEST_MODE
  ? [
      { label: "6 sec", focus: 0.1, shortBreak: 0.05, longBreak: 0.1 },
      { label: "12 sec", focus: 0.2, shortBreak: 0.05, longBreak: 0.1 },
    ]
  : [
      { label: "25min", focus: 25, shortBreak: 5, longBreak: 15 },
      { label: "35min", focus: 35, shortBreak: 8, longBreak: 20 },
      { label: "45min", focus: 45, shortBreak: 10, longBreak: 25 },
    ];

export const timeSelectItems: TimeSelectItem[] = [
  ...PRESETS.map((preset) => {
    const shortLabel = IS_TEST_MODE
      ? `${Math.round(preset.shortBreak * 60)}s`
      : `${preset.shortBreak}m`;
    const longLabel = IS_TEST_MODE
      ? `${Math.round(preset.longBreak * 60)}s`
      : `${preset.longBreak}m`;
    const label = `${preset.label} (${shortLabel}/${longLabel} breaks)`;
    return {
      label,
      value: `preset_${preset.focus}`,
    };
  }),
  {
    label: "Custom...",
    value: "custom",
  },
];

export const DEFAULT_TAGS = [
  "General",
  "Coding",
  "Review",
  "Design",
  "Learning",
  "Admin",
];

export const DURATION_LIMITS = {
  focus: { min: 1, max: IS_TEST_MODE ? 300 : 180 },
  shortBreak: { min: 1, max: IS_TEST_MODE ? 120 : 60 },
  longBreak: { min: 1, max: IS_TEST_MODE ? 300 : 120 },
} as const;

export type ThemePalette = {
  label: string;
  primary: InkColor; // Highlights, borders, active items
  secondary: InkColor; // Secondary accents, inactive items
  text: InkColor; // Default text color
  muted: InkColor; // Dimmed text
  success: InkColor; // Success indicators
  error: InkColor; // Error indicators or muted states
  work: InkColor; // Focus timer color
  shortBreak: InkColor; // Short break timer color
  longBreak: InkColor; // Long break timer color
};

export const THEMES: Record<string, ThemePalette> = {
  default: {
    label: "Default",
    primary: "greenBright",
    secondary: "cyanBright",
    text: "white",
    muted: "gray",
    success: "greenBright",
    error: "red",
    work: "system",
    shortBreak: "cyanBright",
    longBreak: "magentaBright",
  },
  retro: {
    label: "Retro Terminal",
    primary: "yellow",
    secondary: "yellow",
    text: "yellow",
    muted: "yellow",
    success: "yellow",
    error: "yellow",
    work: "yellow",
    shortBreak: "yellowBright",
    longBreak: "yellowBright",
  },
  hacker: {
    label: "Hacker",
    primary: "green",
    secondary: "greenBright",
    text: "green",
    muted: "green",
    success: "greenBright",
    error: "greenBright",
    work: "green",
    shortBreak: "greenBright",
    longBreak: "greenBright",
  },
  cyberpunk: {
    label: "Cyberpunk",
    primary: "magentaBright",
    secondary: "cyanBright",
    text: "whiteBright",
    muted: "gray",
    success: "greenBright",
    error: "redBright",
    work: "yellowBright",
    shortBreak: "cyanBright",
    longBreak: "magentaBright",
  },
  ocean: {
    label: "Ocean",
    primary: "blueBright",
    secondary: "cyanBright",
    text: "cyan",
    muted: "blue",
    success: "greenBright",
    error: "red",
    work: "blue",
    shortBreak: "cyanBright",
    longBreak: "blueBright",
  },
  dracula: {
    label: "Dracula",
    primary: "magenta",
    secondary: "cyan",
    text: "white",
    muted: "gray",
    success: "green",
    error: "red",
    work: "green",
    shortBreak: "cyan",
    longBreak: "magenta",
  },
};

export const FONT_CHARS: Record<string, { filled: string; empty: string }> = {
  block: { filled: "█", empty: "░" },
  simpleBlock: { filled: "■", empty: "□" },
  simple3d: { filled: "▰", empty: "▱" },
  chrome: { filled: "═", empty: "─" },
  slick: { filled: "━", empty: "─" },
  grid: { filled: "▦", empty: "▢" },
  tiny: { filled: "▪", empty: "▫" },
  "3d": { filled: "█", empty: "░" },
};
