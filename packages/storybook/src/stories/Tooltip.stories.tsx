import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, Button, IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const meta: Meta<typeof Tooltip> = {
  title: 'Styles/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Basic: Story = {
  render: () => (
    <Tooltip title="Delete">
      <IconButton>
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  ),
};

export const Placement: Story = {
  render: () => (
    <Stack spacing={2} alignItems="center" sx={{ mt: 8 }}>
      <Stack direction="row" spacing={2}>
        <Tooltip title="Top Start" placement="top-start">
          <Button>top-start</Button>
        </Tooltip>
        <Tooltip title="Top" placement="top">
          <Button>top</Button>
        </Tooltip>
        <Tooltip title="Top End" placement="top-end">
          <Button>top-end</Button>
        </Tooltip>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Tooltip title="Left" placement="left">
          <Button>left</Button>
        </Tooltip>
        <Tooltip title="Right" placement="right">
          <Button>right</Button>
        </Tooltip>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Tooltip title="Bottom Start" placement="bottom-start">
          <Button>bottom-start</Button>
        </Tooltip>
        <Tooltip title="Bottom" placement="bottom">
          <Button>bottom</Button>
        </Tooltip>
        <Tooltip title="Bottom End" placement="bottom-end">
          <Button>bottom-end</Button>
        </Tooltip>
      </Stack>
    </Stack>
  ),
};

export const Arrow: Story = {
  render: () => (
    <Tooltip title="With arrow" arrow>
      <Button>Arrow</Button>
    </Tooltip>
  ),
};
