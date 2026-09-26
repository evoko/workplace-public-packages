/**
 * What an app writes with SOLAR through the MUI theme (packages/components/README.md, SOLAR in app code),
 * typechecked with the package's own types: SOLAR's text styles as Typography variants and its
 * colours as palette paths. The `@ts-expect-error` lines prove an invented name fails; if the
 * augmentation stopped narrowing, they would be unused and the typecheck would fail on them.
 * Never rendered: the web visual check draws the same in a browser (test/visual/components.spec.mjs,
 * the `#app-code` probe in test/visual/page.tsx).
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type {} from '../../src/index.js';

export function AppCode() {
  const theme = useTheme();
  const danger: string = theme.palette.text.feedback.danger;
  const raised: string = theme.palette.surface.raised;
  const hover: string = theme.palette.action.primary.bg.hover;
  const inverse: string = theme.palette.border.inverse.main;
  const translucent: string = theme.palette.surface.feedback.info.subtleAlpha;
  const muiOwn: string = theme.palette.text.secondary;
  // @ts-expect-error not a SOLAR role
  const invented: string = theme.palette.surface.floating;
  return (
    <>
      <Typography variant="titleSm">{danger}</Typography>
      <Typography variant="bodyMdRegular">{raised}</Typography>
      <Typography variant="h4">{muiOwn}</Typography>
      {/* @ts-expect-error not a SOLAR text style */}
      <Typography variant="titleHuge">{hover}</Typography>
      <Box sx={{ bgcolor: 'surface.raised', typography: 'labelMd' }}>
        {inverse}
        {translucent}
        {invented}
      </Box>
    </>
  );
}
