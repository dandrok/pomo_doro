import React from "react";
import { useInput, useApp, Box } from "ink";
import { usePomodoroSession } from "@hooks";
import { ProgressBar, FooterBar } from "@ui";
import type { Mode } from "@types";

type TimerProps = {
  focus: number;
  shortBreak: number;
  longBreak: number;
  initialSecondsRemaining?: number;
  initialMode?: Mode;
  initialPomodoroCount?: number;
};

export const Timer = ({
  focus,
  shortBreak,
  longBreak,
  initialSecondsRemaining,
  initialMode = "work",
  initialPomodoroCount = 0,
}: TimerProps) => {
  const { exit } = useApp();

  const {
    secondsRemaining,
    progress,
    isPaused,
    mode,
    pomodoroCount,
    isMuted,
    togglePause,
    skip,
    restart,
    toggleMute,
  } = usePomodoroSession({
    focus,
    shortBreak,
    longBreak,
    initialSecondsRemaining,
    initialMode,
    initialPomodoroCount,
  });

  useInput((input) => {
    if (input === "p") togglePause();
    if (input === "r") restart();
    if (input === "q") exit();
    if (input === "s") skip();
    if (input === "m") toggleMute();
  });

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <ProgressBar
        secondsRemaining={secondsRemaining}
        progress={progress}
        mode={mode}
        pomodoroCount={pomodoroCount}
        isPaused={isPaused}
        isMuted={isMuted}
      />
      <FooterBar
        controls={[
          { key: "p", label: isPaused ? "resume" : "pause" },
          { key: "r", label: "restart" },
          { key: "s", label: "skip" },
          { key: "m", label: isMuted ? "unmute" : "mute" },
          { key: "q", label: "quit" },
        ]}
      />
    </Box>
  );
};
