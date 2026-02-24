import {
  Canvas as FabricCanvas,
  type FabricObject,
  Point,
  TPointerEvent,
} from 'fabric';
import {
  DEFAULT_MIN_ZOOM,
  DEFAULT_MAX_ZOOM,
  DEFAULT_ZOOM_FACTOR,
  DEFAULT_ZOOM_STEP,
} from './constants';

export type ViewportMode = 'select' | 'pan';

export interface PanToObjectOptions {
  /** Animate the pan with an easing transition. Default: false. */
  animate?: boolean;
  /** Animation duration in milliseconds when `animate` is true. Default: 300. */
  duration?: number;
}

export interface PanAndZoomOptions {
  /** Minimum zoom level (default: 0.2) */
  minZoom?: number;
  /** Maximum zoom level (default: 10) */
  maxZoom?: number;
  /** Zoom sensitivity — larger values zoom faster (default: 1.03) */
  zoomFactor?: number;
  /** Initial viewport mode (default: 'select') */
  initialMode?: ViewportMode;
}

export interface ZoomToFitOptions {
  /** Padding fraction around the object (default: 0.1 = 10% on each side). */
  padding?: number;
}

export interface ViewportController {
  /** Switch between select and pan modes. */
  setMode: (mode: ViewportMode) => void;
  /** Get the current viewport mode. */
  getMode: () => ViewportMode;
  /** Temporarily disable all pan and zoom input (e.g. during draw modes). */
  setEnabled: (enabled: boolean) => void;
  /**
   * Zoom in toward the canvas center by a multiplicative factor.
   * Respects the configured min/max zoom bounds. Default factor: 1.2 (20%).
   */
  zoomIn: (factor?: number) => void;
  /**
   * Zoom out from the canvas center by a multiplicative factor.
   * Respects the configured min/max zoom bounds. Default factor: 1.2 (20%).
   */
  zoomOut: (factor?: number) => void;
  /**
   * Pan the viewport so the given object is centered on the canvas.
   * Optionally animate the transition. Automatically cancels any
   * in-progress panToObject animation.
   */
  panToObject: (object: FabricObject, options?: PanToObjectOptions) => void;
  /**
   * Zoom and pan the viewport so the given object fills the canvas
   * with optional padding.
   */
  zoomToFit: (object: FabricObject, options?: ZoomToFitOptions) => void;
  /** Remove all event listeners. */
  cleanup: () => void;
}

interface ZoomBounds {
  minZoom: number;
  maxZoom: number;
}

// --- Pointer helpers ---

/** Extract clientX/Y from any pointer-style event (Mouse, Pointer, or Touch). */
function getPointerXY(e: Event): { x: number; y: number } | null {
  // PointerEvent extends MouseEvent — both are handled by this branch
  if (e instanceof MouseEvent) return { x: e.clientX, y: e.clientY };
  if (
    typeof TouchEvent !== 'undefined' &&
    e instanceof TouchEvent &&
    e.touches.length > 0
  ) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return null;
}

/** Distance between two touch points. */
function touchDistance(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Midpoint of two touch points relative to a canvas element. */
function touchMidpoint(touches: TouchList, el: HTMLElement): Point {
  const rect = el.getBoundingClientRect();
  return new Point(
    (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
    (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
  );
}

// --- Wheel zoom ---

function setupWheelZoom(
  canvas: FabricCanvas,
  bounds: ZoomBounds,
  zoomFactor: number,
  isEnabled: () => boolean,
) {
  const handleWheel = (opt: { e: WheelEvent }) => {
    if (!isEnabled()) return;

    const e = opt.e;
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY;
    let zoom = canvas.getZoom();
    zoom = delta < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    zoom = Math.min(Math.max(zoom, bounds.minZoom), bounds.maxZoom);

    canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
  };

  canvas.on('mouse:wheel', handleWheel);
  return handleWheel;
}

// --- Mouse / single-touch pan ---

function setupMousePan(
  canvas: FabricCanvas,
  getMode: () => ViewportMode,
  isEnabled: () => boolean,
) {
  let isPanning = false;
  let lastPanX = 0;
  let lastPanY = 0;
  let didDisableSelection = false;

  const handleMouseDown = (opt: { e: TPointerEvent; target?: unknown }) => {
    if (!isEnabled()) return;

    const pos = getPointerXY(opt.e);
    if (!pos) return;

    const e = opt.e;
    const mode = getMode();
    const isMiddleButton = e instanceof MouseEvent && e.button === 1;
    const isModifiedSelect =
      e instanceof MouseEvent && mode === 'select' && (e.metaKey || e.ctrlKey);

    const shouldPan =
      mode === 'pan' ||
      isMiddleButton ||
      isModifiedSelect ||
      (mode === 'select' && !opt.target);

    if (shouldPan) {
      isPanning = true;
      lastPanX = pos.x;
      lastPanY = pos.y;

      if (canvas.selection) {
        didDisableSelection = true;
        canvas.selection = false;
      }
      canvas.setCursor('grab');
    }
  };

  const handleMouseMove = (opt: { e: TPointerEvent }) => {
    if (!isPanning) return;

    const pos = getPointerXY(opt.e);
    if (!pos) return;

    const dx = pos.x - lastPanX;
    const dy = pos.y - lastPanY;
    lastPanX = pos.x;
    lastPanY = pos.y;

    canvas.relativePan(new Point(dx, dy));
    canvas.setCursor('grab');
  };

  const handleMouseUp = () => {
    if (isPanning) {
      isPanning = false;

      if (didDisableSelection) {
        canvas.selection = true;
        didDisableSelection = false;
      }
      canvas.setCursor(getMode() === 'pan' ? 'grab' : 'default');
    }
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}

// --- Pinch-to-zoom ---

function setupPinchZoom(
  canvas: FabricCanvas,
  bounds: ZoomBounds,
  isEnabled: () => boolean,
): () => void {
  const canvasEl = canvas.getElement();
  if (typeof TouchEvent === 'undefined') return () => {};

  let lastPinchDist = 0;

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastPinchDist = touchDistance(e.touches);
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isEnabled() || e.touches.length !== 2) return;
    e.preventDefault();

    const dist = touchDistance(e.touches);
    if (lastPinchDist === 0) {
      lastPinchDist = dist;
      return;
    }

    const ratio = dist / lastPinchDist;
    lastPinchDist = dist;

    const mid = touchMidpoint(e.touches, canvasEl);
    canvas.zoomToPoint(
      mid,
      Math.min(
        Math.max(canvas.getZoom() * ratio, bounds.minZoom),
        bounds.maxZoom,
      ),
    );
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) lastPinchDist = 0;
  };

  canvasEl.addEventListener('touchstart', onTouchStart, { passive: false });
  canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
  canvasEl.addEventListener('touchend', onTouchEnd);

  return () => {
    canvasEl.removeEventListener('touchstart', onTouchStart);
    canvasEl.removeEventListener('touchmove', onTouchMove);
    canvasEl.removeEventListener('touchend', onTouchEnd);
  };
}

// --- Main function ---

/**
 * Enable pan and zoom on the canvas viewport.
 *
 * - **Zoom**: Scroll the mouse wheel to zoom in/out centred on the cursor
 *   (works in both modes). On touch devices, pinch with two fingers to zoom.
 * - **Select mode**: Normal object selection. Hold Cmd (Mac) / Ctrl (Win) and
 *   drag to pan. Middle-button drag also pans.
 * - **Pan mode**: Click or single-touch drag to pan freely. Object selection
 *   is disabled.
 *
 * Returns a {@link ViewportController} for switching modes, programmatic zoom,
 * and cleanup.
 */
export function enablePanAndZoom(
  canvas: FabricCanvas,
  options?: PanAndZoomOptions,
): ViewportController {
  const bounds: ZoomBounds = {
    minZoom: options?.minZoom ?? DEFAULT_MIN_ZOOM,
    maxZoom: options?.maxZoom ?? DEFAULT_MAX_ZOOM,
  };
  const zoomFactor = options?.zoomFactor ?? DEFAULT_ZOOM_FACTOR;

  let mode: ViewportMode = options?.initialMode ?? 'select';
  let enabled = true;
  let currentAnimRafId: number | null = null;
  const isEnabled = () => enabled;
  const getMode = () => mode;

  function cancelAnimation() {
    if (currentAnimRafId !== null) {
      cancelAnimationFrame(currentAnimRafId);
      currentAnimRafId = null;
    }
  }

  const handleWheel = setupWheelZoom(canvas, bounds, zoomFactor, isEnabled);
  const panHandlers = setupMousePan(canvas, getMode, isEnabled);
  const cleanupPinch = setupPinchZoom(canvas, bounds, isEnabled);

  // --- Controller ---

  return {
    setMode(newMode: ViewportMode) {
      mode = newMode;
      if (newMode === 'pan') {
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        canvas.discardActiveObject();
        canvas.setCursor('grab');
      } else {
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
        canvas.setCursor('default');
      }
      canvas.requestRenderAll();
    },

    getMode() {
      return mode;
    },

    setEnabled(value: boolean) {
      enabled = value;
    },

    zoomIn(factor = DEFAULT_ZOOM_STEP) {
      const z = Math.min(canvas.getZoom() * factor, bounds.maxZoom);
      canvas.zoomToPoint(
        new Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
        z,
      );
    },

    zoomOut(factor = DEFAULT_ZOOM_STEP) {
      const z = Math.max(canvas.getZoom() / factor, bounds.minZoom);
      canvas.zoomToPoint(
        new Point(canvas.getWidth() / 2, canvas.getHeight() / 2),
        z,
      );
    },

    panToObject(object: FabricObject, panOpts?: PanToObjectOptions) {
      cancelAnimation();

      const zoom = canvas.getZoom();
      const objectCenter = object.getCenterPoint();
      const canvasCenterX = canvas.getWidth() / 2;
      const canvasCenterY = canvas.getHeight() / 2;

      const targetX = canvasCenterX - objectCenter.x * zoom;
      const targetY = canvasCenterY - objectCenter.y * zoom;

      if (!panOpts?.animate) {
        const vt = canvas.viewportTransform;
        if (!vt) return;
        canvas.setViewportTransform([
          vt[0],
          vt[1],
          vt[2],
          vt[3],
          targetX,
          targetY,
        ]);
        return;
      }

      const duration = panOpts.duration ?? 300;
      const vt = canvas.viewportTransform;
      if (!vt) return;
      const startX = vt[4];
      const startY = vt[5];
      const startTime = performance.now();

      function step(now: number) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);

        const currentX = startX + (targetX - startX) * eased;
        const currentY = startY + (targetY - startY) * eased;

        const currentVt = canvas.viewportTransform;
        if (!currentVt) return;
        canvas.setViewportTransform([
          currentVt[0],
          currentVt[1],
          currentVt[2],
          currentVt[3],
          currentX,
          currentY,
        ]);

        if (t < 1) {
          currentAnimRafId = requestAnimationFrame(step);
        } else {
          currentAnimRafId = null;
        }
      }

      currentAnimRafId = requestAnimationFrame(step);
    },

    zoomToFit(object: FabricObject, fitOpts?: ZoomToFitOptions) {
      cancelAnimation();

      const padding = fitOpts?.padding ?? 0.1;
      const objWidth = (object.width ?? 0) * (object.scaleX ?? 1);
      const objHeight = (object.height ?? 0) * (object.scaleY ?? 1);
      if (!objWidth || !objHeight) return;

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const availableWidth = canvasWidth * (1 - padding * 2);
      const availableHeight = canvasHeight * (1 - padding * 2);

      const zoom = Math.min(
        Math.max(
          Math.min(availableWidth / objWidth, availableHeight / objHeight),
          bounds.minZoom,
        ),
        bounds.maxZoom,
      );

      const objectCenter = object.getCenterPoint();
      const offsetX = canvasWidth / 2 - objectCenter.x * zoom;
      const offsetY = canvasHeight / 2 - objectCenter.y * zoom;

      canvas.setViewportTransform([zoom, 0, 0, zoom, offsetX, offsetY]);
    },

    cleanup() {
      cancelAnimation();
      canvas.off('mouse:wheel', handleWheel);
      canvas.off('mouse:down', panHandlers.handleMouseDown);
      canvas.off('mouse:move', panHandlers.handleMouseMove);
      canvas.off('mouse:up', panHandlers.handleMouseUp);
      cleanupPinch();
    },
  };
}

/**
 * Reset the canvas viewport to the default (no pan, zoom = 1).
 */
export function resetViewport(canvas: FabricCanvas): void {
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
}
