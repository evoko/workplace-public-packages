import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fab, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import NavigationIcon from '@mui/icons-material/Navigation';

const meta: Meta<typeof Fab> = {
  title: 'Styles/Fab',
  component: Fab,
};

export default meta;
type Story = StoryObj<typeof Fab>;

export const Playground: Story = {
  args: { children: <AddIcon />, color: 'primary' },
};

export const Variants: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Fab color="primary">
        <AddIcon />
      </Fab>
      <Fab color="secondary">
        <EditIcon />
      </Fab>
      <Fab variant="extended" color="primary">
        <NavigationIcon sx={{ mr: 1 }} />
        Navigate
      </Fab>
      <Fab disabled>
        <AddIcon />
      </Fab>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Fab size="small" color="primary">
        <AddIcon />
      </Fab>
      <Fab size="medium" color="primary">
        <AddIcon />
      </Fab>
      <Fab size="large" color="primary">
        <AddIcon />
      </Fab>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Fab color="primary">
        <AddIcon />
      </Fab>
      <Fab color="secondary">
        <AddIcon />
      </Fab>
      <Fab color="success">
        <AddIcon />
      </Fab>
      <Fab color="error">
        <AddIcon />
      </Fab>
      <Fab color="info">
        <AddIcon />
      </Fab>
      <Fab color="warning">
        <AddIcon />
      </Fab>
    </Stack>
  ),
};
