import { useState, useEffect, useCallback, useRef } from "react";
import fs from "node:fs";
import path from "node:path";
import { useTimer } from "./useTimer";
import { useHistory } from "./useHistory";
import {
  config,
  ONE_MINUTE,
  getNextSessionType,
  notifyUser,
  padStr,
  modeIcons,
} from "@utils";
import type { Mode } from "@types";

type UsePomodoroSessionProps = {
  focus: number;
  shortBreak: number;
  longBreak: number;
  tag?: string | undefined;
  description?: string | undefined;
  initialSecondsRemaining?: number | undefined;
  initialMode?: Mode | undefined;
  initialPomodoroCount?: number | undefined;
};

export const usePomodoroSession = ({
  focus,
  shortBreak,
  longBreak,
  tag,
  description,
  initialSecondsRemaining,
  initialMode = "work",
  initialPomodoroCount = 0,
}: UsePomodoroSessionProps) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pomodoroCount, setPomodoroCount] = useState(initialPomodoroCount);
  const [isMuted, setIsMuted] = useState(() => config.get("isMuted") ?? false);
  const [isAutoTransition, setIsAutoTransition] = useState(
    () => config.get("autoTransition") ?? true,
  );
  const { addFocusSecond, completeSession, todayStats } = useHistory();

  const handleTimeUpRef = useRef<(() => void) | null>(null);

  const initialDuration =
    initialMode === "work"
      ? focus
      : initialMode === "shortBreak"
        ? shortBreak
        : longBreak;

  const onTimeUp = useCallback(() => {
    handleTimeUpRef.current?.();
  }, []);

  const { secondsRemaining, progress, isPaused, pause, resume, reset } =
    useTimer({
      initialSeconds: initialDuration * ONE_MINUTE,
      initialSecondsRemaining: initialSecondsRemaining,
      onTimeUp,
    });

  const handleTimeUp = useCallback(() => {
    const nextMode = getNextSessionType(mode, pomodoroCount);
    setMode(nextMode);

    if (mode === "work") {
      const nextCount = pomodoroCount + 1;
      setPomodoroCount(nextCount);
      completeSession(tag);

      const duration = nextMode === "longBreak" ? longBreak : shortBreak;
      reset(duration * ONE_MINUTE, !isAutoTransition);

      const breakType = nextMode === "longBreak" ? "long break" : "short break";
      notifyUser(
        "Pomo Doro - Work Done!",
        `Focus session complete! Take a ${breakType}.`,
      );
    } else {
      reset(focus * ONE_MINUTE, !isAutoTransition);
      notifyUser(
        "Pomo Doro - Break Finished!",
        "Break is over. Time to focus!",
      );
    }
  }, [
    mode,
    pomodoroCount,
    focus,
    shortBreak,
    longBreak,
    completeSession,
    tag,
    isAutoTransition,
    reset,
  ]);

  handleTimeUpRef.current = handleTimeUp;

  const handleSkip = useCallback(() => {
    if (mode === "work") {
      setMode("shortBreak");
      reset(shortBreak * ONE_MINUTE, !isAutoTransition);
      notifyUser(
        "Pomo Doro - Work Skipped",
        "Focus session skipped. Taking a short break.",
      );
    } else {
      setMode("work");
      reset(focus * ONE_MINUTE, !isAutoTransition);
      notifyUser("Pomo Doro - Break Skipped", "Break skipped. Time to focus!");
    }
  }, [mode, focus, shortBreak, reset, isAutoTransition]);

  const handleRestart = useCallback(() => {
    const duration =
      mode === "work" ? focus : mode === "shortBreak" ? shortBreak : longBreak;
    reset(duration * ONE_MINUTE);
  }, [mode, focus, shortBreak, longBreak, reset]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    config.set("isMuted", nextMuted);
  }, [isMuted]);

  const toggleAutoTransition = useCallback(() => {
    const nextAuto = !isAutoTransition;
    setIsAutoTransition(nextAuto);
    config.set("autoTransition", nextAuto);
  }, [isAutoTransition]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, resume, pause]);

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
      tag,
      description,
    });
    config.set("pomodoroCount", pomodoroCount);

    // Update Focus Time (only for work mode)
    if (mode === "work" && !isPaused) {
      addFocusSecond(tag);
    }

    // Tmux / Status Bar Integration
    const configDir = path.dirname(config.path);
    const statusFile = path.join(configDir, "current.txt");
    const min = padStr(Math.floor(secondsRemaining / ONE_MINUTE));
    const sec = padStr(secondsRemaining % ONE_MINUTE);
    const icon = modeIcons[mode];
    const statusText = `${icon} ${min}:${sec}`;

    fs.promises.writeFile(statusFile, statusText, "utf-8").catch(() => {
      // Silent fail to prevent timer crash
    });
  }, [
    secondsRemaining,
    mode,
    focus,
    shortBreak,
    longBreak,
    pomodoroCount,
    isPaused,
    addFocusSecond,
    tag,
    description,
  ]);

  return {
    secondsRemaining,
    progress,
    isPaused,
    mode,
    pomodoroCount,
    isMuted,
    isAutoTransition,
    pause,
    resume,
    togglePause,
    skip: handleSkip,
    restart: handleRestart,
    toggleMute,
    toggleAutoTransition,
    todayStats,
  };
};
