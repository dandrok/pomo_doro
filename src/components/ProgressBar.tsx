import { Box, Text, useInput } from "ink"
import { useEffect, useState } from "react"
import BigText from 'ink-big-text';
import { padStr } from "../helper/index.ts";
import { RunningScreen } from "./RunningScreen.tsx";

const LOADING_STEPS = 25

type ProgressBarProps = {
  time: number
}

export const ProgressBar = ({ time }: ProgressBarProps) => {
  const seconds = time * 60;
  const [elapsed, setElapsed] = useState(0);
  //TODO: move time counter to seperate component
  const [timeOut, setTimeOut] = useState(seconds);
  //TODO: pause, resume 
  const [isPaused, setIsPaused] = useState(false);


  useInput(input => {
    if (input === 'p') setIsPaused(true)
    if (input === 'r') setIsPaused(false)
  })

  useEffect(() => {
    if (isPaused) return
    if (elapsed >= seconds) return
    const timer = setTimeout(() => {
      setElapsed((sec) => sec + 1)
      setTimeOut((sec) => sec - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [elapsed, seconds, isPaused])

  const progress = elapsed / seconds;
  const percentage = Math.floor(progress * 100);
  const doneReps = Math.floor(progress * LOADING_STEPS);

  const min = padStr(Math.floor(timeOut / 60))
  const sec = padStr(timeOut % 60)

  return (

    <Box flexDirection="column" gap={2}>
      <Box>
        <BigText text={`${min} : ${sec}`} />
      </Box>
      <Box>
        <Text>[
          <Text>{'█'.repeat(doneReps)}</Text>
          <Text>{'░'.repeat(LOADING_STEPS - doneReps)}</Text>]
          <Text> {percentage}%</Text>

        </Text>
      </Box>
      <RunningScreen />
    </Box>
  )
}

