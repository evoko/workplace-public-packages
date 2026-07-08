import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BiampNotificationPopover } from '@bwp-web/components';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';

const meta: Meta<typeof BiampNotificationPopover> = {
  title: 'Components/NotificationPopover',
  component: BiampNotificationPopover,
};

export default meta;
type Story = StoryObj<typeof BiampNotificationPopover>;

type NotificationItem = {
  title: string;
  body: string;
  time: string;
};

const SAMPLE_TITLES = [
  'Firmware update available',
  'Device went offline',
  'New user invited to workspace',
  'Room calibration completed',
  'Scheduled maintenance tonight',
  'License expires in 7 days',
  'Configuration backup finished',
  'Microphone gain adjusted',
  'Meeting recording ready',
  'Network latency spike detected',
];

const SAMPLE_BODIES = [
  'A new firmware version is ready to install on 3 connected devices.',
  'Conference Room B — Tesira Forte lost connection 4 minutes ago.',
  'jane.doe@example.com now has editor access to this workspace.',
  'Auto-EQ finished for the Main Auditorium. Review the results when convenient.',
  'Systems will be briefly unavailable between 02:00 and 02:30 UTC.',
];

function makeNotifications(count: number): NotificationItem[] {
  return Array.from({ length: count }, (_, i) => ({
    title: SAMPLE_TITLES[i % SAMPLE_TITLES.length],
    body: SAMPLE_BODIES[i % SAMPLE_BODIES.length],
    time: `${(i % 12) + 1}h ago`,
  }));
}

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <Stack direction="row" gap={1.5} sx={{ py: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          mt: '6px',
          borderRadius: '50%',
          flexShrink: 0,
          bgcolor: 'primary.main',
        }}
      />
      <Stack gap={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {item.body}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {item.time}
        </Typography>
      </Stack>
    </Stack>
  );
}

function PopoverDemo({ count, heading }: { count: number; heading: string }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const notifications = makeNotifications(count);

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h3">{heading}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
        {count} notifications. The popover caps at <code>maxHeight: 650px</code>{' '}
        — once the content is taller than that it should scroll inside the
        popover.
      </Typography>
      <Box>
        <Button
          ref={anchorRef}
          variant="contained"
          onClick={() => setOpen(true)}
        >
          Open notifications ({count})
        </Button>
      </Box>

      <BiampNotificationPopover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h4">Notifications</Typography>
          <Button variant="text" size="small" onClick={() => setOpen(false)}>
            Mark all as read
          </Button>
        </Stack>
        <Divider />
        <Stack divider={<Divider />}>
          {notifications.map((item, i) => (
            <NotificationRow key={i} item={item} />
          ))}
        </Stack>
      </BiampNotificationPopover>
    </Stack>
  );
}

/** Long list — taller than 650px, so the content scrolls inside the popover. */
export const Overflowing: Story = {
  render: () => <PopoverDemo count={20} heading="Overflowing (scrolls)" />,
};

/** Short list — under 650px, so the popover shrinks to fit its content. */
export const FitsContent: Story = {
  render: () => <PopoverDemo count={3} heading="Fits content (no scroll)" />,
};
