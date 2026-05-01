import { useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { ProgressBar } from "./components/ProgressBar.tsx";

type Screen = "menu" | "time-select" | "exit";
type MenuItems = { label: string; value: Screen };
type TimeItems = { label: string; value: number };

const menuItems: MenuItems[] = [
  {
    label: "Start",
    value: "time-select",
  },
  {
    label: "Exit",
    value: "exit",
  },
];

const timeItems: TimeItems[] = [
  {
    label: "0.1min",
    value: .1,
  },
  {
    label: "25min",
    value: 25,
  },
  {
    label: "35min",
    value: 35,
  },
  {
    label: "45min",
    value: 45,
  },
];
// TODO: break timer auto play after pomo timer - in progress
// TODO: save sessions - preferably with conf lib
// TODO: add to main menu "Resume session" item
// TODO: "Resume session" should open session from config

export type Mode = 'work' | 'shortBreak' | 'longBreak'

export const App = () => {
  // TODO: add custom time
  const [screen, setScreen] = useState<Screen>("menu");
  const [time, setTime] = useState<number | null>(null);
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [mode, setMode] = useState<Mode>('work')

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

  if (time !== null) {
    return (
      <Box>
        <ProgressBar time={time} mode={mode} setMode={setMode} setPomodoroCount={setPomodoroCount} pomodoroCount={pomodoroCount} />
      </Box>
    );
  }

  if (screen === "exit") {
    return <Text>have a nice day and stay focus!</Text>;
  }

  return <SelectInput items={menuItems} onSelect={startHandleSelect} />;
};
