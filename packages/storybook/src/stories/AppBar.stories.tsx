import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const meta: Meta<typeof AppBar> = {
  title: 'Styles/AppBar',
  component: AppBar,
};

export default meta;
type Story = StoryObj<typeof AppBar>;

export const Basic: Story = {
  render: () => (
    <AppBar position="static">
      <Toolbar>
        <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          App Bar
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      {(['primary', 'secondary', 'transparent', 'default'] as const).map(
        (color) => (
          <AppBar key={color} position="static" color={color}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {color}
              </Typography>
              <Button color="inherit">Action</Button>
            </Toolbar>
          </AppBar>
        ),
      )}
    </Stack>
  ),
};

export const Dense: Story = {
  render: () => (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dense Toolbar
        </Typography>
      </Toolbar>
    </AppBar>
  ),
};
