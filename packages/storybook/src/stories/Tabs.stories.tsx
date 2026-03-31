import { type ReactNode, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Styles/Tabs',
};

export default meta;
type Story = StoryObj;

const tabBtnStyle = (
  active: boolean,
  disabled = false,
): React.CSSProperties => ({
  fontFamily: 'var(--solar-font-sans)',
  fontSize: '0.875rem',
  fontWeight: active ? 600 : 400,
  color: disabled
    ? 'var(--solar-text-disabled)'
    : active
      ? 'var(--solar-text-brand)'
      : 'var(--solar-text-secondary)',
  background: 'none',
  border: 'none',
  borderBottom: active
    ? '2px solid var(--solar-border-brand)'
    : '2px solid transparent',
  padding: '12px 16px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  position: 'relative',
});

const badgeDot = (count: number): React.CSSProperties => ({
  display: count > 0 ? 'inline-flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 18,
  height: 18,
  borderRadius: 'var(--solar-radius-full)',
  backgroundColor: 'var(--solar-brand-500)',
  color: 'var(--solar-white)',
  fontSize: '0.7rem',
  fontWeight: 600,
  padding: '0 4px',
  marginLeft: 6,
});

function TabPanel({
  children,
  value,
  index,
}: {
  children: ReactNode;
  value: number;
  index: number;
}) {
  return value === index ? (
    <div
      style={{
        padding: 16,
        fontFamily: 'var(--solar-font-sans)',
        color: 'var(--solar-text-default)',
        fontSize: '0.875rem',
      }}
    >
      {children}
    </div>
  ) : null;
}

function DefaultDemo() {
  const [value, setValue] = useState(0);
  const tabs = ['Overview', 'Details', 'Settings'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h6
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Tabs
      </h6>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--solar-border-default)',
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            style={tabBtnStyle(value === i)}
            onClick={() => setValue(i)}
          >
            {tab}
          </button>
        ))}
      </div>
      <TabPanel value={value} index={0}>
        Overview content goes here.
      </TabPanel>
      <TabPanel value={value} index={1}>
        Details content goes here.
      </TabPanel>
      <TabPanel value={value} index={2}>
        Settings content goes here.
      </TabPanel>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

function WithBadgeDemo() {
  const [value, setValue] = useState(0);
  const notifications = 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h6
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Many Tabs with badge
      </h6>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--solar-border-default)',
        }}
      >
        <button style={tabBtnStyle(value === 0)} onClick={() => setValue(0)}>
          Dashboard
        </button>
        <button style={tabBtnStyle(value === 1)} onClick={() => setValue(1)}>
          Analytics
        </button>
        <button style={tabBtnStyle(value === 2)} onClick={() => setValue(2)}>
          Users
          <span style={badgeDot(notifications)}>{notifications}</span>
        </button>
      </div>
    </div>
  );
}

export const WithBadge: Story = {
  render: () => <WithBadgeDemo />,
};

function DisabledTabDemo() {
  const [value, setValue] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h6
        style={{
          fontFamily: 'var(--solar-font-sans)',
          color: 'var(--solar-text-default)',
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: 0,
        }}
      >
        With Disabled Tab
      </h6>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--solar-border-default)',
        }}
      >
        <button style={tabBtnStyle(value === 0)} onClick={() => setValue(0)}>
          Active
        </button>
        <button style={tabBtnStyle(false, true)} disabled>
          Disabled
        </button>
        <button style={tabBtnStyle(false, true)} disabled>
          Disabled with badge
          <span style={badgeDot(0)} />
        </button>
      </div>
    </div>
  );
}

export const DisabledTab: Story = {
  render: () => <DisabledTabDemo />,
};
