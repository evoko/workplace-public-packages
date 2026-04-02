import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch, FormControlLabel, FormGroup, Stack } from '@mui/material';

const meta: Meta<typeof Switch> = {
  title: 'Styles/Switch',
  component: Switch,
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  args: { defaultChecked: true },
};

export const BasicSwitches: Story = {
  render: () => (
    <Stack direction="row">
      <Switch defaultChecked />
      <Switch />
      <Switch disabled defaultChecked />
      <Switch disabled />
    </Stack>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <FormGroup>
      <FormControlLabel control={<Switch defaultChecked />} label="On" />
      <FormControlLabel control={<Switch />} label="Off" />
      <FormControlLabel control={<Switch disabled />} label="Disabled" />
    </FormGroup>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack direction="row">
      {(
        [
          'primary',
          'secondary',
          'success',
          'error',
          'info',
          'warning',
          'default',
        ] as const
      ).map((color) => (
        <Switch key={color} defaultChecked color={color} />
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" alignItems="center">
      <Switch defaultChecked size="small" />
      <Switch defaultChecked size="medium" />
    </Stack>
  ),
};
