import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import './preview.css';
import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

// Light and Dark are token reassignment, as in an app: tokens.css switches every
// --solar-* value under [data-theme='dark'], and no component knows which is showing.
const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: { layout: 'padded' },
};

export default preview;
