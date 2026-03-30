import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  Button,
  Stack,
  Avatar,
  IconButton,
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
        <Typography variant="h6" gutterBottom>
          Card Title
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a basic card with content. Cards contain content and actions
          about a single subject.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
        <Button size="small" color="primary">
          Action
        </Button>
      </CardActions>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card sx={{ maxWidth: 400 }}>
      <CardHeader
        avatar={<Avatar>R</Avatar>}
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        title="Card Header"
        subheader="September 14, 2026"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Cards can include a header with an avatar, title, subheader, and an
          action element. The card surface uses the default background with a
          subtle shadow and border.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  ),
};

export const Grid: Story = {
  render: () => (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {['Project Alpha', 'Project Beta', 'Project Gamma'].map((title) => (
        <Card key={title} sx={{ width: 280 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Project
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              A brief description of the project and its current status.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" variant="contained">
              Open
            </Button>
            <Button size="small" variant="text">
              Details
            </Button>
          </CardActions>
        </Card>
      ))}
    </Stack>
  ),
};
