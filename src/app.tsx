import { useEffect, useState } from "react";
import { useApp, useInput } from "ink";
import { Timer, Router } from "@screens";
import { PRESETS } from "@utils";
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
    // If timer is running, let Timer handle its own keys
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

  if (sessionConfig !== null) {
    return (
      <Timer
        focus={sessionConfig.focus}
        shortBreak={sessionConfig.shortBreak}
        longBreak={sessionConfig.longBreak}
        initialPomodoroCount={0}
      />
    );
  }

  return (
    <Router
      screen={screen}
      setScreen={setScreen}
      setSessionConfig={setSessionConfig}
      startHandleSelect={startHandleSelect}
      timeHandlerSelect={timeHandlerSelect}
    />
  );
};
