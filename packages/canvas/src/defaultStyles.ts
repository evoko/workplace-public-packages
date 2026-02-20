import { alpha } from '@mui/material/styles';
import { biampTheme } from '@bwp-web/styles';

const { palette } = biampTheme();

export const DEFAULT_SHAPE_STYLE = {
  fill: alpha(palette.info.main, 0.3),
  stroke: palette.info.main,
  strokeWidth: 2.5,
};

export const DEFAULT_DRAG_SHAPE_STYLE = {
  fill: alpha(palette.info.main, 0.1),
  stroke: palette.info.main,
  strokeWidth: 2.5,
  strokeDashArray: [5, 5],
};

export const DEFAULT_GUIDELINE_SHAPE_STYLE = {
  fill: alpha(palette.info.main, 0.1),
  stroke: alpha(palette.info.main, 0.5),
  strokeWidth: 2.5,
  strokeDashArray: [5, 5],
};
