// MUI theme augmentations for the SOLAR Base UI design system.
//
// These augmentations are automatically available when you import from
// `@bwp-web/styles` (e.g. `import { solarLightTheme } from '@bwp-web/styles'`).
//
// If your file does not import from `@bwp-web/styles` but still needs the
// augmented types (e.g. a standalone component file that only uses
// `useTheme()`), add a single global declaration file to your project:
//
//   // src/global.d.ts
//   /// <reference types="@bwp-web/styles/mui-theme-augmentation" />
//

import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: PaletteColor & {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  }

  interface PaletteOptions {
    neutral?: PaletteColorOptions & {
      50?: string;
      100?: string;
      200?: string;
      300?: string;
      400?: string;
      500?: string;
      600?: string;
      700?: string;
      800?: string;
      900?: string;
    };
  }
}
