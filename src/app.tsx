import { useEffect, useState } from "react";
import { useApp, useInput } from "ink";
import { Timer, Router } from "@screens";
import { PRESETS } from "@utils";
import type { MenuItems, Screen, TimeSelectItem } from "@types";

type AppProps = {
  initialSessionConfig?:
    | {
        focus: number;
        shortBreak: number;
        longBreak: number;
      }
    | undefined;
};

export const App = ({ initialSessionConfig }: AppProps) => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [sessionConfig, setSessionConfig] = useState<{
    focus: number;
    shortBreak: number;
    longBreak: number;
    tag?: string;
    description?: string;
  } | null>(initialSessionConfig ?? null);

  const [pendingSessionConfig, setPendingSessionConfig] = useState<{
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
    // If timer is running or in task-setup/wizard where typing is active, let them handle keys
    if (
      sessionConfig !== null ||
      screen === "resume" ||
      screen === "task-setup" ||
      screen === "custom-wizard"
    ) {
      return;
    }

    if (input === "q") {
      setScreen("exit");
      return;
    }

    if (screen === "time-select") {
      if (key.escape) {
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
          setPendingSessionConfig({
            focus: preset.focus,
            shortBreak: preset.shortBreak,
            longBreak: preset.longBreak,
          });
          setScreen("task-setup");
        }
      }
    }
  };

  const onSessionSetupStart = (
    focus: number,
    shortBreak: number,
    longBreak: number,
    tag: string,
    description: string,
  ) => {
    setSessionConfig({
      focus,
      shortBreak,
      longBreak,
      tag,
      description,
    });
    setPendingSessionConfig(null);
  };

  const onSessionSetupCancel = () => {
    setPendingSessionConfig(null);
    setScreen("time-select");
  };

  if (sessionConfig !== null) {
    return (
      <Timer
        focus={sessionConfig.focus}
        shortBreak={sessionConfig.shortBreak}
        longBreak={sessionConfig.longBreak}
        tag={sessionConfig.tag}
        description={sessionConfig.description}
        initialPomodoroCount={0}
      />
    );
  }

  return (
    <Router
      screen={screen}
      setScreen={setScreen}
      pendingSessionConfig={pendingSessionConfig}
      onSessionSetupStart={onSessionSetupStart}
      onSessionSetupCancel={onSessionSetupCancel}
      startHandleSelect={startHandleSelect}
      timeHandlerSelect={timeHandlerSelect}
    />
  );
};
