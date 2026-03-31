import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Slider',
};

export default meta;
type Story = StoryObj;

const rangeStyle: React.CSSProperties = {
  width: '100%',
  accentColor: 'var(--solar-brand-600)',
  cursor: 'pointer',
};

const labelText: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  color: 'var(--solar-text-secondary)',
  margin: '0 0 8px',
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

export const SingleSlider: Story = {
  name: 'Single slider',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 400,
      }}
    >
      <h6 style={heading}>Single slider</h6>
      <div>
        <p style={labelText}>Volume</p>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={30}
          style={rangeStyle}
        />
      </div>
      <div>
        <p style={labelText}>Disabled</p>
        <input
          type="range"
          min={0}
          max={100}
          defaultValue={50}
          disabled
          style={{ ...rangeStyle, opacity: 0.5, cursor: 'not-allowed' }}
        />
      </div>
    </div>
  ),
};

function RangeDemo() {
  const [min, setMin] = useState(20);
  const [max, setMax] = useState(60);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 400,
      }}
    >
      <h6 style={heading}>Range slider (two inputs)</h6>
      <div>
        <p style={labelText}>
          Price range: ${min} - ${max}
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="range"
            min={0}
            max={100}
            value={min}
            onChange={(e) => setMin(Math.min(Number(e.target.value), max - 1))}
            style={rangeStyle}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={max}
            onChange={(e) => setMax(Math.max(Number(e.target.value), min + 1))}
            style={rangeStyle}
          />
        </div>
      </div>
    </div>
  );
}

export const RangeSlider: Story = {
  name: 'Range slider',
  render: () => <RangeDemo />,
};

export const WithSteps: Story = {
  name: 'With steps & marks',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 400,
      }}
    >
      <h6 style={heading}>Discrete slider with steps</h6>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        defaultValue={20}
        style={rangeStyle}
        list="step-marks"
      />
      <datalist id="step-marks">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
          <option key={v} value={v} />
        ))}
      </datalist>
    </div>
  ),
};
