import { Box, Text } from "ink";
import BigText from "ink-big-text";
import { padStr } from "../helpers.ts";
import { textColor } from "../constants.ts";
import type { Mode } from "../app.tsx";

const LOADING_STEPS = 50;
const ONE_MINUTE = 60;

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
  const percentage = Math.floor(progress * 100);
  const doneReps = Math.floor(progress * LOADING_STEPS);

  const min = padStr(Math.floor(secondsRemaining / ONE_MINUTE));
  const sec = padStr(secondsRemaining % ONE_MINUTE);

  return (
    <Box
      flexDirection="column"
      gap={2}
      backgroundColor={textColor[mode]}
      padding={1}
    >
      <Box justifyContent="space-between">
        <Text>pomodoro count: {pomodoroCount}</Text>
        <Text color={isPaused ? "yellow" : "green"}>
          {isPaused ? "PAUSED ⏸" : "RUNNING ▶"}
        </Text>
      </Box>
      <Box justifyContent="flex-end">
        <Text>&#8226; {mode}</Text>
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
