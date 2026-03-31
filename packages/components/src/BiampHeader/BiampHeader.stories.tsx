import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  BiampHeaderActions,
  BiampHeaderButtonList,
  BiampHeaderButton,
  BiampHeaderProfile,
  BiampAppDialog,
  BiampAppDialogItem,
  BiampAppPopover,
} from '@bwp-web/components';
import {
  BookingApp,
  WorkplaceApp,
  CommandApp,
  DesignerApp,
  ConnectApp,
  AppsIcon,
  AppsIconFilled,
} from '@bwp-web/assets';

const iconLabel = (text: string, filled = false) => (
  <span
    style={{
      fontSize: 11,
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

const meta: Meta<typeof BiampHeader> = {
  title: 'Components/BiampHeader',
  component: BiampHeader,
  decorators: [
    (Story) => (
      <div style={{ width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BiampHeader>;

function DefaultDemo() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const apps = [
    { image: BookingApp, name: 'Booking' },
    { image: DesignerApp, name: 'Designer' },
    { image: ConnectApp, name: 'Connect' },
    { image: CommandApp, name: 'Command' },
    { image: WorkplaceApp, name: 'Workplace' },
  ];

  return (
    <BiampHeader>
      <BiampHeaderTitle title="Workplace" subtitle="Booking" />
      <BiampHeaderSearch />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton
            icon={<AppsIcon />}
            selectedIcon={<AppsIconFilled />}
            selected={open}
            onClick={(e) =>
              setAnchorEl(open ? null : (e.currentTarget as HTMLElement))
            }
          />
          <BiampHeaderButton
            icon={iconLabel('Set')}
            selectedIcon={iconLabel('Set', true)}
          />
        </BiampHeaderButtonList>
        <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
      </BiampHeaderActions>
      <BiampAppPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <BiampAppDialog>
          {apps.map((app, i) => (
            <BiampAppDialogItem key={i} name={app.name}>
              <img
                src={app.image}
                alt={app.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </BiampAppDialogItem>
          ))}
        </BiampAppDialog>
      </BiampAppPopover>
    </BiampHeader>
  );
}

/**
 * The default BiampHeader with all sub-components: title with icon,
 * search bar, action buttons, and a profile section.
 */
export const Default: Story = {
  render: () => <DefaultDemo />,
};

/**
 * When no `icon` prop is provided, `BiampHeaderTitle` renders the
 * default Biamp red logo. Pass a custom icon to override it.
 */
export const TitleIcon: Story = {
  name: 'Title Icon (Default vs Custom)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>Default icon (Biamp red logo)</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          When no <code>icon</code> prop is provided, the Biamp red logo is
          rendered automatically.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeader>
            <BiampHeaderTitle title="Dashboard" />
          </BiampHeader>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Custom icon</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          Pass any JSX element as the <code>icon</code> prop to replace the
          default logo.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeader>
            <BiampHeaderTitle icon={iconLabel('Home')} title="Home" />
          </BiampHeader>
        </div>
      </div>
    </div>
  ),
};

/**
 * `BiampHeaderTitle` supports an optional `subtitle` prop rendered in
 * `text.secondary` color next to the title. Both `title` and `subtitle`
 * are optional and can be used independently or together.
 */
export const TitleSubtitle: Story = {
  name: 'Title & Subtitle',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>Title only</h3>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeader>
            <BiampHeaderTitle title="Workplace" />
          </BiampHeader>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Title with subtitle</h3>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeader>
            <BiampHeaderTitle title="Workplace" subtitle="Booking" />
          </BiampHeader>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Subtitle only</h3>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeader>
            <BiampHeaderTitle subtitle="Booking" />
          </BiampHeader>
        </div>
      </div>
    </div>
  ),
};

/**
 * A header with the title and search bar, but no actions or profile.
 */
export const WithSearch: Story = {
  name: 'With Search',
  render: () => (
    <BiampHeader>
      <BiampHeaderTitle title="Buildings" />
      <BiampHeaderSearch />
    </BiampHeader>
  ),
};

function WithActionsDemo() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const apps = [
    { image: BookingApp, name: 'Booking' },
    { image: DesignerApp, name: 'Designer' },
    { image: ConnectApp, name: 'Connect' },
    { image: CommandApp, name: 'Command' },
    { image: WorkplaceApp, name: 'Workplace' },
  ];

  return (
    <BiampHeader>
      <BiampHeaderTitle title="Overview" />
      <div style={{ flexGrow: 1 }} />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton
            icon={<AppsIcon />}
            selectedIcon={<AppsIconFilled />}
            selected={open}
            onClick={(e) =>
              setAnchorEl(open ? null : (e.currentTarget as HTMLElement))
            }
          />
          <BiampHeaderButton
            icon={iconLabel('Bell')}
            selectedIcon={iconLabel('Bell', true)}
          />
          <BiampHeaderButton
            icon={iconLabel('Set')}
            selectedIcon={iconLabel('Set', true)}
          />
        </BiampHeaderButtonList>
        <BiampHeaderProfile image="https://i.pravatar.cc/32?img=3" />
      </BiampHeaderActions>
      <BiampAppPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <BiampAppDialog>
          {apps.map((app, i) => (
            <BiampAppDialogItem key={i} name={app.name}>
              <img
                src={app.image}
                alt={app.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </BiampAppDialogItem>
          ))}
        </BiampAppDialog>
      </BiampAppPopover>
    </BiampHeader>
  );
}

/**
 * A header with the title and actions (buttons + profile), but no search bar.
 */
export const WithActions: Story = {
  name: 'With Actions',
  render: () => <WithActionsDemo />,
};

function WithSelectedButtonsDemo() {
  const [selectedA, setSelectedA] = useState<number>(0);
  const [selectedB, setSelectedB] = useState<number>(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>With selectedIcon</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          The icon changes from outlined to filled when selected.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeaderButtonList>
            <BiampHeaderButton
              selected={selectedA === 0}
              icon={iconLabel('Bell')}
              selectedIcon={iconLabel('Bell', true)}
              onClick={() => setSelectedA(0)}
            />
            <BiampHeaderButton
              selected={selectedA === 1}
              icon={iconLabel('Set')}
              selectedIcon={iconLabel('Set', true)}
              onClick={() => setSelectedA(1)}
            />
          </BiampHeaderButtonList>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Without selectedIcon</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          When no selectedIcon is provided, the same icon is used for both
          states.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeaderButtonList>
            <BiampHeaderButton
              selected={selectedB === 0}
              icon={iconLabel('Bell', true)}
              onClick={() => setSelectedB(0)}
            />
            <BiampHeaderButton
              selected={selectedB === 1}
              icon={iconLabel('Set', true)}
              onClick={() => setSelectedB(1)}
            />
          </BiampHeaderButtonList>
        </div>
      </div>
    </div>
  );
}

/**
 * When `selectedIcon` is provided, `BiampHeaderButton` swaps between
 * the `icon` (unselected) and `selectedIcon` (selected) automatically.
 * This is useful for showing filled vs outlined icon variants.
 */
export const WithSelectedButtons: Story = {
  name: 'With Selected Buttons',
  render: () => <WithSelectedButtonsDemo />,
};

/**
 * Individual `BiampHeaderButton` states shown side by side.
 * Each button extends `ListItemButton`, so it supports
 * `selected`, `disabled`, and `onClick` props.
 */
export const ButtonStates: Story = {
  name: 'Button States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h3>BiampHeaderButton States</h3>
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
          <BiampHeaderButton icon={iconLabel('Set')} />
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
          <BiampHeaderButton selected icon={iconLabel('Set')} />
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
          <BiampHeaderButton
            selected
            icon={iconLabel('Set')}
            selectedIcon={iconLabel('Set', true)}
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
          <BiampHeaderButton icon={iconLabel('Set')} disabled />
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
        BiampHeaderButton extends MUI&apos;s ListItemButtonProps, so you can
        pass any prop that ListItemButton accepts, such as <code>disabled</code>
        , <code>onClick</code>, <code>sx</code>, and more.
      </p>
    </div>
  ),
};

function WithButtonListDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items = [
    { icon: <AppsIcon />, selectedIcon: <AppsIconFilled /> },
    { icon: iconLabel('Bell'), selectedIcon: iconLabel('Bell', true) },
    { icon: iconLabel('Help'), selectedIcon: iconLabel('Help', true) },
    { icon: iconLabel('Set'), selectedIcon: iconLabel('Set', true) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>With BiampHeaderButtonList</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          Buttons are wrapped in <code>BiampHeaderButtonList</code> which adds
          standardised 4px gaps between each item.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeaderButtonList>
            {items.map((item, i) => (
              <BiampHeaderButton
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </BiampHeaderButtonList>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 16 }}>Without BiampHeaderButtonList</h3>
        <p style={{ marginBottom: 16, maxWidth: 300, fontSize: 14 }}>
          Without the list wrapper, buttons stack with no gap between them.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          {items.map((item, i) => (
            <BiampHeaderButton
              key={i}
              selected={selectedIndex === i}
              icon={item.icon}
              selectedIcon={item.selectedIcon}
              onClick={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * `BiampHeaderButtonList` provides a standardised horizontal layout for
 * `BiampHeaderButton` items with consistent 4px (0.5) gaps between each button.
 * Use it inside `BiampHeaderActions` to get properly-spaced button groups.
 */
export const WithButtonList: Story = {
  name: 'With Button List',
  render: () => <WithButtonListDemo />,
};

function SubComponentsDemo() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const apps = [
    { image: BookingApp, name: 'Booking' },
    { image: DesignerApp, name: 'Designer' },
    { image: ConnectApp, name: 'Connect' },
    { image: CommandApp, name: 'Command' },
    { image: WorkplaceApp, name: 'Workplace' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>BiampHeaderTitle</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          A box with <code>pr: 3</code> containing a 24x24 icon and H4 text with
          a 12px gap. Supports optional <code>title</code> and{' '}
          <code>subtitle</code> props.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeaderTitle title="Dashboard" />
        </div>
      </div>

      <hr
        style={{
          width: '100%',
          border: 'none',
          borderTop: '1px solid #e0e0e0',
        }}
      />

      <div>
        <h3 style={{ marginBottom: 16 }}>BiampHeaderSearch</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          A box with <code>px: 1.5</code> that wraps a search input.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
            width: 400,
          }}
        >
          <BiampHeaderSearch />
        </div>
      </div>

      <hr
        style={{
          width: '100%',
          border: 'none',
          borderTop: '1px solid #e0e0e0',
        }}
      />

      <div>
        <h3 style={{ marginBottom: 16 }}>BiampHeaderButtonList</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          A flex container with <code>gap: 0.5</code> for grouping action
          buttons. Click the Apps button to open the app dialog.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeaderButtonList>
            <BiampHeaderButton
              icon={<AppsIcon />}
              selectedIcon={<AppsIconFilled />}
              selected={open}
              onClick={(e) =>
                setAnchorEl(open ? null : (e.currentTarget as HTMLElement))
              }
            />
            <BiampHeaderButton
              icon={iconLabel('Bell')}
              selectedIcon={iconLabel('Bell', true)}
            />
            <BiampHeaderButton
              icon={iconLabel('Help')}
              selectedIcon={iconLabel('Help', true)}
            />
            <BiampHeaderButton
              icon={iconLabel('Set')}
              selectedIcon={iconLabel('Set', true)}
            />
          </BiampHeaderButtonList>
          <BiampAppPopover
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <BiampAppDialog>
              {apps.map((app, i) => (
                <BiampAppDialogItem key={i} name={app.name}>
                  <img
                    src={app.image}
                    alt={app.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </BiampAppDialogItem>
              ))}
            </BiampAppDialog>
          </BiampAppPopover>
        </div>
      </div>

      <hr
        style={{
          width: '100%',
          border: 'none',
          borderTop: '1px solid #e0e0e0',
        }}
      />

      <div>
        <h3 style={{ marginBottom: 16 }}>BiampHeaderProfile</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          A 36x36 profile button container holding a 32x32 image with a 4px
          border radius.
        </p>
        <div
          style={{
            border: '1px dashed #e0e0e0',
            display: 'inline-flex',
          }}
        >
          <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
        </div>
      </div>
    </div>
  );
}

/**
 * Demonstrates each sub-component individually so you can see
 * how they look and behave in isolation.
 */
export const SubComponents: Story = {
  name: 'Sub-Components',
  render: () => <SubComponentsDemo />,
};

function WithBorderDemo() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const apps = [
    { image: BookingApp, name: 'Booking' },
    { image: DesignerApp, name: 'Designer' },
    { image: ConnectApp, name: 'Connect' },
    { image: CommandApp, name: 'Command' },
    { image: WorkplaceApp, name: 'Workplace' },
  ];

  return (
    <BiampHeader sx={{ border: '1px solid', borderColor: 'divider' }}>
      <BiampHeaderTitle title="Dashboard" />
      <BiampHeaderSearch />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton
            icon={<AppsIcon />}
            selectedIcon={<AppsIconFilled />}
            selected={open}
            onClick={(e) =>
              setAnchorEl(open ? null : (e.currentTarget as HTMLElement))
            }
          />
          <BiampHeaderButton
            icon={iconLabel('Bell')}
            selectedIcon={iconLabel('Bell', true)}
          />
          <BiampHeaderButton
            icon={iconLabel('Help')}
            selectedIcon={iconLabel('Help', true)}
          />
          <BiampHeaderButton
            icon={iconLabel('Set')}
            selectedIcon={iconLabel('Set', true)}
          />
        </BiampHeaderButtonList>
        <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
      </BiampHeaderActions>
      <BiampAppPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <BiampAppDialog>
          {apps.map((app, i) => (
            <BiampAppDialogItem key={i} name={app.name}>
              <img
                src={app.image}
                alt={app.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </BiampAppDialogItem>
          ))}
        </BiampAppDialog>
      </BiampAppPopover>
    </BiampHeader>
  );
}

/**
 * The header rendered with a border to visualise its padding
 * (px: 2.5, py: 1.5) and internal spacing.
 */
export const WithBorder: Story = {
  name: 'With Border (Layout Debug)',
  render: () => <WithBorderDemo />,
};

function AppDialogToggleDemo() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const apps = [
    { image: BookingApp, name: 'Booking' },
    { image: DesignerApp, name: 'Designer' },
    { image: ConnectApp, name: 'Connect' },
    { image: CommandApp, name: 'Command' },
    { image: WorkplaceApp, name: 'Workplace' },
  ];

  return (
    <BiampHeader>
      <BiampHeaderTitle title="Dashboard" />
      <BiampHeaderSearch />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton
            icon={<AppsIcon />}
            selectedIcon={<AppsIconFilled />}
            selected={open}
            onClick={(e) =>
              setAnchorEl(open ? null : (e.currentTarget as HTMLElement))
            }
          />
          <BiampHeaderButton
            icon={iconLabel('Set')}
            selectedIcon={iconLabel('Set', true)}
          />
        </BiampHeaderButtonList>
        <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
      </BiampHeaderActions>
      <BiampAppPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <BiampAppDialog>
          {apps.map((app, i) => (
            <BiampAppDialogItem key={i} name={app.name}>
              <img
                src={app.image}
                alt={app.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </BiampAppDialogItem>
          ))}
        </BiampAppDialog>
      </BiampAppPopover>
    </BiampHeader>
  );
}

/**
 * Clicking the Apps button in the header opens a BiampAppDialog
 * as a popover anchored below the button.
 */
export const AppDialogToggle: Story = {
  name: 'App Dialog (Toggle)',
  render: () => <AppDialogToggleDemo />,
};

/**
 * A BiampAppDialog with only 2 items, showing how the layout
 * behaves with fewer than a full row.
 */
export const AppDialogFewItems: Story = {
  name: 'App Dialog (Few Items)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h3 style={{ marginBottom: 16 }}>BiampAppDialog — Few Items</h3>
        <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
          The dialog with only 2 items. Items maintain their fixed width and
          align to the start of the row.
        </p>
        <BiampAppDialog>
          <BiampAppDialogItem name="Booking">
            <img
              src={BookingApp}
              alt="Booking"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </BiampAppDialogItem>
          <BiampAppDialogItem name="Designer">
            <img
              src={DesignerApp}
              alt="Designer"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </BiampAppDialogItem>
        </BiampAppDialog>
      </div>
    </div>
  ),
};

/**
 * A grid of BiampAppDialogItems inside BiampAppDialog, simulating
 * an app-launcher popover with 9 sample applications.
 */
export const AppDialog: Story = {
  name: 'App Dialog',
  render: () => {
    const apps = [
      { image: BookingApp, name: 'Booking' },
      { image: DesignerApp, name: 'Designer' },
      { image: ConnectApp, name: 'Connect' },
      { image: CommandApp, name: 'Command' },
      { image: WorkplaceApp, name: 'Workplace' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h3 style={{ marginBottom: 16 }}>BiampAppDialog</h3>
          <p style={{ marginBottom: 16, maxWidth: 500, fontSize: 14 }}>
            A 3-column grid of <code>BiampAppDialogItem</code> tiles inside a
            rounded, shadowed container. Each item renders a 76x89px tile.
          </p>
          <BiampAppDialog>
            {apps.map((app, i) => (
              <BiampAppDialogItem key={i} name={app.name}>
                <img
                  src={app.image}
                  alt={app.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </BiampAppDialogItem>
            ))}
          </BiampAppDialog>
        </div>
      </div>
    );
  },
};
