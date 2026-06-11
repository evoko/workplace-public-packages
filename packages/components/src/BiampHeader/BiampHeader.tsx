import {
  alpha,
  Box,
  BoxProps,
  Button,
  Divider,
  ListItemButton,
  ListItemButtonProps,
  Popover,
  PopoverProps,
  Stack,
  StackProps,
  Typography,
} from '@mui/material';
import { Children, JSX, ReactNode } from 'react';
import { BiampRedLogo, ColumnsIcon, ExternalLinkIcon } from '@bwp-web/assets';
import { useBiampLayoutDrawer } from '../BiampLayout/BiampLayout';
import {
  BiampGlobalSearch,
  type BiampGlobalSearchOption,
  type BiampGlobalSearchProps,
} from '../BiampGlobalSearch/BiampGlobalSearch';

type BiampHeaderProps = StackProps & {
  children?: React.ReactNode;
};

export function BiampHeader({ children, sx, ...props }: BiampHeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={{ xs: 0.5, md: 3 }}
      sx={{ px: 2.5, py: 1.5, ...sx }}
      {...props}
    >
      {children}
    </Stack>
  );
}

type BiampHeaderTitleProps = BoxProps & {
  icon?: JSX.Element;
  title?: string;
  subtitle?: string;
};

export function BiampHeaderTitle({
  icon,
  title,
  subtitle,
  sx,
  ...props
}: BiampHeaderTitleProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...sx,
      }}
      {...props}
    >
      {icon ? (
        <Box
          sx={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      ) : (
        <Box
          component="img"
          src={BiampRedLogo}
          alt="Biamp"
          sx={{ width: 24, height: 24 }}
        />
      )}
      <Stack direction="row" gap={0.5}>
        {title && <Typography variant="h4">{title}</Typography>}
        {subtitle && (
          <Typography variant="h4" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

type BiampHeaderSearchProps = Omit<BiampGlobalSearchProps, 'options'> & {
  options?: BiampGlobalSearchOption[];
};

// Backward-compat wrapper: header-friendly styling now lives in `BiampGlobalSearch`,
// so this exists only to keep prop-less `<BiampHeaderSearch />` call sites working.
export function BiampHeaderSearch({
  options = [],
  ...props
}: BiampHeaderSearchProps) {
  return <BiampGlobalSearch options={options} {...props} />;
}

type BiampHeaderActionsProps = BoxProps & {
  children: React.ReactNode;
};

export function BiampHeaderActions({
  children,
  sx,
  ...props
}: BiampHeaderActionsProps) {
  return (
    <Box
      sx={{
        ml: 'auto',
        gap: { xs: 1, md: 2 },
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

type BiampHeaderButtonListProps = BoxProps & {
  children: React.ReactNode;
};

export function BiampHeaderButtonList({
  children,
  sx,
  ...props
}: BiampHeaderButtonListProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0, md: 0.5 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

type BiampHeaderMenuButtonProps = Omit<ListItemButtonProps, 'children'> & {
  /** Override the default hamburger icon. */
  icon?: JSX.Element;
};

/**
 * Header toggle for the responsive sidebar drawer. Renders only when the
 * parent `BiampLayout` is in drawer mode and has a sidebar; otherwise
 * returns `null`. Safe to leave in the header at all viewport sizes.
 */
export function BiampHeaderMenuButton({
  icon,
  sx,
  onClick,
  ...props
}: BiampHeaderMenuButtonProps) {
  const drawer = useBiampLayoutDrawer();
  if (!drawer?.isDrawer || !drawer.hasSidebar) return null;
  return (
    <BiampHeaderButton
      icon={
        icon ?? (
          <ColumnsIcon
            sx={{
              transform: 'rotate(90deg)',
              color: ({ palette }) => palette.text.secondary,
            }}
          />
        )
      }
      onClick={(e) => {
        drawer.setOpen(!drawer.open);
        onClick?.(e);
      }}
      sx={sx}
      {...props}
    />
  );
}

type BiampHeaderButtonProps = ListItemButtonProps & {
  icon: JSX.Element;
  selectedIcon?: JSX.Element;
  selected?: boolean;
};

export function BiampHeaderButton({
  icon,
  selectedIcon,
  selected,
  sx,
  ...props
}: BiampHeaderButtonProps) {
  const displayedSelectedIcon = selectedIcon ?? icon;
  return (
    <ListItemButton
      selected={selected}
      disableGutters
      disableRipple
      sx={{
        minWidth: '40px',
        maxWidth: '40px',
        minHeight: '40px',
        maxHeight: '40px',
        borderRadius: '4px',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      {selected ? displayedSelectedIcon : icon}
    </ListItemButton>
  );
}

type BiampAppPopoverProps = PopoverProps & {
  children: React.ReactNode;
};

const POPOVER_MAX_WIDTH = 350;

export function BiampAppPopover({
  children,
  open,
  sx,
  ...props
}: BiampAppPopoverProps) {
  return (
    <Popover
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: -8, horizontal: POPOVER_MAX_WIDTH - 4 }}
      sx={{ ...sx }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            backgroundImage: 'none',
            outlineWidth: '0.6px',
            outlineStyle: 'solid',
            outlineColor: ({ palette }) => palette.divider,
            boxShadow: ({ palette }) =>
              `0px 4px 50px 0px ${alpha(palette.grey[900], 0.1)}`,
            maxWidth: POPOVER_MAX_WIDTH,
            width: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          },
        },
      }}
      {...props}
    >
      {children}
    </Popover>
  );
}

type BiampBuildAppContentProps = BoxProps & {
  children: React.ReactNode;
};

/** @deprecated Use `BiampAppListContent` + `BiampAppListItem` instead. */
export function BiampBuildAppContent({
  children,
  sx,
  ...props
}: BiampBuildAppContentProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1.5,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

type BiampBuildAppContentItemProps = StackProps & {
  image: ReactNode;
  name: string;
  description: string;
  button?: ReactNode;
};

/** @deprecated Use `BiampAppListItem` instead. */
export function BiampBuildAppContentItem({
  image,
  name,
  description,
  button,
  sx,
  ...props
}: BiampBuildAppContentItemProps) {
  return (
    <Stack
      direction="column"
      position="relative"
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        outlineWidth: '1px',
        outlineStyle: 'solid',
        outlineColor: ({ palette }) => palette.dividers,
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ width: 54, height: 54 }} mb={0.5}>
        {image}
      </Box>
      <Typography variant="caption" fontWeight={600} mb={0.5}>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
      {button && (
        <Box position="absolute" top="12px" right="12px">
          {button}
        </Box>
      )}
    </Stack>
  );
}

type BiampEndUserAppContentProps = StackProps & {
  children: React.ReactNode;
};

/** @deprecated Use `BiampAppListContent` + `BiampAppListItem` instead. */
export function BiampEndUserAppContent({
  children,
  sx,
  ...props
}: BiampEndUserAppContentProps) {
  const isGrid = Children.count(children) > 1;
  return (
    <Stack
      direction="column"
      sx={{
        gap: 1.5,
        ...(isGrid && {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}

type BiampEndUserAppContentItemProps = StackProps & {
  image: ReactNode;
  name: string;
  description: string;
  href?: string;
  target?: string;
};

/** @deprecated Use `BiampAppListItem` instead. */
export function BiampEndUserAppContentItem({
  image,
  name,
  description,
  href,
  target,
  sx,
  ...props
}: BiampEndUserAppContentItemProps) {
  return (
    <Stack
      component={href ? 'a' : 'div'}
      href={href}
      target={target}
      direction="row"
      alignItems="center"
      sx={{
        gap: 1.5,
        p: 1.5,
        borderRadius: 1.5,
        outlineWidth: '1px',
        outlineStyle: 'solid',
        outlineColor: ({ palette }) => palette.divider,
        textDecoration: 'none',
        color: 'inherit',
        cursor: href ? 'pointer' : undefined,
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ width: 32, height: 32 }}>{image}</Box>
      <Stack direction="column">
        <Typography variant="caption" fontWeight={600}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      <ExternalLinkIcon sx={{ width: 16, height: 16, ml: 'auto' }} />
    </Stack>
  );
}

type BiampAppListContentProps = Omit<StackProps, 'direction'> & {
  children: React.ReactNode;
};

export function BiampAppListContent({
  children,
  sx,
  ...props
}: BiampAppListContentProps) {
  return (
    <Stack
      direction="column"
      divider={
        <Divider
          sx={{ borderColor: ({ palette }) => palette.dividers.secondary }}
        />
      }
      sx={{
        borderRadius: 2,
        border: ({ palette }) => `1px solid ${palette.dividers.secondary}`,
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}

type BiampAppListItemProps = Omit<StackProps, 'direction' | 'alignItems'> & {
  image: ReactNode;
  name: string;
  onOpen?: () => void;
  href?: string;
};

export function BiampAppListItem({
  image,
  name,
  onOpen,
  href,
  sx,
  ...props
}: BiampAppListItemProps) {
  const hasActions = onOpen || href;
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ gap: 1.5, py: 1.5, px: 2, ...sx }}
      {...props}
    >
      <Box sx={{ width: 40, height: 40, flexShrink: 0 }}>{image}</Box>
      <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
        {name}
      </Typography>
      {hasActions && (
        <Stack
          direction="row"
          sx={{
            borderRadius: '6px',
            border: ({ palette }) => `1px solid ${palette.dividers.secondary}`,
            overflow: 'hidden',
            boxShadow: ({ palette }) =>
              `0px 1px 1px 0px ${alpha(palette.common.black, 0.05)}`,
          }}
        >
          {onOpen && (
            <Button
              variant="text"
              size="small"
              onClick={onOpen}
              sx={{
                borderRadius: 0,
                px: 1.5,
                minWidth: 0,
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              Open
            </Button>
          )}
          {onOpen && href && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                borderColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.4)',
                opacity: 0.3,
              }}
            />
          )}
          {href && (
            <Box
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in new tab"
              sx={{
                px: 1,
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'stretch',
                cursor: 'pointer',
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ExternalLinkIcon sx={{ width: 16, height: 16 }} />
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  );
}

type BiampHeaderProfileProps = ListItemButtonProps & {
  image?: string;
  children?: ReactNode;
  selected?: boolean;
};

export function BiampHeaderProfile({
  image,
  selected,
  children,
  sx,
  ...props
}: BiampHeaderProfileProps) {
  return (
    <ListItemButton
      selected={selected}
      disableGutters
      disableRipple
      sx={{
        minWidth: '36px',
        maxWidth: '36px',
        minHeight: '36px',
        maxHeight: '36px',
        borderRadius: '6px',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx,
      }}
      {...props}
    >
      {image ? (
        <Box
          component="img"
          src={image}
          alt={'Profile Image'}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '4px',
            border: ({ palette }) =>
              `0.6px solid var(--Divider-divider_primary, ${alpha(palette.background.paper, 0.15)})`,
          }}
        />
      ) : (
        children
      )}
    </ListItemButton>
  );
}
