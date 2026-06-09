import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import { useTheme } from "@hooks";

const Indicator = ({ isSelected }: { isSelected?: boolean }) => {
  const theme = useTheme();
  return (
    <Box marginRight={1}>
      <Text color={isSelected ? theme.secondary : theme.text}>
        {isSelected ? "❯" : " "}
      </Text>
    </Box>
  );
};

const Item = ({
  isSelected,
  label,
}: {
  isSelected?: boolean;
  label: string;
}) => {
  const theme = useTheme();
  return (
    <Text color={isSelected ? theme.primary : theme.text} bold={!!isSelected}>
      {label}
    </Text>
  );
};

export const ThemeSelect = <T,>(
  props: React.ComponentProps<typeof SelectInput<T>>,
) => {
  return (
    <SelectInput<T>
      {...props}
      indicatorComponent={Indicator}
      itemComponent={Item}
    />
  );
};
