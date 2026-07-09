import {
  alpha,
  Box,
  BoxProps,
  List,
  ListItem,
  ListItemProps,
  Popover,
  PopoverProps,
  type SxProps,
  type Theme,
} from '@mui/material';

export type BiampListPopoverProps = PopoverProps & {
  children: React.ReactNode;
};

/**
 * Popover styled as a compact, bordered list container. Wraps its children in a
 * dense, unpadded `List`; pair with `BiampListPopoverItem` for clickable rows
 * and `BiampListPopoverScrollArea` for an overflow-scrolling section.
 */
export function BiampListPopover({
  children,
  slotProps,
  ...props
}: BiampListPopoverProps) {
  return (
    <Popover
      slotProps={{
        ...slotProps,
        paper: {
          sx: ({ palette }) => ({
            borderRadius: '6px',
            backgroundImage: 'none',
            border: `0.6px solid ${palette.dividers.secondary}`,
            boxShadow: `0px 1px 1px 0px ${alpha(palette.common.black, 0.05)}`,
            minWidth: '150px',
          }),
          ...((slotProps?.paper ?? {}) as Record<string, unknown>),
        },
      }}
      {...props}
    >
      <List dense disablePadding>
        {children}
      </List>
    </Popover>
  );
}

const listItemSx: SxProps<Theme> = {
  py: 0,
  pr: 1.5,
  pl: 0,
  alignItems: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: ({ palette }) =>
      palette.mode === 'dark' ? palette.grey[800] : palette.grey[100],
  },
};

export type BiampListPopoverItemProps = ListItemProps;

/** Clickable, hoverable dense row for use inside `BiampListPopover`. */
export function BiampListPopoverItem({
  sx,
  ...props
}: BiampListPopoverItemProps) {
  return (
    <ListItem
      dense
      sx={[listItemSx, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    />
  );
}

export type BiampListPopoverScrollAreaProps = BoxProps & {
  /** Height cap before the region starts scrolling. @default 340 */
  maxHeight?: number | string;
};

/** Overflow-scrolling region for a long list of `BiampListPopoverItem`s. */
export function BiampListPopoverScrollArea({
  maxHeight = 340,
  sx,
  ...props
}: BiampListPopoverScrollAreaProps) {
  return (
    <Box
      sx={{ maxHeight, overflow: 'auto', overscrollBehavior: 'none', ...sx }}
      {...props}
    />
  );
}
