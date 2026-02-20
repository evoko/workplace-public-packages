import type { Meta, StoryObj } from '@storybook/react';
import { Slider, Stack, Typography } from '@mui/material';

const meta: Meta<typeof Slider> = {
  title: 'Styles/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Playground: Story = {
  args: {
    value: 60,
    min: 0,
    max: 100,
    disabled: false,
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={4} sx={{ width: 300, mx: 'auto', pt: 2 }}>
      <Typography variant="h3">Range Slider</Typography>
      <Slider defaultValue={[30, 70]} />

      <Typography variant="h3">Single Slider</Typography>
      <Slider defaultValue={40} />

      <Typography variant="h3">Disabled</Typography>
      <Slider defaultValue={60} disabled />
      <Slider defaultValue={[20, 60]} disabled />
    </Stack>
  ),
};
