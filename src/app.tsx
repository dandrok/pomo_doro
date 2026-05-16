import { useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import { ProgressBar } from "./components/ProgressBar.tsx";
import { config } from "./config.ts";
import { FooterBar } from "./components/FooterBar.tsx";
import { menuItems, timeItems, type MenuItems, type Screen, type TimeItems } from "./constants.ts";

export type Mode = "work" | "shortBreak" | "longBreak";

// TODO: break timer auto play after pomo timer - in progress
// TODO: save sessions - preferably with conf lib
// TODO: "Resume session" should open session from config


export const App = () => {
  // TODO: add custom time
  const [screen, setScreen] = useState<Screen>("menu");
  const [time, setTime] = useState<number | null>(null);
  const [pomodoroCount, setPomodoroCount] = useState<number>(
    () => (config.get("pomodoroCount") as number) || 0,
  );
  const [mode, setMode] = useState<Mode>("work");
  const { exit } = useApp();

  useEffect(() => {
    config.set("pomodoroCount", pomodoroCount);
  }, [pomodoroCount]);

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

  // TODO: make it work
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
      <Box>
        <ProgressBar
          time={session.time}
          mode={session.mode}
          setMode={setMode}
          setPomodoroCount={setPomodoroCount}
          pomodoroCount={session.pomodoroCount}
          initialTimeOut={session.timeOut}
        />
        <FooterBar />
      </Box>
    );
  }

  if (time !== null) {
    return (
      <Box>
        <ProgressBar
          time={time}
          mode={mode}
          setMode={setMode}
          setPomodoroCount={setPomodoroCount}
          pomodoroCount={pomodoroCount}
        />
        <FooterBar />
      </Box>
    );
  }
  if (screen === "exit") {
    return <Text>have a nice day and stay focus!</Text>;
  }

  return <SelectInput items={menuItems} onSelect={startHandleSelect} />;
};
