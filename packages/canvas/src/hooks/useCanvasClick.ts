import { useEffect, useRef, type RefObject } from 'react';
import type {
  Canvas as FabricCanvas,
  CanvasEvents,
  FabricObject,
} from 'fabric';
import { useCanvasRef } from '../context/useCanvasRef';

export interface UseCanvasClickOptions {
  /** Maximum movement in pixels before the gesture is treated as a pan. Default: 5. */
  threshold?: number;
  /** Maximum duration in milliseconds for the gesture to count as a click. Default: 300. */
  maxDuration?: number;
}

/**
 * Distinguish clicks from pan gestures on a canvas, using the `canvasRef`
 * from the nearest {@link ViewCanvasProvider} or {@link EditCanvasProvider}.
 *
 * @example
 * ```tsx
 * useCanvasClick((target) => {
 *   if (target?.data?.id) {
 *     navigate(`/locations/${target.data.id}`);
 *   }
 * });
 * ```
 */
export function useCanvasClick(
  onClick: (target: FabricObject | undefined) => void,
  options?: UseCanvasClickOptions,
): void;
/**
 * Distinguish clicks from pan gestures on a canvas.
 *
 * On view-mode canvases where pan is always active, a regular Fabric `mouse:up`
 * fires for both clicks and drag-to-pan. This hook tracks pointer movement and
 * timing to determine whether the user intended a click or a pan, then calls
 * `onClick` only for genuine clicks.
 *
 * @example
 * ```tsx
 * useCanvasClick(view.canvasRef, (target) => {
 *   if (target?.data?.id) {
 *     navigate(`/locations/${target.data.id}`);
 *   }
 * });
 * ```
 */
export function useCanvasClick(
  canvasRef: RefObject<FabricCanvas | null>,
  onClick: (target: FabricObject | undefined) => void,
  options?: UseCanvasClickOptions,
): void;
export function useCanvasClick(
  canvasRefOrOnClick:
    | RefObject<FabricCanvas | null>
    | ((target: FabricObject | undefined) => void),
  onClickOrOptions?:
    | ((target: FabricObject | undefined) => void)
    | UseCanvasClickOptions,
  maybeOptions?: UseCanvasClickOptions,
): void {
  // Distinguish overloads: if the second arg is a function, the first is canvasRef
  const isContextOverload = typeof canvasRefOrOnClick === 'function';

  // Always called unconditionally (Rules of Hooks compliant)
  const contextCanvasRef = useCanvasRef();

  const resolvedCanvasRef = isContextOverload
    ? contextCanvasRef
    : (canvasRefOrOnClick as RefObject<FabricCanvas | null>);

  const onClick = isContextOverload
    ? (canvasRefOrOnClick as (target: FabricObject | undefined) => void)
    : (onClickOrOptions as (target: FabricObject | undefined) => void);

  const options = isContextOverload
    ? (onClickOrOptions as UseCanvasClickOptions | undefined)
    : maybeOptions;

  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const canvas = resolvedCanvasRef?.current;
    if (!canvas) return;

    let mouseDown: { x: number; y: number; time: number } | null = null;
    let isPanning = false;

    const handleMouseDown = (e: CanvasEvents['mouse:down']) => {
      const native = e.e instanceof TouchEvent ? e.e.touches[0] : e.e;
      if (native) {
        mouseDown = { x: native.clientX, y: native.clientY, time: Date.now() };
        isPanning = false;
      }
    };

    const handleMouseMove = (e: CanvasEvents['mouse:move']) => {
      if (!mouseDown) return;
      const native = e.e instanceof TouchEvent ? e.e.touches[0] : e.e;
      if (!native) return;

      const threshold = optionsRef.current?.threshold ?? 5;
      const deltaX = Math.abs(native.clientX - mouseDown.x);
      const deltaY = Math.abs(native.clientY - mouseDown.y);
      if (deltaX > threshold || deltaY > threshold) {
        isPanning = true;
      }
    };

    const handleMouseUp = (e: CanvasEvents['mouse:up']) => {
      if (!mouseDown) return;

      const maxDuration = optionsRef.current?.maxDuration ?? 300;
      const elapsed = Date.now() - mouseDown.time;

      if (!isPanning && elapsed < maxDuration) {
        onClickRef.current(e.target);
      }

      mouseDown = null;
      isPanning = false;
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [resolvedCanvasRef]);
}
