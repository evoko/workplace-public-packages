import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Stack,
  Typography,
  Divider,
  Popover,
} from '@mui/material';
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
  AppsIcon,
  AppsIconFilled,
  BiampAppPopover,
} from '@bwp-web/components';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpIcon from '@mui/icons-material/Help';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import DevicesIcon from '@mui/icons-material/Devices';

const meta: Meta<typeof BiampHeader> = {
  title: 'Components/BiampHeader',
  component: BiampHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BiampHeader>;

/**
 * The default BiampHeader with all sub-components: title with icon,
 * search bar, action buttons, and a profile section.
 */
export const Default: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const apps = [
      { icon: <DashboardIcon />, name: 'Dashboard' },
      { icon: <CalendarMonthIcon />, name: 'Calendar' },
      { icon: <BarChartIcon />, name: 'Analytics' },
      { icon: <ChatBubbleOutlineIcon />, name: 'Messages' },
      { icon: <FolderOpenIcon />, name: 'Files' },
      { icon: <SettingsOutlinedIcon />, name: 'Settings' },
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
              icon={<SettingsOutlinedIcon />}
              selectedIcon={<SettingsIcon />}
            />
          </BiampHeaderButtonList>
          <BiampHeaderProfile
            image="https://i.pravatar.cc/32?img=1"
          />
        </BiampHeaderActions>
        <BiampAppPopover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <BiampAppDialog>
            {apps.map((app, i) => (
              <BiampAppDialogItem
                key={i}
                icon={app.icon}
                name={app.name}
              />
            ))}
          </BiampAppDialog>
        </BiampAppPopover>
      </BiampHeader>
    );
  },
};

/**
 * When no `icon` prop is provided, `BiampHeaderTitle` renders the
 * default Biamp red logo. Pass a custom icon to override it.
 */
export const TitleIcon: Story = {
  name: 'Title Icon (Default vs Custom)',
  render: () => (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Default icon (Biamp red logo)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
          When no <code>icon</code> prop is provided, the Biamp red logo is
          rendered automatically.
        </Typography>
        <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
          <BiampHeader>
            <BiampHeaderTitle title="Dashboard" />
          </BiampHeader>
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Custom icon
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
          Pass any JSX element as the <code>icon</code> prop to replace the
          default logo.
        </Typography>
        <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
          <BiampHeader>
            <BiampHeaderTitle
              icon={<HomeOutlinedIcon sx={{ width: 24, height: 24 }} />}
              title="Home"
            />
          </BiampHeader>
        </Box>
      </Box>
    </Stack>
  ),
};

/**
 * A header with the title and search bar, but no actions or profile.
 */
export const WithSearch: Story = {
  name: 'With Search',
  render: () => (
    <BiampHeader>
      <BiampHeaderTitle
        title="Buildings"
      />
      <BiampHeaderSearch />
    </BiampHeader>
  ),
};

/**
 * A header with the title and actions (buttons + profile), but no search bar.
 */
export const WithActions: Story = {
  name: 'With Actions',
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const apps = [
      { icon: <DashboardIcon />, name: 'Dashboard' },
      { icon: <CalendarMonthIcon />, name: 'Calendar' },
      { icon: <BarChartIcon />, name: 'Analytics' },
      { icon: <ChatBubbleOutlineIcon />, name: 'Messages' },
      { icon: <FolderOpenIcon />, name: 'Files' },
      { icon: <SettingsOutlinedIcon />, name: 'Settings' },
    ];

    return (
      <BiampHeader>
        <BiampHeaderTitle title="Overview" />
        <Box sx={{ flexGrow: 1 }} />
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
              icon={<NotificationsNoneIcon />}
              selectedIcon={<NotificationsIcon />}
            />
            <BiampHeaderButton
              icon={<SettingsOutlinedIcon />}
              selectedIcon={<SettingsIcon />}
            />
          </BiampHeaderButtonList>
          <BiampHeaderProfile
            image="https://i.pravatar.cc/32?img=3"
          />
        </BiampHeaderActions>
        <BiampAppPopover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <BiampAppDialog>
            {apps.map((app, i) => (
              <BiampAppDialogItem
                key={i}
                icon={app.icon}
                name={app.name}
              />
            ))}
          </BiampAppDialog>
        </BiampAppPopover>
      </BiampHeader>
    );
  },
};

/**
 * When `selectedIcon` is provided, `BiampHeaderButton` swaps between
 * the `icon` (unselected) and `selectedIcon` (selected) automatically.
 * This is useful for showing filled vs outlined icon variants.
 */
export const WithSelectedButtons: Story = {
  name: 'With Selected Buttons',
  render: () => {
    const [selectedA, setSelectedA] = useState<number>(0);
    const [selectedB, setSelectedB] = useState<number>(0);

    return (
      <Stack direction="row" spacing={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            With selectedIcon
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            The icon changes from outlined to filled when selected.
          </Typography>
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
            <BiampHeaderButtonList>
              <BiampHeaderButton
                selected={selectedA === 0}
                icon={<NotificationsNoneIcon />}
                selectedIcon={<NotificationsIcon />}
                onClick={() => setSelectedA(0)}
              />
              <BiampHeaderButton
                selected={selectedA === 1}
                icon={<SettingsOutlinedIcon />}
                selectedIcon={<SettingsIcon />}
                onClick={() => setSelectedA(1)}
              />
            </BiampHeaderButtonList>
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
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
            <BiampHeaderButtonList>
              <BiampHeaderButton
                selected={selectedB === 0}
                icon={<NotificationsIcon />}
                onClick={() => setSelectedB(0)}
              />
              <BiampHeaderButton
                selected={selectedB === 1}
                icon={<SettingsIcon />}
                onClick={() => setSelectedB(1)}
              />
            </BiampHeaderButtonList>
          </Box>
        </Box>
      </Stack>
    );
  },
};

/**
 * Individual `BiampHeaderButton` states shown side by side.
 * Each button extends `ListItemButton`, so it supports
 * `selected`, `disabled`, and `onClick` props.
 */
export const ButtonStates: Story = {
  name: 'Button States',
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">BiampHeaderButton States</Typography>
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Stack alignItems="center" spacing={1}>
          <BiampHeaderButton icon={<SettingsOutlinedIcon />} />
          <Typography variant="caption">Default</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampHeaderButton selected icon={<SettingsOutlinedIcon />} />
          <Typography variant="caption">Selected</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampHeaderButton
            selected
            icon={<SettingsOutlinedIcon />}
            selectedIcon={<SettingsIcon />}
          />
          <Typography variant="caption">Selected (with selectedIcon)</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampHeaderButton icon={<SettingsOutlinedIcon />} disabled />
          <Typography variant="caption">Disabled</Typography>
        </Stack>
      </Stack>
      <Divider />
      <Typography variant="h3">Extends ListItemButton</Typography>
      <Typography variant="body2" sx={{ maxWidth: 500 }}>
        BiampHeaderButton extends MUI's ListItemButtonProps, so you can pass
        any prop that ListItemButton accepts, such as <code>disabled</code>,{' '}
        <code>onClick</code>, <code>sx</code>, and more.
      </Typography>
    </Stack>
  ),
};

/**
 * `BiampHeaderButtonList` provides a standardised horizontal layout for
 * `BiampHeaderButton` items with consistent 4px (0.5) gaps between each button.
 * Use it inside `BiampHeaderActions` to get properly-spaced button groups.
 */
export const WithButtonList: Story = {
  name: 'With Button List',
  render: () => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    const items = [
      { icon: <AppsIcon />, selectedIcon: <AppsIconFilled /> },
      { icon: <NotificationsNoneIcon />, selectedIcon: <NotificationsIcon /> },
      { icon: <HelpOutlineIcon />, selectedIcon: <HelpIcon /> },
      { icon: <SettingsOutlinedIcon />, selectedIcon: <SettingsIcon /> },
    ];

    return (
      <Stack direction="row" spacing={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            With BiampHeaderButtonList
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            Buttons are wrapped in <code>BiampHeaderButtonList</code> which adds
            standardised 4px gaps between each item.
          </Typography>
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
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
          </Box>
        </Box>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Without BiampHeaderButtonList
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
            Without the list wrapper, buttons stack with no gap between them.
          </Typography>
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
            {items.map((item, i) => (
              <BiampHeaderButton
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </Box>
        </Box>
      </Stack>
    );
  },
};

/**
 * Demonstrates each sub-component individually so you can see
 * how they look and behave in isolation.
 */
export const SubComponents: Story = {
  name: 'Sub-Components',
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const apps = [
      { icon: <DashboardIcon />, name: 'Dashboard' },
      { icon: <CalendarMonthIcon />, name: 'Calendar' },
      { icon: <BarChartIcon />, name: 'Analytics' },
      { icon: <ChatBubbleOutlineIcon />, name: 'Messages' },
      { icon: <FolderOpenIcon />, name: 'Files' },
      { icon: <SettingsOutlinedIcon />, name: 'Settings' },
    ];

    return (
      <Stack spacing={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            BiampHeaderTitle
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
            A box with <code>pr: 3</code> containing a 24x24 icon and H4 text
            with a 12px gap.
          </Typography>
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
            <BiampHeaderTitle
              title="Dashboard"
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            BiampHeaderSearch
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
            A box with <code>px: 1.5</code> that wraps a search input.
          </Typography>
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex', width: 400 }}>
            <BiampHeaderSearch />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            BiampHeaderButtonList
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
            A flex container with <code>gap: 0.5</code> for grouping action
            buttons. Click the Apps button to open the app dialog.
          </Typography>
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
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
                icon={<NotificationsNoneIcon />}
                selectedIcon={<NotificationsIcon />}
              />
              <BiampHeaderButton
                icon={<HelpOutlineIcon />}
                selectedIcon={<HelpIcon />}
              />
              <BiampHeaderButton
                icon={<SettingsOutlinedIcon />}
                selectedIcon={<SettingsIcon />}
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
                  <BiampAppDialogItem
                    key={i}
                    icon={app.icon}
                    name={app.name}
                  />
                ))}
              </BiampAppDialog>
            </BiampAppPopover>
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            BiampHeaderProfile
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
            A 36x36 profile button container holding a 32x32 image with
            a 4px border radius.
          </Typography>
          <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
            <BiampHeaderProfile
              image="https://i.pravatar.cc/32?img=1"
            />
          </Box>
        </Box>
      </Stack>
    );
  },
};

/**
 * The header rendered with a border to visualise its padding
 * (px: 2.5, py: 1.5) and internal spacing.
 */
export const WithBorder: Story = {
  name: 'With Border (Layout Debug)',
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const apps = [
      { icon: <DashboardIcon />, name: 'Dashboard' },
      { icon: <CalendarMonthIcon />, name: 'Calendar' },
      { icon: <BarChartIcon />, name: 'Analytics' },
      { icon: <ChatBubbleOutlineIcon />, name: 'Messages' },
      { icon: <FolderOpenIcon />, name: 'Files' },
      { icon: <SettingsOutlinedIcon />, name: 'Settings' },
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
              icon={<NotificationsNoneIcon />}
              selectedIcon={<NotificationsIcon />}
            />
            <BiampHeaderButton
              icon={<HelpOutlineIcon />}
              selectedIcon={<HelpIcon />}
            />
            <BiampHeaderButton
              icon={<SettingsOutlinedIcon />}
              selectedIcon={<SettingsIcon />}
            />
          </BiampHeaderButtonList>
          <BiampHeaderProfile
            image="https://i.pravatar.cc/32?img=1"
          />
        </BiampHeaderActions>
        <BiampAppPopover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <BiampAppDialog>
            {apps.map((app, i) => (
              <BiampAppDialogItem
                key={i}
                icon={app.icon}
                name={app.name}
              />
            ))}
          </BiampAppDialog>
        </BiampAppPopover>
      </BiampHeader>
    );
  },
};

/**
 * Clicking the Apps button in the header opens a BiampAppDialog
 * as a popover anchored below the button.
 */
export const AppDialogToggle: Story = {
  name: 'App Dialog (Toggle)',
  render: () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const apps = [
      { icon: <DashboardIcon />, name: 'Dashboard' },
      { icon: <CalendarMonthIcon />, name: 'Calendar' },
      { icon: <BarChartIcon />, name: 'Analytics' },
      { icon: <ChatBubbleOutlineIcon />, name: 'Messages' },
      { icon: <FolderOpenIcon />, name: 'Files' },
      { icon: <SettingsOutlinedIcon />, name: 'Settings' },
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
                setAnchorEl(open ? null : e.currentTarget as HTMLElement)
              }
            />
            <BiampHeaderButton
              icon={<SettingsOutlinedIcon />}
              selectedIcon={<SettingsIcon />}
            />
          </BiampHeaderButtonList>
          <BiampHeaderProfile
            image="https://i.pravatar.cc/32?img=1"
          />
        </BiampHeaderActions>
        <BiampAppPopover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <BiampAppDialog>
            {apps.map((app, i) => (
              <BiampAppDialogItem
                key={i}
                icon={app.icon}
                name={app.name}
              />
            ))}
          </BiampAppDialog>
        </BiampAppPopover>
      </BiampHeader>
    );
  },
};

/**
 * A BiampAppDialog with only 2 items, showing how the layout
 * behaves with fewer than a full row.
 */
export const AppDialogFewItems: Story = {
  name: 'App Dialog (Few Items)',
  render: () => (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          BiampAppDialog — Few Items
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
          The dialog with only 2 items. Items maintain their fixed width and
          align to the start of the row.
        </Typography>
        <BiampAppDialog>
          <BiampAppDialogItem icon={<DashboardIcon />} name="Dashboard" />
          <BiampAppDialogItem icon={<SettingsOutlinedIcon />} name="Settings" />
        </BiampAppDialog>
      </Box>
    </Stack>
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
      { icon: <DashboardIcon />, name: 'Dashboard' },
      { icon: <CalendarMonthIcon />, name: 'Calendar' },
      { icon: <BarChartIcon />, name: 'Analytics' },
      { icon: <ChatBubbleOutlineIcon />, name: 'Messages' },
      { icon: <FolderOpenIcon />, name: 'Files' },
      { icon: <MapOutlinedIcon />, name: 'Maps' },
      { icon: <DevicesIcon />, name: 'Devices' },
      { icon: <SettingsOutlinedIcon />, name: 'Settings' },
      { icon: <BusinessIcon />, name: 'Buildings' },
    ];

    return (
      <Stack spacing={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 2 }}>
            BiampAppDialog
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
            A 3-column grid of <code>BiampAppDialogItem</code> tiles inside a
            rounded, shadowed container. Each item renders a 76×89px tile.
          </Typography>
          <BiampAppDialog>
            {apps.map((app, i) => (
              <BiampAppDialogItem
                key={i}
                icon={app.icon}
                name={app.name}
              />
            ))}
          </BiampAppDialog>
        </Box>
      </Stack>
    );
  },
};
