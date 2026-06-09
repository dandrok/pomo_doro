import { config, THEMES } from "@utils";
import type { ThemePalette } from "@utils";
import type { ThemeId } from "@types";

export const useTheme = (): ThemePalette => {
  const themeId = (config.get("timerTheme") as ThemeId) || "default";
  return THEMES[themeId] || THEMES["default"]!;
};
