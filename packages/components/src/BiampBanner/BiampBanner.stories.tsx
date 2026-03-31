import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <BiampBanner show={show} severity="info">
        <BiampBannerIcon severity="info" />
        <BiampBannerContent>
          Your session will expire in 5 minutes.
        </BiampBannerContent>
        <BiampBannerActions>
          <button
            style={{
              padding: '4px 10px',
              fontSize: 13,
              border: '1px solid currentColor',
              borderRadius: 4,
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
            onClick={() => setShow(false)}
          >
            Dismiss
          </button>
        </BiampBannerActions>
      </BiampBanner>
      <div style={{ padding: 24 }}>
        <button
          style={{
            padding: '6px 16px',
            fontSize: 14,
            border: 'none',
            borderRadius: 4,
            background: show ? '#bdbdbd' : '#1976d2',
            color: show ? '#757575' : 'white',
            cursor: show ? 'default' : 'pointer',
            alignSelf: 'flex-start',
          }}
          onClick={() => setShow(true)}
          disabled={show}
        >
          Show banner
        </button>
      </div>
    </div>
  );
}

/**
 * A live banner with show/hide toggle, demonstrating the Collapse
 * animation and the full composition of icon, content, and actions.
 */
export const Default: Story = {
  render: () => <DefaultDemo />,
};

const bannerButton = (label: string, onClick?: () => void) => (
  <button
    style={{
      padding: '4px 10px',
      fontSize: 13,
      border: '1px solid currentColor',
      borderRadius: 4,
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
    }}
    onClick={onClick}
  >
    {label}
  </button>
);

/**
 * All four severity variants shown at once: `info`, `success`, `warning`, and `error`.
 * Each uses the matching default icon via the `severity` prop on `BiampBannerIcon`.
 */
export const AllSeverities: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <BiampBanner show severity="info">
        <BiampBannerIcon severity="info" />
        <BiampBannerContent>
          Info — A new software update is available.
        </BiampBannerContent>
        <BiampBannerActions>{bannerButton('Learn more')}</BiampBannerActions>
      </BiampBanner>

      <BiampBanner show severity="success">
        <BiampBannerIcon severity="success" />
        <BiampBannerContent>
          Success — Changes saved successfully.
        </BiampBannerContent>
        <BiampBannerActions>{bannerButton('View')}</BiampBannerActions>
      </BiampBanner>

      <BiampBanner show severity="warning">
        <BiampBannerIcon severity="warning" />
        <BiampBannerContent>
          Warning — Your license expires in 3 days.
        </BiampBannerContent>
        <BiampBannerActions>{bannerButton('Renew')}</BiampBannerActions>
      </BiampBanner>

      <BiampBanner show severity="error">
        <BiampBannerIcon severity="error" />
        <BiampBannerContent>
          Error — Unable to connect to the server.
        </BiampBannerContent>
        <BiampBannerActions>{bannerButton('Retry')}</BiampBannerActions>
      </BiampBanner>
    </div>
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
        {bannerButton('Update now')}
        {bannerButton('Dismiss', () => setShow(false))}
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {severities.map((s) => (
          <BiampBanner key={s} show={visible[s]} severity={s}>
            <BiampBannerIcon severity={s} />
            <BiampBannerContent>{messages[s]}</BiampBannerContent>
            <BiampBannerActions>
              {bannerButton('Dismiss', () =>
                setVisible((v) => ({ ...v, [s]: false })),
              )}
            </BiampBannerActions>
          </BiampBanner>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          padding: 16,
          flexWrap: 'wrap',
        }}
      >
        {severities.map((s) => (
          <button
            key={s}
            style={{
              padding: '4px 10px',
              fontSize: 13,
              border: '1px solid #1976d2',
              borderRadius: 4,
              background: 'transparent',
              color: visible[s] ? '#bdbdbd' : '#1976d2',
              cursor: visible[s] ? 'default' : 'pointer',
            }}
            disabled={visible[s]}
            onClick={() => setVisible((v) => ({ ...v, [s]: true }))}
          >
            Show {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Demonstrates all four severities toggled independently with show/hide controls.
 */
export const IndependentToggles: Story = {
  name: 'Independent Toggles',
  render: () => <IndependentTogglesDemo />,
};
