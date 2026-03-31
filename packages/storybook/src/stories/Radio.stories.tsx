import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Radio',
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
  cursor: 'pointer',
};

const radioStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  accentColor: 'var(--solar-brand-600)',
  cursor: 'pointer',
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

const fieldsetStyle: React.CSSProperties = {
  border: 'none',
  padding: 0,
  margin: 0,
};

const legendStyle: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--solar-text-brand)',
  marginBottom: 8,
};

export const RadioGroupExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>Radio Group</h3>
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Select an option</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelRow}>
            <input
              type="radio"
              name="option"
              value="option1"
              defaultChecked
              style={radioStyle}
            />
            Option 1
          </label>
          <label style={labelRow}>
            <input
              type="radio"
              name="option"
              value="option2"
              style={radioStyle}
            />
            Option 2
          </label>
          <label style={labelRow}>
            <input
              type="radio"
              name="option"
              value="option3"
              style={radioStyle}
            />
            Option 3
          </label>
          <label style={{ ...labelRow, color: 'var(--solar-text-disabled)' }}>
            <input
              type="radio"
              name="option"
              value="disabled"
              disabled
              style={radioStyle}
            />
            Disabled option
          </label>
        </div>
      </fieldset>

      <h3 style={{ ...heading, paddingTop: 16 }}>Horizontal Layout</h3>
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Pick a size</legend>
        <div style={{ display: 'flex', gap: 16 }}>
          <label style={labelRow}>
            <input type="radio" name="size" value="small" style={radioStyle} />
            Small
          </label>
          <label style={labelRow}>
            <input
              type="radio"
              name="size"
              value="medium"
              defaultChecked
              style={radioStyle}
            />
            Medium
          </label>
          <label style={labelRow}>
            <input type="radio" name="size" value="large" style={radioStyle} />
            Large
          </label>
        </div>
      </fieldset>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={heading}>Radio States</h3>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <label style={labelRow}>
          <input type="radio" name="states" style={radioStyle} />
          Unchecked
        </label>
        <label style={labelRow}>
          <input
            type="radio"
            name="states-checked"
            defaultChecked
            style={radioStyle}
          />
          Checked
        </label>
        <label style={{ ...labelRow, color: 'var(--solar-text-disabled)' }}>
          <input type="radio" name="states-dis" disabled style={radioStyle} />
          Disabled
        </label>
        <label style={{ ...labelRow, color: 'var(--solar-text-disabled)' }}>
          <input
            type="radio"
            name="states-dis-checked"
            disabled
            defaultChecked
            style={radioStyle}
          />
          Disabled checked
        </label>
      </div>
    </div>
  ),
};
