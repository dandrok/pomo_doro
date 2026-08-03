import { Box } from "ink";
import { HeaderBar } from "./HeaderBar";
import { FooterBar, type Control } from "./FooterBar";
import { HelpOverlay } from "./HelpOverlay";

type LayoutProps = {
  title: string;
  footerControls?: Control[];
  isHelpOpen?: boolean;
  children: React.ReactNode;
};

export const Layout = ({
  title,
  footerControls,
  isHelpOpen = false,
  children,
}: LayoutProps) => {
  return (
    <Box flexDirection="column" padding={1}>
      <HeaderBar title={title} />
      <Box flexDirection="column" flexGrow={1}>
        {isHelpOpen && footerControls ? (
          <HelpOverlay controls={footerControls} />
        ) : (
          children
        )}
      </Box>
      {footerControls && <FooterBar controls={footerControls} />}
    </Box>
  );
};
