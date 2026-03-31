import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/TextField',
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

const fieldWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--solar-text-secondary)',
};

const inputStyle: React.CSSProperties = {
  height: 44,
  padding: '0 12px',
  borderRadius: 'var(--solar-radius-base)',
  border: '1px solid var(--solar-border-default)',
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  color: 'var(--solar-text-default)',
  backgroundColor: 'var(--solar-surface-default)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.75rem',
  color: 'var(--solar-text-tertiary)',
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 400,
      }}
    >
      <h3 style={heading}>TextField States</h3>

      <div style={fieldWrap}>
        <label style={labelStyle}>Default</label>
        <input style={inputStyle} placeholder="Enter text..." />
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>With value</label>
        <input style={inputStyle} defaultValue="Hello World" />
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>With helper text</label>
        <input style={inputStyle} placeholder="Enter text..." />
        <span style={helperStyle}>This is helper text</span>
      </div>

      <div style={fieldWrap}>
        <label style={{ ...labelStyle, color: 'var(--solar-text-danger)' }}>
          Error state
        </label>
        <input
          style={{
            ...inputStyle,
            borderColor: 'var(--solar-border-danger)',
          }}
          defaultValue="Invalid input"
        />
        <span style={{ ...helperStyle, color: 'var(--solar-text-danger)' }}>
          This field is required
        </span>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Disabled</label>
        <input
          style={{
            ...inputStyle,
            opacity: 0.5,
            cursor: 'not-allowed',
          }}
          defaultValue="Cannot edit"
          disabled
        />
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>
          Required <span style={{ color: 'var(--solar-text-danger)' }}>*</span>
        </label>
        <input style={inputStyle} placeholder="Required field" required />
      </div>
    </div>
  ),
};

export const WithAdornments: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 400,
      }}
    >
      <h3 style={heading}>Input Adornments</h3>

      <div style={fieldWrap}>
        <label style={labelStyle}>Search</label>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 12,
              color: 'var(--solar-icon-tertiary)',
              fontSize: '0.875rem',
              pointerEvents: 'none',
            }}
          >
            &#128269;
          </span>
          <input
            style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }}
            placeholder="Search..."
          />
          <span
            style={{
              position: 'absolute',
              right: 12,
              color: 'var(--solar-icon-tertiary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            &#x2715;
          </span>
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Password</label>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            type="password"
            style={{ ...inputStyle, paddingRight: 36 }}
            placeholder="Enter password"
          />
          <span
            style={{
              position: 'absolute',
              right: 12,
              color: 'var(--solar-icon-tertiary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            &#128065;
          </span>
        </div>
      </div>
    </div>
  ),
};
