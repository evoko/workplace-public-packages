import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Alert',
};

export default meta;
type Story = StoryObj;

const alertStyle = (
  bg: string,
  border: string,
  text: string,
): React.CSSProperties => ({
  padding: '12px 16px',
  borderRadius: 'var(--solar-radius-base)',
  border: `1px solid var(${border})`,
  backgroundColor: `var(${bg})`,
  color: `var(${text})`,
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  lineHeight: 1.5,
});

const severities = [
  {
    key: 'success',
    bg: '--solar-surface-success',
    border: '--solar-border-success',
    text: '--solar-text-success',
  },
  {
    key: 'info',
    bg: '--solar-surface-info',
    border: '--solar-border-info',
    text: '--solar-text-info',
  },
  {
    key: 'warning',
    bg: '--solar-surface-warning',
    border: '--solar-border-warning',
    text: '--solar-text-warning',
  },
  {
    key: 'error',
    bg: '--solar-surface-danger',
    border: '--solar-border-danger',
    text: '--solar-text-danger',
  },
] as const;

export const AllSeverities: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Standard Alerts (all severities)
      </h3>
      {severities.map((s) => (
        <div key={s.key} style={alertStyle(s.bg, s.border, s.text)}>
          {s.key.charAt(0).toUpperCase() + s.key.slice(1)} — This is a {s.key}{' '}
          alert.
        </div>
      ))}
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={alertStyle(
          '--solar-surface-info',
          '--solar-border-info',
          '--solar-text-info',
        )}
      >
        This is a longer alert message that demonstrates how the alert component
        handles content that spans multiple lines. The custom styling should
        ensure proper alignment of the icon and the text content regardless of
        how much text is displayed.
      </div>
    </div>
  ),
};
