import React from "react";
import { Box, Text } from "ink";
import { IS_TEST_MODE } from "@utils";
import { Layout, FormRow } from "@ui";
import { useSessionSetup, Field } from "@hooks";
import { useTheme } from "@hooks";

type SessionSetupProps = {
  initialFocus: number;
  initialShortBreak: number;
  initialLongBreak: number;
  startFocusedOnStartButton: boolean;
  onStart: (
    focus: number,
    shortBreak: number,
    longBreak: number,
    tag: string,
    description: string,
  ) => void;
  onCancel: VoidFunction;
};

export const SessionSetup = (props: SessionSetupProps) => {
  const {
    durations,
    activeField,
    displayTag,
    descriptionText,
    isCustomTagSelected,
  } = useSessionSetup(props);
  const theme = useTheme();

  const unit = IS_TEST_MODE ? "sec" : "min";

  const rows = [
    {
      field: "focus" as Field,
      label: "Focus Time",
      value: `${durations.focus} ${unit}`,
      color: theme.work,
      showArrows: true,
      isFocused: false,
    },
    {
      field: "shortBreak" as Field,
      label: "Short Break",
      value: `${durations.shortBreak} ${unit}`,
      color: theme.shortBreak,
      showArrows: true,
      isFocused: false,
    },
    {
      field: "longBreak" as Field,
      label: "Long Break",
      value: `${durations.longBreak} ${unit}`,
      color: theme.longBreak,
      showArrows: true,
      isFocused: false,
    },
    {
      field: "tag" as Field,
      label: "Tag / Category",
      value: displayTag,
      color: theme.secondary,
      showArrows: !isCustomTagSelected,
      isFocused: isCustomTagSelected,
    },
    {
      field: "description" as Field,
      label: "Description",
      value: descriptionText || "Optional comment...",
      color: theme.muted,
      showArrows: false,
      isFocused: true,
    },
  ] as const;

  const isStartActive = activeField === "start";

  return (
    <Layout
      title="Session Setup"
      footerControls={[
        { key: "↑/↓", label: "navigate" },
        { key: "◀/▶", label: "adjust values/tag" },
        { key: "typing", label: "auto-inputs" },
        { key: "enter", label: "start/advance" },
        { key: "esc", label: "back" },
      ]}
    >
      <Box flexDirection="column" marginBottom={1}>
        {rows.map((row) => (
          <FormRow
            key={row.field}
            label={row.label}
            value={row.value}
            isActive={activeField === row.field}
            color={row.color}
            showArrows={row.showArrows}
            isFocused={activeField === row.field && row.isFocused}
          />
        ))}
      </Box>

      <Box flexDirection="column" marginTop={1} gap={0}>
        <Box marginY={0} height={1}>
          <Text
            color={isStartActive ? theme.primary : theme.text}
            bold={isStartActive}
          >
            {isStartActive ? ` ❯ Start Session` : `   Start Session`}
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};
