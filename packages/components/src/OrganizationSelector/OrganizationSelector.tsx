import {
  alpha,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  Popover,
  PopoverProps,
  Stack,
  StackProps,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { Children, Fragment, isValidElement, ReactNode } from 'react';
import { ChevronRightIcon } from '@bwp-web/assets';

type OrganizationSelectorProps = StackProps & {
  /** Replaces children with a centered spinner. */
  loading?: boolean;
};

/**
 * Outer container for an organization selector. Use inline (inside a sheet,
 * drawer, etc.) or wrap with `OrganizationSelectorPopover` for a popover.
 */
export function OrganizationSelector({
  loading,
  children,
  sx,
  ...props
}: OrganizationSelectorProps) {
  return (
    <Stack
      sx={{
        width: 'min(370px, calc(100vw - 24px))',
        minHeight: 64,
        maxHeight: 'min(700px, 90vh)',
        backgroundColor: ({ palette }) =>
          palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
        borderRadius: 3,
        p: 1.5,
        boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.15)',
        overflow: 'auto',
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={40} sx={{ mx: 'auto', my: 'auto' }} />
      ) : (
        children
      )}
    </Stack>
  );
}

type OrganizationItemListProps = {
  children: ReactNode;
  /** Optional divider with a label rendered below the list. */
  label?: ReactNode;
  /** Caps the list height and enables vertical scrolling. */
  maxHeight?: number | string;
  sx?: SxProps<Theme>;
};

/**
 * Bordered list grouping that auto-renders dividers between its children.
 * Optionally renders a labeled divider below the list.
 */
export function OrganizationItemList({
  children,
  label,
  maxHeight,
  sx,
}: OrganizationItemListProps) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <>
      <List
        disablePadding
        sx={{
          border: 0.6,
          borderColor: ({ palette }) =>
            palette.mode === 'dark'
              ? alpha(palette.common.white, 0.12)
              : alpha(palette.grey[900], 0.15),
          borderRadius: 2,
          ...(maxHeight !== undefined && {
            overflow: 'auto',
            maxHeight,
          }),
          ...sx,
        }}
      >
        {items.map((item, i) => (
          <Fragment key={item.key ?? i}>
            {item}
            {i !== items.length - 1 && <Divider />}
          </Fragment>
        ))}
      </List>
      {label && <Divider sx={{ py: 1, userSelect: 'none' }}>{label}</Divider>}
    </>
  );
}

type OrganizationItemProps = Omit<ListItemButtonProps, 'children'> & {
  /** Top-left text. Strings get default styling; pass a node to override. */
  primaryText: ReactNode;
  /** Optional second line below `primaryText`. */
  secondaryText?: ReactNode;
  /** Optional right-side text on the same row as `primaryText`. */
  meta?: ReactNode;
  /** Logo element (e.g. `<Avatar />`) or an image URL. */
  logo?: ReactNode | string;
  /**
   * Highlights the logo with a ring, hides the chevron, and makes the row
   * non-interactive (without dimming).
   */
  isCurrent?: boolean;
};

function renderText(
  value: ReactNode,
  defaults: {
    variant: 'body2' | 'caption';
    fontWeight?: number;
    color: string;
  },
) {
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <Typography
        variant={defaults.variant}
        fontWeight={defaults.fontWeight}
        color={defaults.color}
        noWrap
      >
        {value}
      </Typography>
    );
  }
  return value;
}

/**
 * A single row inside an `OrganizationItemList`. Spread `ListItem` props
 * (e.g. `component={Link} to={...}` or `onClick={...}`) to make it clickable.
 */
export function OrganizationItem({
  primaryText,
  secondaryText,
  meta,
  logo,
  isCurrent = false,
  sx,
  ...props
}: OrganizationItemProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        disabled={isCurrent}
        disableRipple
        sx={{
          p: 1,
          pr: 1.5,
          gap: 1.5,
          '&.Mui-disabled': { opacity: 1 },
          ...sx,
        }}
        {...props}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: ({ palette }) =>
              palette.mode === 'dark' ? palette.grey[800] : palette.grey[200],
            ...(isCurrent && {
              boxShadow: ({ palette }) => `0 0 0 2px ${palette.info.main}`,
            }),
          }}
        >
          {typeof logo === 'string' ? (
            <Box
              component="img"
              src={logo}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            logo
          )}
        </Box>
        <Stack gap={0.25} sx={{ width: '100%', minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            {renderText(primaryText, {
              variant: 'body2',
              fontWeight: 600,
              color: 'primary',
            })}
            {meta &&
              renderText(meta, { variant: 'body2', color: 'text.secondary' })}
          </Stack>
          {secondaryText &&
            renderText(secondaryText, {
              variant: 'caption',
              color: 'text.secondary',
            })}
        </Stack>
        <ChevronRightIcon
          variant="xs"
          color="primary"
          sx={{
            width: 16,
            height: 16,
            ml: 'auto',
            visibility: isCurrent ? 'hidden' : 'visible',
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}

type OrganizationSelectorPopoverProps = Omit<PopoverProps, 'children'> & {
  children: ReactNode;
  /** Forwarded to the inner `OrganizationSelector`. */
  loading?: boolean;
};

/**
 * A `Popover` pre-configured to render an `OrganizationSelector` inside.
 * Anchors below-right of the trigger by default.
 */
export function OrganizationSelectorPopover({
  children,
  loading,
  anchorOrigin,
  transformOrigin,
  ...props
}: OrganizationSelectorPopoverProps) {
  return (
    <Popover
      anchorOrigin={anchorOrigin ?? { vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={transformOrigin ?? { vertical: -8, horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
            overflow: 'visible',
          },
        },
      }}
      {...props}
    >
      <OrganizationSelector loading={loading}>{children}</OrganizationSelector>
    </Popover>
  );
}
