import { Box, Text, useInput, useApp } from "ink";
import { useEffect, useState } from "react";
import BigText from "ink-big-text";
import { padStr } from "../helper/index.ts";
import type { Mode } from "../app.tsx";
import { config } from "../config.ts";
import { textColor } from "../constants/index.ts";

const LOADING_STEPS = 50;
const SHORT_BREAK_TIME = 5;
const LONG_BREAK_TIME = 15;
const ONE_MINUTE = 60;

type ProgressBarProps = {
  time: number;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  setPomodoroCount: React.Dispatch<React.SetStateAction<number>>;
  pomodoroCount: number; // TODO: remove later on
  initialTimeOut?: number;
};
//TODO: think about the architecure of components
// we propably need to split the progress bar from runing screen and the timer
export const ProgressBar = ({
  time,
  mode,
  setMode,
  setPomodoroCount,
  pomodoroCount,
  initialTimeOut,
}: ProgressBarProps) => {
  const [progressTime, setProgressTime] = useState(time);
  const { exit } = useApp();

  const seconds = progressTime * ONE_MINUTE;
  const [elapsed, setElapsed] = useState(seconds - (initialTimeOut ?? seconds));
  const [timeOut, setTimeOut] = useState(initialTimeOut ?? seconds);
  const [isPaused, setIsPaused] = useState(false);

  useInput((input) => {
    if (input === "p") setIsPaused(true);
    if (input === "r") setIsPaused(false);
    if (input === "q") exit();
  });

  useEffect(() => {
    config.set("activeSession", {
      timeOut,
      mode,
      time: progressTime,
      pomodoroCount,
    });
  }, [timeOut, mode, progressTime, pomodoroCount]);

  useEffect(() => {
    if (isPaused) return;
    if (elapsed >= seconds) return;
    const timer = setTimeout(() => {
      setElapsed((sec) => sec + 1);
      setTimeOut((sec) => sec - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [elapsed, seconds, isPaused, progressTime]);

  useEffect(() => {
    if (timeOut === 0 && mode == "work") {
      const nextPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(nextPomodoroCount);
      if (nextPomodoroCount % 4 === 0) {
        setMode("longBreak");
        setProgressTime(LONG_BREAK_TIME);
        setTimeOut(LONG_BREAK_TIME * ONE_MINUTE);
      } else {
        setMode("shortBreak");
        setProgressTime(SHORT_BREAK_TIME);
        setTimeOut(SHORT_BREAK_TIME * ONE_MINUTE);
      }
      setElapsed(0);
    } else if (
      timeOut === 0 &&
      (mode === "shortBreak" || mode === "longBreak")
    ) {
      setProgressTime(time);
      setTimeOut(time * ONE_MINUTE);
      setElapsed(0);
      setMode("work");
    }
  }, [progressTime, pomodoroCount, timeOut]);

  const progress = elapsed / seconds;
  const percentage = Math.floor(progress * 100);
  const doneReps = Math.floor(progress * LOADING_STEPS);

  const min = padStr(Math.floor(timeOut / ONE_MINUTE));
  const sec = padStr(timeOut % ONE_MINUTE);

  return (
    <Box
      flexDirection="column"
      gap={2}
      backgroundColor={textColor[mode]}
      padding={1}
    >
      <Text>pomodoro count: {pomodoroCount}</Text>
      <Box justifyContent="flex-end">
        <Text>&#8226; {mode}</Text>
      </Box>
      <Box>
        <BigText text={`${min} : ${sec}`} />
      </Box>
      <Box>
        <Text>
          [<Text>{"█".repeat(doneReps)}</Text>
          <Text>{"░".repeat(LOADING_STEPS - doneReps)}</Text>]
          <Text> {percentage}%</Text>
        </Text>
      </Box>
    </Box>
  );
};
