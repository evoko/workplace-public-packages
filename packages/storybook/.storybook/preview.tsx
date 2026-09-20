import { createBwpTheme } from '@bwp-web/styles-mui';
import { ThemeProvider } from '@mui/material/styles';
import type { Preview } from '@storybook/react-vite';
import * as React from 'react';

import { storiesConfig } from '../src/generated/config';
import { applyMode } from '../src/harness/mode';

const theme = createBwpTheme();

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    dsMode: {
      description: 'Design-system color mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: storiesConfig.modes,
        dynamicTitle: true,
      },
    },
    dsTargets: {
      description: 'Which target columns the compare grids show',
      toolbar: {
        title: 'Targets',
        icon: 'component',
        items: ['all', 'css', 'tailwind', 'mui'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { dsMode: storiesConfig.defaultMode, dsTargets: 'all' },
  decorators: [
    (Story, context) => {
      const mode = context.globals.dsMode as string;
      React.useEffect(() => {
        applyMode(storiesConfig.mode, mode);
      }, [mode]);
      return (
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    layout: 'padded',
    a11y: { test: 'todo' },
  },
};

export default preview;
