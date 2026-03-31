import React from 'react';
import type { Preview } from '@storybook/react-vite';
import '@bwp-web/styles/tokens.css';

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

      return (
        <div
          data-theme={mode}
          className={mode === 'dark' ? 'dark' : ''}
          style={{
            backgroundColor: 'var(--solar-surface-default)',
            color: 'var(--solar-text-default)',
            fontFamily: 'var(--solar-font-sans)',
            minHeight: '100vh',
            ...(!context.parameters.noPadding && { padding: '1.5rem' }),
          }}
        >
          <Story />
        </div>
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
