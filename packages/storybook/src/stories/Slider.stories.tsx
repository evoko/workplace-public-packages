import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider, Stack, Typography, Box } from '@mui/material';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

const meta: Meta<typeof Slider> = {
  title: 'Styles/Slider',
  component: Slider,
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  args: { defaultValue: 30 },
  decorators: [
    (Story) => (
      <Box sx={{ width: 300 }}>
        <Story />
      </Box>
    ),
  ],
};

export const Continuous: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Stack spacing={2} direction="row" alignItems="center">
        <VolumeDown />
        <Slider defaultValue={30} />
        <VolumeUp />
      </Stack>
    </Box>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Stack spacing={3}>
        <Slider defaultValue={30} size="small" />
        <Slider defaultValue={30} />
      </Stack>
    </Box>
  ),
};

export const Discrete: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Slider
        defaultValue={30}
        step={10}
        marks
        min={0}
        max={100}
        valueLabelDisplay="auto"
      />
    </Box>
  ),
};

export const Range: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Slider defaultValue={[20, 60]} valueLabelDisplay="auto" />
    </Box>
  ),
};

export const Colors: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Stack spacing={2}>
        {(
          [
            'primary',
            'secondary',
            'error',
            'info',
            'success',
            'warning',
          ] as const
        ).map((color) => (
          <Slider key={color} defaultValue={40} color={color} />
        ))}
      </Stack>
    </Box>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Slider defaultValue={30} disabled />
    </Box>
  ),
};
