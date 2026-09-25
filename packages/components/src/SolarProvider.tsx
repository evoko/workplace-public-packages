import { useMemo, type ReactNode } from 'react';
import {
  ThemeProvider,
  createTheme,
  type ThemeOptions,
} from '@mui/material/styles';
import { createSolarThemeOptions } from '@bwp-web/styles/mui';

export interface SolarProviderProps {
  children?: ReactNode;
  /**
   * The app's own theme options, merged over SOLAR's (MUI's `createTheme` merges them in order).
   * Keep them stable, or memoized, so the theme is not rebuilt on every render.
   */
  theme?: ThemeOptions;
}

// One theme for every provider with no options of its own: built once, not per render.
let shared: ReturnType<typeof createTheme> | undefined;

/**
 * SOLAR for an app: the MUI theme that makes stock MUI components match the SOLAR ones, in Light
 * and Dark, switched as the tokens are, by `data-theme="dark"` on any element. The components look
 * right without it; wrap the app once so what MUI draws around them matches too. Load
 * `@bwp-web/styles/tokens.css` and `@bwp-web/styles/fonts.css` beside it.
 */
export function SolarProvider({ children, theme }: SolarProviderProps) {
  const built = useMemo(
    () =>
      theme
        ? createTheme(createSolarThemeOptions(), theme)
        : (shared ??= createTheme(createSolarThemeOptions())),
    [theme],
  );
  return <ThemeProvider theme={built}>{children}</ThemeProvider>;
}
