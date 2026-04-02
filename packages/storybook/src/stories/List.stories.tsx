import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListSubheader,
  Avatar,
  Divider,
  Stack,
  Typography,
  Checkbox,
  IconButton,
  Paper,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import CommentIcon from '@mui/icons-material/Comment';

const meta: Meta<typeof List> = {
  title: 'Styles/List',
  component: List,
};

export default meta;
type Story = StoryObj<typeof List>;

export const Basic: Story = {
  render: () => (
    <Paper sx={{ width: 300 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <DraftsIcon />
            </ListItemIcon>
            <ListItemText primary="Drafts" />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Trash" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary="Spam" />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  ),
};

export const WithSubheader: Story = {
  render: () => (
    <Paper sx={{ width: 300 }}>
      <List subheader={<ListSubheader>Nested List Items</ListSubheader>}>
        <ListItemButton>
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
      </List>
    </Paper>
  ),
};

export const WithAvatars: Story = {
  render: () => (
    <Paper sx={{ width: 360 }}>
      <List>
        {['Photos', 'Work', 'Vacation'].map((text) => (
          <ListItem key={text}>
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={text} secondary="Jan 9, 2024" />
          </ListItem>
        ))}
      </List>
    </Paper>
  ),
};

export const WithSecondaryAction: Story = {
  render: () => (
    <Paper sx={{ width: 360 }}>
      <List>
        {['Line item 1', 'Line item 2', 'Line item 3'].map((text) => (
          <ListItem
            key={text}
            secondaryAction={
              <IconButton edge="end">
                <CommentIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Paper>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <Paper sx={{ width: 360 }}>
      <List>
        {['Line item 1', 'Line item 2', 'Line item 3'].map((text, i) => (
          <ListItem key={text} disablePadding>
            <ListItemButton dense>
              <ListItemIcon>
                <Checkbox edge="start" defaultChecked={i === 0} />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  ),
};

export const Dense: Story = {
  render: () => (
    <Paper sx={{ width: 300 }}>
      <List dense>
        {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((text) => (
          <ListItem key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Paper>
  ),
};
