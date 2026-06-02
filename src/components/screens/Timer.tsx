import { useEffect, useState, useCallback } from "react";
import { useInput, useApp, Box } from "ink";
import { useTimer, useHistory } from "@hooks";
import { ProgressBar, FooterBar } from "@ui";
import { config, ONE_MINUTE, getNextSessionType, notifyUser } from "@utils";
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
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pomodoroCount, setPomodoroCount] = useState(initialPomodoroCount);
  const [isMuted, setIsMuted] = useState(() => config.get("isMuted") ?? false);
  const { addFocusSecond, completeSession } = useHistory();

  const handleTimeUp = useCallback(() => {
    const nextMode = getNextSessionType(mode, pomodoroCount);
    setMode(nextMode);

    if (mode === "work") {
      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);
      completeSession();

      const duration = nextMode === "longBreak" ? longBreak : shortBreak;
      reset(duration * ONE_MINUTE);

      const breakType = nextMode === "longBreak" ? "long break" : "short break";
      notifyUser(
        "Pomo Doro - Work Done!",
        `Focus session complete! Take a ${breakType}.`,
      );
    } else {
      reset(focus * ONE_MINUTE);
      notifyUser(
        "Pomo Doro - Break Finished!",
        "Break is over. Time to focus!",
      );
    }
  }, [mode, pomodoroCount, focus, shortBreak, longBreak, completeSession]);

  const { secondsRemaining, progress, isPaused, pause, resume, reset } =
    useTimer({
      initialSeconds: focus * ONE_MINUTE,
      initialSecondsRemaining: initialSecondsRemaining,
      onTimeUp: handleTimeUp,
    });

  // Persist current session state
  useEffect(() => {
    config.set("activeSession", {
      timeOut: secondsRemaining,
      mode,
      time: focus, // legacy fallback for backward compatibility
      focus,
      shortBreak,
      longBreak,
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
    focus,
    shortBreak,
    longBreak,
    pomodoroCount,
    isPaused,
    addFocusSecond,
  ]);

  useInput((input) => {
    if (input === "p") pause();
    if (input === "r") resume();
    if (input === "q") exit();
    if (input === "m") {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      config.set("isMuted", nextMuted);
    }
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
          { key: "p", label: "pause" },
          { key: "r", label: "resume" },
          { key: "m", label: isMuted ? "unmute" : "mute" },
          { key: "q", label: "quit" },
        ]}
      />
    </Box>
  );
};
