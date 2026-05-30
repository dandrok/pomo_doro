import { Box, Text } from "ink";

interface HeaderBarProps {
  title: string;
}

export const HeaderBar = ({ title }: HeaderBarProps) => {
  return (
    <Box
      marginBottom={1}
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      width="fit-content"
    >
      <Text bold color="cyan">
        {" "}
        {title}{" "}
      </Text>
    </Box>
  );
};
