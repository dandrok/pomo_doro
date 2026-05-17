import { useEffect, useState, useCallback } from "react";
import { useInput, useApp, Box } from "ink";
import { useTimer } from "../hooks/useTimer.ts";
import { ProgressBar } from "./ProgressBar.tsx";
import { FooterBar } from "./FooterBar.tsx";
import { config } from "../config.ts";
import { ONE_MINUTE, SHORT_BREAK_TIME, LONG_BREAK_TIME } from "../constants.ts";
import type { Mode } from "../app.tsx";

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
    if (mode === "work") {
      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);
      
      if (nextCount % 4 === 0) {
        setMode("longBreak");
        reset(LONG_BREAK_TIME * ONE_MINUTE);
      } else {
        setMode("shortBreak");
        reset(SHORT_BREAK_TIME * ONE_MINUTE);
      }
    } else {
      setMode("work");
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
  }, [secondsRemaining, mode, currentWorkMinutes, pomodoroCount]);

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
