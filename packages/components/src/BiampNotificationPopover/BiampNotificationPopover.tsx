import {
  alpha,
  Box,
  BoxProps,
  Popover,
  PopoverProps,
  Stack,
  StackProps,
} from '@mui/material';

export type BiampNotificationPopoverProps = PopoverProps & {
  children: React.ReactNode;
};

const NOTIFICATION_POPOVER_MAX_WIDTH = 420;

/**
 * Notification popover shell. Lays its children out as a vertical flex column
 * capped at `maxHeight` with `overflow: hidden`, so the children decide what
 * stays fixed and what scrolls.
 */
export function BiampNotificationPopover({
  children,
  open,
  sx,
  ...props
}: BiampNotificationPopoverProps) {
  return (
    <Popover
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{
        vertical: -4,
        horizontal: NOTIFICATION_POPOVER_MAX_WIDTH,
      }}
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
            maxWidth: NOTIFICATION_POPOVER_MAX_WIDTH,
            maxHeight: '650px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
      {...props}
    >
      {children}
    </Popover>
  );
}

export type BiampNotificationPopoverHeaderProps = StackProps;

/** Fixed (non-scrolling) region at the top of the popover. */
export function BiampNotificationPopoverHeader({
  sx,
  ...props
}: BiampNotificationPopoverHeaderProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        flexShrink: 0,
        gap: 2,
        px: 2,
        pt: 2,
        ...sx,
      }}
      {...props}
    />
  );
}

export type BiampNotificationPopoverBodyProps = BoxProps;

/**
 * Scrollable region of the popover. Grows to fill the space below any fixed
 * regions and scrolls its own overflow.
 */
export function BiampNotificationPopoverBody({
  sx,
  ...props
}: BiampNotificationPopoverBodyProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehavior: 'none',
        px: 2,
        pb: 2,
        ...sx,
      }}
      {...props}
    />
  );
}
