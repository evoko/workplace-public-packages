import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Box, Stack, Typography } from '@mui/material';
import { EmailIcon } from '@bwp-web/assets';

const meta: Meta<typeof Badge> = {
  title: 'Styles/Badge',
  component: Badge,
  argTypes: {
    badgeContent: { control: 'text' },
    color: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'error',
        'warning',
        'success',
        'info',
      ],
    },
    variant: {
      control: 'select',
      options: [
        'standard',
        'dot',
        'rectangle',
        'round',
        'rectangle-inline',
        'round-inline',
      ],
    },
    max: { control: 'number' },
    invisible: { control: 'boolean' },
    anchorOrigin: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    max: 99,
    invisible: false,
    variant: 'rectangle-inline',
  },
};

const COLORS = ['primary', 'error', 'warning', 'success', 'info'] as const;

export const Variants: Story = {
  render: () => (
    <Stack spacing={4} sx={{ paddingBottom: '40px' }}>
      {(
        [
          {
            variant: 'standard',
            label: 'Standard',
            description: 'Floats on another component',
            inline: false,
          },
          {
            variant: 'dot',
            label: 'Dot',
            description: 'Floats on another component',
            inline: false,
          },
          {
            variant: 'rectangle',
            label: 'Rectangle',
            description: 'Floats on another component',
            inline: false,
          },
          {
            variant: 'rectangle-inline',
            label: 'Rectangle inline',
            description: 'Block behavior - no float',
            inline: true,
          },
          {
            variant: 'round',
            label: 'Round',
            description: 'Floats on another component',
            inline: false,
          },
          {
            variant: 'round-inline',
            label: 'Round inline',
            description: 'Block behavior - no float',
            inline: true,
          },
        ] as const
      ).map(({ variant, label, description, inline }) => (
        <Stack key={variant} spacing={0}>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ paddingBottom: '20px' }}
          >
            {description}
          </Typography>
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            flexWrap="wrap"
          >
            {COLORS.map((color) =>
              inline ? (
                <Badge
                  key={color}
                  color={color}
                  badgeContent="9"
                  variant={variant}
                />
              ) : (
                <Badge
                  key={color}
                  color={color}
                  badgeContent="9"
                  variant={variant}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'action.selected',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EmailIcon variant="md" />
                  </Box>
                </Badge>
              ),
            )}
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};
