import { Box, Text, useInput } from "ink";
import { config } from "../config";
import { padStr } from "../helpers";

interface HistoryProps {
  onBack: () => void;
}

export const History = ({ onBack }: HistoryProps) => {
  const history = config.get("history") || [];
  const last7Days = history.slice(-7).reverse();

  useInput((input) => {
    if (input === "b" || input === "q" || input === "escape") {
      onBack();
    }
  });

  const totalFocusSeconds = history.reduce((acc, curr) => acc + curr.totalFocusSeconds, 0);
  const totalCompleted = history.reduce((acc, curr) => acc + curr.completedPomodoros, 0);

  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} borderStyle="round" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan"> Productivity Dashboard </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>Total Focus Time: <Text color="green">{formatSeconds(totalFocusSeconds)}</Text></Text>
        <Text>Completed Pomodoros: <Text color="green">{totalCompleted}</Text></Text>
      </Box>

      <Box marginBottom={1}>
        <Text underline>Last 7 Days (Focus Time)</Text>
      </Box>

      {last7Days.length === 0 ? (
        <Text color="gray italic">No data recorded yet. Start working to see your progress!</Text>
      ) : (
        last7Days.map((day) => {
          const hours = day.totalFocusSeconds / 3600;
          // Scale: 1 hour = 10 blocks
          const blocks = Math.min(40, Math.floor(hours * 10));
          return (
            <Box key={day.date} gap={1}>
              <Text color="gray">{day.date}</Text>
              <Text color="cyan">{"█".repeat(blocks)}{"░".repeat(Math.max(0, 5 - blocks))}</Text>
              <Text>{formatSeconds(day.totalFocusSeconds)}</Text>
            </Box>
          );
        })
      )}

      <Box marginTop={2}>
        <Text >[b] back to menu</Text>
      </Box>
    </Box>
  );
};
