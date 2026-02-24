import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import type { ViewportController } from './viewport';
import type { GuidelineStyle } from './alignment/cursorSnapping';

/** A simple 2D point. */
export type Point2D = { x: number; y: number };

/** Common style fields shared across all shape options. */
export interface ShapeStyleOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** Optional metadata to attach to the created object. */
  data?: { type: string; id: string };
}

/** Snapping configuration used by interaction modes (dragToCreate, drawToCreate). */
export type SnappingOptions =
  | boolean
  | {
      /** Snap margin in screen pixels. Default: 6. */
      margin?: number;
      /** Custom guideline style. */
      guidelineStyle?: GuidelineStyle;
    };

/** Options shared by all interaction modes that create objects. */
export interface InteractionModeOptions {
  onCreated?: (obj: FabricObject) => void;
  viewport?: ViewportController;
}

/** Options shared by interaction modes that support snapping. */
export interface SnappableInteractionOptions extends InteractionModeOptions {
  /** Enable cursor snapping. Pass `true` for defaults or an options object. Default: enabled. */
  snapping?: SnappingOptions;
  /**
   * Master toggle for alignment/snapping.
   * - `undefined`: uses the `snapping` prop (default: enabled).
   * - `true`: force-enable snapping.
   * - `false`: force-disable snapping.
   */
  enableAlignment?: boolean;
}

/** Bounds produced by a drag-to-create interaction. */
export interface DragBounds {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

/** Setup function for interaction modes, used by useEditCanvas.setMode(). */
export type ModeSetup = (
  canvas: FabricCanvas,
  viewport: ViewportController | undefined,
) => (() => void) | void;
