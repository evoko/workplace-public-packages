import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export interface HeaderProps {
  /** The title displayed in the header */
  title?: string;
  /** Content rendered on the left side of the header (e.g. logo, navigation) */
  startContent?: React.ReactNode;
  /** Content rendered on the right side of the header (e.g. user menu, actions) */
  endContent?: React.ReactNode;
  /** Additional props passed to the MUI AppBar */
  appBarProps?: React.ComponentProps<typeof AppBar>;
}

/**
 * A skeleton header component built on MUI AppBar.
 * Provides a simple layout with a title and optional start/end content slots.
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  startContent,
  endContent,
  appBarProps,
}) => {
  return (
    <AppBar position="static" {...appBarProps}>
      <Toolbar>
        {startContent && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            {startContent}
          </Box>
        )}

        {title && (
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        )}

        {!title && <Box sx={{ flexGrow: 1 }} />}

        {endContent && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {endContent}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
