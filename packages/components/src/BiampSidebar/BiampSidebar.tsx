import {
  Box,
  ListItemButton,
  ListItemButtonProps,
  Stack,
  StackProps,
  Typography,
} from '@mui/material';
import { BiampLogoIcon, SquareRoundedArrowRightIcon } from '@bwp-web/assets';
import { JSX, createContext, useContext, useState } from 'react';

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
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : internalExpanded;

  const toggleExpanded = () => {
    const next = !expanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const width = expanded ? '240px' : '48px';

  return (
    <BiampSidebarContext.Provider value={{ expanded }}>
      <Stack
        sx={{
          width,
          minWidth: width,
          height: '100%',
          overflowX: 'hidden',
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
        {expandable && (
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
            name="Collapse menu"
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
              color="sidebar.main"
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
};

export function BiampSidebarIcon({
  selected,
  icon,
  selectedIcon,
  name,
  sx,
  ...props
}: BiampSidebarIconProps) {
  const { expanded } = useContext(BiampSidebarContext);
  const displayedSelectedIcon = selectedIcon ?? icon;
  return (
    <ListItemButton
      selected={selected}
      disableGutters
      disableRipple
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
        ...sx,
      }}
      {...props}
    >
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
