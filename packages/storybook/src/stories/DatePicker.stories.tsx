import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Stack } from '@mui/material';

const meta: Meta = {
  title: 'Styles/DatePicker',
  decorators: [
    (Story) => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Story />
      </LocalizationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const BasicDatePicker: Story = {
  render: () => <DatePicker label="Pick a date" />,
};

export const BasicTimePicker: Story = {
  render: () => <TimePicker label="Pick a time" />,
};

export const Disabled: Story = {
  render: () => (
    <Stack spacing={2}>
      <DatePicker label="Disabled date" disabled />
      <TimePicker label="Disabled time" disabled />
    </Stack>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <Stack spacing={2}>
      <DatePicker label="Read only date" readOnly />
      <TimePicker label="Read only time" readOnly />
    </Stack>
  ),
};
