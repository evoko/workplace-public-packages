/**
 * SOLAR Base UI Web v1 2026 — MUI Theme
 *
 * Extracted from: https://www.figma.com/design/OGvmMNnywH7JWDyEhOzjcc/
 * Token system: color.* semantic tokens (Light / Dark modes)
 * Typography: display / title / body / label / helper / code / link scales
 * Effects: shadow/* (control, subtle, focus, modal, danger, warning, strong)
 *
 * Usage:
 *   import { solarLightTheme, solarDarkTheme } from './solarTheme';
 *   <ThemeProvider theme={isDark ? solarDarkTheme : solarLightTheme}>
 */

import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// ─── Primitive palette ────────────────────────────────────────────────────────
// Inferred from semantic token names visible in the design file
const primitives = {
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  neutral: {
    50: '#F9FAFB',
    100: '#F2F4F7',
    200: '#E4E7EC',
    300: '#D0D5DD',
    400: '#98A2B3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1D2939',
    900: '#101828',
  },
  // Brand (primary action)
  brand: {
    white: '#FFFFFF',
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  // Feedback
  red: {
    50: '#FFF1F0',
    100: '#FFCCC7',
    200: '#FFA39E',
    300: '#FF7875',
    400: '#FF4D4F',
    500: '#F5222D',
    600: '#CF1322',
    700: '#A8071A',
  },
  orange: {
    50: '#FFF7E6',
    100: '#FFE7BA',
    200: '#FFD591',
    300: '#FFC069',
    400: '#FFA940',
    500: '#FA8C16',
    600: '#D46B08',
    700: '#AD4E00',
  },
  green: {
    50: '#F6FFED',
    100: '#D9F7BE',
    200: '#B7EB8F',
    300: '#95DE64',
    400: '#73D13D',
    500: '#52C41A',
    600: '#389E0D',
    700: '#237804',
  },
  blue: {
    50: '#E6F4FF',
    100: '#BAE0FF',
    200: '#91CAFF',
    300: '#69B1FF',
    400: '#4096FF',
    500: '#1677FF',
    600: '#0958D9',
    700: '#003EB3',
  },
  // Alpha tokens
  alpha: {
    'blue-10': alpha('#1677FF', 0.1),
    'red-05': alpha('#F5222D', 0.05),
    'red-10': alpha('#F5222D', 0.1),
  },
} as const;

// ─── Semantic color tokens ─────────────────────────────────────────────────
// Derived from the design file's color.* token system (Light / Dark)
const semanticTokens = {
  light: {
    // Surface
    'surface.default': primitives.white,
    'surface.secondary': primitives.neutral[50],
    'surface.tertiary': primitives.neutral[100],
    'surface.overlay': primitives.white,
    'surface.inverse': primitives.neutral[900],
    'surface.brand': primitives.brand[500],
    'surface.brand.subtle': primitives.brand[50],
    'surface.danger': primitives.red[50],
    'surface.warning': primitives.orange[50],
    'surface.success': primitives.green[50],
    'surface.info': primitives.blue[50],

    // Text
    'text.default': primitives.neutral[900],
    'text.secondary': primitives.neutral[700],
    'text.tertiary': primitives.neutral[500],
    'text.disabled': primitives.neutral[300],
    'text.inverse': primitives.white,
    'text.brand': primitives.brand[600],
    'text.danger': primitives.red[500],
    'text.warning': primitives.orange[600],
    'text.success': primitives.green[600],
    'text.info': primitives.blue[600],
    'text.link': primitives.brand[600],

    // Icon
    'icon.default': primitives.neutral[900],
    'icon.secondary': primitives.neutral[700],
    'icon.tertiary': primitives.neutral[500],
    'icon.disabled': primitives.neutral[300],
    'icon.inverse': primitives.white,
    'icon.brand': primitives.brand[500],
    'icon.danger': primitives.red[500],

    // Border (Neutral)
    'border.default': primitives.neutral[200],
    'border.secondary': primitives.neutral[300],
    'border.strong': primitives.neutral[400],
    'border.inverse': primitives.neutral[800],
    'border.brand': primitives.brand[500],

    // Border (Feedback)
    'border.danger.default': primitives.red[500],
    'border.warning.default': primitives.orange[500],
    'border.success.default': primitives.green[500],
    'border.info.default': primitives.blue[500],

    // Action — Primary
    'action.primary.bg.default': primitives.brand[600],
    'action.primary.bg.hover': primitives.brand[700],
    'action.primary.bg.active': primitives.brand[700],
    'action.primary.bg.disabled': primitives.neutral[100],
    'action.primary.bg.danger.default': primitives.red[500],
    'action.primary.bg.danger.hover': primitives.red[600],
    'action.primary.bg.danger.active': primitives.red[700],
    'action.primary.bg.danger.disabled': primitives.neutral[100],
    'action.primary.text.default': primitives.white,
    'action.primary.text.hover': primitives.white,
    'action.primary.text.active': primitives.white,
    'action.primary.text.disabled': primitives.neutral[400],
    'action.primary.text.danger.default': primitives.white,
    'action.primary.text.danger.disabled': primitives.neutral[400],
    'action.primary.icon.default': primitives.brand.white,
    'action.primary.icon.hover': primitives.white,
    'action.primary.icon.active': primitives.white,
    'action.primary.icon.disabled': primitives.neutral[300],

    // Action — Secondary
    'action.secondary.bg.default': 'transparent',
    'action.secondary.bg.hover': primitives.neutral[50],
    'action.secondary.bg.active': primitives.neutral[100],
    'action.secondary.bg.disabled': primitives.neutral[100],
    'action.secondary.bg.danger.default': 'transparent',
    'action.secondary.bg.danger.hover': primitives.alpha['red-05'],
    'action.secondary.bg.danger.active': 'transparent',
    'action.secondary.bg.danger.disabled': primitives.neutral[100],
    'action.secondary.text.default': primitives.neutral[900],
    'action.secondary.text.hover': primitives.neutral[900],
    'action.secondary.text.active': primitives.neutral[900],
    'action.secondary.text.disabled': primitives.neutral[300],
    'action.secondary.text.danger.default': primitives.red[500],
    'action.secondary.text.danger.hover': primitives.red[500],
    'action.secondary.text.danger.active': primitives.red[500],
    'action.secondary.text.danger.disabled': primitives.neutral[300],
    'action.secondary.icon.default': primitives.neutral[900],
    'action.secondary.icon.hover': primitives.neutral[900],
    'action.secondary.icon.active': primitives.neutral[900],
    'action.secondary.icon.disabled': primitives.neutral[300],
    'action.secondary.icon.danger.default': primitives.red[500],

    // Shadow colors
    'shadow.default': alpha(primitives.black, 0.1),
    'shadow.focus': primitives.alpha['blue-10'],
    'shadow.danger': primitives.alpha['red-10'],
  },

  dark: {
    // Surface
    'surface.default': primitives.neutral[900],
    'surface.secondary': primitives.neutral[800],
    'surface.tertiary': primitives.neutral[700],
    'surface.overlay': primitives.neutral[800],
    'surface.inverse': primitives.white,
    'surface.brand': primitives.brand[500],
    'surface.brand.subtle': primitives.brand[900],
    'surface.danger': primitives.red[700],
    'surface.warning': primitives.orange[700],
    'surface.success': primitives.green[700],
    'surface.info': primitives.blue[700],

    // Text
    'text.default': primitives.neutral[50],
    'text.secondary': primitives.neutral[300],
    'text.tertiary': primitives.neutral[500],
    'text.disabled': primitives.neutral[500],
    'text.inverse': primitives.neutral[900],
    'text.brand': primitives.brand[300],
    'text.danger': primitives.red[400],
    'text.warning': primitives.orange[400],
    'text.success': primitives.green[400],
    'text.info': primitives.blue[300],
    'text.link': primitives.brand[300],

    // Icon
    'icon.default': primitives.neutral[50],
    'icon.secondary': primitives.neutral[300],
    'icon.tertiary': primitives.neutral[500],
    'icon.disabled': primitives.neutral[500],
    'icon.inverse': primitives.neutral[900],
    'icon.brand': primitives.brand[300],
    'icon.danger': primitives.red[400],

    // Border
    'border.default': primitives.neutral[700],
    'border.secondary': primitives.neutral[600],
    'border.strong': primitives.neutral[500],
    'border.inverse': primitives.neutral[100],
    'border.brand': primitives.brand[400],
    'border.danger.default': primitives.red[500],
    'border.warning.default': primitives.orange[500],
    'border.success.default': primitives.green[500],
    'border.info.default': primitives.blue[400],

    // Action — Primary
    'action.primary.bg.default': primitives.brand[500],
    'action.primary.bg.hover': primitives.brand[400],
    'action.primary.bg.active': primitives.brand[300],
    'action.primary.bg.disabled': primitives.neutral[800],
    'action.primary.text.default': primitives.neutral[900],
    'action.primary.text.disabled': primitives.neutral[300],
    'action.primary.icon.default': primitives.brand.white,

    // Action — Secondary
    'action.secondary.bg.default': 'transparent',
    'action.secondary.bg.hover': primitives.neutral[800],
    'action.secondary.bg.active': primitives.neutral[700],
    'action.secondary.bg.disabled': primitives.neutral[800],
    'action.secondary.text.default': primitives.neutral[50],
    'action.secondary.text.hover': primitives.neutral[50],
    'action.secondary.text.active': primitives.neutral[50],
    'action.secondary.text.disabled': primitives.neutral[500],
    'action.secondary.text.danger.default': primitives.red[500],
    'action.secondary.icon.default': primitives.neutral[50],
    'action.secondary.icon.disabled': primitives.neutral[500],
    'action.secondary.icon.danger.default': primitives.red[500],

    'shadow.default': alpha(primitives.black, 0.3),
    'shadow.focus': primitives.alpha['blue-10'],
    'shadow.danger': primitives.alpha['red-10'],
  },
} as const;

// ─── Typography scale ──────────────────────────────────────────────────────
// From Figma text styles (display / title / body / label / helper / code / link)
// Base font: Inter (or system sans as fallback)
const fontFamily = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';
const fontFamilyMono =
  '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace';

const typography = {
  fontFamily,
  // display/lg — hero headings
  displayLg: {
    fontSize: '3.75rem',
    lineHeight: 1.13,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  // display/md
  displayMd: {
    fontSize: '3rem',
    lineHeight: 1.17,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  // display/sm
  displaySm: {
    fontSize: '2.25rem',
    lineHeight: 1.22,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  // title/lg
  titleLg: {
    fontSize: '1.875rem',
    lineHeight: 1.27,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  // title/md
  titleMd: {
    fontSize: '1.5rem',
    lineHeight: 1.33,
    fontWeight: 600,
    letterSpacing: '-0.005em',
  },
  // title/sm
  titleSm: { fontSize: '1.25rem', lineHeight: 1.4, fontWeight: 600 },
  // title/xs
  titleXs: { fontSize: '1.125rem', lineHeight: 1.44, fontWeight: 600 },
  // body/md — regular, medium, semibold, bold
  bodyMdRegular: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 400 },
  bodyMdMedium: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 },
  bodyMdSemibold: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 },
  bodyMdBold: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 700 },
  // body/sm
  bodySmRegular: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 400 },
  bodySmMedium: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 500 },
  bodySmSemibold: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 600 },
  bodySmBold: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 700 },
  // body/xs
  bodyXsRegular: { fontSize: '0.75rem', lineHeight: 1.5, fontWeight: 400 },
  bodyXsMedium: { fontSize: '0.75rem', lineHeight: 1.5, fontWeight: 500 },
  bodyXsSemibold: { fontSize: '0.75rem', lineHeight: 1.5, fontWeight: 600 },
  bodyXsBold: { fontSize: '0.75rem', lineHeight: 1.5, fontWeight: 700 },
  // label
  labelMd: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
  labelSm: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
  // helper
  helperMd: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 400 },
  helperSm: { fontSize: '0.75rem', lineHeight: 1.5, fontWeight: 400 },
  // link
  linkMd: {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 500,
    textDecoration: 'underline',
  },
  linkSm: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
    fontWeight: 500,
    textDecoration: 'underline',
  },
  linkXs: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    fontWeight: 500,
    textDecoration: 'underline',
  },
  // code
  codeMd: {
    fontFamily: fontFamilyMono,
    fontSize: '0.875rem',
    lineHeight: 1.57,
    fontWeight: 400,
  },
  codeSm: {
    fontFamily: fontFamilyMono,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
} as const;

// ─── Shadow scale (from shadow/* effect styles) ────────────────────────────
const shadows = {
  subtle: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  control:
    '0px 1px 2px rgba(16, 24, 40, 0.06), 0px 1px 3px rgba(16, 24, 40, 0.10)',
  focus: `0px 0px 0px 4px ${alpha('#1677FF', 0.1)}`,
  danger: `0px 0px 0px 4px ${alpha('#F5222D', 0.1)}`,
  warning: `0px 0px 0px 4px ${alpha('#FA8C16', 0.1)}`,
  modal: '0px 8px 24px rgba(16, 24, 40, 0.18)',
  strong: '0px 24px 48px rgba(16, 24, 40, 0.25)',
} as const;

// ─── Shared shape ──────────────────────────────────────────────────────────
const shape = {
  borderRadius: 8, // 8px base radius
};

// ─── Theme builder ─────────────────────────────────────────────────────────
function buildThemeOptions(mode: 'light' | 'dark'): ThemeOptions {
  const t = semanticTokens[mode];
  const isDark = mode === 'dark';

  return {
    palette: {
      mode,
      background: {
        default: t['surface.default'],
        paper: t['surface.secondary'],
      },
      text: {
        primary: t['text.default'],
        secondary: t['text.secondary'],
        disabled: t['text.disabled'],
      },
      primary: {
        main: t['action.primary.bg.default'],
        dark: t['action.primary.bg.hover'],
        contrastText: t['action.primary.text.default'],
      },
      secondary: {
        main: t['action.secondary.bg.hover'],
        contrastText: t['action.secondary.text.default'],
      },
      error: {
        main: primitives.red[500],
        dark: primitives.red[600],
        light: primitives.red[300],
        contrastText: primitives.white,
      },
      warning: {
        main: primitives.orange[500],
        dark: primitives.orange[600],
        light: primitives.orange[300],
        contrastText: primitives.white,
      },
      success: {
        main: primitives.green[500],
        dark: primitives.green[600],
        light: primitives.green[300],
        contrastText: primitives.white,
      },
      info: {
        main: primitives.blue[500],
        dark: primitives.blue[600],
        light: primitives.blue[300],
        contrastText: primitives.white,
      },
      divider: t['border.default'],

      neutral: {
        ...primitives.neutral,
        main: primitives.neutral[500],
        contrastText: primitives.white,
      },
    },

    typography: {
      fontFamily,
      // Map SOLAR scale to MUI variants
      h1: { ...typography.displayLg },
      h2: { ...typography.displayMd },
      h3: { ...typography.displaySm },
      h4: { ...typography.titleLg },
      h5: { ...typography.titleMd },
      h6: { ...typography.titleSm },
      subtitle1: { ...typography.titleXs },
      subtitle2: { ...typography.labelMd },
      body1: { ...typography.bodyMdRegular },
      body2: { ...typography.bodySmRegular },
      caption: { ...typography.helperSm },
      overline: { ...typography.labelSm, textTransform: 'uppercase' },
      button: { ...typography.labelMd, textTransform: 'none' },
    },

    shape,

    shadows: [
      'none',
      shadows.subtle, // 1
      shadows.control, // 2
      shadows.control, // 3
      shadows.modal, // 4
      shadows.modal, // 5
      shadows.strong, // 6
      shadows.strong, // 7
      shadows.strong, // 8
      shadows.strong, // 9
      shadows.strong, // 10
      shadows.strong, // 11
      shadows.strong, // 12
      shadows.strong, // 13
      shadows.strong, // 14
      shadows.strong, // 15
      shadows.strong, // 16
      shadows.strong, // 17
      shadows.strong, // 18
      shadows.strong, // 19
      shadows.strong, // 20
      shadows.strong, // 21
      shadows.strong, // 22
      shadows.strong, // 23
      shadows.strong, // 24
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,

    components: {
      // ── Button ──────────────────────────────────────────────────────────
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: shape.borderRadius,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
            '&:active': { boxShadow: 'none' },
          },
          containedPrimary: {
            backgroundColor: t['action.primary.bg.default'],
            color: t['action.primary.text.default'],
            '&:hover': { backgroundColor: t['action.primary.bg.hover'] },
            '&:active': { backgroundColor: t['action.primary.bg.active'] },
            '&.Mui-disabled': {
              backgroundColor: t['action.primary.bg.disabled'],
              color: t['action.primary.text.disabled'],
            },
          },
          outlinedPrimary: {
            backgroundColor: t['action.secondary.bg.default'],
            borderColor: t['border.default'],
            color: t['action.secondary.text.default'],
            '&:hover': {
              backgroundColor: t['action.secondary.bg.hover'],
              borderColor: t['border.secondary'],
            },
            '&:active': { backgroundColor: t['action.secondary.bg.active'] },
            '&.Mui-disabled': {
              backgroundColor: t['action.secondary.bg.disabled'],
              color: t['action.secondary.text.disabled'],
            },
          },
          textPrimary: {
            color: t['action.secondary.text.default'],
            '&:hover': { backgroundColor: t['action.secondary.bg.hover'] },
            '&:active': { backgroundColor: t['action.secondary.bg.active'] },
          },
          sizeSmall: { ...typography.labelSm, padding: '6px 12px' },
          sizeMedium: { ...typography.labelMd, padding: '8px 16px' },
          sizeLarge: { ...typography.bodyMdMedium, padding: '10px 20px' },
        },
      },

      // ── TextField / Input ───────────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: shape.borderRadius,
            backgroundColor: t['surface.default'],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: t['border.default'],
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: t['border.secondary'],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: t['action.primary.bg.default'],
              borderWidth: 1,
              boxShadow: shadows.focus,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: t['border.danger.default'],
            },
            '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
              boxShadow: shadows.danger,
            },
            '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: t['border.default'],
            },
          },
          input: {
            ...typography.bodyMdRegular,
            color: t['text.default'],
            '&::placeholder': { color: t['text.tertiary'], opacity: 1 },
          },
        },
      },

      MuiFormLabel: {
        styleOverrides: {
          root: {
            ...typography.labelMd,
            color: t['text.secondary'],
            '&.Mui-focused': { color: t['text.secondary'] },
            '&.Mui-error': { color: t['text.danger'] },
          },
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: {
            ...typography.helperSm,
            color: t['text.tertiary'],
            '&.Mui-error': { color: t['text.danger'] },
          },
        },
      },

      // ── Card ────────────────────────────────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: shape.borderRadius,
            border: `1px solid ${t['border.default']}`,
            boxShadow: shadows.subtle,
            backgroundColor: t['surface.default'],
          },
        },
      },

      // ── Chip ────────────────────────────────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            ...typography.labelSm,
            height: 22,
          },
          outlined: {
            borderColor: t['border.default'],
            color: t['text.secondary'],
            backgroundColor: 'transparent',
          },
        },
      },

      // ── Dialog ──────────────────────────────────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            boxShadow: shadows.modal,
            backgroundColor: t['surface.default'],
            border: `1px solid ${t['border.default']}`,
          },
        },
      },

      // ── Divider ─────────────────────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t['border.default'] },
        },
      },

      // ── Tooltip ─────────────────────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            ...typography.bodySmRegular,
            backgroundColor: isDark
              ? primitives.neutral[700]
              : primitives.neutral[900],
            color: primitives.white,
            borderRadius: 6,
            padding: '6px 10px',
          },
        },
      },

      // ── Table ───────────────────────────────────────────────────────────
      MuiTableHead: {
        styleOverrides: {
          root: { backgroundColor: t['surface.secondary'] },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            ...typography.labelMd,
            color: t['text.secondary'],
            borderBottomColor: t['border.default'],
            padding: '12px 16px',
          },
          body: {
            ...typography.bodySmRegular,
            color: t['text.default'],
            borderBottomColor: t['border.default'],
            padding: '16px',
          },
        },
      },

      // ── Select ──────────────────────────────────────────────────────────
      MuiSelect: {
        styleOverrides: {
          icon: { color: t['icon.secondary'] },
        },
      },

      // ── Checkbox / Radio ─────────────────────────────────────────────
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: t['border.secondary'],
            '&.Mui-checked': { color: t['action.primary.bg.default'] },
            '&.Mui-disabled': { color: t['text.disabled'] },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: t['border.secondary'],
            '&.Mui-checked': { color: t['action.primary.bg.default'] },
          },
        },
      },

      // ── Switch ──────────────────────────────────────────────────────────
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: t['action.primary.bg.default'],
              '+ .MuiSwitch-track': {
                backgroundColor: t['action.primary.bg.default'],
              },
            },
            '&.Mui-disabled': {
              color: t['text.disabled'],
              '+ .MuiSwitch-track': { backgroundColor: t['border.default'] },
            },
          },
          track: { backgroundColor: t['border.secondary'] },
        },
      },

      // ── Alert ───────────────────────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: shape.borderRadius,
            border: '1px solid',
            ...typography.bodySmRegular,
          },
          standardError: {
            backgroundColor: t['surface.danger'],
            borderColor: t['border.danger.default'],
            color: t['text.danger'],
          },
          standardWarning: {
            backgroundColor: t['surface.warning'],
            borderColor: t['border.warning.default'],
            color: t['text.warning'],
          },
          standardSuccess: {
            backgroundColor: t['surface.success'],
            borderColor: t['border.success.default'],
            color: t['text.success'],
          },
          standardInfo: {
            backgroundColor: t['surface.info'],
            borderColor: t['border.info.default'],
            color: t['text.info'],
          },
        },
      },

      // ── Breadcrumbs ──────────────────────────────────────────────────────
      MuiBreadcrumbs: {
        styleOverrides: {
          root: { ...typography.bodySmRegular },
          separator: { color: t['text.tertiary'] },
          li: {
            '& .MuiBreadcrumbs-ol a': {
              color: t['text.link'],
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            },
          },
        },
      },

      // ── Skeleton ─────────────────────────────────────────────────────────
      MuiSkeleton: {
        styleOverrides: {
          root: { backgroundColor: t['surface.tertiary'] },
        },
      },

      // ── Link ─────────────────────────────────────────────────────────────
      MuiLink: {
        styleOverrides: {
          root: {
            color: t['text.link'],
            ...typography.linkMd,
            '&:hover': { color: t['text.brand'] },
          },
        },
      },

      // ── Tabs ─────────────────────────────────────────────────────────────
      MuiTab: {
        styleOverrides: {
          root: {
            ...typography.labelMd,
            textTransform: 'none',
            color: t['text.tertiary'],
            '&.Mui-selected': { color: t['action.primary.bg.default'] },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { backgroundColor: t['action.primary.bg.default'] },
          root: { borderBottom: `1px solid ${t['border.default']}` },
        },
      },

      // ── CssBaseline ──────────────────────────────────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: t['surface.default'],
            color: t['text.default'],
            fontFamily,
          },
          code: { ...typography.codeMd },
          pre: {
            ...typography.codeMd,
            backgroundColor: t['surface.secondary'],
            padding: 16,
            borderRadius: shape.borderRadius,
          },
        },
      },
    },
  };
}

// ─── Export named themes ───────────────────────────────────────────────────
export const solarLightTheme = createTheme(buildThemeOptions('light'));
export const solarDarkTheme = createTheme(buildThemeOptions('dark'));

// ─── Custom typography helpers (use with sx or styled) ────────────────────
export {
  typography as solarTypography,
  shadows as solarShadows,
  primitives as solarPrimitives,
};
