import { Box, Text } from "ink";
export const FooterBar = () => {
  return (
    <Box flexDirection="column">
      <Box marginTop={1}>
        <Text>[p] pause [r] resume [q] quit</Text>
      </Box>
    </Box>
  );
};
