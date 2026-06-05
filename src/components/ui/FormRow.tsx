import React from "react";
import { Box, Text } from "ink";

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
  color = "greenBright",
  showArrows = true,
  isFocused = false,
}: FormRowProps) => {
  return (
    <Box marginY={0} height={1}>
      <Text color={isActive ? "cyan" : "system"} bold={isActive}>
        {isActive ? " ❯ " : "   "}
        {label.padEnd(22)}
      </Text>
      <Box width={30} justifyContent="flex-start">
        {isFocused ? (
          <Text color="cyanBright" bold={isActive}>
            {value}
            <Text color="cyanBright" dimColor>
              █
            </Text>
          </Text>
        ) : (
          <Text color={isActive ? color : "system"} bold={isActive}>
            {isActive && showArrows ? "◀ " : "  "}
            {value}
            {isActive && showArrows ? " ▶" : "  "}
          </Text>
        )}
      </Box>
    </Box>
  );
};
