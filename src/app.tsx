import { useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import { TimerView } from "./components/TimerView.tsx";
import { config } from "./config.ts";
import { menuItems, timeItems, type MenuItems, type Screen, type TimeItems } from "./constants.ts";

export type Mode = "work" | "shortBreak" | "longBreak";

export const App = () => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [time, setTime] = useState<number | null>(null);
  const { exit } = useApp();

  useEffect(() => {
    if (screen === "exit") {
      exit();
    }
  }, [screen, exit]);

  const startHandleSelect = (item: MenuItems) => setScreen(item.value);

  const timeHandlerSelect = (item: TimeItems) => {
    setTime(item.value);
    setScreen("menu");
  };

  if (screen === "time-select") {
    return (
      <Box>
        <SelectInput items={timeItems} onSelect={timeHandlerSelect} />
      </Box>
    );
  }

  if (screen === "resume") {
    const session = config.get("activeSession");

    if (!session) {
      return (
        <Box>
          <Text color={"red"}>no active session found</Text>
        </Box>
      );
    }

    return (
      <TimerView
        initialMinutes={session.time}
        initialSecondsRemaining={session.timeOut}
        initialMode={session.mode}
        initialPomodoroCount={session.pomodoroCount}
      />
    );
  }

  if (time !== null) {
    return (
      <TimerView 
        initialMinutes={time} 
        initialPomodoroCount={config.get("pomodoroCount") as number || 0}
      />
    );
  }

  if (screen === "exit") {
    return <Text>have a nice day and stay focus!</Text>;
  }

  return <SelectInput items={menuItems} onSelect={startHandleSelect} />;
};
