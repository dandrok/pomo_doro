import React from "react";
import { Box, Text } from "ink";
import { useTheme } from "@hooks";

type FormRowProps = {
  label: string;
  value: string;
  isActive: boolean;
  color?: string;
  showArrows?: boolean;
  isFocused?: boolean; // highlight indicating it accepts direct input
};

export const FormRow = ({
  label,
  value,
  isActive,
  color,
  showArrows = true,
  isFocused = false,
}: FormRowProps) => {
  const theme = useTheme();
  const activeColor = color || theme.primary;

  return (
    <Box marginY={0} height={1}>
      <Text color={isActive ? theme.secondary : theme.text} bold={isActive}>
        {isActive ? " ❯ " : "   "}
        {label.padEnd(30)}
      </Text>
      <Box width={30} justifyContent="flex-start">
        {isFocused ? (
          <Text color={theme.primary} bold={isActive}>
            {value}
            <Text color={theme.primary} dimColor>
              █
            </Text>
          </Text>
        ) : (
          <Text color={isActive ? activeColor : theme.text} bold={isActive}>
            {isActive && showArrows ? "◀ " : "  "}
            {value}
            {isActive && showArrows ? " ▶" : "  "}
          </Text>
        )}
      </Box>
    </Box>
  );
};
