import { Box, Text, useInput } from "ink";
import { FooterBar } from "./FooterBar";
import {
  APP_VERSION,
  APP_AUTHOR,
  APP_DESCRIPTION,
  APP_LINKS,
  TECHNOLOGIES,
} from "../constants";

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
        <Text bold color="cyan">
          {" "}
          About Pomo Doro{" "}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>
          Version: <Text color="green">{APP_VERSION}</Text>
        </Text>
        <Text>
          Author: <Text color="yellow">{APP_AUTHOR}</Text>
        </Text>
        <Text>Description: {APP_DESCRIPTION}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold underline>
          Technologies
        </Text>
        {TECHNOLOGIES.map((tech) => (
          <Text key={tech}>- {tech}</Text>
        ))}
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold underline>
          Contact & Links
        </Text>
        <Text>
          GitHub: <Text color="blue">{APP_LINKS.github}</Text>
        </Text>
        <Text>
          NPM: <Text color="magenta">{APP_LINKS.npm}</Text>
        </Text>
      </Box>

      <FooterBar controls={[{ key: "b", label: "back to menu" }]} />
    </Box>
  );
};
