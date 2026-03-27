import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { solarLightTheme, solarDarkTheme } from '@bwp-web/styles';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    colorMode: {
      description: 'Color mode for the SOLAR theme',
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
      const mode = context.globals.colorMode;
      const theme = mode === 'dark' ? solarDarkTheme : solarLightTheme;

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
