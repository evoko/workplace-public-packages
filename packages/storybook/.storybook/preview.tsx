import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { biampTheme } from '@bwp-web/styles';
import '@bwp-web/styles/mui-theme-augmentation';

// Create two separate themes, each with ONLY one color scheme.
// This prevents MUI from auto-detecting system preferences or
// fighting over which scheme to show — there's only one option each.
const lightTheme = biampTheme({
  defaultColorScheme: 'light',
  colorSchemes: { dark: false },
});

const darkTheme = biampTheme({
  defaultColorScheme: 'dark',
  colorSchemes: { light: false },
});

const preview: Preview = {
  globalTypes: {
    colorMode: {
      description: 'Color mode for the Biamp theme',
      toolbar: {
        title: 'Color Mode',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorMode: 'light',
  },
  decorators: [
    (Story, context) => {
      // Force light mode in the Docs tab so the story content matches
      // the always-light Storybook docs page background.
      const isDocs = context.viewMode === 'docs';
      const mode = isDocs ? 'light' : context.globals.colorMode || 'light';
      const theme = mode === 'dark' ? darkTheme : lightTheme;

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ ...( !context.parameters.noPadding && { p: 3 }), minHeight: '100vh', bgcolor: 'grey.100', ...( mode === 'dark' && { bgcolor: 'grey.900' }) }}>
            <Story />
          </Box>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
};

export default preview;
