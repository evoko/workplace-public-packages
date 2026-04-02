import { createTheme } from '@mui/material/styles';

/**
 * Base theme — plain MUI defaults, no custom overrides.
 * Pass override options to layer on top of the defaults.
 */
export const biampTheme = (
  overrideOptions: Parameters<typeof createTheme>[0] = {},
) => createTheme(overrideOptions);
