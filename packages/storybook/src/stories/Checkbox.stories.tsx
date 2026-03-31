import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Checkbox',
};

export default meta;
type Story = StoryObj;

const labelRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  color: 'var(--solar-text-default)',
};

const checkboxStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  accentColor: 'var(--solar-brand-600)',
  cursor: 'pointer',
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
        Checkbox States
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={labelRow}>
          <input type="checkbox" style={checkboxStyle} />
          Unchecked
        </label>
        <label style={labelRow}>
          <input type="checkbox" style={checkboxStyle} defaultChecked />
          Checked
        </label>
        <label style={labelRow}>
          <input type="checkbox" style={checkboxStyle} disabled />
          Disabled unchecked
        </label>
        <label style={labelRow}>
          <input
            type="checkbox"
            style={checkboxStyle}
            disabled
            defaultChecked
          />
          Disabled checked
        </label>
      </div>

      <h3
        style={{
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
          paddingTop: 16,
        }}
      >
        Label Placement
      </h3>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <label style={labelRow}>
          <input type="checkbox" style={checkboxStyle} defaultChecked />
          End (default)
        </label>
        <label style={{ ...labelRow, flexDirection: 'row-reverse' }}>
          <input type="checkbox" style={checkboxStyle} defaultChecked />
          Start
        </label>
        <label
          style={{
            ...labelRow,
            flexDirection: 'column-reverse',
            textAlign: 'center',
          }}
        >
          <input type="checkbox" style={checkboxStyle} defaultChecked />
          Top
        </label>
        <label
          style={{ ...labelRow, flexDirection: 'column', textAlign: 'center' }}
        >
          <input type="checkbox" style={checkboxStyle} defaultChecked />
          Bottom
        </label>
      </div>
    </div>
  ),
};
