import { Box, Text, useInput } from "ink";
import { useHistory } from "../hooks/useHistory";
import { formatTime } from "../utils/helpers";
import { DailyBarChart } from "./DailyBarChart";
import { FooterBar } from "./FooterBar";

interface HistoryProps {
  onBack: () => void;
}

export const History = ({ onBack }: HistoryProps) => {
  const { history, totals } = useHistory();
  const last7Days = [...history].slice(-7).reverse();

  useInput((input) => {
    if (input === "b" || input === "q" || input === "escape") {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          {" "}
          Productivity Dashboard{" "}
        </Text>
      </Box>

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

      <FooterBar controls={[{ key: "b", label: "back to menu" }]} />
    </Box>
  );
};
