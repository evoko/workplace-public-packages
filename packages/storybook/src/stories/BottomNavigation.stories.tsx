import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FolderIcon from '@mui/icons-material/Folder';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Styles/BottomNavigation',
  component: BottomNavigation,
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

const BasicDemo = () => {
  const [value, setValue] = useState(0);
  return (
    <Box sx={{ width: 500 }}>
      <Paper elevation={3}>
        <BottomNavigation
          value={value}
          onChange={(_, v) => setValue(v)}
          showLabels
        >
          <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
          <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
          <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} />
          <BottomNavigationAction label="Folder" icon={<FolderIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export const Basic: Story = {
  render: () => <BasicDemo />,
};

const NoLabelsDemo = () => {
  const [value, setValue] = useState(0);
  return (
    <Box sx={{ width: 500 }}>
      <Paper elevation={3}>
        <BottomNavigation value={value} onChange={(_, v) => setValue(v)}>
          <BottomNavigationAction icon={<RestoreIcon />} />
          <BottomNavigationAction icon={<FavoriteIcon />} />
          <BottomNavigationAction icon={<LocationOnIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export const NoLabels: Story = {
  render: () => <NoLabelsDemo />,
};
