import { Box, Text, useInput, useStdout } from "ink";
import { useState, useEffect } from "react";
import { useHistory } from "@hooks";
import { formatTime, calculateTagTotals, config, IS_TEST_MODE } from "@utils";
import {
  ActivityHeatmap,
  Layout,
  StackedBarChart,
  type StackedBarData,
} from "@ui";

type HistoryProps = {
  onBack: () => void;
};

export const History = ({ onBack }: HistoryProps) => {
  const { history, totals } = useHistory();
  const tagTotals = calculateTagTotals(history);
  const dailyFocusGoalHours = config.get("dailyFocusGoal") ?? 4;
  const goalMultiplier = IS_TEST_MODE ? 1 : 3600;

  const colorPalette = [
    "cyanBright",
    "magentaBright",
    "greenBright",
    "yellowBright",
    "blueBright",
    "redBright",
  ];
  const charPalette = ["█", "▓", "▒", "░"];
  const barData: StackedBarData[] = tagTotals.map((t, index) => ({
    label: t.tag,
    value: t.focusSeconds,
    color: colorPalette[index % colorPalette.length]!,
    char: charPalette[index % charPalette.length]!,
  }));

  const { stdout } = useStdout();
  const [columns, setColumns] = useState(stdout.columns || 80);

  useEffect(() => {
    const onResize = () => setColumns(stdout.columns);
    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  const isNarrow = columns <= 85;

  // Group tags into rows of 2 for the legend grid
  const legendRows = [];
  for (let i = 0; i < tagTotals.length; i += 2) {
    legendRows.push(tagTotals.slice(i, i + 2));
  }

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  return (
    <Layout
      title="Productivity Dashboard"
      footerControls={[{ key: "esc", label: "back to menu" }]}
    >
      <Box flexDirection={isNarrow ? "column" : "row"} gap={isNarrow ? 2 : 4}>
        {/* Left Column: Stats & Bar Chart */}
        <Box flexDirection="column" width={isNarrow ? "100%" : 46}>
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

          <ActivityHeatmap
            data={history}
            weeks={15}
            dailyGoalSeconds={dailyFocusGoalHours * goalMultiplier}
          />
        </Box>

        {/* Right Column: Tag Breakdown */}
        <Box flexDirection="column" width={isNarrow ? "100%" : 36}>
          <Box marginBottom={1}>
            <Text underline>Tag Breakdown (Focus Time)</Text>
          </Box>
          {barData.length === 0 ? (
            <Text color="gray" italic>
              No tags recorded yet.
            </Text>
          ) : (
            <StackedBarChart
              data={barData}
              barWidth={isNarrow ? Math.max(10, columns - 4) : 36}
              legend={
                <Box flexDirection="column" gap={1}>
                  {legendRows.map((rowTags, rIdx) => (
                    <Box key={`legend-row-${rIdx}`} flexDirection="row" gap={2}>
                      {rowTags.map((t) => {
                        const index = tagTotals.findIndex(
                          (x) => x.tag === t.tag,
                        );
                        const pct =
                          totals.totalFocusSeconds > 0
                            ? Math.round(
                                (t.focusSeconds / totals.totalFocusSeconds) *
                                  100,
                              )
                            : 0;
                        const color =
                          colorPalette[index % colorPalette.length]!;
                        const char = charPalette[index % charPalette.length]!;
                        return (
                          <Box key={t.tag} flexDirection="column" width="50%">
                            <Box gap={1}>
                              <Text color={color} bold>
                                {char} {t.tag}
                              </Text>
                              <Text color="gray">({pct}%)</Text>
                            </Box>
                            <Box gap={1}>
                              <Text>{formatTime(t.focusSeconds)}</Text>
                              <Text color="gray">| {t.completedPomodoros}</Text>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              }
            />
          )}
        </Box>
      </Box>
    </Layout>
  );
};
