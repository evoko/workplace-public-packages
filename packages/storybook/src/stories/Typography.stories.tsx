import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography, Stack, Divider, Box } from '@mui/material';

const meta: Meta<typeof Typography> = {
  title: 'Styles/Typography',
  component: Typography,
};

export default meta;
type Story = StoryObj<typeof Typography>;

const sampleText = 'The quick brown fox jumps over the lazy dog';

export const AllVariants: Story = {
  render: () => (
    <Stack spacing={2}>
      {(
        [
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'subtitle1',
          'subtitle2',
          'body1',
          'body2',
          'caption',
          'overline',
          'button',
        ] as const
      ).map((variant) => (
        <Box key={variant}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}
          >
            {variant}
          </Typography>
          <Typography variant={variant}>{sampleText}</Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
    </Stack>
  ),
};

export const Playground: Story = {
  args: {
    variant: 'body1',
    children: sampleText,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'caption',
        'overline',
        'button',
      ],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
  },
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={1}>
      <Typography color="primary">Primary color</Typography>
      <Typography color="secondary">Secondary color</Typography>
      <Typography color="text.primary">Text primary</Typography>
      <Typography color="text.secondary">Text secondary</Typography>
      <Typography color="text.disabled">Text disabled</Typography>
      <Typography color="error">Error color</Typography>
    </Stack>
  ),
};

export const GutterBottom: Story = {
  render: () => (
    <div>
      <Typography variant="h4" gutterBottom>
        Heading with gutter
      </Typography>
      <Typography variant="body1">Body text below the heading.</Typography>
    </div>
  ),
};

export const NoWrap: Story = {
  render: () => (
    <Box sx={{ width: 200, border: '1px solid grey' }}>
      <Typography noWrap>
        This is a very long text that will be truncated with an ellipsis when it
        overflows.
      </Typography>
    </Box>
  ),
};
