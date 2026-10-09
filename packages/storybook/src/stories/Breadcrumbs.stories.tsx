import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs, Link, Typography, Stack } from '@mui/material';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Styles/Breadcrumbs',
  component: Breadcrumbs,
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Breadcrumbs</Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
        }}
      >
        Uses the ChevronRightIcon separator from the theme.
      </Typography>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Settings
        </Link>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          General
        </Typography>
      </Breadcrumbs>
    </Stack>
  ),
};

export const MultipleDepths: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Multiple Depths</Typography>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          Dashboard
        </Typography>
      </Breadcrumbs>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Users
        </Link>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          John Doe
        </Typography>
      </Breadcrumbs>

      <Breadcrumbs>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Settings
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Advanced
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Network
        </Link>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          Proxy Configuration
        </Typography>
      </Breadcrumbs>
    </Stack>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Collapsed (maxItems)</Typography>
      <Breadcrumbs maxItems={3}>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Category
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Sub-category
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Item Type
        </Link>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          Item Detail
        </Typography>
      </Breadcrumbs>
    </Stack>
  ),
};
