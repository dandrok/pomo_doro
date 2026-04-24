import { Box, Text } from "ink"
import { useEffect, useState } from "react"
import BigText from 'ink-big-text';
import { padStr } from "../helper/index.ts";

const LOADING_STEPS = 25

type ProgressBarProps = {
  time: number
}

export const ProgressBar = ({ time }: ProgressBarProps) => {
  const seconds = time * 60;
  const [elapsed, setElapsed] = useState(0);
  //TODO: move time counter to seperate component
  const [timeOut, setTimeOut] = useState(seconds);

  const progress = elapsed / seconds;
  const percentage = Math.floor(progress * 100);
  const doneReps = Math.floor(progress * LOADING_STEPS);

  useEffect(() => {
    if (elapsed >= seconds) return
    const timer = setTimeout(() => {
      setElapsed((sec) => sec + 1)
      setTimeOut((sec) => sec - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [elapsed, seconds])


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
    </Box>
  )
}

