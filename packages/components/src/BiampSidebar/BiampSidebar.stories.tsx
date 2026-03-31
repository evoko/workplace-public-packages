import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BiampSidebar,
  BiampSidebarIcon,
  BiampSidebarIconList,
  BiampSidebarComponent,
} from '@bwp-web/components';

const meta: Meta<typeof BiampSidebar> = {
  title: 'Components/BiampSidebar',
  component: BiampSidebar,
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BiampSidebar>;

const iconLabel = (text: string, filled = false) => (
  <span
    style={{
      fontSize: 12,
      fontWeight: filled ? 700 : 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
    }}
  >
    {text}
  </span>
);

function DefaultDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items = [
    { icon: iconLabel('Home'), selectedIcon: iconLabel('Home', true) },
    { icon: iconLabel('Dash'), selectedIcon: iconLabel('Dash', true) },
    { icon: iconLabel('Ppl'), selectedIcon: iconLabel('Ppl', true) },
    { icon: iconLabel('Set'), selectedIcon: iconLabel('Set', true) },
  ];

  return (
    <BiampSidebar sx={{ height: 600 }}>
      {items.map((item, i) => (
        <BiampSidebarIcon
          key={i}
          selected={selectedIndex === i}
          icon={item.icon}
          selectedIcon={item.selectedIcon}
          onClick={() => setSelectedIndex(i)}
        />
      ))}
    </BiampSidebar>
  );
}

/**
 * The default sidebar with selectable navigation icons.
 * Click any icon to select it. The Biamp logo is automatically rendered at the bottom.
 */
export const Default: Story = {
  render: () => <DefaultDemo />,
};

function CustomLogoDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items = [
    { icon: iconLabel('Home'), selectedIcon: iconLabel('Home', true) },
    { icon: iconLabel('Dash'), selectedIcon: iconLabel('Dash', true) },
    { icon: iconLabel('Set'), selectedIcon: iconLabel('Set', true) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>Default logo</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          The Biamp logo is rendered at the bottom when no{' '}
          <code>bottomLogoIcon</code> prop is provided.
        </p>
        <div style={{ height: 400 }}>
          <BiampSidebar>
            {items.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </BiampSidebar>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Custom logo</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          Any JSX element can be passed as the <code>bottomLogoIcon</code> prop
          to replace the default Biamp logo.
        </p>
        <div style={{ height: 400 }}>
          <BiampSidebar
            bottomLogoIcon={
              <span
                style={{
                  width: 48,
                  height: 24,
                  alignSelf: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                Bldg
              </span>
            }
          >
            {items.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </BiampSidebar>
        </div>
      </div>
    </div>
  );
}

/**
 * Pass a custom `logo` prop to replace the default Biamp logo at the
 * bottom of the sidebar. When omitted, the Biamp logo is rendered automatically.
 */
export const CustomLogo: Story = {
  name: 'Custom Logo',
  render: () => <CustomLogoDemo />,
};

function WithSelectedIconsDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>With selectedIcon</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          The icon changes from outlined to filled when selected.
        </p>
        <div style={{ height: 400 }}>
          <BiampSidebar>
            <BiampSidebarIcon
              selected={selectedIndex === 0}
              icon={iconLabel('Home')}
              selectedIcon={iconLabel('Home', true)}
              onClick={() => setSelectedIndex(0)}
            />
            <BiampSidebarIcon
              selected={selectedIndex === 1}
              icon={iconLabel('Set')}
              selectedIcon={iconLabel('Set', true)}
              onClick={() => setSelectedIndex(1)}
            />
          </BiampSidebar>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Without selectedIcon</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          When no selectedIcon is provided, the same icon is used for both
          states.
        </p>
        <div style={{ height: 400 }}>
          <BiampSidebar>
            <BiampSidebarIcon
              selected={selectedIndex === 0}
              icon={iconLabel('Home', true)}
              onClick={() => setSelectedIndex(0)}
            />
            <BiampSidebarIcon
              selected={selectedIndex === 1}
              icon={iconLabel('Set', true)}
              onClick={() => setSelectedIndex(1)}
            />
          </BiampSidebar>
        </div>
      </div>
    </div>
  );
}

/**
 * When `selectedIcon` is provided, the sidebar icon swaps between
 * the `icon` (unselected) and `selectedIcon` (selected) automatically.
 * This is useful for showing filled vs outlined icon variants.
 */
export const WithSelectedIcons: Story = {
  name: 'With Selected Icons',
  render: () => <WithSelectedIconsDemo />,
};

/**
 * Individual `BiampSidebarIcon` states shown side by side.
 * Each icon is a `ListItemButton` under the hood, so it supports
 * `selected`, `disabled`, and `onClick` props.
 */
export const IconStates: Story = {
  name: 'Icon States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3>BiampSidebarIcon States</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BiampSidebarIcon icon={iconLabel('Home')} />
          <span style={{ fontSize: 12 }}>Default</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BiampSidebarIcon selected icon={iconLabel('Home')} />
          <span style={{ fontSize: 12 }}>Selected</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BiampSidebarIcon
            selected
            icon={iconLabel('Home')}
            selectedIcon={iconLabel('Home', true)}
          />
          <span style={{ fontSize: 12 }}>Selected (with selectedIcon)</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BiampSidebarIcon icon={iconLabel('Home')} disabled />
          <span style={{ fontSize: 12 }}>Disabled</span>
        </div>
      </div>
      <hr
        style={{
          width: '100%',
          border: 'none',
          borderTop: '1px solid #e0e0e0',
        }}
      />
      <h3>Extends ListItemButton</h3>
      <p style={{ maxWidth: 500, fontSize: 14 }}>
        BiampSidebarIcon extends MUI&apos;s ListItemButtonProps, so you can pass
        any prop that ListItemButton accepts, such as <code>disabled</code>,{' '}
        <code>onClick</code>, <code>sx</code>, and more.
      </p>
    </div>
  ),
};

function WithIconListDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items = [
    { icon: iconLabel('Home'), selectedIcon: iconLabel('Home', true) },
    { icon: iconLabel('Dash'), selectedIcon: iconLabel('Dash', true) },
    { icon: iconLabel('Ppl'), selectedIcon: iconLabel('Ppl', true) },
    { icon: iconLabel('Set'), selectedIcon: iconLabel('Set', true) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>With BiampSidebarIconList</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          Icons are wrapped in <code>BiampSidebarIconList</code> which adds
          standardised 4px gaps between each item.
        </p>
        <div style={{ height: 400 }}>
          <BiampSidebar>
            <BiampSidebarIconList>
              {items.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Without BiampSidebarIconList</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          Without the list wrapper, icons stack with no gap between them.
        </p>
        <div style={{ height: 400 }}>
          <BiampSidebar>
            {items.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </BiampSidebar>
        </div>
      </div>
    </div>
  );
}

/**
 * `BiampSidebarIconList` provides a standardised vertical list layout for
 * `BiampSidebarIcon` items with consistent 4px gaps between each icon.
 * Use it inside `BiampSidebar` to get properly-spaced icon groups.
 */
export const WithIconList: Story = {
  name: 'With Icon List',
  render: () => <WithIconListDemo />,
};

function WithSidebarComponentDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items = [
    { icon: iconLabel('Home'), selectedIcon: iconLabel('Home', true) },
    { icon: iconLabel('Dash'), selectedIcon: iconLabel('Dash', true) },
    { icon: iconLabel('Set'), selectedIcon: iconLabel('Set', true) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>BiampSidebarComponent</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          Use <code>BiampSidebarComponent</code> to embed arbitrary content in
          the sidebar. It provides the same 48x48px rounded-box dimensions as{' '}
          <code>BiampSidebarIcon</code>, but renders a plain <code>Box</code>{' '}
          instead of a button.
        </p>
      </div>
      <div style={{ height: 500 }}>
        <BiampSidebar>
          <BiampSidebarIconList>
            <BiampSidebarComponent
              style={{
                backgroundColor: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                AV
              </span>
            </BiampSidebarComponent>
            {items.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
            <BiampSidebarComponent
              style={{
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 'bold' }}>42</span>
            </BiampSidebarComponent>
          </BiampSidebarIconList>
        </BiampSidebar>
      </div>
    </div>
  );
}

/**
 * `BiampSidebarComponent` renders a 48x48px rounded box that matches the
 * dimensions and shape of `BiampSidebarIcon`. Use it to place arbitrary
 * content (avatars, status indicators, custom widgets, etc.) in the sidebar
 * alongside icon buttons while maintaining a consistent visual rhythm.
 */
export const WithSidebarComponent: Story = {
  name: 'With Sidebar Component',
  render: () => <WithSidebarComponentDemo />,
};
