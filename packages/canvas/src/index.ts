// Fabric.js module augmentation — adds `shapeType`, `data`, and `lockLightMode`
// to FabricObject/Canvas. Importing here ensures the augmentation is emitted in
// the dist and automatically applied for consumers of the package.
import './fabricAugmentation';

// --- Component ---
export { Canvas } from './Canvas';
export type { CanvasProps } from './Canvas';

// --- Hooks ---
export { useEditCanvas } from './hooks';
export type { UseEditCanvasOptions } from './hooks';
export { useViewCanvas } from './hooks';
export type { UseViewCanvasOptions, ViewObjectStyle } from './hooks';
export { useCanvasEvents } from './hooks';
export type { CanvasEventHandlers } from './hooks';
export { useCanvasTooltip } from './hooks';
export type { UseCanvasTooltipOptions, CanvasTooltipState } from './hooks';
export { useCanvasClick } from './hooks';
export type { UseCanvasClickOptions } from './hooks';
export { useObjectOverlay } from './hooks';
export type { UseObjectOverlayOptions } from './hooks';

// --- Types ---
export type {
  Point2D,
  ShapeStyleOptions,
  SnappingOptions,
  InteractionModeOptions,
  SnappableInteractionOptions,
  DragBounds,
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
  PanToObjectOptions,
} from './viewport';

// --- Alignment ---
export { getSnapPoints, registerSnapPointExtractor } from './alignment';
export type { SnapPointExtractor } from './alignment';
export { enableObjectAlignment } from './alignment';
export type { ObjectAlignmentOptions } from './alignment';
export { enableRotationSnap } from './alignment';
export type { RotationSnapOptions } from './alignment';
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
  enableScaledBorderRadius,
  serializeCanvas,
  loadCanvas,
  getBaseStrokeWidth,
} from './serialization';
export type { SerializeOptions, LoadCanvasOptions } from './serialization';

// --- Background ---
export {
  fitViewportToBackground,
  getBackgroundSrc,
  setBackgroundContrast,
  getBackgroundContrast,
  setBackgroundInverted,
  getBackgroundInverted,
  resizeImageUrl,
  setBackgroundImage,
} from './background';
export type {
  FitViewportOptions,
  ResizeResult,
  ResizeImageOptions,
  SetBackgroundImageOptions,
} from './background';

// --- Styles ---
export {
  DEFAULT_CONTROL_STYLE,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_CIRCLE_STYLE,
  DEFAULT_DRAG_SHAPE_STYLE,
  DEFAULT_GUIDELINE_SHAPE_STYLE,
  DEFAULT_ALIGNMENT_STYLE,
} from './styles';

// --- Fabric re-exports ---
// Re-export commonly used Fabric types so consumers don't need to import
// from both '@bwp-web/canvas' and 'fabric' (avoids type boundary mismatches).
export {
  Canvas as FabricCanvas,
  FabricObject,
  FabricImage,
  Rect,
  Polygon,
  Point,
  util,
} from 'fabric';
