import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Drawer,
  type DrawerProps,
  Button,
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  StyledEngineProvider,
} from '@mui/material';

const meta: Meta<typeof Drawer> = {
  title: 'Styles/Drawer',
  component: Drawer,
  argTypes: {
    anchor: {
      control: 'inline-radio',
      options: ['left', 'right', 'top', 'bottom'],
    },
    variant: {
      control: 'inline-radio',
      options: ['temporary', 'persistent', 'permanent'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

function DrawerContent({ anchor }: { anchor: DrawerProps['anchor'] }) {
  return (
    <Box sx={{ pt: 2, minWidth: 240 }}>
      <Typography variant="h2" sx={{ px: 2, pb: 2 }}>
        {anchor} drawer
      </Typography>
      <Divider />
      <List>
        {['Dashboard', 'Users', 'Analytics', 'Settings'].map((text, index) => (
          <ListItemButton key={text} selected={index === 0}>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        {['Inbox', 'Mail'].map((text) => (
          <ListItemButton key={text}>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

function DrawerDemo({
  anchor = 'left',
  variant = 'temporary',
  ...rest
}: DrawerProps) {
  const [open, setOpen] = useState(false);
  const isPermanent = variant === 'permanent';

  return (
    <Stack spacing={2}>
      <Typography variant="h3">
        Drawer — anchor: {anchor}, variant: {variant}
      </Typography>
      {!isPermanent && (
        <Button
          variant="contained"
          onClick={() => setOpen((prev) => !prev)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {open ? 'Close' : 'Open'} drawer
        </Button>
      )}
      <Drawer
        anchor={anchor}
        variant={variant}
        open={isPermanent ? true : open}
        onClose={() => setOpen(false)}
        {...rest}
      >
        <DrawerContent anchor={anchor} />
      </Drawer>
    </Stack>
  );
}

/** Anchor and variant are controllable from the Storybook controls panel. */
export const Playground: Story = {
  args: { anchor: 'left', variant: 'temporary' },
  render: (args) => <DrawerDemo {...args} />,
};

export const Left: Story = {
  render: () => <DrawerDemo anchor="left" />,
};

export const Right: Story = {
  render: () => <DrawerDemo anchor="right" />,
};

export const Top: Story = {
  render: () => <DrawerDemo anchor="top" />,
};

export const Bottom: Story = {
  render: () => <DrawerDemo anchor="bottom" />,
};

export const Persistent: Story = {
  render: () => <DrawerDemo anchor="left" variant="persistent" />,
};

/** Repro harness: mirrors workplace-web's `<StyledEngineProvider injectFirst>`. */
export const InjectFirst: Story = {
  render: () => (
    <StyledEngineProvider injectFirst>
      <DrawerDemo anchor="left" />
    </StyledEngineProvider>
  ),
};
