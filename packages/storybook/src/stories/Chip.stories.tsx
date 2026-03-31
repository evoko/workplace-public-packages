import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Chip',
};

export default meta;
type Story = StoryObj;

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 32,
  padding: '0 12px',
  borderRadius: 'var(--solar-radius-full)',
  backgroundColor: 'var(--solar-surface-secondary)',
  color: 'var(--solar-text-default)',
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  border: '1px solid var(--solar-border-default)',
  whiteSpace: 'nowrap',
};

const deleteBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
  borderRadius: 'var(--solar-radius-full)',
  border: 'none',
  background: 'var(--solar-neutral-300)',
  color: 'var(--solar-text-secondary)',
  fontSize: '0.7rem',
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1,
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        fontFamily: 'var(--solar-font-sans)',
      }}
    >
      <h3
        style={{
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Chip States
      </h3>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span style={chipStyle}>Default</span>
        <span style={chipStyle}>
          With Delete
          <button style={deleteBtn} aria-label="Remove">
            x
          </button>
        </span>
        <span style={chipStyle}>
          <span style={{ fontSize: '0.9rem' }}>&#128269;</span>
          With Icon
        </span>
        <span style={chipStyle}>
          <span style={{ fontSize: '0.9rem' }}>&#128269;</span>
          Icon + Delete
          <button style={deleteBtn} aria-label="Remove">
            x
          </button>
        </span>
      </div>
    </div>
  ),
};
