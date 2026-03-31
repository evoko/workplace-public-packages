import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BiampLayout,
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  BiampHeaderActions,
  BiampHeaderButtonList,
  BiampHeaderButton,
  BiampHeaderProfile,
  BiampSidebar,
  BiampSidebarIcon,
  BiampWrapper,
  BiampSidebarIconList,
  BiampSidebarComponent,
  BiampAppDialog,
  BiampAppDialogItem,
  BiampAppPopover,
} from '@bwp-web/components';
import {
  AppsIcon,
  AppsIconFilled,
  BookingApp,
  CommandApp,
  ConnectApp,
  DesignerApp,
  WorkplaceApp,
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

const meta: Meta<typeof BiampLayout> = {
  title: 'Components/BiampLayout',
  component: BiampLayout,
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
  },
};

export default meta;
type Story = StoryObj<typeof BiampLayout>;

function WithHeaderSidebarAndWrapperDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const sidebarItems = [
    { icon: iconLabel('Home'), selectedIcon: iconLabel('Home', true) },
    { icon: iconLabel('Dash'), selectedIcon: iconLabel('Dash', true) },
    { icon: iconLabel('Ppl'), selectedIcon: iconLabel('Ppl', true) },
    { icon: iconLabel('Set'), selectedIcon: iconLabel('Set', true) },
  ];

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
    <BiampLayout
      header={
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
        </BiampHeader>
      }
      sidebar={
        <BiampSidebar>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <BiampSidebarComponent
              style={{
                marginTop: 8,
                marginBottom: 8,
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
            <BiampSidebarIconList>
              {sidebarItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </div>
        </BiampSidebar>
      }
    >
      <BiampWrapper>
        <h4 style={{ margin: '0 0 8px' }}>Page Content</h4>
        <p style={{ margin: 0 }}>
          This layout includes a header, sidebar, and wrapper — the full
          opinionated Biamp page layout.
        </p>
      </BiampWrapper>
    </BiampLayout>
  );
}

/**
 * A full layout with a header, sidebar, and wrapper.
 * This is the most common configuration for a standard Biamp application page.
 */
export const WithHeaderSidebarAndWrapper: Story = {
  name: 'Header + Sidebar + Wrapper',
  render: () => <WithHeaderSidebarAndWrapperDemo />,
};

function WithHeaderAndWrapperDemo() {
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
    <BiampLayout
      header={
        <BiampHeader>
          <BiampHeaderTitle title="Settings" />
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
        </BiampHeader>
      }
    >
      <BiampWrapper>
        <h4 style={{ margin: '0 0 8px' }}>Page Content</h4>
        <p style={{ margin: 0 }}>
          This layout includes a header and wrapper, but no sidebar.
        </p>
      </BiampWrapper>
    </BiampLayout>
  );
}

/**
 * A layout with a header and wrapper, but no sidebar.
 * Useful for pages that don't require navigation.
 */
export const WithHeaderAndWrapper: Story = {
  name: 'Header + Wrapper',
  render: () => <WithHeaderAndWrapperDemo />,
};

/**
 * A layout with only the wrapper.
 * The simplest configuration, providing just the content area.
 */
export const WrapperOnly: Story = {
  name: 'Wrapper Only',
  render: () => (
    <BiampLayout>
      <BiampWrapper>
        <h4 style={{ margin: '0 0 8px' }}>Page Content</h4>
        <p style={{ margin: 0 }}>
          This layout uses only the wrapper with no header or sidebar.
        </p>
      </BiampWrapper>
    </BiampLayout>
  ),
};
