import { alpha, Popover, PopoverProps } from '@mui/material';

export type BiampNotificationPopoverProps = PopoverProps & {
  children: React.ReactNode;
};

const NOTIFICATION_POPOVER_MAX_WIDTH = 420;

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
            overscrollBehavior: 'none',
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
