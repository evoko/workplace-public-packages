import type { Preview } from '@storybook/react-vite';

// Cleared ahead of the new design system.
// The previous preview wrapped every story in a MUI ThemeProvider and
// exposed a light/dark toolbar driven by the old theme. Both are gone.
// Re-add a decorator here once the new design system ships a provider.
const preview: Preview = {
  tags: ['autodocs'],
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
