import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  CardMedia,
  Typography,
  Button,
  Stack,
  IconButton,
  Avatar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const meta: Meta<typeof Card> = {
  title: 'Styles/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: () => (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Card Title
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a basic card with some content text. Cards contain content and
          actions about a single subject.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={<Avatar>R</Avatar>}
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        title="Card Title"
        subheader="September 14, 2024"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          This card has a header with an avatar and action button.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card variant="outlined" sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography variant="h6">Outlined Card</Typography>
        <Typography variant="body2" color="text.secondary">
          An outlined card variant with a border instead of elevation.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  ),
};

export const Elevated: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      {[0, 1, 2, 4, 8, 12, 24].map((elevation) => (
        <Card
          key={elevation}
          elevation={elevation}
          sx={{
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption">elev={elevation}</Typography>
        </Card>
      ))}
    </Stack>
  ),
};
