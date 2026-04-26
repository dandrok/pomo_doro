import { Box, Text } from "ink"
// TODO: add [q] to quit
export const RunningScreen = () => {

  return (
    <Box flexDirection="column">
      <Box marginTop={1}>
        <Text>
          [p] pause [r] resume
        </Text>
      </Box>
    </Box>
  )
}

