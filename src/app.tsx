import { useEffect, useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import SelectInput from "ink-select-input";
import { TimerView } from "./components/TimerView";
import { CustomPresetWizard } from "./components/CustomPresetWizard";
import { History } from "./components/History";
import { About } from "./components/About";
import { HeaderBar } from "./components/HeaderBar";
import { FooterBar } from "./components/FooterBar";
import { config } from "./utils/config";
import {
  menuItems,
  timeSelectItems,
  PRESETS,
  IS_TEST_MODE,
} from "./utils/constants";
import type { MenuItems, Screen, TimeSelectItem } from "./types";

export const App = () => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [sessionConfig, setSessionConfig] = useState<{
    focus: number;
    shortBreak: number;
    longBreak: number;
  } | null>(null);
  const { exit } = useApp();

  useEffect(() => {
    if (screen === "exit") {
      exit();
    }
  }, [screen, exit]);

  useInput((input, key) => {
    // If timer is running, let TimerView handle its own keys
    if (sessionConfig !== null || screen === "resume") {
      return;
    }

    if (input === "q") {
      setScreen("exit");
      return;
    }

    if (screen === "time-select") {
      if (input === "b" || key.escape) {
        setScreen("menu");
      }
    }
  });

  const startHandleSelect = (item: MenuItems) => setScreen(item.value);

  const timeHandlerSelect = (item: TimeSelectItem) => {
    if (item.value === "custom") {
      setScreen("custom-wizard");
    } else {
      const match = item.value.match(/^preset_([\d.]+)$/);
      if (match) {
        const focusVal = parseFloat(match[1]!);
        const preset = PRESETS.find((p) => p.focus === focusVal);
        if (preset) {
          setSessionConfig({
            focus: preset.focus,
            shortBreak: preset.shortBreak,
            longBreak: preset.longBreak,
          });
          setScreen("menu");
        }
      }
    }
  };

  if (screen === "time-select") {
    return (
      <Box flexDirection="column" padding={1}>
        <HeaderBar title="Select Duration" />
        <SelectInput items={timeSelectItems} onSelect={timeHandlerSelect} />
        <FooterBar
          controls={[
            { key: "b", label: "back to menu" },
            { key: "q", label: "quit" },
          ]}
        />
      </Box>
    );
  }

  if (screen === "custom-wizard") {
    return (
      <CustomPresetWizard
        onStart={(focus, shortBreak, longBreak) => {
          setSessionConfig({ focus, shortBreak, longBreak });
          setScreen("menu");
        }}
        onCancel={() => {
          setScreen("time-select");
        }}
      />
    );
  }

  if (screen === "resume") {
    const session = config.get("activeSession");

    if (
      !session ||
      (typeof session.focus !== "number" && typeof session.time !== "number")
    ) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color={"red"}>No valid active session found.</Text>
          <Text color={"gray"}>
            Press any key to return to menu (not implemented) or restart the
            app.
          </Text>
        </Box>
      );
    }

    const focus = session.focus ?? session.time ?? 25;
    const shortBreak = session.shortBreak ?? (IS_TEST_MODE ? 0.05 : 5);
    const longBreak = session.longBreak ?? (IS_TEST_MODE ? 0.1 : 15);

    return (
      <TimerView
        focus={focus}
        shortBreak={shortBreak}
        longBreak={longBreak}
        initialSecondsRemaining={session.timeOut}
        initialMode={session.mode}
        initialPomodoroCount={session.pomodoroCount}
      />
    );
  }

  if (screen === "history") {
    return <History onBack={() => setScreen("menu")} />;
  }

  if (screen === "about") {
    return <About onBack={() => setScreen("menu")} />;
  }

  if (sessionConfig !== null) {
    return (
      <TimerView
        focus={sessionConfig.focus}
        shortBreak={sessionConfig.shortBreak}
        longBreak={sessionConfig.longBreak}
        initialPomodoroCount={0}
      />
    );
  }

  if (screen === "exit") {
    return <Text>have a nice day and stay focus!</Text>;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <HeaderBar title="Pomo Doro" />
      <SelectInput items={menuItems} onSelect={startHandleSelect} />
      <FooterBar controls={[{ key: "q", label: "quit" }]} />
    </Box>
  );
};
