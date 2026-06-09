import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { config, THEMES } from "@utils";
import { ProgressBar } from "@ui";
import type { FontId, ThemeId } from "@types";

type AppearanceProps = {
  onBack: () => void;
};

const FONTS: FontId[] = [
  "block",
  "simpleBlock",
  "simple3d",
  "3d",
  "chrome",
  "slick",
  "grid",
  "tiny",
];

type FontType = FontId;

const THEME_KEYS = Object.keys(THEMES) as ThemeId[];

export const Appearance = ({ onBack }: AppearanceProps) => {
  const [fontIdx, setFontIdx] = useState<number>(() => {
    const savedFont = config.get("timerFont") as FontType;
    const idx = FONTS.indexOf(savedFont);
    return idx !== -1 ? idx : 0;
  });

  const [themeIdx, setThemeIdx] = useState<number>(() => {
    const savedTheme = config.get("timerTheme") as ThemeId;
    const idx = THEME_KEYS.indexOf(savedTheme);
    return idx !== -1 ? idx : 0;
  });

  const selectedFont = FONTS[fontIdx]!;
  const selectedThemeKey = THEME_KEYS[themeIdx]!;
  const selectedTheme = THEMES[selectedThemeKey]!;

  useInput((input, key) => {
    if (key.escape || input === "q") {
      onBack();
      return;
    }

    if (key.return) {
      config.set("timerFont", selectedFont);
      config.set("timerTheme", selectedThemeKey);
      onBack();
      return;
    }

    if (key.leftArrow) {
      setFontIdx((prev) => (prev === 0 ? FONTS.length - 1 : prev - 1));
      return;
    }

    if (key.rightArrow) {
      setFontIdx((prev) => (prev === FONTS.length - 1 ? 0 : prev + 1));
      return;
    }

    if (key.upArrow) {
      setThemeIdx((prev) => (prev === 0 ? THEME_KEYS.length - 1 : prev - 1));
      return;
    }

    if (key.downArrow) {
      setThemeIdx((prev) => (prev === THEME_KEYS.length - 1 ? 0 : prev + 1));
      return;
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={selectedTheme.primary}
      padding={1}
      width="100%"
      alignItems="center"
    >
      <Box flexDirection="row" justifyContent="space-between" width="100%">
        <Box flexDirection="column">
          <Text bold color={selectedTheme.primary}>
            Appearance Setup
          </Text>
          <Text color={selectedTheme.text}>
            Adjust the visual style of your timer.
          </Text>
        </Box>
        <Box flexDirection="column" alignItems="flex-end">
          <Text>
            <Text color={selectedTheme.primary}>◀ ▶</Text> Font:{" "}
            <Text bold color={selectedTheme.text}>
              {selectedFont}
            </Text>
          </Text>
          <Text>
            <Text color={selectedTheme.primary}>▲ ▼</Text> Theme:{" "}
            <Text bold color={selectedTheme.text}>
              {selectedTheme.label}
            </Text>
          </Text>
        </Box>
      </Box>

      <Box marginTop={1} marginBottom={1} flexDirection="column" width="100%">
        <ProgressBar
          secondsRemaining={1500} // 25:00
          progress={0.5}
          mode="work"
          pomodoroCount={3}
          dailyCompletedCount={3}
          dailyFocusSeconds={4500}
          goalDisplayMode="both"
          isPaused={false}
          isMuted={false}
          tag="Preview"
          description="Visualizing the new theme..."
          fontOverride={selectedFont}
          themeOverride={selectedThemeKey}
        />
      </Box>

      <Box flexDirection="row" justifyContent="center" gap={4}>
        <Text>
          <Text bold color={selectedTheme.primary}>
            Enter
          </Text>{" "}
          <Text color={selectedTheme.text}>Save & Apply</Text>
        </Text>
        <Text>
          <Text bold color={selectedTheme.primary}>
            Esc
          </Text>{" "}
          <Text color={selectedTheme.text}>Cancel</Text>
        </Text>
      </Box>
    </Box>
  );
};
