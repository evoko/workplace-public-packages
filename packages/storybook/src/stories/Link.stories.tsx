import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Link',
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

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  color: 'var(--solar-text-link)',
  textDecoration: 'underline',
};

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h6 style={heading}>Links</h6>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <a href="#" style={linkStyle}>
          Default link
        </a>
        <a href="#" style={{ ...linkStyle, textDecoration: 'none' }}>
          Underline on hover (no underline by default)
        </a>
        <a href="#" style={{ ...linkStyle, textDecoration: 'none' }}>
          No underline
        </a>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <p
      style={{
        fontFamily: 'var(--solar-font-sans)',
        fontSize: '1rem',
        color: 'var(--solar-text-default)',
        maxWidth: 500,
        lineHeight: 1.6,
        margin: 0,
      }}
    >
      Visit the{' '}
      <a href="#" style={linkStyle}>
        documentation
      </a>{' '}
      for more details about configuring the SOLAR theme. You can also check the{' '}
      <a href="#" style={linkStyle}>
        design tokens reference
      </a>{' '}
      for color and typography values.
    </p>
  ),
};
