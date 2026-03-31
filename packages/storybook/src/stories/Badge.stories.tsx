import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Badge',
};

export default meta;
type Story = StoryObj;

const iconPlaceholder: React.CSSProperties = {
  width: 24,
  height: 24,
  backgroundColor: 'var(--solar-neutral-400)',
  borderRadius: 'var(--solar-radius-sm)',
};

const badgeWrap: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
};

const dotStyle = (color: string): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: 8,
  height: 8,
  borderRadius: 'var(--solar-radius-full)',
  backgroundColor: color,
  border: '2px solid var(--solar-surface-default)',
  transform: 'translate(50%, -50%)',
});

const countStyle = (color: string): React.CSSProperties => ({
  position: 'absolute',
  top: 0,
  right: 0,
  minWidth: 18,
  height: 18,
  borderRadius: 'var(--solar-radius-full)',
  backgroundColor: color,
  color: 'var(--solar-white)',
  fontSize: '0.7rem',
  fontWeight: 600,
  fontFamily: 'var(--solar-font-sans)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  border: '2px solid var(--solar-surface-default)',
  transform: 'translate(50%, -50%)',
});

const COLORS = [
  { name: 'primary', value: 'var(--solar-brand-500)' },
  { name: 'error', value: 'var(--solar-red-500)' },
  { name: 'warning', value: 'var(--solar-orange-500)' },
  { name: 'success', value: 'var(--solar-green-500)' },
  { name: 'info', value: 'var(--solar-blue-500)' },
];

export const Dot: Story = {
  name: 'Dot variant',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h6
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Badge dot — status indicator
      </h6>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {COLORS.map((c) => (
          <span key={c.name} style={badgeWrap}>
            <span style={iconPlaceholder} />
            <span style={dotStyle(c.value)} />
          </span>
        ))}
      </div>
    </div>
  ),
};

export const Standard: Story = {
  name: 'Standard variant',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h6
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Badge standard — with count
      </h6>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {COLORS.map((c) => (
          <span key={c.name} style={badgeWrap}>
            <span style={iconPlaceholder} />
            <span style={countStyle(c.value)}>5</span>
          </span>
        ))}
      </div>
    </div>
  ),
};
