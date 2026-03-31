// Canvas object styles using SOLAR design tokens directly.
// These are Fabric.js object properties, not CSS — they need raw color values.

const INFO_MAIN = '#1677FF'; // solar blue-500

/** Selection handle appearance (border, corner color). Applied to all objects. */
export const DEFAULT_CONTROL_STYLE = {
  borderColor: INFO_MAIN,
  cornerColor: INFO_MAIN,
  cornerStrokeColor: INFO_MAIN,
  transparentCorners: true,
};

/** Default fill/stroke for rectangles and polygons. */
export const DEFAULT_SHAPE_STYLE = {
  fill: `${INFO_MAIN}4D`, // ~0.3 alpha
  stroke: INFO_MAIN,
  strokeWidth: 2.5,
  strokeUniform: true,
  ...DEFAULT_CONTROL_STYLE,
};

/** Default fill for circles (Rects with full border-radius). */
export const DEFAULT_CIRCLE_STYLE = {
  fill: INFO_MAIN,
  stroke: INFO_MAIN,
  strokeWidth: 2.5,
  strokeUniform: true,
  ...DEFAULT_CONTROL_STYLE,
};

/** Preview rectangle shown during drag-to-create (dashed stroke). */
export const DEFAULT_DRAG_SHAPE_STYLE = {
  fill: `${INFO_MAIN}1A`, // ~0.1 alpha
  stroke: INFO_MAIN,
  strokeWidth: 2.5,
  strokeUniform: true,
  strokeDashArray: [5, 5],
};

/** Preview polygon shown during draw-to-create (semi-transparent dashed stroke). */
export const DEFAULT_GUIDELINE_SHAPE_STYLE = {
  fill: `${INFO_MAIN}1A`, // ~0.1 alpha
  stroke: `${INFO_MAIN}80`, // ~0.5 alpha
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
