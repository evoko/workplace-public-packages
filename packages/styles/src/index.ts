/**
 * `@bwp-web/styles`: SOLAR's tokens as framework-agnostic data. Imports nothing.
 *
 * Each audience takes only its own entry:
 *
 * - plain CSS  `@bwp-web/styles/tokens.css`
 * - Tailwind 4 `@bwp-web/styles/tailwind.css` (brings tokens.css with it)
 * - MUI        `@bwp-web/styles/mui`, plus tokens.css
 * - any        `@bwp-web/styles/fonts.css` for SOLAR's fonts
 *
 * This root holds what any JavaScript consumer can use, such as a CSS-in-JS library.
 */
export {
  solarTokens,
  solarViewportTokens,
  solarTypography,
  solarResponsiveTypography,
  solarShadows,
  solarZIndex,
  type SolarMode,
} from './generated/tokens.js';
