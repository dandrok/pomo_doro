import { Box, Text, useStdout } from "ink";
import { useEffect, useState } from "react";
import { useTheme } from "@hooks";
import { NARROW_COLUMNS_THRESHOLD, type Control } from "./FooterBar";

export const HELP_CONTROL: Control = {
  key: "h",
  label: "help",
  description: "Show what each key on this screen does",
};

type HelpOverlayProps = {
  controls: Control[];
};

export const HelpOverlay = ({ controls }: HelpOverlayProps) => {
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
  const shortcutWidth = Math.max(
    ...controls.map((control) => `[${control.key}] ${control.label}`.length),
  );

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.primary}
      paddingX={2}
      paddingY={1}
      gap={1}
      width="fit-content"
    >
      <Text bold color={theme.primary}>
        Help
      </Text>
      <Box flexDirection="column" gap={isNarrow ? 1 : 0}>
        {controls.map((control) => {
          const shortcut = `[${control.key}] ${control.label}`;
          return (
            <Box key={control.key} flexDirection={isNarrow ? "column" : "row"}>
              <Text color={theme.secondary}>
                {isNarrow ? shortcut : shortcut.padEnd(shortcutWidth)}
              </Text>
              <Text color={theme.muted}>
                <Text color={theme.primary}>
                  {isNarrow ? "  └─▶ " : "  ──▶ "}
                </Text>
                {control.description}
              </Text>
            </Box>
          );
        })}
      </Box>
      <Text color={theme.muted} italic>
        press [h] or [esc] to close
      </Text>
    </Box>
  );
};
