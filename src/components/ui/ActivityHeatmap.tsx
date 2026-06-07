import { Box, Text } from "ink";
import type { DailyStats } from "@types";

type ActivityHeatmapProps = {
  data: DailyStats[];
  weeks?: number;
  dailyGoalSeconds?: number;
};

const DEFAULT_WEEKS = 15;
const DEFAULT_DAILY_GOAL = 4 * 3600; // 4 hours

const getISODate = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getIntensity = (seconds: number, goal: number) => {
  if (seconds === 0) return { char: "■", color: "#333333" }; // dark gray for empty
  const ratio = seconds / goal;
  if (ratio < 0.25) return { char: "■", color: "#004400" }; // very dark green
  if (ratio < 0.5) return { char: "■", color: "#008800" }; // dark green
  if (ratio < 0.8) return { char: "■", color: "#00cc00" }; // green
  return { char: "■", color: "#00ff00" }; // bright green
};

export const ActivityHeatmap = ({
  data,
  weeks = DEFAULT_WEEKS,
  dailyGoalSeconds = DEFAULT_DAILY_GOAL,
}: ActivityHeatmapProps) => {
  const normalizedDailyGoal = Math.max(1, Math.floor(dailyGoalSeconds));

  // Map data for fast lookup by date string
  const dataMap = new Map(data.map((d) => [d.date, d.totalFocusSeconds]));

  const today = new Date();

  // Calculate day of week (Monday = 0, Sunday = 6)
  const currentDayOfWeek = (today.getDay() + 6) % 7;

  // End of the grid is the Sunday of the current week
  const daysUntilSunday = 6 - currentDayOfWeek;
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysUntilSunday);

  const totalDays = weeks * 7;
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - totalDays + 1);

  // Initialize 7 rows (Mon-Sun)
  const grid: { date: string; seconds: number }[][] = Array.from(
    { length: 7 },
    () => [],
  );

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = getISODate(d);

    // Map to row index (Mon=0, Sun=6)
    const rowIdx = (d.getDay() + 6) % 7;
    grid[rowIdx]!.push({
      date: dateStr,
      seconds: dataMap.get(dateStr) || 0,
    });
  }

  const rowLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box marginBottom={1}>
        <Text underline>Activity Heatmap (Last {weeks} Weeks)</Text>
      </Box>

      {/* Grid container */}
      <Box flexDirection="column" gap={0}>
        {grid.map((row, rIdx) => (
          <Box key={rowLabels[rIdx]} flexDirection="row" gap={1}>
            {/* Row Label */}
            <Box width={3}>
              <Text color="gray">{rIdx % 2 === 0 ? rowLabels[rIdx] : ""}</Text>
            </Box>

            {/* Cells */}
            <Box flexDirection="row">
              {row.map((cell) => {
                const { char, color } = getIntensity(
                  cell.seconds,
                  normalizedDailyGoal,
                );
                // We add a space after each block to make it look like a grid
                return (
                  <Text key={cell.date} color={color}>
                    {char}{" "}
                  </Text>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box flexDirection="row" marginTop={1} gap={2}>
        <Text color="gray">Less</Text>
        <Text color="#333333">■</Text>
        <Text color="#004400">■</Text>
        <Text color="#008800">■</Text>
        <Text color="#00cc00">■</Text>
        <Text color="#00ff00">■</Text>
        <Text color="gray">More</Text>
      </Box>
    </Box>
  );
};
