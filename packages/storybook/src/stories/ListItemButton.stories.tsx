import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

const meta: Meta<typeof ListItemButton> = {
  title: 'Styles/ListItemButton',
  component: ListItemButton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListItemButton>;

export const Default: Story = {
  render: () => (
    <Stack spacing={3} sx={{ maxWidth: 360 }}>
      <Typography variant="h3">ListItemButton</Typography>
      <Paper variant="outlined">
        <List>
          <ListItemButton selected>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <DraftsIcon />
            </ListItemIcon>
            <ListItemText primary="Drafts" />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <SendIcon />
            </ListItemIcon>
            <ListItemText primary="Sent" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Trash" />
          </ListItemButton>
        </List>
      </Paper>
    </Stack>
  ),
};

export const WithSecondaryText: Story = {
  render: () => (
    <Stack spacing={3} sx={{ maxWidth: 360 }}>
      <Typography variant="h3">With Secondary Text</Typography>
      <Paper variant="outlined">
        <List>
          <ListItemButton selected>
            <ListItemText primary="Inbox" secondary="12 unread messages" />
          </ListItemButton>
          <ListItemButton>
            <ListItemText primary="Drafts" secondary="3 drafts" />
          </ListItemButton>
          <ListItemButton>
            <ListItemText primary="Sent" secondary="Last sent 2h ago" />
          </ListItemButton>
          <ListItemButton disabled>
            <ListItemText primary="Spam" secondary="Disabled" />
          </ListItemButton>
        </List>
      </Paper>
    </Stack>
  ),
};
