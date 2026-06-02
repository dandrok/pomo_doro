import { Box, Text } from "ink";

export type Control = {
  key: string;
  label: string;
};

type FooterBarProps = {
  controls: Control[];
};

export const FooterBar = ({ controls }: FooterBarProps) => {
  return (
    <Box flexDirection="column">
      <Box marginTop={1} gap={1}>
        {controls.map((control) => (
          <Text key={control.key} color="gray">
            [{control.key}] {control.label}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
