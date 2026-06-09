import { Layout, ThemeSelect } from "@ui";
import { menuItems } from "@utils";
import type { MenuItems } from "@types";

type MainMenuProps = {
  onSelect: (item: MenuItems) => void;
};

export const MainMenu = ({ onSelect }: MainMenuProps) => {
  return (
    <Layout title="Pomo Doro">
      <ThemeSelect items={menuItems} onSelect={onSelect} />
    </Layout>
  );
};
