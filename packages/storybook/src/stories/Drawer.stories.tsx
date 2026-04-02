import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Drawer,
  Button,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

const meta: Meta<typeof Drawer> = {
  title: 'Styles/Drawer',
  component: Drawer,
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const DrawerContent = () => (
  <Box sx={{ width: 250 }} role="presentation">
    <List>
      {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
        <ListItem key={text} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    <Divider />
    <List>
      {['All mail', 'Trash', 'Spam'].map((text, index) => (
        <ListItem key={text} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Box>
);

const DrawerDemo = ({
  anchor,
}: {
  anchor: 'left' | 'right' | 'top' | 'bottom';
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open {anchor}
      </Button>
      <Drawer anchor={anchor} open={open} onClose={() => setOpen(false)}>
        <DrawerContent />
      </Drawer>
    </>
  );
};

export const Anchors: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      {(['left', 'right', 'top', 'bottom'] as const).map((anchor) => (
        <DrawerDemo key={anchor} anchor={anchor} />
      ))}
    </Stack>
  ),
};
