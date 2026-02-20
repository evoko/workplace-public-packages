import { Canvas as FabricCanvas, Point, TPointerEvent } from 'fabric';

export type ViewportMode = 'select' | 'pan';

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

export interface ViewportController {
  /** Switch between select and pan modes. */
  setMode: (mode: ViewportMode) => void;
  /** Get the current viewport mode. */
  getMode: () => ViewportMode;
  /** Remove all event listeners. */
  cleanup: () => void;
}

/**
 * Enable pan and zoom on the canvas viewport.
 *
 * - **Zoom**: Scroll the mouse wheel to zoom in/out centred on the cursor
 *   (works in both modes).
 * - **Select mode**: Normal object selection. Hold Cmd (Mac) / Ctrl (Win) and
 *   drag to pan.
 * - **Pan mode**: Click and drag to pan freely. Object selection is disabled.
 *
 * Returns a {@link ViewportController} for switching modes and cleaning up.
 */
export function enablePanAndZoom(
  canvas: FabricCanvas,
  options?: PanAndZoomOptions,
): ViewportController {
  const minZoom = options?.minZoom ?? 0.2;
  const maxZoom = options?.maxZoom ?? 10;
  const zoomFactor = options?.zoomFactor ?? 1.03;

  let mode: ViewportMode = options?.initialMode ?? 'select';
  let isPanning = false;
  let lastPanX = 0;
  let lastPanY = 0;
  /** Tracks whether we toggled canvas.selection off so we can restore it. */
  let didDisableSelection = false;

  const handleWheel = (opt: { e: WheelEvent }) => {
    const e = opt.e;
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY;
    let zoom = canvas.getZoom();
    zoom = delta < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    zoom = Math.min(Math.max(zoom, minZoom), maxZoom);

    canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
  };

  const handleMouseDown = (opt: { e: TPointerEvent }) => {
    const e = opt.e;
    if (!(e instanceof MouseEvent)) {
      return;
    }

    const shouldPan =
      mode === 'pan' ||
      e.button === 1 ||
      ((e.metaKey || e.ctrlKey) && mode === 'select');

    if (shouldPan) {
      isPanning = true;
      lastPanX = e.clientX;
      lastPanY = e.clientY;

      if (canvas.selection) {
        didDisableSelection = true;
        canvas.selection = false;
      }
      canvas.setCursor('grab');
    }
  };

  const handleMouseMove = (opt: { e: TPointerEvent }) => {
    if (!isPanning) {
      return;
    }

    const e = opt.e;
    if (!(e instanceof MouseEvent)) {
      return;
    }

    const dx = e.clientX - lastPanX;
    const dy = e.clientY - lastPanY;
    lastPanX = e.clientX;
    lastPanY = e.clientY;

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
      canvas.setCursor(mode === 'pan' ? 'grab' : 'default');
    }
  };

  canvas.on('mouse:wheel', handleWheel);
  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

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

    cleanup() {
      canvas.off('mouse:wheel', handleWheel);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    },
  };
}

/**
 * Reset the canvas viewport to the default (no pan, zoom = 1).
 */
export function resetViewport(canvas: FabricCanvas): void {
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
}
