import { alpha } from '@mui/material/styles';
import { biampTheme } from '@bwp-web/styles';

const { palette } = biampTheme();

/** Selection handle appearance (border, corner color). Applied to all objects. */
export const DEFAULT_CONTROL_STYLE = {
  borderColor: palette.info.main,
  cornerColor: palette.info.main,
  cornerStrokeColor: palette.info.main,
  transparentCorners: true,
};

/** Default fill/stroke for rectangles and polygons. */
export const DEFAULT_SHAPE_STYLE = {
  fill: alpha(palette.info.main, 0.3),
  stroke: palette.info.main,
  strokeWidth: 2.5,
  strokeUniform: true,
  ...DEFAULT_CONTROL_STYLE,
};

/** Default fill for circles (Rects with full border-radius). */
export const DEFAULT_CIRCLE_STYLE = {
  fill: palette.info.main,
  stroke: palette.info.main,
  strokeWidth: 2.5,
  strokeUniform: true,
  ...DEFAULT_CONTROL_STYLE,
};

/** Preview rectangle shown during drag-to-create (dashed stroke). */
export const DEFAULT_DRAG_SHAPE_STYLE = {
  fill: alpha(palette.info.main, 0.1),
  stroke: palette.info.main,
  strokeWidth: 2.5,
  strokeUniform: true,
  strokeDashArray: [5, 5],
};

/** Preview polygon shown during draw-to-create (semi-transparent dashed stroke). */
export const DEFAULT_GUIDELINE_SHAPE_STYLE = {
  fill: alpha(palette.info.main, 0.1),
  stroke: alpha(palette.info.main, 0.5),
  strokeWidth: 2.5,
  strokeUniform: true,
  strokeDashArray: [5, 5],
};

/** Alignment guideline appearance (color, width, x-marker size). */
export const DEFAULT_ALIGNMENT_STYLE = {
  color: 'rgba(255, 0, 0, 0.9)',
  width: 1,
  xSize: 2.4,
} as const;
