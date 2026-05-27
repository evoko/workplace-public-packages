import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography } from '@mui/material';
import {
  BiampLayout,
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  BiampHeaderActions,
  BiampHeaderButtonList,
  BiampHeaderButton,
  BiampHeaderMenuButton,
  BiampHeaderProfile,
  BiampSidebar,
  BiampSidebarIcon,
  BiampWrapper,
  BiampSidebarIconList,
  BiampSidebarComponent,
  BiampAppPopover,
  OrganizationItem,
  OrganizationItemList,
  OrganizationSelectorButton,
  OrganizationSelectorPopover,
} from '@bwp-web/components';
import { AppPopoverContent } from '../BiampHeader/BiampHeader.storyhelpers';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/People';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppsIcon, AppsIconFilled, BuildingIcon } from '@bwp-web/assets';

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
    { name: 'Home', icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
    {
      name: 'Dashboard',
      icon: <DashboardOutlinedIcon />,
      selectedIcon: <DashboardIcon />,
    },
    {
      name: 'People',
      icon: <PeopleOutlinedIcon />,
      selectedIcon: <PeopleIcon />,
    },
    {
      name: 'Settings',
      icon: <SettingsOutlinedIcon />,
      selectedIcon: <SettingsIcon />,
    },
  ];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

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
                icon={<SettingsOutlinedIcon />}
                selectedIcon={<SettingsIcon />}
              />
            </BiampHeaderButtonList>
            <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
          </BiampHeaderActions>
          <BiampAppPopover
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            <AppPopoverContent />
          </BiampAppPopover>
        </BiampHeader>
      }
      sidebar={
        <BiampSidebar>
          <Stack direction="column" gap={1}>
            <BiampSidebarComponent
              sx={{
                my: '8px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
              >
                AV
              </Typography>
            </BiampSidebarComponent>
            <BiampSidebarIconList>
              {sidebarItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </Stack>
        </BiampSidebar>
      }
    >
      <BiampWrapper>
        <Typography variant="h4" gutterBottom>
          Page Content
        </Typography>
        <Typography variant="body1">
          This layout includes a header, sidebar, and wrapper — the full
          opinionated Biamp page layout.
        </Typography>
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
                icon={<SettingsOutlinedIcon />}
                selectedIcon={<SettingsIcon />}
              />
            </BiampHeaderButtonList>
            <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
          </BiampHeaderActions>
          <BiampAppPopover
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            <AppPopoverContent />
          </BiampAppPopover>
        </BiampHeader>
      }
    >
      <BiampWrapper>
        <Typography variant="h4" gutterBottom>
          Page Content
        </Typography>
        <Typography variant="body1">
          This layout includes a header and wrapper, but no sidebar.
        </Typography>
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

const responsiveOrgs = [
  {
    id: 'acme-001',
    name: 'Acme Corporation',
    logo: 'https://picsum.photos/seed/acme/80',
    region: 'EU',
  },
  {
    id: 'globex-002',
    name: 'Globex Industries',
    logo: 'https://picsum.photos/seed/globex/80',
  },
  {
    id: 'initech-003',
    name: 'Initech Systems',
    logo: 'https://picsum.photos/seed/initech/80',
    region: 'EU',
  },
  {
    id: 'umbrella-004',
    name: 'Umbrella Co',
    logo: 'https://picsum.photos/seed/umbrella/80',
  },
  {
    id: 'soylent-005',
    name: 'Soylent Group',
    logo: 'https://picsum.photos/seed/soylent/80',
    region: 'EU',
  },
  {
    id: 'wayne-006',
    name: 'Wayne Enterprises',
    logo: 'https://picsum.photos/seed/wayne/80',
  },
  {
    id: 'stark-007',
    name: 'Stark Industries',
    logo: 'https://picsum.photos/seed/stark/80',
  },
  {
    id: 'oscorp-008',
    name: 'Oscorp Industries',
    logo: 'https://picsum.photos/seed/oscorp/80',
    region: 'EU',
  },
  {
    id: 'tyrell-009',
    name: 'Tyrell Corporation',
    logo: 'https://picsum.photos/seed/tyrell/80',
  },
  {
    id: 'cyberdyne-010',
    name: 'Cyberdyne Systems',
    logo: 'https://picsum.photos/seed/cyberdyne/80',
    region: 'EU',
  },
];

function ResponsiveDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [appsAnchorEl, setAppsAnchorEl] = useState<HTMLElement | null>(null);
  const appsOpen = Boolean(appsAnchorEl);
  const [orgsAnchorEl, setOrgsAnchorEl] = useState<HTMLElement | null>(null);
  const orgsOpen = Boolean(orgsAnchorEl);
  const [currentOrgId, setCurrentOrgId] = useState('acme-001');
  const currentOrg = responsiveOrgs.find((o) => o.id === currentOrgId);

  const handleAppsClick = (e: React.MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(appsOpen ? null : (e.currentTarget as HTMLElement));
  };

  const handleOrgsClick = (e: React.MouseEvent<HTMLElement>) => {
    setOrgsAnchorEl(orgsOpen ? null : (e.currentTarget as HTMLElement));
  };

  const orgListContent = (
    <OrganizationItemList>
      {responsiveOrgs.map((org) => (
        <OrganizationItem
          key={org.id}
          primaryText={org.name}
          secondaryText={`ID: ${org.id}`}
          logo={org.logo}
          meta={org.region === 'EU' ? 'EU region' : undefined}
          isCurrent={org.id === currentOrgId}
          onClick={() => {
            setCurrentOrgId(org.id);
            setOrgsAnchorEl(null);
          }}
        />
      ))}
    </OrganizationItemList>
  );

  const sidebarItems = [
    { name: 'Home', icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
    {
      name: 'Dashboard',
      icon: <DashboardOutlinedIcon />,
      selectedIcon: <DashboardIcon />,
    },
    {
      name: 'People',
      icon: <PeopleOutlinedIcon />,
      selectedIcon: <PeopleIcon />,
    },
    {
      name: 'Settings',
      icon: <SettingsOutlinedIcon />,
      selectedIcon: <SettingsIcon />,
    },
  ];

  return (
    <BiampLayout
      responsive
      drawerHeader={<BiampHeaderTitle title="Responsive" />}
      header={
        <BiampHeader>
          <BiampHeaderMenuButton />
          <BiampHeaderTitle title="Responsive" />
          <BiampHeaderSearch sx={{ display: { xs: 'none', md: 'flex' } }} />
          <BiampHeaderActions>
            <OrganizationSelectorButton
              icon={
                currentOrg?.logo ? (
                  <Box
                    component="img"
                    src={currentOrg.logo}
                    sx={{ width: 24, height: 24, borderRadius: 0.5 }}
                  />
                ) : (
                  <BuildingIcon />
                )
              }
              name={currentOrg?.name ?? ''}
              open={orgsOpen}
              onClick={handleOrgsClick}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            />
            <BiampHeaderButtonList sx={{ display: { xs: 'none', md: 'flex' } }}>
              <BiampHeaderButton
                icon={<AppsIcon />}
                selectedIcon={<AppsIconFilled />}
                selected={appsOpen}
                onClick={handleAppsClick}
              />
            </BiampHeaderButtonList>
            <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
          </BiampHeaderActions>
          <BiampAppPopover
            open={appsOpen}
            anchorEl={appsAnchorEl}
            onClose={() => setAppsAnchorEl(null)}
          >
            <AppPopoverContent />
          </BiampAppPopover>
          <OrganizationSelectorPopover
            open={orgsOpen}
            anchorEl={orgsAnchorEl}
            onClose={() => setOrgsAnchorEl(null)}
          >
            {orgListContent}
          </OrganizationSelectorPopover>
        </BiampHeader>
      }
      sidebar={
        <BiampSidebar>
          <Stack gap={{ xs: 2, md: 0 }}>
            <BiampHeaderSearch
              sx={{
                display: { xs: 'flex', md: 'none' },
                px: 0,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: ({ palette }) =>
                    palette.mode === 'dark'
                      ? palette.grey[800]
                      : palette.grey[100],
                },
              }}
            />
            <BiampSidebarIconList>
              <BiampSidebarIcon
                icon={<BuildingIcon />}
                name="Organizations"
                selected={orgsOpen}
                closeDrawerOnClick={false}
                onClick={handleOrgsClick}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              />
              <BiampSidebarIcon
                icon={<AppsIcon />}
                selectedIcon={<AppsIconFilled />}
                name="Apps"
                selected={appsOpen}
                closeDrawerOnClick={false}
                onClick={handleAppsClick}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              />
              {sidebarItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </Stack>
        </BiampSidebar>
      }
    >
      <BiampWrapper>
        <Typography variant="h4" gutterBottom>
          Responsive layout
        </Typography>
        <Typography variant="body1" paragraph>
          Resize the viewport below the <code>md</code> breakpoint (900px) to
          see the sidebar collapse into a drawer. A menu toggle appears in the
          header and the drawer auto-closes when you pick an item.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tip: in the Storybook toolbar, switch the viewport to a mobile preset
          (or just narrow the browser window) to trigger drawer mode.
        </Typography>
      </BiampWrapper>
    </BiampLayout>
  );
}

/**
 * Responsive layout: above the `md` breakpoint the sidebar renders inline as
 * usual; below it, the sidebar collapses into a left-anchored drawer with a
 * 50px right gap, toggled by `BiampHeaderMenuButton` in the header.
 * Selecting a sidebar item auto-closes the drawer.
 */
export const Responsive: Story = {
  name: 'Responsive (Header + Sidebar)',
  render: () => <ResponsiveDemo />,
};

function HeaderOnlyResponsiveDemo() {
  const [appsAnchorEl, setAppsAnchorEl] = useState<HTMLElement | null>(null);
  const appsOpen = Boolean(appsAnchorEl);
  const [orgsAnchorEl, setOrgsAnchorEl] = useState<HTMLElement | null>(null);
  const orgsOpen = Boolean(orgsAnchorEl);
  const [currentOrgId, setCurrentOrgId] = useState('acme-001');
  const currentOrg = responsiveOrgs.find((o) => o.id === currentOrgId);

  const handleAppsClick = (e: React.MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(appsOpen ? null : (e.currentTarget as HTMLElement));
  };
  const handleOrgsClick = (e: React.MouseEvent<HTMLElement>) => {
    setOrgsAnchorEl(orgsOpen ? null : (e.currentTarget as HTMLElement));
  };

  const orgListContent = (
    <OrganizationItemList>
      {responsiveOrgs.map((org) => (
        <OrganizationItem
          key={org.id}
          primaryText={org.name}
          secondaryText={`ID: ${org.id}`}
          logo={org.logo}
          meta={org.region === 'EU' ? 'EU region' : undefined}
          isCurrent={org.id === currentOrgId}
          onClick={() => {
            setCurrentOrgId(org.id);
            setOrgsAnchorEl(null);
          }}
        />
      ))}
    </OrganizationItemList>
  );

  return (
    <BiampLayout
      responsive
      mobileSidebarOnly
      drawerHeader={<BiampHeaderTitle title="Header-only app" />}
      header={
        <BiampHeader>
          <BiampHeaderMenuButton />
          <BiampHeaderTitle title="Header-only app" />
          <BiampHeaderSearch sx={{ display: { xs: 'none', md: 'flex' } }} />
          <BiampHeaderActions>
            <OrganizationSelectorButton
              icon={
                currentOrg?.logo ? (
                  <Box
                    component="img"
                    src={currentOrg.logo}
                    sx={{ width: 24, height: 24, borderRadius: 0.5 }}
                  />
                ) : (
                  <BuildingIcon />
                )
              }
              name={currentOrg?.name ?? ''}
              open={orgsOpen}
              onClick={handleOrgsClick}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            />
            <BiampHeaderButtonList sx={{ display: { xs: 'none', md: 'flex' } }}>
              <BiampHeaderButton
                icon={<AppsIcon />}
                selectedIcon={<AppsIconFilled />}
                selected={appsOpen}
                onClick={handleAppsClick}
              />
            </BiampHeaderButtonList>
            <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
          </BiampHeaderActions>
          <BiampAppPopover
            open={appsOpen}
            anchorEl={appsAnchorEl}
            onClose={() => setAppsAnchorEl(null)}
          >
            <AppPopoverContent />
          </BiampAppPopover>
          <OrganizationSelectorPopover
            open={orgsOpen}
            anchorEl={orgsAnchorEl}
            onClose={() => setOrgsAnchorEl(null)}
          >
            {orgListContent}
          </OrganizationSelectorPopover>
        </BiampHeader>
      }
      sidebar={
        <BiampSidebar expandable={false}>
          <Stack gap={2}>
            <BiampHeaderSearch
              sx={{
                px: 0,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: ({ palette }) =>
                    palette.mode === 'dark'
                      ? palette.grey[800]
                      : palette.grey[100],
                },
              }}
            />
            <BiampSidebarIconList>
              <BiampSidebarIcon
                icon={<BuildingIcon />}
                name="Organizations"
                selected={orgsOpen}
                closeDrawerOnClick={false}
                onClick={handleOrgsClick}
              />
              <BiampSidebarIcon
                icon={<AppsIcon />}
                selectedIcon={<AppsIconFilled />}
                name="Apps"
                selected={appsOpen}
                closeDrawerOnClick={false}
                onClick={handleAppsClick}
              />
            </BiampSidebarIconList>
          </Stack>
        </BiampSidebar>
      }
    >
      <BiampWrapper>
        <Typography variant="h4" gutterBottom>
          Header-only on desktop
        </Typography>
        <Typography variant="body1" paragraph>
          Above the <code>md</code> breakpoint there is no sidebar — search,
          organizations, and apps all live in the header. Below the breakpoint,
          the menu button reveals a drawer containing the same controls.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set with <code>responsive</code> + <code>mobileSidebarOnly</code> on{' '}
          <code>BiampLayout</code>. The sidebar is never rendered inline.
        </Typography>
      </BiampWrapper>
    </BiampLayout>
  );
}

/**
 * Header-only desktop layout that moves search, organizations, and apps into
 * a mobile drawer below the breakpoint. Enabled with `responsive` +
 * `mobileSidebarOnly` on `BiampLayout` — the sidebar prop is treated as drawer
 * content only and is never shown inline.
 */
export const HeaderOnlyResponsive: Story = {
  name: 'Responsive (Header only, mobile drawer)',
  render: () => <HeaderOnlyResponsiveDemo />,
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
        <Typography variant="h4" gutterBottom>
          Page Content
        </Typography>
        <Typography variant="body1">
          This layout uses only the wrapper with no header or sidebar.
        </Typography>
      </BiampWrapper>
    </BiampLayout>
  ),
};
