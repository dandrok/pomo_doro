import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { Layout, FormRow } from "@ui";
import { config } from "@utils";

type SettingsProps = {
  onBack: () => void;
};

export const Settings = ({ onBack }: SettingsProps) => {
  const [dailyGoal, setDailyGoal] = useState(
    () => config.get("dailyGoal") ?? 8,
  );
  const [isMuted, setIsMuted] = useState(() => config.get("isMuted") ?? false);
  const [activeIdx, setActiveIdx] = useState(0);

  const fields = ["dailyGoal", "isMuted", "save"] as const;
  const activeField = fields[activeIdx];

  const handleSave = () => {
    config.set("dailyGoal", dailyGoal);
    config.set("isMuted", isMuted);
    onBack();
  };

  useInput((input, key) => {
    if (key.escape) {
      onBack();
      return;
    }

    if (key.upArrow) {
      setActiveIdx((prev) => (prev === 0 ? fields.length - 1 : prev - 1));
      return;
    }

    if (key.downArrow) {
      setActiveIdx((prev) => (prev === fields.length - 1 ? 0 : prev + 1));
      return;
    }

    if (key.return) {
      if (activeField === "save") {
        handleSave();
      } else {
        setActiveIdx((prev) => (prev === fields.length - 1 ? 0 : prev + 1));
      }
      return;
    }

    if (key.leftArrow) {
      if (activeField === "dailyGoal") {
        setDailyGoal((prev) => Math.max(1, prev - 1));
      } else if (activeField === "isMuted") {
        setIsMuted((prev) => !prev);
      }
      return;
    }

    if (key.rightArrow) {
      if (activeField === "dailyGoal") {
        setDailyGoal((prev) => Math.min(50, prev + 1));
      } else if (activeField === "isMuted") {
        setIsMuted((prev) => !prev);
      }
      return;
    }
  });

  return (
    <Layout
      title="Settings"
      footerControls={[
        { key: "↑/↓", label: "navigate" },
        { key: "◀/▶", label: "adjust value" },
        { key: "enter", label: "save/advance" },
        { key: "esc", label: "cancel" },
      ]}
    >
      <Box flexDirection="column" marginBottom={1}>
        <FormRow
          label="Daily Pomodoro Goal"
          value={dailyGoal.toString()}
          isActive={activeField === "dailyGoal"}
          showArrows={true}
        />
        <FormRow
          label="Global Mute"
          value={isMuted ? "ON" : "OFF"}
          isActive={activeField === "isMuted"}
          showArrows={true}
        />
      </Box>

      <Box flexDirection="column" marginTop={1} gap={0}>
        <Box marginY={0} height={1}>
          <Text
            color={activeField === "save" ? "greenBright" : "system"}
            bold={activeField === "save"}
          >
            {activeField === "save" ? ` ❯ Save Settings` : `   Save Settings`}
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};
