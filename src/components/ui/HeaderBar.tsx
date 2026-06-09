import { Box, Text } from "ink";
import { useTheme } from "@hooks";

type HeaderBarProps = {
  title: string;
};

export const HeaderBar = ({ title }: HeaderBarProps) => {
  const theme = useTheme();

  return (
    <Box
      marginBottom={1}
      borderStyle="round"
      borderColor={theme.primary}
      paddingX={1}
      width="fit-content"
    >
      <Text bold color={theme.primary}>
        {" "}
        {title}{" "}
      </Text>
    </Box>
  );
};
