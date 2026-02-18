import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Autocomplete,
  TextField,
  Stack,
  Typography,
  Chip,
} from '@mui/material';

const meta: Meta<typeof Autocomplete> = {
  title: 'Styles/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

const topMovies = [
  'The Shawshank Redemption',
  'The Godfather',
  'The Dark Knight',
  'Pulp Fiction',
  'Forrest Gump',
  'Inception',
  'The Matrix',
  'Goodfellas',
  'Fight Club',
  'Interstellar',
];

const countries = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'AU', label: 'Australia' },
  { code: 'CA', label: 'Canada' },
  { code: 'BR', label: 'Brazil' },
];

export const Default: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">Autocomplete</Typography>

      <Autocomplete
        options={topMovies}
        renderInput={(params) => (
          <TextField {...params} label="Movie" placeholder="Select a movie" />
        )}
      />
    </Stack>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">Autocomplete Variants</Typography>

      <Autocomplete
        options={topMovies}
        renderInput={(params) => (
          <TextField {...params} label="Default" placeholder="Select a movie" />
        )}
      />

      <Autocomplete
        options={topMovies}
        defaultValue="The Matrix"
        renderInput={(params) => (
          <TextField {...params} label="With default value" />
        )}
      />

      <Autocomplete
        options={topMovies}
        disabled
        defaultValue="Inception"
        renderInput={(params) => <TextField {...params} label="Disabled" />}
      />

      <Autocomplete
        options={topMovies}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Error state"
            error
            helperText="Please select a valid option"
          />
        )}
      />
    </Stack>
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">Multi-select</Typography>

      <Autocomplete
        multiple
        options={topMovies}
        defaultValue={['The Matrix', 'Inception']}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Favorite movies"
            placeholder="Add movies"
          />
        )}
      />

      <Autocomplete
        multiple
        options={topMovies}
        defaultValue={['Fight Club']}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              size="small"
              {...getTagProps({ index })}
              key={option}
            />
          ))
        }
        renderInput={(params) => (
          <TextField {...params} label="With chips" placeholder="Add movies" />
        )}
      />
    </Stack>
  ),
};

export const ObjectOptions: Story = {
  render: () => (
    <Stack spacing={4} sx={{ maxWidth: 400 }}>
      <Typography variant="h3">Object Options</Typography>

      <Autocomplete
        options={countries}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Country"
            placeholder="Select a country"
          />
        )}
      />
    </Stack>
  ),
};
