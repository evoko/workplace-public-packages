import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider, Stack, Typography, Box } from '@mui/material';

const meta: Meta<typeof Slider> = {
  title: 'Styles/Slider',
  component: Slider,
  argTypes: {
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium'] },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  args: {
    defaultValue: 40,
    disabled: false,
    size: 'medium',
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 300, p: 2 }}>
        <Story />
      </Box>
    ),
  ],
};

export const SingleSlider: Story = {
  name: 'Single slider',
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h6">Single slider</Typography>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Volume
        </Typography>
        <Slider defaultValue={30} />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Disabled
        </Typography>
        <Slider defaultValue={50} disabled />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Small
        </Typography>
        <Slider defaultValue={60} size="small" />
      </Box>
    </Stack>
  ),
};

function RangeDemo() {
  const [value, setValue] = useState<number[]>([20, 60]);
  return (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h6">Range slider</Typography>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Price range: ${value[0]} – ${value[1]}
        </Typography>
        <Slider
          value={value}
          onChange={(_, v) => setValue(v as number[])}
          valueLabelDisplay="auto"
        />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Disabled range
        </Typography>
        <Slider defaultValue={[30, 70]} disabled />
      </Box>
    </Stack>
  );
}

export const RangeSlider: Story = {
  name: 'Range slider',
  render: () => <RangeDemo />,
};

export const WithSteps: Story = {
  name: 'With steps & marks',
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h6">Discrete slider with marks</Typography>
      <Slider
        defaultValue={20}
        step={10}
        marks
        min={0}
        max={100}
        valueLabelDisplay="auto"
      />
    </Stack>
  ),
};
