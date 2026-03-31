/**
 * SOLAR Base UI Web v1 2026 — Tailwind CSS Preset
 *
 * Maps the SOLAR design tokens (CSS custom properties) into Tailwind utilities.
 *
 * Usage in consumer's tailwind.config.ts:
 *
 *   import { solarPreset } from '@bwp-web/styles';
 *
 *   export default {
 *     presets: [solarPreset],
 *     content: [
 *       './src/**\/*.{ts,tsx}',
 *       './node_modules/@bwp-web/**\/*.js', // scan library classes
 *     ],
 *   };
 */

import type { Config } from 'tailwindcss';

function cssVar(name: string) {
  return `var(--solar-${name})`;
}

export const solarPreset: Config = {
  // The preset does not define `content` — consumers provide their own.
  content: [],

  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    extend: {
      /* ── Colors ──────────────────────────────────────────────────── */
      colors: {
        // Primitive scales — use for one-off overrides
        brand: {
          50: cssVar('brand-50'),
          100: cssVar('brand-100'),
          200: cssVar('brand-200'),
          300: cssVar('brand-300'),
          400: cssVar('brand-400'),
          500: cssVar('brand-500'),
          600: cssVar('brand-600'),
          700: cssVar('brand-700'),
          800: cssVar('brand-800'),
          900: cssVar('brand-900'),
        },
        neutral: {
          50: cssVar('neutral-50'),
          100: cssVar('neutral-100'),
          200: cssVar('neutral-200'),
          300: cssVar('neutral-300'),
          400: cssVar('neutral-400'),
          500: cssVar('neutral-500'),
          600: cssVar('neutral-600'),
          700: cssVar('neutral-700'),
          800: cssVar('neutral-800'),
          900: cssVar('neutral-900'),
        },
        red: {
          50: cssVar('red-50'),
          100: cssVar('red-100'),
          200: cssVar('red-200'),
          300: cssVar('red-300'),
          400: cssVar('red-400'),
          500: cssVar('red-500'),
          600: cssVar('red-600'),
          700: cssVar('red-700'),
        },
        orange: {
          50: cssVar('orange-50'),
          100: cssVar('orange-100'),
          200: cssVar('orange-200'),
          300: cssVar('orange-300'),
          400: cssVar('orange-400'),
          500: cssVar('orange-500'),
          600: cssVar('orange-600'),
          700: cssVar('orange-700'),
        },
        green: {
          50: cssVar('green-50'),
          100: cssVar('green-100'),
          200: cssVar('green-200'),
          300: cssVar('green-300'),
          400: cssVar('green-400'),
          500: cssVar('green-500'),
          600: cssVar('green-600'),
          700: cssVar('green-700'),
        },
        blue: {
          50: cssVar('blue-50'),
          100: cssVar('blue-100'),
          200: cssVar('blue-200'),
          300: cssVar('blue-300'),
          400: cssVar('blue-400'),
          500: cssVar('blue-500'),
          600: cssVar('blue-600'),
          700: cssVar('blue-700'),
        },

        // Semantic tokens — prefer these in components
        surface: {
          DEFAULT: cssVar('surface-default'),
          secondary: cssVar('surface-secondary'),
          tertiary: cssVar('surface-tertiary'),
          overlay: cssVar('surface-overlay'),
          inverse: cssVar('surface-inverse'),
          brand: cssVar('surface-brand'),
          'brand-subtle': cssVar('surface-brand-subtle'),
          danger: cssVar('surface-danger'),
          warning: cssVar('surface-warning'),
          success: cssVar('surface-success'),
          info: cssVar('surface-info'),
        },
        content: {
          DEFAULT: cssVar('text-default'),
          secondary: cssVar('text-secondary'),
          tertiary: cssVar('text-tertiary'),
          disabled: cssVar('text-disabled'),
          inverse: cssVar('text-inverse'),
          brand: cssVar('text-brand'),
          danger: cssVar('text-danger'),
          warning: cssVar('text-warning'),
          success: cssVar('text-success'),
          info: cssVar('text-info'),
          link: cssVar('text-link'),
        },
        icon: {
          DEFAULT: cssVar('icon-default'),
          secondary: cssVar('icon-secondary'),
          tertiary: cssVar('icon-tertiary'),
          disabled: cssVar('icon-disabled'),
          inverse: cssVar('icon-inverse'),
          brand: cssVar('icon-brand'),
          danger: cssVar('icon-danger'),
        },
        border: {
          DEFAULT: cssVar('border-default'),
          secondary: cssVar('border-secondary'),
          strong: cssVar('border-strong'),
          inverse: cssVar('border-inverse'),
          brand: cssVar('border-brand'),
          danger: cssVar('border-danger'),
          warning: cssVar('border-warning'),
          success: cssVar('border-success'),
          info: cssVar('border-info'),
        },
        action: {
          'primary-bg': cssVar('action-primary-bg'),
          'primary-bg-hover': cssVar('action-primary-bg-hover'),
          'primary-bg-active': cssVar('action-primary-bg-active'),
          'primary-bg-disabled': cssVar('action-primary-bg-disabled'),
          'primary-bg-danger': cssVar('action-primary-bg-danger'),
          'primary-bg-danger-hover': cssVar('action-primary-bg-danger-hover'),
          'primary-bg-danger-active': cssVar('action-primary-bg-danger-active'),
          'primary-text': cssVar('action-primary-text'),
          'primary-text-disabled': cssVar('action-primary-text-disabled'),
          'primary-text-danger': cssVar('action-primary-text-danger'),
          'primary-icon': cssVar('action-primary-icon'),
          'primary-icon-disabled': cssVar('action-primary-icon-disabled'),
          'secondary-bg': cssVar('action-secondary-bg'),
          'secondary-bg-hover': cssVar('action-secondary-bg-hover'),
          'secondary-bg-active': cssVar('action-secondary-bg-active'),
          'secondary-bg-disabled': cssVar('action-secondary-bg-disabled'),
          'secondary-bg-danger': cssVar('action-secondary-bg-danger'),
          'secondary-bg-danger-hover': cssVar(
            'action-secondary-bg-danger-hover',
          ),
          'secondary-text': cssVar('action-secondary-text'),
          'secondary-text-disabled': cssVar('action-secondary-text-disabled'),
          'secondary-text-danger': cssVar('action-secondary-text-danger'),
          'secondary-icon': cssVar('action-secondary-icon'),
          'secondary-icon-disabled': cssVar('action-secondary-icon-disabled'),
          'secondary-icon-danger': cssVar('action-secondary-icon-danger'),
        },
      },

      /* ── Background ─────────────────────────────────────────────── */
      backgroundColor: {
        DEFAULT: cssVar('surface-default'),
      },

      /* ── Text color ─────────────────────────────────────────────── */
      textColor: {
        DEFAULT: cssVar('text-default'),
      },

      /* ── Border color ───────────────────────────────────────────── */
      borderColor: {
        DEFAULT: cssVar('border-default'),
      },

      /* ── Font families ──────────────────────────────────────────── */
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },

      /* ── Font size + line-height combos (SOLAR typography scale) ─ */
      fontSize: {
        // Display
        'display-lg': [
          '3.75rem',
          { lineHeight: '1.13', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'display-md': [
          '3rem',
          { lineHeight: '1.17', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        'display-sm': [
          '2.25rem',
          { lineHeight: '1.22', letterSpacing: '-0.01em', fontWeight: '700' },
        ],
        // Title
        'title-lg': [
          '1.875rem',
          { lineHeight: '1.27', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        'title-md': [
          '1.5rem',
          { lineHeight: '1.33', letterSpacing: '-0.005em', fontWeight: '600' },
        ],
        'title-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'title-xs': ['1.125rem', { lineHeight: '1.44', fontWeight: '600' }],
        // Body
        'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.43', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Label
        'label-md': [
          '0.875rem',
          { lineHeight: '1.43', letterSpacing: '0.01em', fontWeight: '500' },
        ],
        'label-sm': [
          '0.75rem',
          { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '500' },
        ],
        // Helper
        'helper-md': ['0.875rem', { lineHeight: '1.43', fontWeight: '400' }],
        'helper-sm': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Link
        'link-md': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'link-sm': ['0.875rem', { lineHeight: '1.43', fontWeight: '500' }],
        'link-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
        // Code
        'code-md': ['0.875rem', { lineHeight: '1.57', fontWeight: '400' }],
        'code-sm': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
      },

      /* ── Border radius ──────────────────────────────────────────── */
      borderRadius: {
        sm: cssVar('radius-sm'),
        md: cssVar('radius-md'),
        DEFAULT: cssVar('radius-base'),
        lg: cssVar('radius-lg'),
        xl: cssVar('radius-xl'),
      },

      /* ── Box shadows ────────────────────────────────────────────── */
      boxShadow: {
        subtle: cssVar('shadow-subtle'),
        control: cssVar('shadow-control'),
        focus: cssVar('shadow-focus'),
        danger: cssVar('shadow-danger'),
        warning: cssVar('shadow-warning'),
        modal: cssVar('shadow-modal'),
        strong: cssVar('shadow-strong'),
      },
    },
  },

  plugins: [],
};
