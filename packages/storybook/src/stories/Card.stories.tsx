import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Card',
};

export default meta;
type Story = StoryObj;

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--solar-surface-default)',
  border: '1px solid var(--solar-border-default)',
  borderRadius: 'var(--solar-radius-lg)',
  boxShadow: 'var(--solar-shadow-subtle)',
  overflow: 'hidden',
  fontFamily: 'var(--solar-font-sans)',
};

const cardContent: React.CSSProperties = {
  padding: 16,
};

const cardActions: React.CSSProperties = {
  padding: '8px 16px 16px',
  display: 'flex',
  gap: 8,
};

const btnSmall: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  border: 'none',
  background: 'none',
  color: 'var(--solar-text-brand)',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 'var(--solar-radius-sm)',
};

const btnSmallFilled: React.CSSProperties = {
  ...btnSmall,
  backgroundColor: 'var(--solar-action-primary-bg)',
  color: 'var(--solar-action-primary-text)',
};

export const Basic: Story = {
  render: () => (
    <div style={{ ...cardStyle, maxWidth: 345 }}>
      <div style={cardContent}>
        <h6
          style={{
            margin: '0 0 8px',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--solar-text-default)',
          }}
        >
          Card Title
        </h6>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--solar-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          This is a basic card with content. Cards contain content and actions
          about a single subject.
        </p>
      </div>
      <div style={cardActions}>
        <button style={btnSmall}>Learn More</button>
        <button style={btnSmall}>Action</button>
      </div>
    </div>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <div style={{ ...cardStyle, maxWidth: 400 }}>
      <div
        style={{
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--solar-radius-full)',
            backgroundColor: 'var(--solar-surface-brand)',
            color: 'var(--solar-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          R
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--solar-text-default)',
            }}
          >
            Card Header
          </div>
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--solar-text-secondary)',
            }}
          >
            September 14, 2026
          </div>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--solar-icon-secondary)',
            fontSize: '1.25rem',
          }}
        >
          ...
        </button>
      </div>
      <div style={cardContent}>
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--solar-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Cards can include a header with an avatar, title, subheader, and an
          action element. The card surface uses the default background with a
          subtle shadow and border.
        </p>
      </div>
      <div style={cardActions}>
        <button style={btnSmall}>Share</button>
        <button style={btnSmall}>Learn More</button>
      </div>
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {['Project Alpha', 'Project Beta', 'Project Gamma'].map((title) => (
        <div key={title} style={{ ...cardStyle, width: 280 }}>
          <div style={cardContent}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--solar-text-secondary)',
              }}
            >
              Project
            </div>
            <h6
              style={{
                margin: '4px 0 0',
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--solar-text-default)',
              }}
            >
              {title}
            </h6>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: '0.875rem',
                color: 'var(--solar-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              A brief description of the project and its current status.
            </p>
          </div>
          <div style={cardActions}>
            <button style={btnSmallFilled}>Open</button>
            <button style={btnSmall}>Details</button>
          </div>
        </div>
      ))}
    </div>
  ),
};
