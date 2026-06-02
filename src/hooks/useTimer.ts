import { useState, useEffect, useCallback, useMemo } from "react";

type UseTimerProps = {
  initialSeconds: number;
  initialSecondsRemaining?: number | undefined;
  onTimeUp?: () => void;
};

export const useTimer = ({
  initialSeconds,
  initialSecondsRemaining,
  onTimeUp,
}: UseTimerProps) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(
    initialSecondsRemaining ?? initialSeconds,
  );
  const [isPaused, setIsPaused] = useState(false);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  const reset = useCallback((newTotalSeconds: number) => {
    setTotalSeconds(newTotalSeconds);
    setSecondsRemaining(newTotalSeconds);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (isPaused || secondsRemaining <= 0) return;

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (next === 0 && onTimeUp) {
          onTimeUp();
        }
        return next;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPaused, secondsRemaining, onTimeUp]);

  const progress = useMemo(() => {
    if (totalSeconds === 0) return 0;
    return (totalSeconds - secondsRemaining) / totalSeconds;
  }, [totalSeconds, secondsRemaining]);

  return {
    secondsRemaining,
    totalSeconds,
    progress,
    isPaused,
    pause,
    resume,
    reset,
  };
};
