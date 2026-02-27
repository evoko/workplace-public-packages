import { useEffect, useRef, useState, type RefObject } from 'react';
import type {
  Canvas as FabricCanvas,
  CanvasEvents,
  FabricObject,
} from 'fabric';
import { useCanvasRef } from '../context/useCanvasRef';

export interface UseCanvasTooltipOptions<T> {
  /** Extract tooltip content from a hovered object. Return `null` to skip the tooltip. */
  getContent: (obj: FabricObject) => T | null;
}

export interface CanvasTooltipState<T> {
  /** Whether the tooltip is currently visible. */
  visible: boolean;
  /** The content extracted from the hovered object, or `null` when hidden. */
  content: T | null;
  /** Screen-space position (relative to the canvas container) for the tooltip. */
  position: { x: number; y: number };
}

/**
 * Track mouse hover over canvas objects and return tooltip state, using the
 * `canvasRef` from the nearest {@link ViewCanvasProvider} or
 * {@link EditCanvasProvider}.
 *
 * @example
 * ```tsx
 * const tooltip = useCanvasTooltip({
 *   getContent: (obj) => obj.data ? { id: obj.data.id, type: obj.data.type } : null,
 * });
 * ```
 */
export function useCanvasTooltip<T>(
  options: UseCanvasTooltipOptions<T>,
): CanvasTooltipState<T>;
/**
 * Track mouse hover over canvas objects and return tooltip state.
 *
 * Listens to `mouse:over`, `mouse:out`, `after:render`, and `mouse:wheel` to
 * maintain a reactive tooltip state. The returned position is in screen-space
 * coordinates relative to the canvas container element — suitable for absolute
 * positioning of a tooltip component.
 *
 * @example
 * ```tsx
 * const tooltip = useCanvasTooltip(view.canvasRef, {
 *   getContent: (obj) => obj.data ? { id: obj.data.id, type: obj.data.type } : null,
 * });
 *
 * return (
 *   <>
 *     <Canvas onReady={view.onReady} />
 *     {tooltip.visible && (
 *       <div style={{ position: 'absolute', left: tooltip.position.x, top: tooltip.position.y }}>
 *         {tooltip.content?.id}
 *       </div>
 *     )}
 *   </>
 * );
 * ```
 */
export function useCanvasTooltip<T>(
  canvasRef: RefObject<FabricCanvas | null>,
  options: UseCanvasTooltipOptions<T>,
): CanvasTooltipState<T>;
export function useCanvasTooltip<T>(
  canvasRefOrOptions:
    | RefObject<FabricCanvas | null>
    | UseCanvasTooltipOptions<T>,
  maybeOptions?: UseCanvasTooltipOptions<T>,
): CanvasTooltipState<T> {
  const isContextOverload = maybeOptions === undefined;

  // Always called unconditionally (Rules of Hooks compliant)
  const contextCanvasRef = useCanvasRef();

  const resolvedCanvasRef = isContextOverload
    ? contextCanvasRef
    : (canvasRefOrOptions as RefObject<FabricCanvas | null>);

  const options = isContextOverload
    ? (canvasRefOrOptions as UseCanvasTooltipOptions<T>)
    : maybeOptions!;

  const [state, setState] = useState<CanvasTooltipState<T>>({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  const hoveredObjectRef = useRef<FabricObject | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const canvas = resolvedCanvasRef?.current;
    if (!canvas) return;

    function calculatePosition(
      target: FabricObject,
    ): { x: number; y: number } | null {
      const bounds = target.getBoundingRect();
      const zoom = canvas!.getZoom();
      const vt = canvas!.viewportTransform;
      if (!vt) return null;

      return {
        x: (bounds.left + bounds.width / 2) * zoom + vt[4],
        y: bounds.top * zoom + vt[5] - 10,
      };
    }

    const handleMouseOver = (e: CanvasEvents['mouse:over']) => {
      const target = e.target;
      if (!target) return;

      const content = optionsRef.current.getContent(target);
      if (content === null) return;

      if (hoveredObjectRef.current !== target) {
        hoveredObjectRef.current = target;
        const position = calculatePosition(target);
        if (position) {
          setState({ visible: true, content, position });
        }
      }
    };

    const handleMouseOut = (e: CanvasEvents['mouse:out']) => {
      if (e.target && hoveredObjectRef.current === e.target) {
        setState((prev) => ({ ...prev, visible: false }));
        hoveredObjectRef.current = null;
      }
    };

    const updatePosition = () => {
      if (!hoveredObjectRef.current) return;
      const position = calculatePosition(hoveredObjectRef.current);
      if (position) {
        setState((prev) => (prev.visible ? { ...prev, position } : prev));
      }
    };

    canvas.on('mouse:over', handleMouseOver);
    canvas.on('mouse:out', handleMouseOut);
    canvas.on('after:render', updatePosition);
    canvas.on('mouse:wheel', updatePosition);

    return () => {
      canvas.off('mouse:over', handleMouseOver);
      canvas.off('mouse:out', handleMouseOut);
      canvas.off('after:render', updatePosition);
      canvas.off('mouse:wheel', updatePosition);
    };
  }, [resolvedCanvasRef]);

  return state;
}
