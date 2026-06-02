import SelectInput from "ink-select-input";
import { Layout } from "@ui";
import { menuItems } from "@utils";
import type { MenuItems } from "@types";

type MainMenuProps = {
  onSelect: (item: MenuItems) => void;
};

export const MainMenu = ({ onSelect }: MainMenuProps) => {
  return (
    <Layout title="Pomo Doro" footerControls={[{ key: "q", label: "quit" }]}>
      <SelectInput items={menuItems} onSelect={onSelect} />
    </Layout>
  );
};
