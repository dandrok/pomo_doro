import { Box, Text, useInput } from "ink";
import { useHistory } from "@hooks";
import { formatTime } from "@utils";
import { DailyBarChart, Layout } from "@ui";

interface HistoryProps {
  onBack: () => void;
}

export const History = ({ onBack }: HistoryProps) => {
  const { history, totals } = useHistory();
  const last7Days = [...history].slice(-7).reverse();

  useInput((input, key) => {
    if (input === "b" || key.escape) {
      onBack();
    }
  });

  return (
    <Layout
      title="Productivity Dashboard"
      footerControls={[
        { key: "b", label: "back to menu" },
        { key: "q", label: "quit" },
      ]}
    >
      <Box flexDirection="column" marginBottom={1}>
        <Text>
          Total Focus Time:{" "}
          <Text color="green">{formatTime(totals.totalFocusSeconds)}</Text>
        </Text>
        <Text>
          Completed Pomodoros:{" "}
          <Text color="green">{totals.totalCompleted}</Text>
        </Text>
      </Box>

      <DailyBarChart data={last7Days} />
    </Layout>
  );
};
