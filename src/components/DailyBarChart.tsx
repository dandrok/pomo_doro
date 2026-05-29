import { Box, Text } from "ink";
import type { DailyStats } from "../types";
import { formatTime } from "../utils/helpers";

interface DailyBarChartProps {
  data: DailyStats[];
  barWidth?: number;
  dailyGoalSeconds?: number;
}

const DEFAULT_BAR_WIDTH = 20;
const DEFAULT_DAILY_GOAL = 4 * 3600; // 4 hours

export const DailyBarChart = ({
  data,
  barWidth = DEFAULT_BAR_WIDTH,
  dailyGoalSeconds = DEFAULT_DAILY_GOAL,
}: DailyBarChartProps) => {
  if (data.length === 0) {
    return (
      <Text color="gray italic">
        No data recorded yet. Start working to see your progress!
      </Text>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text underline>Last 7 Days (Focus Time)</Text>
      </Box>

      {data.map((day) => {
        const progress = Math.min(1, day.totalFocusSeconds / dailyGoalSeconds);
        const doneReps = Math.floor(progress * barWidth);

        return (
          <Box key={day.date} gap={1}>
            <Text color="gray">{day.date}</Text>
            <Text color="cyan">
              {"█".repeat(doneReps)}
              <Text color="gray">{"░".repeat(barWidth - doneReps)}</Text>
            </Text>
            <Text bold>{formatTime(day.totalFocusSeconds)}</Text>
            <Text dimColor>({day.completedPomodoros} sessions)</Text>
          </Box>
        );
      })}
    </Box>
  );
};
