import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Breadcrumbs',
};

export default meta;
type Story = StoryObj;

const navStyle: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
};

const olStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  listStyle: 'none',
  padding: 0,
  margin: 0,
  gap: 4,
};

const linkStyle: React.CSSProperties = {
  color: 'var(--solar-text-secondary)',
  textDecoration: 'none',
};

const currentStyle: React.CSSProperties = {
  color: 'var(--solar-text-tertiary)',
  fontWeight: 600,
};

const separator = (
  <li
    style={{
      color: 'var(--solar-text-tertiary)',
      userSelect: 'none',
      fontSize: '0.875rem',
    }}
  >
    /
  </li>
);

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Breadcrumbs
      </h3>
      <p
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-secondary)',
          fontSize: '0.875rem',
          margin: 0,
        }}
      >
        Uses a simple "/" separator.
      </p>
      <nav style={navStyle}>
        <ol style={olStyle}>
          <li>
            <a href="#" style={linkStyle}>
              Home
            </a>
          </li>
          {separator}
          <li>
            <a href="#" style={linkStyle}>
              Settings
            </a>
          </li>
          {separator}
          <li>
            <span style={currentStyle}>General</span>
          </li>
        </ol>
      </nav>
    </div>
  ),
};

export const MultipleDepths: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Multiple Depths
      </h3>

      <nav style={navStyle}>
        <ol style={olStyle}>
          <li>
            <a href="#" style={linkStyle}>
              Home
            </a>
          </li>
          {separator}
          <li>
            <span style={currentStyle}>Dashboard</span>
          </li>
        </ol>
      </nav>

      <nav style={navStyle}>
        <ol style={olStyle}>
          <li>
            <a href="#" style={linkStyle}>
              Home
            </a>
          </li>
          {separator}
          <li>
            <a href="#" style={linkStyle}>
              Users
            </a>
          </li>
          {separator}
          <li>
            <span style={currentStyle}>John Doe</span>
          </li>
        </ol>
      </nav>

      <nav style={navStyle}>
        <ol style={olStyle}>
          <li>
            <a href="#" style={linkStyle}>
              Home
            </a>
          </li>
          {separator}
          <li>
            <a href="#" style={linkStyle}>
              Settings
            </a>
          </li>
          {separator}
          <li>
            <a href="#" style={linkStyle}>
              Advanced
            </a>
          </li>
          {separator}
          <li>
            <a href="#" style={linkStyle}>
              Network
            </a>
          </li>
          {separator}
          <li>
            <span style={currentStyle}>Proxy Configuration</span>
          </li>
        </ol>
      </nav>
    </div>
  ),
};
