import { useState } from "react";
import { useInput } from "ink";

export const useHelp = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useInput(
    (input, key) => {
      if (input === "h" || key.escape) setIsHelpOpen(false);
    },
    { isActive: isHelpOpen },
  );

  return { isHelpOpen, toggleHelp: () => setIsHelpOpen((prev) => !prev) };
};
