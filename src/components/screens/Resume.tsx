import { Box, Text } from "ink";
import { Timer } from "./Timer";
import { config, IS_TEST_MODE } from "@utils";

export const Resume = () => {
  const session = config.get("activeSession");

  if (
    !session ||
    (typeof session.focus !== "number" && typeof session.time !== "number")
  ) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">No valid active session found.</Text>
        <Text color="gray">
          Press any key to return to menu (not implemented) or restart the app.
        </Text>
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
      initialSecondsRemaining={session.timeOut}
      initialMode={session.mode}
      initialPomodoroCount={session.pomodoroCount}
    />
  );
};
