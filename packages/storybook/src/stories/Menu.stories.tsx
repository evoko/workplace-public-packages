import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Menu,
  MenuItem,
  Button,
  Stack,
  Typography,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const meta: Meta<typeof Menu> = {
  title: 'Styles/Menu',
  component: Menu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    return (
      <Stack spacing={2}>
        <Typography variant="h3">Menu</Typography>
        <Button
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Open Menu
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>My Account</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Settings</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Logout</MenuItem>
        </Menu>
      </Stack>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    return (
      <Stack spacing={2}>
        <Typography variant="h3">Menu with Icons</Typography>
        <Button
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Actions
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon>
              <ContentPasteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Paste</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setAnchorEl(null)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>
    );
  },
};

export const ContextMenu: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    return (
      <Stack spacing={2}>
        <Typography variant="h3">Triggered from IconButton</Typography>
        <Button
          variant="outlined"
          startIcon={<MoreVertIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          More Options
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>Option A</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Option B</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Option C</MenuItem>
          <MenuItem disabled>Option D (disabled)</MenuItem>
        </Menu>
      </Stack>
    );
  },
};
