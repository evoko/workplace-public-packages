import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Stack } from '@mui/material';
import {
  BiampBanner,
  BiampBannerIcon,
  BiampBannerContent,
  BiampBannerActions,
} from '@bwp-web/components';

const meta: Meta<typeof BiampBanner> = {
  title: 'Components/BiampBanner',
  component: BiampBanner,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof BiampBanner>;

function DefaultDemo() {
  const [show, setShow] = useState(true);
  return (
    <Stack>
      <BiampBanner show={show} severity="info">
        <BiampBannerIcon severity="info" />
        <BiampBannerContent>
          Your session will expire in 5 minutes.
        </BiampBannerContent>
        <BiampBannerActions>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => setShow(false)}
          >
            Dismiss
          </Button>
        </BiampBannerActions>
      </BiampBanner>
      <Stack p={3}>
        <Button
          variant="contained"
          onClick={() => setShow(true)}
          disabled={show}
          sx={{ alignSelf: 'flex-start' }}
        >
          Show banner
        </Button>
      </Stack>
    </Stack>
  );
}

/**
 * A live banner with show/hide toggle, demonstrating the Collapse
 * animation and the full composition of icon, content, and actions.
 */
export const Default: Story = {
  render: () => <DefaultDemo />,
};

/**
 * All four severity variants shown at once: `info`, `success`, `warning`, and `error`.
 * Each uses the matching default icon via the `severity` prop on `BiampBannerIcon`.
 */
export const AllSeverities: Story = {
  render: () => (
    <Stack gap={1}>
      <BiampBanner show severity="info">
        <BiampBannerIcon severity="info" />
        <BiampBannerContent>
          Info — A new software update is available.
        </BiampBannerContent>
        <BiampBannerActions>
          <Button size="small" variant="outlined" color="inherit">
            Learn more
          </Button>
        </BiampBannerActions>
      </BiampBanner>

      <BiampBanner show severity="success">
        <BiampBannerIcon severity="success" />
        <BiampBannerContent>
          Success — Changes saved successfully.
        </BiampBannerContent>
        <BiampBannerActions>
          <Button size="small" variant="outlined" color="inherit">
            View
          </Button>
        </BiampBannerActions>
      </BiampBanner>

      <BiampBanner show severity="warning">
        <BiampBannerIcon severity="warning" />
        <BiampBannerContent>
          Warning — Your license expires in 3 days.
        </BiampBannerContent>
        <BiampBannerActions>
          <Button size="small" variant="outlined" color="inherit">
            Renew
          </Button>
        </BiampBannerActions>
      </BiampBanner>

      <BiampBanner show severity="error">
        <BiampBannerIcon severity="error" />
        <BiampBannerContent>
          Error — Unable to connect to the server.
        </BiampBannerContent>
        <BiampBannerActions>
          <Button size="small" variant="outlined" color="inherit">
            Retry
          </Button>
        </BiampBannerActions>
      </BiampBanner>
    </Stack>
  ),
};

/**
 * A banner with no icon or actions — just centered content.
 * Useful for simple announcements that don't need interaction.
 */
export const ContentOnly: Story = {
  render: () => (
    <BiampBanner show severity="info">
      <BiampBannerContent>
        Scheduled maintenance on Sunday, 2 AM – 4 AM UTC.
      </BiampBannerContent>
    </BiampBanner>
  ),
};

function MultipleActionsDemo() {
  const [show, setShow] = useState(true);
  return (
    <BiampBanner show={show} severity="warning">
      <BiampBannerIcon severity="warning" />
      <BiampBannerContent>
        A firmware update is ready to install. Reboot required.
      </BiampBannerContent>
      <BiampBannerActions>
        <Button size="small" variant="outlined" color="inherit">
          Update now
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={() => setShow(false)}
        >
          Dismiss
        </Button>
      </BiampBannerActions>
    </BiampBanner>
  );
}

/**
 * A banner with multiple action buttons, demonstrating how `BiampBannerActions`
 * lays out children in a horizontal flex row with 8px gaps.
 */
export const MultipleActions: Story = {
  render: () => <MultipleActionsDemo />,
};

function IndependentTogglesDemo() {
  const severities = ['info', 'success', 'warning', 'error'] as const;
  const messages: Record<(typeof severities)[number], string> = {
    info: 'Info — System check completed.',
    success: 'Success — All devices are online.',
    warning: 'Warning — Disk usage above 80%.',
    error: 'Error — 3 devices are offline.',
  };

  const [visible, setVisible] = useState<
    Record<(typeof severities)[number], boolean>
  >({
    info: true,
    success: true,
    warning: true,
    error: true,
  });

  return (
    <Stack>
      <Stack gap={1}>
        {severities.map((s) => (
          <BiampBanner key={s} show={visible[s]} severity={s}>
            <BiampBannerIcon severity={s} />
            <BiampBannerContent>{messages[s]}</BiampBannerContent>
            <BiampBannerActions>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => setVisible((v) => ({ ...v, [s]: false }))}
              >
                Dismiss
              </Button>
            </BiampBannerActions>
          </BiampBanner>
        ))}
      </Stack>
      <Stack direction="row" gap={1} p={2} flexWrap="wrap">
        {severities.map((s) => (
          <Button
            key={s}
            size="small"
            variant="outlined"
            disabled={visible[s]}
            onClick={() => setVisible((v) => ({ ...v, [s]: true }))}
          >
            Show {s}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

/**
 * Demonstrates all four severities toggled independently with show/hide controls.
 */
export const IndependentToggles: Story = {
  name: 'Independent Toggles',
  render: () => <IndependentTogglesDemo />,
};
