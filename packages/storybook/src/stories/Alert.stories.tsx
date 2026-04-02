import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, Stack, Button } from '@mui/material';

const meta: Meta<typeof Alert> = {
  title: 'Styles/Alert',
  component: Alert,
  argTypes: {
    severity: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
    },
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  args: {
    children: 'This is an alert.',
    severity: 'success',
    variant: 'standard',
  },
};

export const Severities: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="success">This is a success alert.</Alert>
      <Alert severity="info">This is an info alert.</Alert>
      <Alert severity="warning">This is a warning alert.</Alert>
      <Alert severity="error">This is an error alert.</Alert>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      {(['standard', 'filled', 'outlined'] as const).map((variant) => (
        <Stack key={variant} spacing={1}>
          {(['success', 'info', 'warning', 'error'] as const).map(
            (severity) => (
              <Alert key={severity} variant={variant} severity={severity}>
                {variant} — {severity}
              </Alert>
            ),
          )}
        </Stack>
      ))}
    </Stack>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="success">
        <AlertTitle>Success</AlertTitle>
        This is a success alert with a title.
      </Alert>
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        This is an error alert with a title.
      </Alert>
    </Stack>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Stack spacing={2}>
      <Alert severity="warning" onClose={() => {}}>
        This alert has a close button.
      </Alert>
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small">
            UNDO
          </Button>
        }
      >
        This alert has a custom action.
      </Alert>
    </Stack>
  ),
};
