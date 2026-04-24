import { Box, Text } from "ink"
import { useEffect, useState } from "react"

const LOADING_STEPS = 25

type ProgressBarProps = {
  time: number
}

export const ProgressBar = ({ time }: ProgressBarProps) => {
  const seconds = time * 60;
  const [elapsed, setElapsed] = useState(0);

  const progress = elapsed / seconds;
  const percentage = Math.floor(progress * 100);
  const doneReps = Math.floor(progress * LOADING_STEPS);

  useEffect(() => {
    if (elapsed >= seconds) return
    const timer = setTimeout(() => {
      setElapsed((sec) => sec + 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [elapsed, seconds])

  return (
    <Box>
      <Text>[
        <Text>{'█'.repeat(doneReps)}</Text>
        <Text>{'░'.repeat(LOADING_STEPS - doneReps)}</Text>]
        <Text> {percentage}%</Text>

      </Text>
    </Box >
  )
}

