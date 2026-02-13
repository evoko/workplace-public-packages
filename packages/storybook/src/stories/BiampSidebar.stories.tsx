import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Typography, Divider } from '@mui/material';
import {
  BiampSidebar,
  BiampSidebarIcon,
  BiampSidebarIconList,
  BiampSidebarComponent,
} from '@bwp-web/components';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PeopleIcon from '@mui/icons-material/People';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';

const meta: Meta<typeof BiampSidebar> = {
  title: 'Components/BiampSidebar',
  component: BiampSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BiampSidebar>;

/**
 * The default sidebar with selectable navigation icons.
 * Click any icon to select it. The Biamp logo is automatically rendered at the bottom.
 */
export const Default: Story = {
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const items = [
      { icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
      { icon: <DashboardOutlinedIcon />, selectedIcon: <DashboardIcon /> },
      { icon: <PeopleOutlinedIcon />, selectedIcon: <PeopleIcon /> },
      { icon: <SettingsOutlinedIcon />, selectedIcon: <SettingsIcon /> },
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
  },
};

/**
 * Pass a custom `logo` prop to replace the default Biamp logo at the
 * bottom of the sidebar. When omitted, the Biamp logo is rendered automatically.
 */
export const CustomLogo: Story = {
  name: 'Custom Logo',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const items = [
      { icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
      { icon: <DashboardOutlinedIcon />, selectedIcon: <DashboardIcon /> },
      { icon: <SettingsOutlinedIcon />, selectedIcon: <SettingsIcon /> },
    ];

    return (
      <Stack direction="row" spacing={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Default logo
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            The Biamp logo is rendered at the bottom when no{' '}
            <code>bottomLogoIcon</code> prop is provided.
          </Typography>
          <Box sx={{ height: 400 }}>
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
          </Box>
        </Box>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Custom logo
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            Any JSX element can be passed as the{' '}
            <code>bottomLogoIcon</code> prop to replace the default Biamp logo.
          </Typography>
          <Box sx={{ height: 400 }}>
            <BiampSidebar
              bottomLogoIcon={
                <ApartmentIcon
                  sx={{ width: '48px', height: '24px', alignSelf: 'center' }}
                />
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
          </Box>
        </Box>
      </Stack>
    );
  },
};

/**
 * When `selectedIcon` is provided, the sidebar icon swaps between
 * the `icon` (unselected) and `selectedIcon` (selected) automatically.
 * This is useful for showing filled vs outlined icon variants.
 */
export const WithSelectedIcons: Story = {
  name: 'With Selected Icons',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    return (
      <Stack direction="row" spacing={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            With selectedIcon
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            The icon changes from outlined to filled when selected.
          </Typography>
          <Box sx={{ height: 400 }}>
            <BiampSidebar>
              <BiampSidebarIcon
                selected={selectedIndex === 0}
                icon={<HomeOutlinedIcon />}
                selectedIcon={<HomeIcon />}
                onClick={() => setSelectedIndex(0)}
              />
              <BiampSidebarIcon
                selected={selectedIndex === 1}
                icon={<SettingsOutlinedIcon />}
                selectedIcon={<SettingsIcon />}
                onClick={() => setSelectedIndex(1)}
              />
            </BiampSidebar>
          </Box>
        </Box>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Without selectedIcon
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            When no selectedIcon is provided, the same icon is used for both
            states.
          </Typography>
          <Box sx={{ height: 400 }}>
            <BiampSidebar>
              <BiampSidebarIcon
                selected={selectedIndex === 0}
                icon={<HomeIcon />}
                onClick={() => setSelectedIndex(0)}
              />
              <BiampSidebarIcon
                selected={selectedIndex === 1}
                icon={<SettingsIcon />}
                onClick={() => setSelectedIndex(1)}
              />
            </BiampSidebar>
          </Box>
        </Box>
      </Stack>
    );
  },
};

/**
 * Individual `BiampSidebarIcon` states shown side by side.
 * Each icon is a `ListItemButton` under the hood, so it supports
 * `selected`, `disabled`, and `onClick` props.
 */
export const IconStates: Story = {
  name: 'Icon States',
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">BiampSidebarIcon States</Typography>
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon icon={<HomeOutlinedIcon />} />
          <Typography variant="caption">Default</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon selected icon={<HomeOutlinedIcon />} />
          <Typography variant="caption">Selected</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon
            selected
            icon={<HomeOutlinedIcon />}
            selectedIcon={<HomeIcon />}
          />
          <Typography variant="caption">Selected (with selectedIcon)</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon icon={<HomeOutlinedIcon />} disabled />
          <Typography variant="caption">Disabled</Typography>
        </Stack>
      </Stack>
      <Divider />
      <Typography variant="h3">Extends ListItemButton</Typography>
      <Typography variant="body2" sx={{ maxWidth: 500 }}>
        BiampSidebarIcon extends MUI's ListItemButtonProps, so you can pass
        any prop that ListItemButton accepts, such as <code>disabled</code>,{' '}
        <code>onClick</code>, <code>sx</code>, and more.
      </Typography>
    </Stack>
  ),
};

/**
 * `BiampSidebarIconList` provides a standardised vertical list layout for
 * `BiampSidebarIcon` items with consistent 4px gaps between each icon.
 * Use it inside `BiampSidebar` to get properly-spaced icon groups.
 */
export const WithIconList: Story = {
  name: 'With Icon List',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const items = [
      { icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
      { icon: <DashboardOutlinedIcon />, selectedIcon: <DashboardIcon /> },
      { icon: <PeopleOutlinedIcon />, selectedIcon: <PeopleIcon /> },
      { icon: <SettingsOutlinedIcon />, selectedIcon: <SettingsIcon /> },
    ];

    return (
      <Stack direction="row" spacing={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            With BiampSidebarIconList
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            Icons are wrapped in <code>BiampSidebarIconList</code> which adds
            standardised 4px gaps between each item.
          </Typography>
          <Box sx={{ height: 400 }}>
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
          </Box>
        </Box>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Without BiampSidebarIconList
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            Without the list wrapper, icons stack with no gap between them.
          </Typography>
          <Box sx={{ height: 400 }}>
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
          </Box>
        </Box>
      </Stack>
    );
  },
};

/**
 * `BiampSidebarComponent` renders a 48×48px rounded box that matches the
 * dimensions and shape of `BiampSidebarIcon`. Use it to place arbitrary
 * content (avatars, status indicators, custom widgets, etc.) in the sidebar
 * alongside icon buttons while maintaining a consistent visual rhythm.
 */
export const WithSidebarComponent: Story = {
  name: 'With Sidebar Component',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const items = [
      { icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
      { icon: <DashboardOutlinedIcon />, selectedIcon: <DashboardIcon /> },
      { icon: <SettingsOutlinedIcon />, selectedIcon: <SettingsIcon /> },
    ];

    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            BiampSidebarComponent
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
            Use <code>BiampSidebarComponent</code> to embed arbitrary content
            in the sidebar. It provides the same 48×48px rounded-box
            dimensions as <code>BiampSidebarIcon</code>, but renders a plain{' '}
            <code>Box</code> instead of a button.
          </Typography>
        </Box>
        <Box sx={{ height: 500 }}>
          <BiampSidebar>
            <BiampSidebarIconList>
              <BiampSidebarComponent
                sx={{
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
                sx={{
                  bgcolor: 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  42
                </Typography>
              </BiampSidebarComponent>
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Stack>
    );
  },
};
