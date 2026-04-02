import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';

const meta: Meta<typeof Checkbox> = {
  title: 'Styles/Checkbox',
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  args: { defaultChecked: true },
};

export const BasicCheckboxes: Story = {
  render: () => (
    <Stack direction="row" spacing={1}>
      <Checkbox defaultChecked />
      <Checkbox />
      <Checkbox disabled />
      <Checkbox disabled checked />
    </Stack>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <FormGroup>
      <FormControlLabel control={<Checkbox defaultChecked />} label="Label" />
      <FormControlLabel control={<Checkbox />} label="Required" />
      <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
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
        <Checkbox key={color} defaultChecked color={color} />
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" alignItems="center">
      <Checkbox defaultChecked size="small" />
      <Checkbox defaultChecked size="medium" />
    </Stack>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Stack direction="row">
      <Checkbox indeterminate />
      <Checkbox indeterminate color="secondary" />
    </Stack>
  ),
};

export const CustomIcons: Story = {
  render: () => (
    <Checkbox
      icon={<FavoriteBorder />}
      checkedIcon={<Favorite />}
      defaultChecked
    />
  ),
};
