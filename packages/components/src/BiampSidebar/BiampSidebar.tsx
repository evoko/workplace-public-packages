import {
  Box,
  ListItemButton,
  ListItemButtonProps,
  Stack,
  StackProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { BiampLogoIcon, SquareRoundedArrowRightIcon } from '@bwp-web/assets';
import { JSX, createContext, useContext, useState } from 'react';
import { useBiampLayoutDrawer } from '../BiampLayout/BiampLayout';

type BiampSidebarContextValue = {
  expanded: boolean;
};

const BiampSidebarContext = createContext<BiampSidebarContextValue>({
  expanded: false,
});

type BiampSidebarProps = StackProps & {
  children: React.ReactNode;
  bottomLogoIcon?: JSX.Element;
  bottomLogoText?: string;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export function BiampSidebar({
  children,
  bottomLogoIcon,
  bottomLogoText,
  expandable = true,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  sx,
  ...props
}: BiampSidebarProps) {
  const layoutDrawer = useBiampLayoutDrawer();
  const isInDrawer = layoutDrawer?.isDrawer ?? false;

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const expanded = isInDrawer
    ? true
    : isControlled
      ? expandedProp
      : internalExpanded;
  const showCollapseButton = !isInDrawer && expandable;

  const toggleExpanded = () => {
    const next = !expanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const width = isInDrawer ? '100%' : expanded ? '240px' : '48px';

  return (
    <BiampSidebarContext.Provider value={{ expanded }}>
      <Stack
        sx={{
          width,
          minWidth: width,
          height: '100%',
          transition: ({ transitions }) =>
            transitions.create(['width', 'min-width'], {
              easing: transitions.easing.sharp,
              duration: expanded
                ? transitions.duration.enteringScreen
                : transitions.duration.leavingScreen,
            }),
          ...sx,
        }}
        {...props}
      >
        <Stack sx={{ flex: 1, minHeight: 0 }}>{children}</Stack>
        {showCollapseButton && (
          <BiampSidebarIcon
            icon={
              <SquareRoundedArrowRightIcon
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: ({ transitions }) =>
                    transitions.create('transform', {
                      duration: transitions.duration.shorter,
                    }),
                }}
              />
            }
            name={expanded ? 'Collapse menu' : 'Expand menu'}
            onClick={toggleExpanded}
          />
        )}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 2, overflow: 'hidden' }}
        >
          {bottomLogoIcon ?? (
            <BiampLogoIcon
              sx={{ width: '48px', height: '15px', flexShrink: 0 }}
            />
          )}
          {bottomLogoText && (
            <Typography
              variant="caption"
              fontWeight={500}
              color="text.secondary"
              noWrap
              sx={{
                opacity: expanded ? 1 : 0,
                transition: ({ transitions }) =>
                  transitions.create('opacity', {
                    duration: expanded
                      ? transitions.duration.enteringScreen
                      : transitions.duration.leavingScreen,
                  }),
              }}
            >
              {`© ${new Date().getFullYear()} ${bottomLogoText}`}
            </Typography>
          )}
        </Stack>
      </Stack>
    </BiampSidebarContext.Provider>
  );
}

type BiampSidebarIconList = StackProps & {
  children: React.ReactNode;
};

/**
 * Vertical, scrollable list container for sidebar items with 4px gaps.
 */
export function BiampSidebarIconList({
  children,
  sx,
  ...props
}: BiampSidebarIconList) {
  return (
    <Stack
      sx={{
        flex: 1,
        minHeight: 0,
        gap: '4px',
        overflowY: 'auto',
        overscrollBehavior: 'none',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}

type BiampSidebarIconProps = ListItemButtonProps & {
  selected?: boolean;
  icon: JSX.Element;
  selectedIcon?: JSX.Element;
  name?: string;
  /**
   * When inside a `BiampLayout` responsive drawer, whether clicking this
   * icon should also close the drawer. Default: true (navigation pattern).
   * Set to false for items that open menus or popovers anchored to this
   * element, since closing the drawer would unmount the anchor.
   */
  closeDrawerOnClick?: boolean;
};

export function BiampSidebarIcon({
  selected,
  icon,
  selectedIcon,
  name,
  closeDrawerOnClick = true,
  sx,
  onClick,
  ...props
}: BiampSidebarIconProps) {
  const { expanded } = useContext(BiampSidebarContext);
  const layoutDrawer = useBiampLayoutDrawer();
  const displayedSelectedIcon = selectedIcon ?? icon;
  return (
    <ListItemButton
      selected={selected}
      disableGutters
      disableRipple
      onClick={(e) => {
        onClick?.(e);
        if (closeDrawerOnClick && layoutDrawer?.isDrawer && layoutDrawer.open) {
          layoutDrawer.setOpen(false);
        }
      }}
      sx={{
        minWidth: '48px',
        minHeight: '48px',
        maxHeight: '48px',
        borderRadius: '8px',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 0,
        overflow: 'hidden',
        color: 'text.secondary',
        '&.Mui-selected': {
          color: 'primary.main',
        },
        ...sx,
      }}
      {...props}
    >
      <Tooltip title={expanded ? '' : (name ?? '')} placement="right" arrow>
        <Box
          sx={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {selected ? displayedSelectedIcon : icon}
        </Box>
      </Tooltip>
      {name && (
        <Typography
          variant="body1"
          fontWeight={600}
          color="inherit"
          noWrap
          sx={{
            pr: 2,
            opacity: expanded ? 1 : 0,
            transition: ({ transitions }) =>
              transitions.create('opacity', {
                duration: expanded
                  ? transitions.duration.enteringScreen
                  : transitions.duration.leavingScreen,
              }),
          }}
        >
          {name}
        </Typography>
      )}
    </ListItemButton>
  );
}

type BiampSidebarComponentProps = ListItemButtonProps & {
  children: React.ReactNode;
};

export function BiampSidebarComponent({
  children,
  sx,
  ...props
}: BiampSidebarComponentProps) {
  return (
    <Box
      sx={{
        minWidth: '48px',
        maxWidth: '48px',
        minHeight: '48px',
        maxHeight: '48px',
        borderRadius: '8px',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        border: ({ palette }) => `0.6px solid ${palette.divider}`,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
