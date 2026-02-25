// --- Viewport ---

/** Minimum zoom level. */
export const DEFAULT_MIN_ZOOM = 0.2;
/** Maximum zoom level. */
export const DEFAULT_MAX_ZOOM = 10;
/** Zoom sensitivity base — raised to the power of deltaY for proportional scroll zoom. */
export const DEFAULT_ZOOM_FACTOR = 0.999;
/** Default multiplier for programmatic zoomIn/zoomOut (1.2 = 20% per click). */
export const DEFAULT_ZOOM_STEP = 1.2;
/** Default viewport padding fraction (5% on each side). */
export const DEFAULT_VIEWPORT_PADDING = 0.05;

// --- Alignment & snapping ---

/** Reference canvas dimension for scaling snap margins proportionally. */
export const BASE_CANVAS_SIZE = 1000;
/** Default snap margin in screen-pixel-equivalent units (shared by all snap systems). */
export const DEFAULT_SNAP_MARGIN = 6;
/** Default angle snap interval in degrees. */
export const DEFAULT_ANGLE_SNAP_INTERVAL = 15;

// --- Interactions ---

/**
 * Minimum drag distance (in scene units) before a drag is treated as intentional.
 * Prevents accidental micro-drags from creating objects.
 */
export const MIN_DRAG_SIZE = 3;

/**
 * Distance (in scene units) from the first vertex at which a click closes the polygon.
 */
export const POLYGON_CLOSE_THRESHOLD = 10;

// --- Background image ---

/** Default max image dimension before downscale. */
export const DEFAULT_IMAGE_MAX_SIZE = 4096;
/** Default min image dimension (images smaller on both axes are rejected). */
export const DEFAULT_IMAGE_MIN_SIZE = 480;

// --- Vertex edit handles ---

export const DEFAULT_VERTEX_HANDLE_RADIUS = 6;
export const DEFAULT_VERTEX_HANDLE_FILL = '#ffffff';
export const DEFAULT_VERTEX_HANDLE_STROKE = '#2196f3';
export const DEFAULT_VERTEX_HANDLE_STROKE_WIDTH = 2;
