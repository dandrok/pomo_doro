import { Box, Text, useInput } from "ink";
import { Layout } from "@ui";
import {
  APP_VERSION,
  APP_AUTHOR,
  APP_DESCRIPTION,
  APP_LINKS,
  TECHNOLOGIES,
} from "@utils";

type AboutProps = {
  onBack: () => void;
};

export const About = ({ onBack }: AboutProps) => {
  useInput((input, key) => {
    if (input === "b" || key.escape) {
      onBack();
    }
  });

  return (
    <Layout
      title="About Pomo Doro"
      footerControls={[
        { key: "b", label: "back to menu" },
        { key: "q", label: "quit" },
      ]}
    >
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
    </Layout>
  );
};
