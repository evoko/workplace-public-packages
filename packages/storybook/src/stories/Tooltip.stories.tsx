import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Tooltip',
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

const btnOutlined: React.CSSProperties = {
  fontFamily: 'var(--solar-font-sans)',
  fontWeight: 500,
  fontSize: '0.875rem',
  borderRadius: 'var(--solar-radius-base)',
  cursor: 'pointer',
  height: 40,
  padding: '0 16px',
  backgroundColor: 'var(--solar-action-secondary-bg)',
  color: 'var(--solar-action-secondary-text)',
  border: '1px solid var(--solar-border-secondary)',
};

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 8px)',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'var(--solar-surface-inverse)',
  color: 'var(--solar-text-inverse)',
  padding: '6px 12px',
  borderRadius: 'var(--solar-radius-md)',
  fontSize: '0.75rem',
  fontFamily: 'var(--solar-font-sans)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  boxShadow: 'var(--solar-shadow-modal)',
};

const arrowStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderTop: '6px solid var(--solar-surface-inverse)',
};

function TooltipWrap({
  text,
  children,
}: {
  text: React.ReactNode;
  children: React.ReactElement;
}) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span style={tooltipStyle}>
          {text}
          <span style={arrowStyle} />
        </span>
      )}
    </span>
  );
}

export const Playground: Story = {
  render: () => (
    <div style={{ padding: '60px 0 20px' }}>
      <TooltipWrap text="Tooltip text">
        <button style={btnOutlined}>Hover me</button>
      </TooltipWrap>
    </div>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>With custom content</h3>
      <div style={{ display: 'flex', gap: 16, paddingTop: 60 }}>
        <TooltipWrap
          text={
            <span style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
              <span>1380 W Elliot Rd, Tempe, AZ 85284, US</span>
              <span>11:45PM PST</span>
            </span>
          }
        >
          <button style={btnOutlined}>Hover over</button>
        </TooltipWrap>
      </div>
    </div>
  ),
};

export const OnIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3 style={heading}>On Icon Buttons</h3>
      <div style={{ display: 'flex', gap: 16, paddingTop: 60 }}>
        <TooltipWrap text="More information">
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: 'var(--solar-icon-secondary)',
              padding: 8,
              borderRadius: 'var(--solar-radius-base)',
            }}
          >
            &#9432;
          </button>
        </TooltipWrap>
        <TooltipWrap text="Get help">
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: 'var(--solar-icon-secondary)',
              padding: 8,
              borderRadius: 'var(--solar-radius-base)',
            }}
          >
            &#10067;
          </button>
        </TooltipWrap>
      </div>
    </div>
  ),
};
