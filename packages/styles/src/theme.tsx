import { createTheme } from '@mui/material/styles';

/*
 * SOLAR Design System — Biamp
 *
 * Primitive color palette extracted from Figma variables.
 * Semantic tokens are mapped to MUI's palette structure.
 */

// ── Primitive palette ──

const neutral = {
  50: '#f5f5f5',
  100: '#e0e0e0',
  200: '#c4c4c4',
  300: '#a8a8a8',
  400: '#8c8c8c',
  500: '#646464',
  600: '#484848',
  700: '#333333',
  800: '#222222',
  900: '#111111',
} as const;

const red = {
  50: '#ffe4df',
  100: '#ffc5bf',
  300: '#ff5f64',
  400: '#e8243b',
  500: '#e0032d',
  600: '#c00024',
  800: '#7e000f',
  900: '#410001',
} as const;

const green = {
  50: '#ecffe9',
  100: '#b2fbaa',
  300: '#51d845',
  400: '#1fbf14',
  500: '#009600',
  600: '#007a00',
  800: '#084d03',
  900: '#002400',
} as const;

const orange = {
  50: '#ffeeda',
  100: '#ffd9a8',
  400: '#e05500',
  500: '#cf4700',
  600: '#a63800',
} as const;

const blue = {
  50: '#e8eeff',
  100: '#d0dfff',
  400: '#4580ff',
  500: '#2569fd',
  600: '#1a54d4',
} as const;

const turquoise = {
  50: '#f0ffff',
  100: '#c0f5f8',
  400: '#0ad0e3',
  500: '#08b8c9',
  600: '#0896a6',
  700: '#067580',
  800: '#045a61',
} as const;

const yellow = {
  500: '#ecb600',
  600: '#c39900',
} as const;

const purple = {
  100: '#e2d2ff',
  200: '#c5a9ff',
  300: '#a777ff',
  400: '#8e4bff',
  500: '#7b3aff',
  600: '#6226d1',
  700: '#451091',
  800: '#24004b',
  900: '#140028',
} as const;

const brand = {
  red: '#d22730',
  black: '#000000',
  white: '#ffffff',
} as const;

// ── Theme factory ──

export const biampTheme = (
  overrideOptions: Parameters<typeof createTheme>[0] = {},
) =>
  createTheme(
    {
      cssVariables: {
        colorSchemeSelector: 'class',
      },
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: neutral[900],
              light: neutral[700],
              dark: neutral[900],
              contrastText: '#ffffff',
            },
            secondary: {
              main: neutral[500],
              light: neutral[300],
              dark: neutral[700],
              contrastText: '#ffffff',
            },
            error: {
              main: red[500],
              light: red[50],
              dark: red[600],
              contrastText: '#ffffff',
            },
            warning: {
              main: orange[500],
              light: orange[50],
              dark: orange[600],
              contrastText: '#ffffff',
            },
            info: {
              main: turquoise[500],
              light: turquoise[50],
              dark: turquoise[700],
              contrastText: '#ffffff',
            },
            success: {
              main: green[500],
              light: green[50],
              dark: green[600],
              contrastText: '#ffffff',
            },
            grey: neutral,
            text: {
              primary: neutral[900],
              secondary: neutral[500],
              disabled: 'rgba(0,0,0,0.4)',
            },
            divider: 'rgba(0,0,0,0.2)',
            background: {
              default: neutral[50],
              paper: '#ffffff',
            },
            action: {
              hover: 'rgba(0,0,0,0.05)',
              selected: 'rgba(0,0,0,0.05)',
              disabled: 'rgba(0,0,0,0.4)',
              disabledBackground: neutral[100],
            },
          },
        },
        dark: {
          palette: {
            primary: {
              main: neutral[50],
              light: neutral[100],
              dark: neutral[300],
              contrastText: neutral[900],
            },
            secondary: {
              main: neutral[300],
              light: neutral[100],
              dark: neutral[500],
              contrastText: neutral[900],
            },
            error: {
              main: red[400],
              light: red[100],
              dark: red[600],
              contrastText: '#ffffff',
            },
            warning: {
              main: orange[400],
              light: orange[100],
              dark: orange[600],
              contrastText: '#ffffff',
            },
            info: {
              main: turquoise[400],
              light: turquoise[100],
              dark: turquoise[600],
              contrastText: '#ffffff',
            },
            success: {
              main: green[400],
              light: green[100],
              dark: green[600],
              contrastText: '#ffffff',
            },
            grey: neutral,
            text: {
              primary: neutral[50],
              secondary: neutral[300],
              disabled: 'rgba(255,255,255,0.4)',
            },
            divider: 'rgba(255,255,255,0.2)',
            background: {
              default: neutral[900],
              paper: neutral[800],
            },
            action: {
              hover: 'rgba(255,255,255,0.05)',
              selected: 'rgba(255,255,255,0.05)',
              disabled: 'rgba(255,255,255,0.4)',
              disabledBackground: neutral[800],
            },
          },
        },
      },
      typography: {
        fontFamily: '"Inter", sans-serif',
      },
      shape: {
        borderRadius: 8,
      },
      spacing: 8,
    },
    overrideOptions,
  );

// ── Exported primitives for direct use ──

export const solarPalette = {
  neutral,
  red,
  green,
  orange,
  blue,
  turquoise,
  yellow,
  purple,
  brand,
} as const;
