/**
 * `@bwp-web/styles/mui`: SOLAR for MUI. The theme options for `createTheme` and the component
 * recipes (`solarButtonStyle`). Plain data: nothing here imports MUI, so the package stays free of
 * it, but nothing here is useful outside an MUI app either, which is why it is its own entry.
 * Load `@bwp-web/styles/tokens.css` beside it; every recipe value is a `var(--solar-*)`.
 */
export {
  solarMuiPalette,
  solarMuiTypography,
  createSolarThemeOptions,
} from './generated/mui/theme.js';
export type { SolarMode } from './generated/tokens.js';
export * from './generated/mui/components/index.js';
