import { useState } from "react";
import { Box, Text, useInput } from "ink";
import { IS_TEST_MODE } from "@utils";
import { Layout } from "@ui";

type CustomPresetWizardProps = {
  onStart: (focus: number, shortBreak: number, longBreak: number) => void;
  onCancel: () => void;
};

type Field = "focus" | "shortBreak" | "longBreak" | "start";

export const CustomPresetWizard = ({
  onStart,
  onCancel,
}: CustomPresetWizardProps) => {
  // Store values: in minutes for normal mode, or in seconds for test mode (for easier adjustment)
  const [focus, setFocus] = useState(IS_TEST_MODE ? 6 : 25);
  const [shortBreak, setShortBreak] = useState(IS_TEST_MODE ? 3 : 5);
  const [longBreak, setLongBreak] = useState(IS_TEST_MODE ? 6 : 15);

  const fields: Field[] = ["focus", "shortBreak", "longBreak", "start"];
  const [activeIdx, setActiveIdx] = useState(0);

  const activeField = fields[activeIdx]!;

  useInput((input, key) => {
    if (key.upArrow) {
      setActiveIdx((prev) => (prev === 0 ? fields.length - 1 : prev - 1));
    } else if (key.downArrow) {
      setActiveIdx((prev) => (prev === fields.length - 1 ? 0 : prev + 1));
    } else if (key.leftArrow) {
      if (activeField === "focus") {
        setFocus((prev) => Math.max(1, prev - 1));
      } else if (activeField === "shortBreak") {
        setShortBreak((prev) => Math.max(1, prev - 1));
      } else if (activeField === "longBreak") {
        setLongBreak((prev) => Math.max(1, prev - 1));
      }
    } else if (key.rightArrow) {
      if (activeField === "focus") {
        setFocus((prev) => Math.min(IS_TEST_MODE ? 300 : 180, prev + 1));
      } else if (activeField === "shortBreak") {
        setShortBreak((prev) => Math.min(IS_TEST_MODE ? 120 : 60, prev + 1));
      } else if (activeField === "longBreak") {
        setLongBreak((prev) => Math.min(IS_TEST_MODE ? 300 : 120, prev + 1));
      }
    } else if (key.return) {
      if (activeField === "start") {
        triggerStart();
      } else {
        // Pressing Enter on a setting field moves down to the next field
        setActiveIdx((prev) => (prev === fields.length - 1 ? 0 : prev + 1));
      }
    } else if (input === "b" || key.escape) {
      onCancel();
    }
  });

  const triggerStart = () => {
    if (IS_TEST_MODE) {
      // In test mode, values are in seconds. Convert them back to fractional minutes
      onStart(focus / 60, shortBreak / 60, longBreak / 60);
    } else {
      onStart(focus, shortBreak, longBreak);
    }
  };

  const renderRow = (
    field: Field,
    label: string,
    valueStr: string,
    color: string,
  ) => {
    const isActive = activeField === field;
    return (
      <Box key={field} marginY={0} height={1}>
        <Text color={isActive ? "cyan" : "system"} bold={isActive}>
          {isActive ? " ❯ " : "   "}
          {label.padEnd(16)}
        </Text>
        <Box width={10} justifyContent="center">
          <Text color={isActive ? color : "system"} bold={isActive}>
            {isActive ? "◀ " : "  "}
            {valueStr}
            {isActive ? " ▶" : "  "}
          </Text>
        </Box>
      </Box>
    );
  };

  const renderButton = (field: Field, label: string, color: string) => {
    const isActive = activeField === field;
    return (
      <Box key={field} marginY={0} height={1}>
        <Text color={isActive ? color : "system"} bold={isActive}>
          {isActive ? ` ❯ ${label}` : `   ${label}`}
        </Text>
      </Box>
    );
  };

  const unit = IS_TEST_MODE ? "sec" : "min";

  return (
    <Layout
      title="Custom Preset Wizard"
      footerControls={[
        { key: "↑/↓", label: "navigate" },
        { key: "◀/▶", label: "adjust values" },
        { key: "enter", label: "select" },
        { key: "b", label: "back" },
        { key: "q", label: "quit" },
      ]}
    >
      <Box flexDirection="column" marginBottom={1}>
        {renderRow("focus", "Focus Time", `${focus} ${unit}`, "greenBright")}
        {renderRow(
          "shortBreak",
          "Short Break",
          `${shortBreak} ${unit}`,
          "cyanBright",
        )}
        {renderRow(
          "longBreak",
          "Long Break",
          `${longBreak} ${unit}`,
          "magentaBright",
        )}
      </Box>

      <Box flexDirection="column" marginTop={1} gap={0}>
        {renderButton("start", "Start Session", "greenBright")}
      </Box>
    </Layout>
  );
};
