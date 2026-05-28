import { useEffect, useState, useCallback } from "react";
import { useInput, useApp, Box } from "ink";
import { useTimer } from "../hooks/useTimer";
import { useHistory } from "../hooks/useHistory";
import { ProgressBar } from "./ProgressBar";
import { FooterBar } from "./FooterBar";
import { config } from "../config";
import { ONE_MINUTE, SHORT_BREAK_TIME, LONG_BREAK_TIME } from "../constants";
import { getNextSessionType, type Mode } from "../helpers";
import { notifyUser } from "../notifications";

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
  const { addFocusSecond, completeSession } = useHistory();

  const handleTimeUp = useCallback(() => {
    const nextMode = getNextSessionType(mode, pomodoroCount);
    setMode(nextMode);

    if (mode === "work") {
      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);
      completeSession();

      const duration =
        nextMode === "longBreak" ? LONG_BREAK_TIME : SHORT_BREAK_TIME;
      reset(duration * ONE_MINUTE);

      const breakType = nextMode === "longBreak" ? "long break" : "short break";
      notifyUser(
        "Pomo Doro - Work Done!",
        `Focus session complete! Take a ${breakType}.`,
      );
    } else {
      reset(currentWorkMinutes * ONE_MINUTE);
      notifyUser(
        "Pomo Doro - Break Finished!",
        "Break is over. Time to focus!",
      );
    }
  }, [mode, pomodoroCount, currentWorkMinutes, completeSession]);

  const { secondsRemaining, progress, isPaused, pause, resume, reset } =
    useTimer({
      initialSeconds: initialMinutes * ONE_MINUTE,
      initialSecondsRemaining: initialSecondsRemaining,
      onTimeUp: handleTimeUp,
    });

  // Persist current session state
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
      addFocusSecond();
    }
  }, [
    secondsRemaining,
    mode,
    currentWorkMinutes,
    pomodoroCount,
    isPaused,
    addFocusSecond,
  ]);

  useInput((input) => {
    if (input === "p") pause();
    if (input === "r") resume();
    if (input === "q") exit();
  });

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <ProgressBar
        secondsRemaining={secondsRemaining}
        progress={progress}
        mode={mode}
        pomodoroCount={pomodoroCount}
        isPaused={isPaused}
      />
      <FooterBar
        controls={[
          { key: "p", label: "pause" },
          { key: "r", label: "resume" },
          { key: "q", label: "quit" },
        ]}
      />
    </Box>
  );
};
