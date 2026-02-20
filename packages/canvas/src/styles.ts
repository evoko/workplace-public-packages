import { alpha } from '@mui/material/styles';
import { biampTheme } from '@bwp-web/styles';

const { palette } = biampTheme();

export const DEFAULT_CONTROL_STYLE = {
  borderColor: palette.info.main,
  cornerColor: palette.info.main,
  cornerStrokeColor: palette.info.main,
  transparentCorners: true,
};

export const DEFAULT_SHAPE_STYLE = {
  fill: alpha(palette.info.main, 0.3),
  stroke: palette.info.main,
  strokeWidth: 2.5,
  ...DEFAULT_CONTROL_STYLE,
};

export const DEFAULT_CIRCLE_STYLE = {
  fill: palette.info.main,
  stroke: palette.info.main,
  strokeWidth: 2.5,
  ...DEFAULT_CONTROL_STYLE,
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

export const DEFAULT_ALIGNMENT_STYLE = {
  color: 'rgba(255, 0, 0, 0.9)',
  width: 1,
  xSize: 2.4,
} as const;
