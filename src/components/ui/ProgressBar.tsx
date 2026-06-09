import { Box, Text } from "ink";
import BigText from "ink-big-text";
import {
  padStr,
  modeIcons,
  ONE_MINUTE,
  IS_TEST_MODE,
  config,
  THEMES,
  FONT_CHARS,
} from "@utils";
import type { Mode, GoalDisplayMode } from "@types";

const LOADING_STEPS = 50;

type ProgressBarProps = {
  secondsRemaining: number;
  progress: number;
  mode: Mode;
  pomodoroCount: number;
  dailyCompletedCount: number;
  dailyFocusSeconds: number;
  goalDisplayMode: GoalDisplayMode;
  isPaused: boolean;
  isMuted?: boolean | undefined;
  tag?: string | undefined;
  description?: string | undefined;
  fontOverride?: string;
  themeOverride?: string;
};

export const ProgressBar = ({
  secondsRemaining,
  progress,
  mode,
  pomodoroCount,
  dailyCompletedCount,
  dailyFocusSeconds,
  goalDisplayMode,
  isPaused,
  isMuted = false,
  tag,
  description,
  fontOverride,
  themeOverride,
}: ProgressBarProps) => {
  const activeTheme =
    themeOverride && THEMES[themeOverride]
      ? THEMES[themeOverride]!
      : THEMES[(config.get("timerTheme") as string) || "default"] ||
        THEMES["default"]!;
  const modeColor = activeTheme[mode];
  const progressSafe = Math.max(0, Math.min(1, progress));
  const percentage = Math.floor(progressSafe * 100);
  const doneReps = Math.floor(progressSafe * LOADING_STEPS);
  const dailyGoal = config.get("dailyGoal") ?? 8;
  const dailyFocusGoalHours = config.get("dailyFocusGoal") ?? 4;
  const goalMultiplier = IS_TEST_MODE ? 1 : 3600;
  const dailyFocusGoalSeconds = dailyFocusGoalHours * goalMultiplier;

  const isSessionGoalMet = dailyCompletedCount >= dailyGoal;
  const isTimeGoalMet = dailyFocusSeconds >= dailyFocusGoalSeconds;

  const formatGoalTime = (secs: number) => {
    if (IS_TEST_MODE) return `${secs}s`;
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  const renderGoal = () => {
    if (goalDisplayMode === "sessions") {
      return (
        <Text color={isSessionGoalMet ? activeTheme.success : activeTheme.text}>
          Daily Goal: [ {dailyCompletedCount} / {dailyGoal} ]{" "}
          {isSessionGoalMet && "★"}
        </Text>
      );
    }
    if (goalDisplayMode === "time") {
      return (
        <Text color={isTimeGoalMet ? activeTheme.success : activeTheme.text}>
          Focus Goal: [ {formatGoalTime(dailyFocusSeconds)} /{" "}
          {formatGoalTime(dailyFocusGoalSeconds)} ] {isTimeGoalMet && "★"}
        </Text>
      );
    }
    if (goalDisplayMode === "both") {
      return (
        <Text>
          <Text
            color={isSessionGoalMet ? activeTheme.success : activeTheme.text}
          >
            [{dailyCompletedCount}/{dailyGoal} sess] {isSessionGoalMet && "★"}
          </Text>
          <Text color={activeTheme.muted}>{" | "}</Text>
          <Text color={isTimeGoalMet ? activeTheme.success : activeTheme.text}>
            [{formatGoalTime(dailyFocusSeconds)}/
            {formatGoalTime(dailyFocusGoalSeconds)} time] {isTimeGoalMet && "★"}
          </Text>
        </Text>
      );
    }
    if (goalDisplayMode === "hidden") {
      return null;
    }

    return null;
  };

  const min = padStr(Math.floor(secondsRemaining / ONE_MINUTE));
  const sec = padStr(secondsRemaining % ONE_MINUTE);

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      {IS_TEST_MODE && (
        <Box justifyContent="center" marginBottom={1}>
          <Text color="yellow" bold inverse>
            {" "}
            ⚠️ TEST MODE - DATA SANDBOXED{" "}
          </Text>
        </Box>
      )}
      <Box justifyContent="space-between" alignItems="flex-start">
        <Box flexDirection="column" gap={0}>
          <Box gap={1}>
            <Text color={modeColor}>{modeIcons[mode]}</Text>
            <Text bold color={activeTheme.text}>
              {mode.toUpperCase()}
            </Text>
          </Box>
          {tag && (
            <Box gap={1} marginTop={1}>
              <Text color={activeTheme.secondary} bold>
                Tag:
              </Text>
              <Text color={activeTheme.secondary}>{tag}</Text>
              {description ? (
                <Text color={activeTheme.muted}>— {description}</Text>
              ) : null}
            </Box>
          )}
        </Box>
        <Box gap={2}>
          {isMuted && (
            <Box gap={1}>
              <Text color={activeTheme.error}>{"\u{1F507}\u{FE0E}"}</Text>
              <Text color={activeTheme.error}>MUTED</Text>
            </Box>
          )}
          <Box gap={1}>
            <Text color={isPaused ? activeTheme.primary : activeTheme.success}>
              {isPaused ? "⏸" : "▶"}
            </Text>
            <Text color={isPaused ? activeTheme.primary : activeTheme.success}>
              {isPaused
                ? progress === 0
                  ? "WAITING TO START"
                  : "PAUSED"
                : "RUNNING"}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box justifyContent="space-between">
        <Text color={activeTheme.muted}>session count: {pomodoroCount}</Text>
        {renderGoal()}
      </Box>
      <Box flexDirection="column" flexBasis={"center"}>
        <Box>
          <BigText
            text={`${min} : ${sec}`}
            font={
              (fontOverride as React.ComponentProps<typeof BigText>["font"]) ??
              (config.get("timerFont") as React.ComponentProps<
                typeof BigText
              >["font"]) ??
              "block"
            }
            colors={[modeColor]}
          />
        </Box>
        <Box>
          <Text>
            [
            <Text>
              {FONT_CHARS[
                fontOverride || (config.get("timerFont") as string) || "block"
              ]?.filled.repeat(doneReps) || "█".repeat(doneReps)}
            </Text>
            <Text>
              {FONT_CHARS[
                fontOverride || (config.get("timerFont") as string) || "block"
              ]?.empty.repeat(LOADING_STEPS - doneReps) ||
                "░".repeat(LOADING_STEPS - doneReps)}
            </Text>
            ]<Text> {percentage}%</Text>
          </Text>
        </Box>
        {isPaused && progress === 0 && (
          <Box marginTop={1} justifyContent="center">
            <Text color={activeTheme.primary} bold inverse>
              {" ▶ PRESS 'P' TO START SESSION "}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
