import { Box, Text, useInput } from "ink";
import { FooterBar } from "./FooterBar";
import packageJson from "../../package.json" with { type: "json" };

interface AboutProps {
  onBack: () => void;
}

export const About = ({ onBack }: AboutProps) => {
  useInput((input) => {
    if (input === "b" || input === "q" || input === "escape") {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan"> About Pomo Doro </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>Version: <Text color="green">{packageJson.version}</Text></Text>
        <Text>Author: <Text color="yellow">{packageJson.author}</Text></Text>
        <Text>Description: {packageJson.description}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold underline>Technologies</Text>
        <Text>- React & Ink (Terminal UI)</Text>
        <Text>- TypeScript</Text>
        <Text>- Vitest (Testing)</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold underline>Contact & Links</Text>
        <Text>GitHub: <Text color="blue">https://github.com/dandrok/pomo_doro</Text></Text>
        <Text>NPM: <Text color="magenta">https://www.npmjs.com/package/pomo-doro-tui</Text></Text>
      </Box>

      <FooterBar 
        controls={[
          { key: "b", label: "back to menu" }
        ]} 
      />
    </Box>
  );
};
