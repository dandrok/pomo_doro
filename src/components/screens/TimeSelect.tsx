import { Layout, ThemeSelect } from "@ui";
import { timeSelectItems } from "@utils";
import type { TimeSelectItem } from "@types";

type TimeSelectProps = {
  onSelect: (item: TimeSelectItem) => void;
};

export const TimeSelect = ({ onSelect }: TimeSelectProps) => {
  return (
    <Layout
      title="Select Duration"
      footerControls={[{ key: "esc", label: "back to menu" }]}
    >
      <ThemeSelect items={timeSelectItems} onSelect={onSelect} />
    </Layout>
  );
};
