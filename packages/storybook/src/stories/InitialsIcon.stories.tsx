import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Typography } from '@mui/material';
import { UserInitialsIcon } from '@bwp-web/components';

const meta: Meta<typeof UserInitialsIcon> = {
  title: 'Components/UserInitialsIcon',
  component: UserInitialsIcon,
  argTypes: {
    name: { control: 'text' },
    id: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof UserInitialsIcon>;

export const Playground: Story = {
  args: {
    name: 'Jane Doe',
    id: 'user-1',
    width: 40,
    height: 40,
  },
};

const SAMPLE_USERS = [
  { name: 'Alice Johnson', id: 'u-alice' },
  { name: 'Bob Smith', id: 'u-bob' },
  { name: 'Charlie Brown', id: 'u-charlie' },
  { name: 'Diana Prince', id: 'u-diana' },
  { name: 'Eve Torres', id: 'u-eve' },
  { name: 'Frank Castle', id: 'u-frank' },
  { name: 'Grace Hopper', id: 'u-grace' },
  { name: 'Hank Pym', id: 'u-hank' },
];

export const UserGrid: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="subtitle2">
        Each user gets a unique color derived from their ID
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {SAMPLE_USERS.map((user) => (
          <Stack key={user.id} alignItems="center" spacing={0.5}>
            <UserInitialsIcon name={user.name} id={user.id} />
            <Typography variant="caption">{user.name}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2">
        Font size scales proportionally with the icon
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        {[24, 32, 40, 56, 72, 96].map((size) => (
          <Stack key={size} alignItems="center" spacing={0.5}>
            <UserInitialsIcon
              name="Jane Doe"
              id="user-sizes"
              width={size}
              height={size}
            />
            <Typography variant="caption">{size}px</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};

export const EdgeCases: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Name edge cases</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        {[
          { name: 'Single', label: 'One word' },
          { name: 'Three Word Name', label: 'Three words (uses first two)' },
          { name: '', label: 'Empty string' },
          { name: '  Padded  Name  ', label: 'Extra whitespace' },
        ].map(({ name, label }, i) => (
          <Stack key={i} alignItems="center" spacing={0.5}>
            <UserInitialsIcon name={name} id={`edge-${i}`} />
            <Typography
              variant="caption"
              sx={{ maxWidth: 80, textAlign: 'center' }}
            >
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};

export const ConsistentColors: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2">
        Same ID always produces the same color, regardless of name
      </Typography>
      <Stack direction="row" spacing={2}>
        {['Alice', 'Bob', 'Charlie'].map((name) => (
          <Stack key={name} alignItems="center" spacing={0.5}>
            <UserInitialsIcon name={name} id="same-id" />
            <Typography variant="caption">{name}</Typography>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption" color="textSecondary">
        All three share id=&quot;same-id&quot; so they share the same background
        color
      </Typography>
    </Stack>
  ),
};
