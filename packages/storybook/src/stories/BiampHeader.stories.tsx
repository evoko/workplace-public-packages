import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderSearch,
  BiampHeaderActions,
  BiampHeaderButtonList,
  BiampHeaderProfile,
} from '@bwp-web/components';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

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
  render: () => (
    <BiampHeader>
      <BiampHeaderTitle
        icon={<DashboardIcon sx={{ width: 24, height: 24 }} />}
        title="Dashboard"
      />
      <BiampHeaderSearch sx={{ flexGrow: 1 }}>
        <TextField
          size="small"
          placeholder="Search…"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </BiampHeaderSearch>
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <IconButton size="small">
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton size="small">
            <HelpOutlineIcon />
          </IconButton>
          <IconButton size="small">
            <SettingsOutlinedIcon />
          </IconButton>
        </BiampHeaderButtonList>
        <BiampHeaderProfile
          icon={<AccountCircleIcon sx={{ width: 32, height: 32 }} />}
          name="Jane Doe"
        />
      </BiampHeaderActions>
    </BiampHeader>
  ),
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
        icon={<BusinessIcon sx={{ width: 24, height: 24 }} />}
        title="Buildings"
      />
      <BiampHeaderSearch sx={{ flexGrow: 1 }}>
        <TextField
          size="small"
          placeholder="Search buildings…"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </BiampHeaderSearch>
    </BiampHeader>
  ),
};

/**
 * A header with the title and actions (buttons + profile), but no search bar.
 */
export const WithActions: Story = {
  name: 'With Actions',
  render: () => (
    <BiampHeader>
      <BiampHeaderTitle
        icon={<DashboardIcon sx={{ width: 24, height: 24 }} />}
        title="Overview"
      />
      <Box sx={{ flexGrow: 1 }} />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <IconButton size="small">
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton size="small">
            <SettingsOutlinedIcon />
          </IconButton>
        </BiampHeaderButtonList>
        <BiampHeaderProfile
          icon={<PersonOutlineIcon sx={{ width: 32, height: 32 }} />}
          name="John Smith"
        />
      </BiampHeaderActions>
    </BiampHeader>
  ),
};

/**
 * Demonstrates each sub-component individually so you can see
 * how they look and behave in isolation.
 */
export const SubComponents: Story = {
  name: 'Sub-Components',
  render: () => (
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
            icon={<DashboardIcon sx={{ width: 24, height: 24 }} />}
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
          <BiampHeaderSearch sx={{ flexGrow: 1 }}>
            <TextField
              size="small"
              placeholder="Search…"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </BiampHeaderSearch>
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          BiampHeaderButtonList
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
          A flex container with <code>gap: 0.5</code> for grouping action
          buttons.
        </Typography>
        <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
          <BiampHeaderButtonList>
            <IconButton size="small">
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton size="small">
              <HelpOutlineIcon />
            </IconButton>
            <IconButton size="small">
              <SettingsOutlinedIcon />
            </IconButton>
          </BiampHeaderButtonList>
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          BiampHeaderProfile
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
          A profile section with a 36x36 container (holding a 32x32 icon) and
          an H4 name, separated by <code>gap: 1</code>.
        </Typography>
        <Box sx={{ border: '1px dashed', borderColor: 'divider', display: 'inline-flex' }}>
          <BiampHeaderProfile
            icon={<AccountCircleIcon sx={{ width: 32, height: 32 }} />}
            name="Jane Doe"
          />
        </Box>
      </Box>
    </Stack>
  ),
};

/**
 * The header rendered with a border to visualise its padding
 * (px: 2.5, py: 1.5) and internal spacing.
 */
export const WithBorder: Story = {
  name: 'With Border (Layout Debug)',
  render: () => (
    <BiampHeader sx={{ border: '1px solid', borderColor: 'divider' }}>
      <BiampHeaderTitle
        icon={<DashboardIcon sx={{ width: 24, height: 24 }} />}
        title="Dashboard"
      />
      <BiampHeaderSearch sx={{ flexGrow: 1 }}>
        <TextField
          size="small"
          placeholder="Search…"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </BiampHeaderSearch>
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <IconButton size="small">
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton size="small">
            <HelpOutlineIcon />
          </IconButton>
          <IconButton size="small">
            <SettingsOutlinedIcon />
          </IconButton>
        </BiampHeaderButtonList>
        <BiampHeaderProfile
          icon={<AccountCircleIcon sx={{ width: 32, height: 32 }} />}
          name="Jane Doe"
        />
      </BiampHeaderActions>
    </BiampHeader>
  ),
};
