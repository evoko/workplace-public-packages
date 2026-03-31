import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Select',
};

export default meta;
type Story = StoryObj;

const selectStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 12px',
  borderRadius: 'var(--solar-radius-base)',
  border: '1px solid var(--solar-border-default)',
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  color: 'var(--solar-text-default)',
  backgroundColor: 'var(--solar-surface-default)',
  cursor: 'pointer',
  appearance: 'auto',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--solar-text-secondary)',
  marginBottom: 4,
};

const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.75rem',
  color: 'var(--solar-text-tertiary)',
  marginTop: 4,
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

function SelectDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ minWidth: 200 }}>
      <label style={labelStyle}>Option</label>
      <select
        style={selectStyle}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="" disabled>
          Select...
        </option>
        <option value="alpha">Alpha</option>
        <option value="beta">Beta</option>
        <option value="gamma">Gamma</option>
        <option value="delta">Delta</option>
      </select>
    </div>
  );
}

export const Default: Story = {
  render: () => <SelectDemo />,
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h6 style={heading}>Select states</h6>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Default</label>
          <select style={selectStyle} defaultValue="">
            <option value="" disabled>
              Select...
            </option>
            <option value="one">Option one</option>
            <option value="two">Option two</option>
          </select>
        </div>

        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>Disabled</label>
          <select
            style={{ ...selectStyle, opacity: 0.5, cursor: 'not-allowed' }}
            disabled
            defaultValue=""
          >
            <option value="" disabled>
              Select...
            </option>
            <option value="one">Option one</option>
          </select>
        </div>

        <div style={{ minWidth: 180 }}>
          <label style={{ ...labelStyle, color: 'var(--solar-text-danger)' }}>
            Error
          </label>
          <select
            style={{
              ...selectStyle,
              borderColor: 'var(--solar-border-danger)',
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Select...
            </option>
            <option value="one">Option one</option>
          </select>
          <div style={{ ...helperStyle, color: 'var(--solar-text-danger)' }}>
            Required field
          </div>
        </div>

        <div style={{ minWidth: 180 }}>
          <label style={labelStyle}>With value</label>
          <select style={selectStyle} defaultValue="one">
            <option value="one">Option one</option>
            <option value="two">Option two</option>
          </select>
          <div style={helperStyle}>Helper text</div>
        </div>
      </div>
    </div>
  ),
};
