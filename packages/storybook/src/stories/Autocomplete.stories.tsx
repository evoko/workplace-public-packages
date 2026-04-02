import type { Meta, StoryObj } from '@storybook/react-vite';
import { Autocomplete, TextField, Stack, Chip } from '@mui/material';

const meta: Meta<typeof Autocomplete> = {
  title: 'Styles/Autocomplete',
  component: Autocomplete,
};

export default meta;
type Story = StoryObj;

const top5Films = [
  { label: 'The Shawshank Redemption', year: 1994 },
  { label: 'The Godfather', year: 1972 },
  { label: 'The Dark Knight', year: 2008 },
  { label: 'Pulp Fiction', year: 1994 },
  { label: 'Fight Club', year: 1999 },
];

export const Basic: Story = {
  render: () => (
    <Autocomplete
      options={top5Films}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Movie" />}
    />
  ),
};

export const FreeSolo: Story = {
  render: () => (
    <Autocomplete
      freeSolo
      options={top5Films.map((f) => f.label)}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Free solo" />}
    />
  ),
};

export const Multiple: Story = {
  render: () => (
    <Autocomplete
      multiple
      options={top5Films}
      defaultValue={[top5Films[0]]}
      sx={{ width: 400 }}
      renderInput={(params) => <TextField {...params} label="Movies" />}
    />
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Autocomplete
        size="small"
        options={top5Films}
        renderInput={(params) => <TextField {...params} label="Small" />}
      />
      <Autocomplete
        options={top5Films}
        renderInput={(params) => <TextField {...params} label="Medium" />}
      />
    </Stack>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Autocomplete
      disabled
      options={top5Films}
      defaultValue={top5Films[0]}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Disabled" />}
    />
  ),
};
