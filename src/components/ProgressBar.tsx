import { Box, Text, useInput } from "ink";
import { useEffect, useState } from "react";
import BigText, { type CFontProps } from "ink-big-text";
import { padStr } from "../helper/index.ts";
import { RunningScreen } from "./RunningScreen.tsx";
import SelectInput from "ink-select-input";
import type { Mode } from "../app.tsx";

const LOADING_STEPS = 50;

type ProgressBarProps = {
  time: number,
  mode: Mode,
  setMode: React.Dispatch<React.SetStateAction<Mode>>
  setPomodoroCount: React.Dispatch<React.SetStateAction<number>>
  pomodoroCount: any // TODO: remove later on
};
//TODO: think about the architecure of components
// we propably need to split the progress bar from runing screen and the timer
export const ProgressBar = ({ time, mode, setMode, setPomodoroCount, pomodoroCount }: ProgressBarProps) => {
  const [progressTime, setProgressTime] = useState(time)

  const seconds = progressTime * 60;
  const [elapsed, setElapsed] = useState(0);
  //TODO: move time counter to seperate component
  const [timeOut, setTimeOut] = useState(seconds);
  //TODO: pause, resume
  const [isPaused, setIsPaused] = useState(false);
  // TODO: for testing all of the fonts
  const [fontType, setFontType] = useState<CFontProps['font']>('block')

  useInput((input) => {
    if (input === "p") setIsPaused(true);
    if (input === "r") setIsPaused(false);
  });

  useEffect(() => {
    if (isPaused) return;
    if (elapsed >= seconds) return;
    const timer = setTimeout(() => {
      setElapsed((sec) => sec + 1);
      setTimeOut((sec) => sec - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [elapsed, seconds, isPaused, fontType, progressTime]);

  useEffect(() => {
    if (timeOut === 0 && mode == 'work') {
      const nextPomodoroCount = pomodoroCount + 1
      setPomodoroCount(nextPomodoroCount)
      if (nextPomodoroCount % 4 === 0) {
        setMode('longBreak')
        //TODO: get break values in better way  
        setProgressTime(time < 1 ? .1 : 5)
        setTimeOut(time < 1 ? .1 : 5 * 60)
      } else {
        setMode('shortBreak')
        setProgressTime(time < 1 ? .2 : 15)
        setTimeOut(time < 1 ? .2 : 15 * 60)
      }
      setElapsed(0)
    } else if (timeOut === 0 && (mode === 'shortBreak' || mode === 'longBreak')) {
      setProgressTime(time)
      setTimeOut(time * 60)
      setElapsed(0)
      setMode('work')
    }
  }, [progressTime, pomodoroCount, timeOut])


  const progress = elapsed / seconds;
  const percentage = Math.floor(progress * 100);
  const doneReps = Math.floor(progress * LOADING_STEPS);

  const min = padStr(Math.floor(timeOut / 60));
  const sec = padStr(timeOut % 60);
  const textColor = { work: 'transparent', shortBreak: 'cyan', longBreak: 'magenta' }
  // const textColor = mode === 'work' ? 'transparent' : mode === 'shortBreak' ? 'cyan' : 'magenta'

  //TODO: move font select to app.tsx
  //create seperate "Settings" state in which the user will be able to set the correct fontType
  //in addition we propably would like to set it inside of the config
  //so in the futuere we could use config lib to setup the .config for this app
  const textFonts: CFontProps['font'][] = [
    "huge",
    "block",
    "grid",
    "3d",
    "chrome",
    "pallet",
    "shade",
    "simple",
    "simple3d",
    "simpleBlock",
    "slick",
    "tiny"
  ]

  const items = textFonts.map((font) => ({ ['label']: font, ['value']: font }))


  return (
    <Box flexDirection="column" gap={2} backgroundColor={textColor[mode]} padding={1}>
      <Text>{pomodoroCount}</Text>
      <SelectInput items={items} onSelect={(item) => setFontType(item.value)} />
      <Box justifyContent="flex-end">
        <Text>&#8226; {mode}</Text>
      </Box>
      <Box  >
        <BigText text={`${min} : ${sec}`} font={fontType} />
      </Box>
      <Box>
        <Text>
          [<Text>{"█".repeat(doneReps)}</Text>
          <Text>{"░".repeat(LOADING_STEPS - doneReps)}</Text>]
          <Text> {percentage}%</Text>
        </Text>
      </Box>

      <RunningScreen />
    </Box>
  );
};
