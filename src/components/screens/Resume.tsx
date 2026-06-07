import { Box, Text, useInput } from "ink";
import { Timer } from "./Timer";
import { config, IS_TEST_MODE } from "@utils";

type ResumeProps = {
  onBack: () => void;
};

export const Resume = ({ onBack }: ResumeProps) => {
  const session = config.get("activeSession");

  if (
    !session ||
    (typeof session.focus !== "number" && typeof session.time !== "number")
  ) {
    useInput((input, key) => {
      if (key.escape) onBack();
    });

    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">No valid active session found.</Text>
        <Text color="gray">Press ESC to return to menu.</Text>
      </Box>
    );
  }

  const focus = session.focus ?? session.time ?? 25;
  const shortBreak = session.shortBreak ?? (IS_TEST_MODE ? 0.05 : 5);
  const longBreak = session.longBreak ?? (IS_TEST_MODE ? 0.1 : 15);

  return (
    <Timer
      focus={focus}
      shortBreak={shortBreak}
      longBreak={longBreak}
      tag={session.tag}
      description={session.description}
      initialSecondsRemaining={session.timeOut}
      initialMode={session.mode}
      initialPomodoroCount={session.pomodoroCount}
      onBack={onBack}
    />
  );
};
