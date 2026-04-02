import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating, Stack, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const meta: Meta<typeof Rating> = {
  title: 'Styles/Rating',
  component: Rating,
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Playground: Story = {
  args: { defaultValue: 3 },
};

export const BasicRatings: Story = {
  render: () => (
    <Stack spacing={1}>
      <Typography>Controlled</Typography>
      <Rating value={2} readOnly />
      <Typography>Read only</Typography>
      <Rating value={3.5} readOnly precision={0.5} />
      <Typography>Disabled</Typography>
      <Rating value={2} disabled />
      <Typography>No rating</Typography>
      <Rating value={null} />
    </Stack>
  ),
};

export const Precision: Story = {
  render: () => (
    <Stack spacing={1}>
      <Rating defaultValue={2.5} precision={0.5} />
      <Rating defaultValue={3.3} precision={0.1} readOnly />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={1}>
      <Rating defaultValue={2} size="small" />
      <Rating defaultValue={2} size="medium" />
      <Rating defaultValue={2} size="large" />
    </Stack>
  ),
};

export const CustomIcon: Story = {
  render: () => (
    <Rating
      defaultValue={3}
      icon={<FavoriteIcon color="error" />}
      emptyIcon={<FavoriteBorderIcon />}
    />
  ),
};

export const MaxStars: Story = {
  render: () => <Rating defaultValue={7} max={10} />,
};
