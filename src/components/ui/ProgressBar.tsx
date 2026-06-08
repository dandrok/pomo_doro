import { Box, Text } from "ink";
import BigText from "ink-big-text";
import {
  padStr,
  textColor,
  modeIcons,
  ONE_MINUTE,
  IS_TEST_MODE,
  config,
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
}: ProgressBarProps) => {
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
        <Text color={isSessionGoalMet ? "greenBright" : "white"}>
          Daily Goal: [ {dailyCompletedCount} / {dailyGoal} ]{" "}
          {isSessionGoalMet && "★"}
        </Text>
      );
    }
    if (goalDisplayMode === "time") {
      return (
        <Text color={isTimeGoalMet ? "greenBright" : "white"}>
          Focus Goal: [ {formatGoalTime(dailyFocusSeconds)} /{" "}
          {formatGoalTime(dailyFocusGoalSeconds)} ] {isTimeGoalMet && "★"}
        </Text>
      );
    }
    if (goalDisplayMode === "both") {
      return (
        <Text>
          <Text color={isSessionGoalMet ? "greenBright" : "white"}>
            [{dailyCompletedCount}/{dailyGoal} sess] {isSessionGoalMet && "★"}
          </Text>
          <Text color="gray">{" | "}</Text>
          <Text color={isTimeGoalMet ? "greenBright" : "white"}>
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
            <Text color={textColor[mode]}>{modeIcons[mode]}</Text>
            <Text bold>{mode.toUpperCase()}</Text>
          </Box>
          {tag && (
            <Box gap={1} marginTop={1}>
              <Text color="cyanBright" bold>
                Tag:
              </Text>
              <Text color="cyanBright">{tag}</Text>
              {description ? <Text color="gray">— {description}</Text> : null}
            </Box>
          )}
        </Box>
        <Box gap={2}>
          {isMuted && (
            <Box gap={1}>
              <Text color="red">{"\u{1F507}\u{FE0E}"}</Text>
              <Text color="red">MUTED</Text>
            </Box>
          )}
          <Box gap={1}>
            <Text color={isPaused ? "yellow" : "green"}>
              {isPaused ? "⏸" : "▶"}
            </Text>
            <Text color={isPaused ? "yellow" : "green"}>
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
        <Text color="gray">session count: {pomodoroCount}</Text>
        {renderGoal()}
      </Box>
      <Box flexDirection="column" flexBasis={"center"}>
        <Box>
          <BigText
            text={`${min} : ${sec}`}
            colors={[textColor[mode], textColor[mode]]}
          />
        </Box>
        <Box>
          <Text>
            [<Text>{"█".repeat(doneReps)}</Text>
            <Text>{"░".repeat(LOADING_STEPS - doneReps)}</Text>]
            <Text> {percentage}%</Text>
          </Text>
        </Box>
        {isPaused && progress === 0 && (
          <Box marginTop={1} justifyContent="center">
            <Text color="yellowBright" bold inverse>
              {" ▶ PRESS 'P' TO START SESSION "}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
