import { useEffect, useState, useCallback } from "react";
import { useInput, useApp, Box } from "ink";
import { useTimer } from "../hooks/useTimer";
import { ProgressBar } from "./ProgressBar";
import { FooterBar } from "./FooterBar";
import { config } from "../config";
import { ONE_MINUTE, SHORT_BREAK_TIME, LONG_BREAK_TIME } from "../constants";
import { getNextSessionType, type Mode } from "../helpers";

interface TimerViewProps {
  initialMinutes: number;
  initialSecondsRemaining?: number;
  initialMode?: Mode;
  initialPomodoroCount?: number;
}

export const TimerView = ({
  initialMinutes,
  initialSecondsRemaining,
  initialMode = "work",
  initialPomodoroCount = 0,
}: TimerViewProps) => {
  const { exit } = useApp();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pomodoroCount, setPomodoroCount] = useState(initialPomodoroCount);
  const [currentWorkMinutes] = useState(initialMinutes);

  const handleTimeUp = useCallback(() => {
    const nextMode = getNextSessionType(mode, pomodoroCount);
    setMode(nextMode);

    if (mode === "work") {
      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);
      
      // Update completion in history
      const today = new Date().toISOString().split("T")[0];
      const history = config.get("history") || [];
      const todayIndex = history.findIndex((h) => h.date === today);
      
      if (todayIndex !== -1) {
        const updatedHistory = [...history];
        const day = updatedHistory[todayIndex];
        if (day) {
          updatedHistory[todayIndex] = {
            ...day,
            completedPomodoros: day.completedPomodoros + 1,
          };
          config.set("history", updatedHistory);
        }
      }

      const duration = nextMode === "longBreak" ? LONG_BREAK_TIME : SHORT_BREAK_TIME;
      reset(duration * ONE_MINUTE);
    } else {
      reset(currentWorkMinutes * ONE_MINUTE);
    }
  }, [mode, pomodoroCount, currentWorkMinutes]);

  const { secondsRemaining, progress, isPaused, pause, resume, reset } = useTimer({
    initialSeconds: initialMinutes * ONE_MINUTE,
    initialSecondsRemaining: initialSecondsRemaining,
    onTimeUp: handleTimeUp,
  });

  // Persist state
  useEffect(() => {
    config.set("activeSession", {
      timeOut: secondsRemaining,
      mode,
      time: currentWorkMinutes,
      pomodoroCount,
    });
    config.set("pomodoroCount", pomodoroCount);

    // Update Focus Time (only for work mode)
    if (mode === "work" && !isPaused) {
      const today = new Date().toISOString().split("T")[0];
      const history = config.get("history") || [];
      const todayIndex = history.findIndex((h) => h.date === today);

      if (todayIndex !== -1) {
        const updatedHistory = [...history];
        const day = updatedHistory[todayIndex];
        if (day) {
          updatedHistory[todayIndex] = {
            ...day,
            totalFocusSeconds: day.totalFocusSeconds + 1,
          };
          config.set("history", updatedHistory);
        }
      } else {
        config.set("history", [
          ...history,
          { date: today || "", totalFocusSeconds: 1, completedPomodoros: 0 },
        ]);
      }
    }
  }, [secondsRemaining, mode, currentWorkMinutes, pomodoroCount, isPaused]);

  useInput((input) => {
    if (input === "p") pause();
    if (input === "r") resume();
    if (input === "q") exit();
  });

  return (
    <Box flexDirection="column">
      <ProgressBar
        secondsRemaining={secondsRemaining}
        progress={progress}
        mode={mode}
        pomodoroCount={pomodoroCount}
        isPaused={isPaused}
      />
      <FooterBar />
    </Box>
  );
};
