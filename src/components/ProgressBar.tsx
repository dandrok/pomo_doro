import { Box, Text } from "ink";
import BigText from "ink-big-text";
import { padStr } from "../helpers.ts";
import { textColor, modeIcons, ONE_MINUTE } from "../constants.ts";
import type { Mode } from "../app.tsx";

const LOADING_STEPS = 50;

interface ProgressBarProps {
  secondsRemaining: number;
  progress: number;
  mode: Mode;
  pomodoroCount: number;
  isPaused: boolean;
}

export const ProgressBar = ({
  secondsRemaining,
  progress,
  mode,
  pomodoroCount,
  isPaused,
}: ProgressBarProps) => {
  const progressSafe = Math.max(0, Math.min(1, progress));
  const percentage = Math.floor(progressSafe * 100);
  const doneReps = Math.floor(progressSafe * LOADING_STEPS);

  const min = padStr(Math.floor(secondsRemaining / ONE_MINUTE));
  const sec = padStr(secondsRemaining % ONE_MINUTE);

  return (
    <Box
      flexDirection="column"
      gap={2}
      // backgroundColor={textColor[mode]}
      padding={1}
    >
      <Box justifyContent="space-between">
        <Box gap={1}>
          <Text color="gray">{modeIcons[mode]}</Text>
          <Text>{mode}</Text>
        </Box>
        <Box gap={1}>
          <Text color={isPaused ? "yellow" : "green"}>
            {isPaused ? "⏸" : "▶"}
          </Text>
          <Text color={isPaused ? "yellow" : "green"}>
            {isPaused ? "PAUSED" : "RUNNING"}
          </Text>
        </Box>
      </Box>
      <Box justifyContent="flex-end">
        <Text>count: {pomodoroCount}</Text>
      </Box>
      <Box>
        <BigText text={`${min} : ${sec}`} />
      </Box>
      <Box>
        <Text>
          [<Text>{"█".repeat(doneReps)}</Text>
          <Text>{"░".repeat(LOADING_STEPS - doneReps)}</Text>]
          <Text> {percentage}%</Text>
        </Text>
      </Box>
    </Box>
  );
};
