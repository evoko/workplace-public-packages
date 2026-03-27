import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { biampTheme } from '@bwp-web/styles';

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
  tags: ['autodocs'],
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
      const mode = context.globals.colorMode ;
      const theme = mode === 'dark' ? darkTheme : lightTheme;

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              ...(!context.parameters.noPadding && { p: 3 }),
              height: '100vh',
            }}
          >
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
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
