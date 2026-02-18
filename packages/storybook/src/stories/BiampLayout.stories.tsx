import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Typography } from '@mui/material';
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
} from '@bwp-web/components';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/People';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

const meta: Meta<typeof BiampLayout> = {
  title: 'Components/BiampLayout',
  component: BiampLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
  },
};

export default meta;
type Story = StoryObj<typeof BiampLayout>;

/**
 * A full layout with a header, sidebar, and wrapper.
 * This is the most common configuration for a standard Biamp application page.
 */
export const WithHeaderSidebarAndWrapper: Story = {
  name: 'Header + Sidebar + Wrapper',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const sidebarItems = [
      { icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
      { icon: <DashboardOutlinedIcon />, selectedIcon: <DashboardIcon /> },
      { icon: <PeopleOutlinedIcon />, selectedIcon: <PeopleIcon /> },
      { icon: <SettingsOutlinedIcon />, selectedIcon: <SettingsIcon /> },
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
                  icon={<SettingsOutlinedIcon />}
                  selectedIcon={<SettingsIcon />}
                />
              </BiampHeaderButtonList>
              <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
            </BiampHeaderActions>
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
  },
};

/**
 * A layout with a header and wrapper, but no sidebar.
 * Useful for pages that don't require navigation.
 */
export const WithHeaderAndWrapper: Story = {
  name: 'Header + Wrapper',
  render: () => (
    <BiampLayout
      header={
        <BiampHeader>
          <BiampHeaderTitle title="Settings" />
          <BiampHeaderSearch />
          <BiampHeaderActions>
            <BiampHeaderButtonList>
              <BiampHeaderButton
                icon={<SettingsOutlinedIcon />}
                selectedIcon={<SettingsIcon />}
              />
            </BiampHeaderButtonList>
            <BiampHeaderProfile image="https://i.pravatar.cc/32?img=2" />
          </BiampHeaderActions>
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
  ),
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
