import React from 'react';
import Box from '@mui/material/Box';

/**
 * A full-page content wrapper that stretches to fill all available space
 * with a grey.100 (#F5F5F5) background and responsive padding around the content.
 * Mobile: 16px, Desktop: 20px.
 */

// TODO: Perhaps include a "withHeader" prop to include the header in the wrapper 
export const BiampWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        padding: { xs: '16px', md: '20px' },
        backgroundColor: 'grey.900',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          borderRadius: '8px',
          overflow: 'auto',
          backgroundColor: 'background.default',
          flexGrow: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
