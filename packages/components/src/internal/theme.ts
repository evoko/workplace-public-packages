/**
 * A SOLAR component's props as the app's MUI theme sets them, the way MUI's own components read
 * theirs: `components.SolarButton.defaultProps` fill what the caller leaves unset, and
 * `components.SolarButton.styleOverrides.root` styles its root over the recipe, under the
 * caller's own `sx`. Every shell reads its props through it (the codegen writes the call, in
 * `shells/index.mjs`), so an app themes a SOLAR component as it themes a stock one. With no theme,
 * or none for the component, the props are the caller's.
 *
 * Hand written and internal.
 */

import { useTheme, useThemeProps } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

type Overrides = {
  styleOverrides?: {
    root?: unknown | ((args: { ownerState: unknown; theme: Theme }) => unknown);
  };
};

export function useSolarProps<P extends object>(props: P, name: string): P {
  const merged = useThemeProps({ props, name }) as P;
  const theme = useTheme();
  const root = (
    theme.components as Record<string, Overrides | undefined> | undefined
  )?.[name]?.styleOverrides?.root;
  if (root == null) return merged;
  const style =
    typeof root === 'function' ? root({ ownerState: merged, theme }) : root;
  const sx = (merged as { sx?: SxProps<Theme> }).sx;
  return {
    ...merged,
    // The recipe first (the shell's own), then the theme's override, then the caller's sx.
    sx: [style, ...(Array.isArray(sx) ? sx : sx == null ? [] : [sx])],
  } as P;
}
