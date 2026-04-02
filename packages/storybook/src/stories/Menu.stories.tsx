import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Menu,
  MenuItem,
  Button,
  Stack,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';

const meta: Meta<typeof Menu> = {
  title: 'Styles/Menu',
  component: Menu,
};

export default meta;
type Story = StoryObj<typeof Menu>;

const BasicMenuDemo = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <>
      <Button variant="outlined" onClick={(e) => setAnchorEl(e.currentTarget)}>
        Open Menu
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>My account</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export const Basic: Story = {
  render: () => <BasicMenuDemo />,
};

const WithIconsDemo = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <>
      <Button variant="outlined" onClick={(e) => setAnchorEl(e.currentTarget)}>
        Edit Menu
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <ContentCut fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cut</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <ContentPaste fontSize="small" />
          </ListItemIcon>
          <ListItemText>Paste</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} disabled>
          <ListItemText>Disabled</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export const WithIcons: Story = {
  render: () => <WithIconsDemo />,
};

const DenseMenuDemo = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <>
      <Button variant="outlined" onClick={(e) => setAnchorEl(e.currentTarget)}>
        Dense Menu
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem dense onClick={() => setAnchorEl(null)}>
          Single
        </MenuItem>
        <MenuItem dense onClick={() => setAnchorEl(null)}>
          1.15
        </MenuItem>
        <MenuItem dense onClick={() => setAnchorEl(null)}>
          Double
        </MenuItem>
        <MenuItem dense onClick={() => setAnchorEl(null)}>
          Custom: 1.2
        </MenuItem>
      </Menu>
    </>
  );
};

export const Dense: Story = {
  render: () => <DenseMenuDemo />,
};
