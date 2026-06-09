import { config, THEMES } from "@utils";
import type { ThemePalette } from "@utils";

export const useTheme = (): ThemePalette => {
  const themeId = (config.get("timerTheme") as string) || "default";
  return THEMES[themeId] || THEMES["default"]!;
};
