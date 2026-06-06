import React, { useState } from "react";
import { useInput, Box } from "ink";
import { usePomodoroSession } from "@hooks";
import { ProgressBar, FooterBar } from "@ui";
import { config } from "@utils";
import type { Mode, GoalDisplayMode } from "@types";

type TimerProps = {
  focus: number;
  shortBreak: number;
  longBreak: number;
  tag?: string | undefined;
  description?: string | undefined;
  initialSecondsRemaining?: number | undefined;
  initialMode?: Mode | undefined;
  initialPomodoroCount?: number | undefined;
  onBack?: () => void;
};

export const Timer = ({
  focus,
  shortBreak,
  longBreak,
  tag,
  description,
  initialSecondsRemaining,
  initialMode = "work",
  initialPomodoroCount = 0,
  onBack,
}: TimerProps) => {
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
    todayStats,
  } = usePomodoroSession({
    focus,
    shortBreak,
    longBreak,
    tag,
    description,
    initialSecondsRemaining,
    initialMode,
    initialPomodoroCount,
  });

  const [goalDisplayMode, setGoalDisplayMode] = useState<GoalDisplayMode>(
    () =>
      (config.get("goalDisplayMode") as GoalDisplayMode | undefined) ??
      "sessions",
  );

  const toggleGoalDisplay = () => {
    setGoalDisplayMode((prev) => {
      const next =
        prev === "sessions"
          ? "time"
          : prev === "time"
            ? "both"
            : prev === "both"
              ? "hidden"
              : "sessions";
      config.set("goalDisplayMode", next);
      return next;
    });
  };

  useInput((input, key) => {
    if (input === "p") togglePause();
    if (input === "r") restart();
    if (input === "s") skip();
    if (input === "m") toggleMute();
    if (input === "g") toggleGoalDisplay();
    if (key.escape && onBack) onBack();
  });

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <ProgressBar
        secondsRemaining={secondsRemaining}
        progress={progress}
        mode={mode}
        pomodoroCount={pomodoroCount}
        dailyCompletedCount={todayStats.completedPomodoros}
        dailyFocusSeconds={todayStats.totalFocusSeconds}
        goalDisplayMode={goalDisplayMode}
        isPaused={isPaused}
        isMuted={isMuted}
        tag={tag}
        description={description}
      />
      <FooterBar
        controls={[
          { key: "p", label: isPaused ? "resume" : "pause" },
          { key: "r", label: "restart" },
          { key: "s", label: "skip" },
          { key: "m", label: isMuted ? "unmute" : "mute" },
          { key: "g", label: "goal view" },
          { key: "esc", label: "menu" },
        ]}
      />
    </Box>
  );
};
