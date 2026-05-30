import { Text } from "ink";
import { MainMenu } from "./MainMenu";
import { TimeSelect } from "./TimeSelect";
import { CustomPresetWizard } from "./CustomPresetWizard";
import { History } from "./History";
import { About } from "./About";
import { Resume } from "./Resume";
import type { Screen, MenuItems, TimeSelectItem } from "@types";

interface RouterProps {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  setSessionConfig: (
    config: {
      focus: number;
      shortBreak: number;
      longBreak: number;
    } | null,
  ) => void;
  startHandleSelect: (item: MenuItems) => void;
  timeHandlerSelect: (item: TimeSelectItem) => void;
}

export const Router = ({
  screen,
  setScreen,
  setSessionConfig,
  startHandleSelect,
  timeHandlerSelect,
}: RouterProps) => {
  const screens: Record<Screen, () => React.ReactNode> = {
    menu: () => <MainMenu onSelect={startHandleSelect} />,
    "time-select": () => <TimeSelect onSelect={timeHandlerSelect} />,
    "custom-wizard": () => (
      <CustomPresetWizard
        onStart={(focus, shortBreak, longBreak) => {
          setSessionConfig({ focus, shortBreak, longBreak });
          setScreen("menu");
        }}
        onCancel={() => {
          setScreen("time-select");
        }}
      />
    ),
    resume: () => <Resume />,
    history: () => <History onBack={() => setScreen("menu")} />,
    about: () => <About onBack={() => setScreen("menu")} />,
    exit: () => <Text>have a nice day and stay focus!</Text>,
  };

  return screens[screen]();
};
