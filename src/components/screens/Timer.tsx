import React, { useState } from "react";
import { useInput, Box } from "ink";
import { usePomodoroSession, useHelp } from "@hooks";
import { ProgressBar, FooterBar, HelpOverlay, HELP_CONTROL } from "@ui";
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
    isAutoTransition,
    togglePause,
    skip,
    restart,
    toggleMute,
    toggleAutoTransition,
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

  const { isHelpOpen, toggleHelp } = useHelp();

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
    if (isHelpOpen) return;
    if (input === "h") {
      toggleHelp();
      return;
    }
    if (input === "p") togglePause();
    if (input === "r") restart();
    if (input === "s") skip();
    if (input === "m") toggleMute();
    if (input === "a") toggleAutoTransition();
    if (input === "g") toggleGoalDisplay();
    if (key.escape && onBack) onBack();
  });

  const controls = [
    {
      key: "p",
      label: isPaused ? "resume" : "pause",
      description: "Pauses or resumes the current timer",
    },
    {
      key: "r",
      label: "restart",
      description: "Restarts the current timer from the beginning",
    },
    {
      key: "s",
      label: "skip",
      description: "Skips the current session and moves to the next one",
    },
    {
      key: "a",
      label: isAutoTransition ? "auto" : "manual",
      description: "Toggles automatic or manual transitions between sessions",
    },
    {
      key: "m",
      label: isMuted ? "unmute" : "mute",
      description: "Mutes or unmutes sound and desktop notifications",
    },
    {
      key: "g",
      label: "goal view",
      description: "Cycles how the daily goal is displayed",
    },
    {
      key: "esc",
      label: "menu",
      description: "Safely pauses the session and returns to the main menu",
    },
    HELP_CONTROL,
  ];

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      {isHelpOpen ? (
        <HelpOverlay controls={controls} />
      ) : (
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
      )}
      <FooterBar controls={controls} />
    </Box>
  );
};
