import { Box, Text, useInput } from "ink";
import { useHistory } from "@hooks";
import { formatTime, calculateTagTotals, config, IS_TEST_MODE } from "@utils";
import { DailyBarChart, Layout } from "@ui";

type HistoryProps = {
  onBack: () => void;
};

export const History = ({ onBack }: HistoryProps) => {
  const { history, totals } = useHistory();
  const last7Days = [...history].slice(-7).reverse();
  const tagTotals = calculateTagTotals(history);
  const dailyFocusGoalHours = config.get("dailyFocusGoal") ?? 4;
  const goalMultiplier = IS_TEST_MODE ? 1 : 3600;

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
      <Box flexDirection="row" gap={4}>
        {/* Left Column: Stats & Bar Chart */}
        <Box flexDirection="column" width={46}>
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

          <DailyBarChart
            data={last7Days}
            barWidth={15}
            dailyGoalSeconds={dailyFocusGoalHours * goalMultiplier}
          />
        </Box>

        {/* Right Column: Tag Breakdown */}
        <Box flexDirection="column" width={30}>
          <Box marginBottom={1}>
            <Text underline>Tag Breakdown (Focus Time)</Text>
          </Box>
          {tagTotals.length === 0 ? (
            <Text color="gray" italic>
              No tags recorded yet.
            </Text>
          ) : (
            tagTotals.map((t) => {
              const pct =
                totals.totalFocusSeconds > 0
                  ? Math.round(
                      (t.focusSeconds / totals.totalFocusSeconds) * 100,
                    )
                  : 0;
              return (
                <Box key={t.tag} flexDirection="column" marginBottom={1}>
                  <Box gap={1}>
                    <Text color="cyanBright" bold>
                      ■ {t.tag}
                    </Text>
                    <Text color="gray">({pct}%)</Text>
                  </Box>
                  <Box gap={1}>
                    <Text>{formatTime(t.focusSeconds)}</Text>
                    <Text color="gray">| {t.completedPomodoros} sessions</Text>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Layout>
  );
};
