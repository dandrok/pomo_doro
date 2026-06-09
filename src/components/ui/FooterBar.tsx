import { Box, Text } from "ink";
import { useTheme } from "@hooks";

export type Control = {
  key: string;
  label: string;
};

type FooterBarProps = {
  controls: Control[];
};

export const FooterBar = ({ controls }: FooterBarProps) => {
  const theme = useTheme();

  return (
    <Box flexDirection="column">
      <Box marginTop={1} gap={1}>
        {controls.map((control) => (
          <Text key={control.key} color={theme.muted}>
            <Text color={theme.primary}>[{control.key}]</Text> {control.label}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
