import type { Meta, StoryObj } from '@storybook/react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

const meta: Meta<typeof TimePicker> = {
  title: 'Styles/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Story />
      </LocalizationProvider>
    ),
  ],
  argTypes: {
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const AllStates: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 115 }}>
      <Typography variant="h3">TimePicker States</Typography>
      <TimePicker label="Default" defaultValue={dayjs().startOf('day')} />
      <TimePicker label="With value" defaultValue={dayjs().startOf('day')} />
      <TimePicker
        label="Disabled"
        defaultValue={dayjs().startOf('day')}
        disabled
      />
      <TimePicker
        label="Read only"
        defaultValue={dayjs().startOf('day')}
        readOnly
      />
    </Stack>
  ),
};
