import { Text } from "ink";
import { MainMenu } from "./MainMenu";
import { TimeSelect } from "./TimeSelect";
import { SessionSetup } from "./SessionSetup";
import { History } from "./History";
import { About } from "./About";
import { Resume } from "./Resume";
import type { Screen, MenuItems, TimeSelectItem } from "@types";

type RouterProps = {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  pendingSessionConfig: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  } | null;
  onSessionSetupStart: (
    focus: number,
    shortBreak: number,
    longBreak: number,
    tag: string,
    description: string,
  ) => void;
  onSessionSetupCancel: VoidFunction;
  startHandleSelect: (item: MenuItems) => void;
  timeHandlerSelect: (item: TimeSelectItem) => void;
};

export const Router = ({
  screen,
  setScreen,
  pendingSessionConfig,
  onSessionSetupStart,
  onSessionSetupCancel,
  startHandleSelect,
  timeHandlerSelect,
}: RouterProps) => {
  const screens: Record<Screen, () => React.ReactNode> = {
    menu: () => <MainMenu onSelect={startHandleSelect} />,
    "time-select": () => <TimeSelect onSelect={timeHandlerSelect} />,
    "custom-wizard": () => (
      <SessionSetup
        initialFocus={25}
        initialShortBreak={5}
        initialLongBreak={15}
        startFocusedOnStartButton={false}
        onStart={onSessionSetupStart}
        onCancel={onSessionSetupCancel}
      />
    ),
    "task-setup": () => (
      <SessionSetup
        initialFocus={pendingSessionConfig?.focus ?? 25}
        initialShortBreak={pendingSessionConfig?.shortBreak ?? 5}
        initialLongBreak={pendingSessionConfig?.longBreak ?? 15}
        startFocusedOnStartButton={true}
        onStart={onSessionSetupStart}
        onCancel={onSessionSetupCancel}
      />
    ),
    resume: () => <Resume />,
    history: () => <History onBack={() => setScreen("menu")} />,
    about: () => <About onBack={() => setScreen("menu")} />,
    exit: () => <Text>have a nice day and stay focus!</Text>,
  };

  return screens[screen]();
};
