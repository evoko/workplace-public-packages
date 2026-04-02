import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, Tab, Box, Typography, Stack } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonPinIcon from '@mui/icons-material/PersonPin';

const meta: Meta<typeof Tabs> = {
  title: 'Styles/Tabs',
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const BasicTabsDemo = () => {
  const [value, setValue] = useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={(_, v) => setValue(v)}>
        <Tab label="Item One" />
        <Tab label="Item Two" />
        <Tab label="Item Three" />
      </Tabs>
      <Box sx={{ p: 2 }}>
        <Typography>Tab content {value + 1}</Typography>
      </Box>
    </Box>
  );
};

export const Basic: Story = {
  render: () => <BasicTabsDemo />,
};

export const Colors: Story = {
  render: () => {
    const [v, setV] = useState(0);
    return (
      <Stack spacing={3}>
        <Tabs
          value={v}
          onChange={(_, n) => setV(n)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Primary" />
          <Tab label="Primary" />
        </Tabs>
        <Tabs
          value={v}
          onChange={(_, n) => setV(n)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="Secondary" />
          <Tab label="Secondary" />
        </Tabs>
      </Stack>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [v, setV] = useState(0);
    return (
      <Stack spacing={3}>
        <Typography variant="subtitle2">Icons only</Typography>
        <Tabs value={v} onChange={(_, n) => setV(n)}>
          <Tab icon={<PhoneIcon />} />
          <Tab icon={<FavoriteIcon />} />
          <Tab icon={<PersonPinIcon />} />
        </Tabs>
        <Typography variant="subtitle2">Icon + label</Typography>
        <Tabs value={v} onChange={(_, n) => setV(n)}>
          <Tab icon={<PhoneIcon />} label="Recents" />
          <Tab icon={<FavoriteIcon />} label="Favorites" />
          <Tab icon={<PersonPinIcon />} label="Nearby" />
        </Tabs>
      </Stack>
    );
  },
};

export const Centered: Story = {
  render: () => {
    const [v, setV] = useState(0);
    return (
      <Tabs value={v} onChange={(_, n) => setV(n)} centered>
        <Tab label="Item One" />
        <Tab label="Item Two" />
        <Tab label="Item Three" />
      </Tabs>
    );
  },
};

export const Scrollable: Story = {
  render: () => {
    const [v, setV] = useState(0);
    return (
      <Box sx={{ maxWidth: 480 }}>
        <Tabs
          value={v}
          onChange={(_, n) => setV(n)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <Tab key={i} label={`Item ${i + 1}`} />
          ))}
        </Tabs>
      </Box>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [v, setV] = useState(0);
    return (
      <Tabs value={v} onChange={(_, n) => setV(n)}>
        <Tab label="Active" />
        <Tab label="Disabled" disabled />
        <Tab label="Active" />
      </Tabs>
    );
  },
};
