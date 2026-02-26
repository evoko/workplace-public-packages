// MUI theme augmentations for the Biamp Workplace design system.
//
// These augmentations are automatically available when you import from
// `@bwp-web/styles` (e.g. `import { biampTheme } from '@bwp-web/styles'`).
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
    sidebar: PaletteColor;
    biamp: PaletteColor;
    blue: PaletteColor;
    purple: PaletteColor;
    dividers: {
      primary: string;
      secondary: string;
    };
  }

  interface PaletteOptions {
    sidebar?: PaletteColorOptions;
    biamp?: PaletteColorOptions;
    blue?: PaletteColorOptions;
    purple?: PaletteColorOptions;
    dividers?: {
      primary: string;
      secondary: string;
    };
  }

  interface TypeBackground {
    success: string;
    warning: string;
    error: string;
    info: string;
  }

  interface TypeText {
    sidebar?: string;
  }

  interface TypographyVariants {
    h0: React.CSSProperties;
    sidebar: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    h0?: React.CSSProperties;
    sidebar?: React.CSSProperties;
  }
}

declare module '@mui/material/Alert' {
  interface AlertPropsVariantOverrides {
    filled: false;
    outlined: false;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    biamp: true;
  }

  interface ButtonPropsVariantOverrides {
    overlay: true;
  }
}

declare module '@mui/material/Checkbox' {
  interface CheckboxPropsColorOverrides {
    biamp: true;
  }
}

declare module '@mui/material/Fab' {
  interface FabPropsColorOverrides {
    biamp: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h0: true;
    sidebar: true;
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonOwnProps {
    variant?: 'none' | 'transparent' | 'outlined';
  }
}
