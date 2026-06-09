import { Box, Text } from "ink";
import { useTheme } from "@hooks";

export type StackedBarData = {
  label: string;
  value: number;
  color: string;
  char: string;
};

type StackedBarChartProps = {
  data: StackedBarData[];
  barWidth?: number;
  legend?: React.ReactNode;
};

export const StackedBarChart = ({
  data,
  barWidth = 30,
  legend,
}: StackedBarChartProps) => {
  const theme = useTheme();

  const safeBarWidth = Math.max(
    0,
    Number.isFinite(barWidth) ? Math.floor(barWidth) : 0,
  );

  if (data.length === 0) {
    return (
      <Text color={theme.muted} italic>
        No data available
      </Text>
    );
  }

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  if (totalValue === 0) {
    return <Text color={theme.muted}>{"░".repeat(safeBarWidth)}</Text>;
  }

  // Calculate widths for each segment based on percentage
  let remainingWidth = safeBarWidth;
  const segments = data.map((d, i) => {
    const exactWidth = (d.value / totalValue) * safeBarWidth;
    let width = Math.round(exactWidth);

    // For the last element, take all remaining width to ensure it matches barWidth exactly.
    if (i === data.length - 1) {
      width = remainingWidth; // absorb rounding errors
    } else {
      if (width > remainingWidth) {
        width = remainingWidth;
      }
      remainingWidth -= width;
    }

    return { ...d, width: Math.max(0, width) };
  });

  return (
    <Box flexDirection="column" gap={1} marginBottom={1}>
      {/* The Stacked Bar */}
      <Box flexDirection="row">
        {segments.map((s, i) => {
          if (s.width === 0) return null;
          return (
            <Text key={`bar-${i}`} color={s.color}>
              {s.char.repeat(s.width)}
            </Text>
          );
        })}
      </Box>

      {/* The Legend */}
      {legend && <Box flexDirection="column">{legend}</Box>}
    </Box>
  );
};
