import { Box, Text } from "ink";
import BigText from "ink-big-text";
import { padStr, textColor, modeIcons, ONE_MINUTE, IS_TEST_MODE } from "@utils";
import type { Mode } from "@types";

const LOADING_STEPS = 50;

type ProgressBarProps = {
  secondsRemaining: number;
  progress: number;
  mode: Mode;
  pomodoroCount: number;
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
  isPaused,
  isMuted = false,
  tag,
  description,
}: ProgressBarProps) => {
  const progressSafe = Math.max(0, Math.min(1, progress));
  const percentage = Math.floor(progressSafe * 100);
  const doneReps = Math.floor(progressSafe * LOADING_STEPS);

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
              {isPaused ? "PAUSED" : "RUNNING"}
            </Text>
          </Box>
        </Box>
      </Box>
      <Box justifyContent="flex-end">
        <Text>pomodoro_count: {pomodoroCount}</Text>
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
      </Box>
    </Box>
  );
};
