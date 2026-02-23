// --- Component ---
export { Canvas } from './Canvas';
export type { CanvasProps } from './Canvas';

// --- Hooks ---
export { useEditCanvas } from './hooks';
export type { UseEditCanvasOptions } from './hooks';
export { useViewCanvas } from './hooks';
export type { UseViewCanvasOptions } from './hooks';

// --- Types ---
export type {
  Point2D,
  ShapeStyleOptions,
  SnappingOptions,
  InteractionModeOptions,
  SnappableInteractionOptions,
  ModeSetup,
} from './types';

// --- Shapes ---
export {
  createRectangle,
  createRectangleAtPoint,
  editRectangle,
} from './shapes';
export type { RectangleOptions, RectangleAtPointOptions } from './shapes';

export { createCircle, createCircleAtPoint, editCircle } from './shapes';
export type { CircleOptions, CircleAtPointOptions } from './shapes';

export {
  createPolygon,
  createPolygonAtPoint,
  createPolygonFromDrag,
  createPolygonFromVertices,
  editPolygon,
} from './shapes';
export type { PolygonOptions, PolygonStyleOptions } from './shapes';

// --- Interactions ---
export { enableClickToCreate } from './interactions';
export { enableDragToCreate } from './interactions';
export type { DragToCreateOptions } from './interactions';
export { enableDrawToCreate } from './interactions';
export type { DrawToCreateOptions } from './interactions';
export { enableVertexEdit } from './interactions';
export type { VertexEditOptions } from './interactions';

// --- Viewport ---
export { enablePanAndZoom, resetViewport } from './viewport';
export type {
  ViewportController,
  ViewportMode,
  PanAndZoomOptions,
} from './viewport';

// --- Alignment ---
export { getSnapPoints, registerSnapPointExtractor } from './alignment';
export type { SnapPointExtractor } from './alignment';
export { enableObjectAlignment } from './alignment';
export type { ObjectAlignmentOptions } from './alignment';
export { snapCursorPoint } from './alignment';
export type {
  CursorSnapResult,
  CursorSnapOptions,
  GuidelineStyle,
} from './alignment';

// --- Keyboard ---
export { deleteObjects, enableKeyboardShortcuts } from './keyboard';

// --- Serialization ---
export {
  enableScaledStrokes,
  serializeCanvas,
  loadCanvas,
  getBaseStrokeWidth,
} from './serialization';
export type { SerializeOptions } from './serialization';

// --- Background ---
export {
  fitViewportToBackground,
  setBackgroundOpacity,
  getBackgroundOpacity,
  setBackgroundInverted,
  getBackgroundInverted,
  resizeImageUrl,
  setBackgroundImage,
} from './background';
export type { FitViewportOptions, ResizeResult, ResizeImageOptions } from './background';

// --- Styles ---
export {
  DEFAULT_CONTROL_STYLE,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_CIRCLE_STYLE,
  DEFAULT_DRAG_SHAPE_STYLE,
  DEFAULT_GUIDELINE_SHAPE_STYLE,
  DEFAULT_ALIGNMENT_STYLE,
} from './styles';
