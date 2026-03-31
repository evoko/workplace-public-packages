import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Switch',
};

export default meta;
type Story = StoryObj;

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

/**
 * Toggle switch built with a hidden checkbox + styled label.
 * Uses inline <style> for the :checked pseudo-class.
 */
const switchCSS = `
  .solar-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }
  .solar-switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }
  .solar-switch .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--solar-neutral-300);
    border-radius: var(--solar-radius-full);
    transition: background-color 0.2s;
  }
  .solar-switch .slider::before {
    content: "";
    position: absolute;
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: var(--solar-white);
    border-radius: var(--solar-radius-full);
    transition: transform 0.2s;
  }
  .solar-switch input:checked + .slider {
    background-color: var(--solar-brand-600);
  }
  .solar-switch input:checked + .slider::before {
    transform: translateX(20px);
  }
  .solar-switch input:disabled + .slider {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SwitchRow = ({
  label,
  defaultChecked = false,
  disabled = false,
  id,
}: {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  id: string;
}) => (
  <label
    htmlFor={id}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: 'var(--solar-font-sans)',
      fontSize: '0.875rem',
      color: disabled
        ? 'var(--solar-text-disabled)'
        : 'var(--solar-text-default)',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
  >
    <span className="solar-switch">
      <input
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
      />
      <span className="slider" />
    </span>
    {label}
  </label>
);

export const AllStates: Story = {
  render: () => (
    <>
      <style>{switchCSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={heading}>Switch States</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SwitchRow id="sw-off" label="Off" />
          <SwitchRow id="sw-on" label="On" defaultChecked />
          <SwitchRow id="sw-dis-off" label="Disabled off" disabled />
          <SwitchRow
            id="sw-dis-on"
            label="Disabled on"
            defaultChecked
            disabled
          />
        </div>
      </div>
    </>
  ),
};
