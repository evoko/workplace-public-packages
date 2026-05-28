import {
  Breakpoint,
  Drawer,
  IconButton,
  Stack,
  StackProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { CloseIcon } from '@bwp-web/assets';

type BiampLayoutDrawerContextValue = {
  isDrawer: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  hasSidebar: boolean;
};

const BiampLayoutDrawerContext =
  createContext<BiampLayoutDrawerContextValue | null>(null);

/**
 * Read/control the responsive drawer state from inside a `BiampLayout`.
 * Returns `null` when used outside of a `BiampLayout` (so it is always safe
 * to call). Powers `BiampHeaderMenuButton` and the sidebar auto-close
 * behavior, but is also exposed so consumers can drive the drawer from
 * custom UI.
 */
export function useBiampLayoutDrawer(): BiampLayoutDrawerContextValue | null {
  return useContext(BiampLayoutDrawerContext);
}

type BiampLayoutProps = StackProps & {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  /**
   * When true, the sidebar collapses into a left-anchored drawer below
   * `breakpoint`. Pair with `<BiampHeaderMenuButton />` in the header
   * to get a toggle. Default: false.
   */
  responsive?: boolean;
  /** Breakpoint at which the sidebar becomes a drawer. Default: 'md'. */
  breakpoint?: Breakpoint;
  /**
   * Content shown next to the auto-rendered close button at the top of the
   * responsive drawer. Typically a `<BiampHeaderTitle />`. The close button
   * is always rendered in drawer mode; this slot is optional.
   */
  drawerHeader?: React.ReactNode;
  /**
   * When combined with `responsive`, the sidebar is never rendered inline —
   * only as the mobile drawer. Use for layouts that show only a header on
   * desktop and move some of its content into a drawer on mobile. Has no
   * effect when `responsive` is false.
   */
  mobileSidebarOnly?: boolean;
};

const DRAWER_RIGHT_GAP_PX = 50;
const DRAWER_MAX_WIDTH_PX = 350;

export function BiampLayout({
  header,
  sidebar,
  children,
  responsive = false,
  breakpoint = 'md',
  drawerHeader,
  mobileSidebarOnly = false,
  sx,
  ...props
}: BiampLayoutProps) {
  const theme = useTheme();
  const belowBreakpoint = useMediaQuery(theme.breakpoints.down(breakpoint));
  const isDrawer = responsive && !!sidebar && belowBreakpoint;

  const [open, setOpen] = useState(false);

  const ctx = useMemo<BiampLayoutDrawerContextValue>(
    () => ({ isDrawer, open, setOpen, hasSidebar: !!sidebar }),
    [isDrawer, open, sidebar],
  );

  return (
    <BiampLayoutDrawerContext.Provider value={ctx}>
      <Stack
        direction="column"
        height="100vh"
        sx={{
          backgroundColor: ({ palette }) =>
            palette.mode === 'dark' ? palette.grey[900] : palette.grey[100],
          ...sx,
        }}
        {...props}
      >
        {header}
        <Stack
          direction="row"
          flex={1}
          minHeight={0}
          gap={{ xs: 1.5, md: 2.5 }}
          px={{ xs: 1.5, md: 2.5 }}
          pb={{ xs: 1.5, md: 2.5 }}
          pt={{ xs: header ? 0 : 1.5, md: header ? 0 : 2.5 }}
        >
          {!isDrawer && !(responsive && mobileSidebarOnly) && sidebar}
          {children}
        </Stack>
        {isDrawer && (
          <Drawer
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
            slotProps={{
              paper: {
                sx: {
                  width: `min(calc(100vw - ${DRAWER_RIGHT_GAP_PX}px), ${DRAWER_MAX_WIDTH_PX}px)`,
                  backgroundColor: ({ palette }) =>
                    palette.mode === 'dark'
                      ? palette.grey[900]
                      : palette.common.white,
                  backgroundImage: 'none',
                  p: 1.5,
                },
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ height: 40, mb: 1.5, flexShrink: 0 }}
            >
              <IconButton
                variant="none"
                size="medium"
                onClick={() => setOpen(false)}
                aria-label="Close drawer"
              >
                <CloseIcon
                  variant="md"
                  sx={{ color: ({ palette }) => palette.text.secondary }}
                />
              </IconButton>
              {drawerHeader}
            </Stack>
            {sidebar}
          </Drawer>
        )}
      </Stack>
    </BiampLayoutDrawerContext.Provider>
  );
}
