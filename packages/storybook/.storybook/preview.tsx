import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { biampTheme } from '@bwp-web/styles';

const lightTheme = biampTheme({
  defaultColorScheme: 'light',
  colorSchemes: { dark: false },
});

const darkTheme = biampTheme({
  defaultColorScheme: 'dark',
  colorSchemes: { light: false },
});

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    colorMode: {
      description: 'Color mode',
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
      const isDocs = context.viewMode === 'docs';
      const mode = isDocs ? 'light' : context.globals.colorMode || 'light';
      const theme = mode === 'dark' ? darkTheme : lightTheme;

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ p: 3 }}>
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
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
