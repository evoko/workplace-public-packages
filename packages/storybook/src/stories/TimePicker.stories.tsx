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
  parameters: {
    docs: {
      description: {
        component: `\`TimePicker\` requires a \`LocalizationProvider\` wrapper with a date adapter to function correctly.

\`\`\`bash
npm install @mui/x-date-pickers dayjs
\`\`\`

\`\`\`tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

function MyComponent() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker label="Time" />
    </LocalizationProvider>
  );
}
\`\`\``,
      },
    },
  },
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
      <TimePicker label="Default" />
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
