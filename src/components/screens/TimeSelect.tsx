import SelectInput from "ink-select-input";
import { Layout } from "@ui";
import { timeSelectItems } from "@utils";
import type { TimeSelectItem } from "@types";

interface TimeSelectProps {
  onSelect: (item: TimeSelectItem) => void;
}

export const TimeSelect = ({ onSelect }: TimeSelectProps) => {
  return (
    <Layout
      title="Select Duration"
      footerControls={[
        { key: "b", label: "back to menu" },
        { key: "q", label: "quit" },
      ]}
    >
      <SelectInput items={timeSelectItems} onSelect={onSelect} />
    </Layout>
  );
};
