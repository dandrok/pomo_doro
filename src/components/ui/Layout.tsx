import { Box } from "ink";
import { HeaderBar } from "./HeaderBar";
import { FooterBar, type Control } from "./FooterBar";

type LayoutProps = {
  title: string;
  footerControls?: Control[];
  children: React.ReactNode;
};

export const Layout = ({ title, footerControls, children }: LayoutProps) => {
  return (
    <Box flexDirection="column" padding={1}>
      <HeaderBar title={title} />
      <Box flexDirection="column" flexGrow={1}>
        {children}
      </Box>
      {footerControls && <FooterBar controls={footerControls} />}
    </Box>
  );
};
