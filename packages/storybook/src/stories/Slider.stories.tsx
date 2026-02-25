import type { Meta, StoryObj } from '@storybook/react';
import { Slider, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Slider> = {
  title: 'Styles/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Variants: Story = {
  render: () => (
    <Stack spacing={4} sx={{ width: 300, mx: 'auto', pt: 2, backgroundColor: 'background.paper', padding: 4 }}>
      <Typography variant="h3">Range Slider</Typography>
      <Slider defaultValue={[30, 70]} />

      <Typography variant="h3">Single Slider</Typography>
      <Slider defaultValue={40} />
    </Stack>
  ),
};
