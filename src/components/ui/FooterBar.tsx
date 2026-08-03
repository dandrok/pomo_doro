import { Box, Text, useStdout } from "ink";
import { useEffect, useState } from "react";
import { useTheme } from "@hooks";

export type Control = {
  key: string;
  label: string;
  description: string;
};

type FooterBarProps = {
  controls: Control[];
};

export const NARROW_COLUMNS_THRESHOLD = 70;

export const FooterBar = ({ controls }: FooterBarProps) => {
  const theme = useTheme();
  const { stdout } = useStdout();
  const [columns, setColumns] = useState(stdout.columns || 80);

  useEffect(() => {
    const onResize = () => setColumns(stdout.columns);
    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  const isNarrow = columns < NARROW_COLUMNS_THRESHOLD;

  return (
    <Box flexDirection="column">
      <Box marginTop={1} gap={1}>
        {controls.map((control) => (
          <Text key={control.key} color={theme.muted}>
            <Text color={theme.primary}>[{control.key}]</Text>
            {!isNarrow && ` ${control.label}`}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
