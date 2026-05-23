import { useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import { TimerView } from "./components/TimerView";
import { History } from "./components/History";
import { config } from "./config";
import { menuItems, timeItems, type MenuItems, type Screen, type TimeItems } from "./constants";

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

    if (!session || typeof session.time !== "number") {
      return (
        <Box flexDirection="column">
          <Text color={"red"}>No valid active session found.</Text>
          <Text color={"gray"}>Press any key to return to menu (not implemented) or restart the app.</Text>
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

  if (screen === "history") {
    return <History onBack={() => setScreen("menu")} />;
  }

  if (time !== null) {
    return (
      <TimerView
        initialMinutes={time}
        initialPomodoroCount={0}
      />
    );
  }

  if (screen === "exit") {
    return <Text>have a nice day and stay focus!</Text>;
  }

  return <SelectInput items={menuItems} onSelect={startHandleSelect} />;
};
