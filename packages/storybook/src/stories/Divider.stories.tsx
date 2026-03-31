import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Divider',
};

export default meta;
type Story = StoryObj;

const hrStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--solar-border-default)',
  margin: 0,
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
  fontSize: '1.25rem',
  fontWeight: 600,
  margin: 0,
};

const body: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '1rem',
  color: 'var(--solar-text-default)',
  margin: 0,
};

const dividerWithText: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.8125rem',
  color: 'var(--solar-text-tertiary)',
};

const dividerLine: React.CSSProperties = {
  flex: 1,
  borderTop: '1px solid var(--solar-border-default)',
};

const chipInline: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: 24,
  padding: '0 8px',
  borderRadius: 'var(--solar-radius-full)',
  backgroundColor: 'var(--solar-surface-secondary)',
  border: '1px solid var(--solar-border-default)',
  fontSize: '0.75rem',
  fontFamily: 'var(--solar-font-sans)',
  color: 'var(--solar-text-default)',
};

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>Divider</h3>
      <div>
        <p style={{ ...body, marginBottom: 8 }}>Content above the divider</p>
        <hr style={hrStyle} />
        <p style={{ ...body, marginTop: 8 }}>Content below the divider</p>
      </div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>Divider with Text</h3>

      <div style={dividerWithText}>
        <span style={dividerLine} />
        <span>Center</span>
        <span style={dividerLine} />
      </div>

      <div style={dividerWithText}>
        <span>Left</span>
        <span style={dividerLine} />
      </div>

      <div style={dividerWithText}>
        <span style={dividerLine} />
        <span>Right</span>
      </div>

      <div style={dividerWithText}>
        <span style={dividerLine} />
        <span style={chipInline}>Chip</span>
        <span style={dividerLine} />
      </div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>Dividers in a List</h3>
      <div>
        {['First section', 'Second section', 'Third section'].map(
          (text, index, arr) => (
            <div key={text}>
              <p style={{ ...body, padding: '12px 0' }}>{text}</p>
              {index < arr.length - 1 && <hr style={hrStyle} />}
            </div>
          ),
        )}
      </div>
    </div>
  ),
};
