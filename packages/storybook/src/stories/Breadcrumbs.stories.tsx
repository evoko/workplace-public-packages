import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs, Link, Typography, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Styles/Breadcrumbs',
  component: Breadcrumbs,
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Basic: Story = {
  render: () => (
    <Breadcrumbs>
      <Link underline="hover" color="inherit" href="#">
        MUI
      </Link>
      <Link underline="hover" color="inherit" href="#">
        Core
      </Link>
      <Typography color="text.primary">Breadcrumbs</Typography>
    </Breadcrumbs>
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Stack spacing={2}>
      <Breadcrumbs separator="›">
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Catalog
        </Link>
        <Typography color="text.primary">Accessories</Typography>
      </Breadcrumbs>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        <Link underline="hover" color="inherit" href="#">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="#">
          Catalog
        </Link>
        <Typography color="text.primary">Accessories</Typography>
      </Breadcrumbs>
    </Stack>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumbs>
      <Link
        underline="hover"
        color="inherit"
        href="#"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        Home
      </Link>
      <Link underline="hover" color="inherit" href="#">
        Core
      </Link>
      <Typography color="text.primary">Breadcrumbs</Typography>
    </Breadcrumbs>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Breadcrumbs maxItems={3}>
      <Link underline="hover" color="inherit" href="#">
        Home
      </Link>
      <Link underline="hover" color="inherit" href="#">
        Catalog
      </Link>
      <Link underline="hover" color="inherit" href="#">
        Accessories
      </Link>
      <Link underline="hover" color="inherit" href="#">
        New Collection
      </Link>
      <Typography color="text.primary">Belts</Typography>
    </Breadcrumbs>
  ),
};
