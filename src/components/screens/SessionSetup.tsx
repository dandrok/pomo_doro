import React from "react";
import { Box, Text, useInput } from "ink";
import { IS_TEST_MODE } from "@utils";
import { Layout, FormRow, HELP_CONTROL } from "@ui";
import { useSessionSetup, useHelp, Field } from "@hooks";
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
  const { isHelpOpen, toggleHelp } = useHelp();
  const {
    durations,
    activeField,
    displayTag,
    descriptionText,
    isCustomTagSelected,
  } = useSessionSetup({ ...props, isHelpOpen });
  const theme = useTheme();

  const unit = IS_TEST_MODE ? "sec" : "min";

  const isTypingField =
    activeField === "description" ||
    (activeField === "tag" && isCustomTagSelected);

  useInput((input) => {
    if (isHelpOpen) return;
    if (input === "h" && !isTypingField) toggleHelp();
  });

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
      isHelpOpen={isHelpOpen}
      footerControls={[
        {
          key: "↑/↓",
          label: "navigate",
          description: "Moves between the setup fields",
        },
        {
          key: "◀/▶",
          label: "adjust values/tag",
          description: "Adjusts the highlighted value, or cycles between tags",
        },
        {
          key: "typing",
          label: "auto-inputs",
          description: "Types a custom tag or description directly",
        },
        {
          key: "enter",
          label: "start/advance",
          description: "Starts the session, or advances to the next field",
        },
        {
          key: "esc",
          label: "back",
          description: "Cancels and returns to the previous screen",
        },
        HELP_CONTROL,
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
