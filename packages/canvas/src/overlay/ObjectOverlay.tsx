import { useEffect, useRef, type RefObject, type ReactNode } from 'react';
import { Stack } from '@mui/material';
import type { StackProps } from '@mui/material';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import { util } from 'fabric';
import { useCanvasRef } from '../context/useCanvasRef';

export interface ObjectOverlayProps extends StackProps {
  /**
   * Ref to the Fabric canvas instance.
   * Optional when rendered inside a {@link ViewCanvasProvider} or
   * {@link EditCanvasProvider} — the ref is read from context automatically.
   * If provided, takes precedence over the context value.
   */
  canvasRef?: RefObject<FabricCanvas | null>;
  /** The Fabric object to overlay. When `null`/`undefined`, nothing renders. */
  object: FabricObject | null | undefined;
  children?: ReactNode;
}

/**
 * A MUI `Stack` positioned absolutely over a Fabric canvas object, sized to
 * the object's screen-space dimensions and kept in sync with pan, zoom, move,
 * scale, and rotate transforms.
 *
 * Default styles: `position: absolute`, `pointerEvents: none`,
 * `alignItems: center`, `justifyContent: center`, `zIndex: 1`.
 * All can be overridden via the `sx` prop.
 *
 * Must be rendered inside a container that is `position: relative` and wraps
 * the `<Canvas>` component (e.g. the `canvasOverlay` slot of `DemoLayout`).
 *
 * @example
 * ```tsx
 * // Inside a ViewCanvasProvider or EditCanvasProvider — canvasRef is read from context:
 * <ObjectOverlay object={deskObj}>
 *   <OverlayContent>
 *     <MyLabel>{desk.name}</MyLabel>
 *   </OverlayContent>
 * </ObjectOverlay>
 *
 * // Or pass canvasRef explicitly:
 * <ObjectOverlay canvasRef={canvasRef} object={deskObj}>
 *   <OverlayContent>
 *     <MyLabel>{desk.name}</MyLabel>
 *   </OverlayContent>
 * </ObjectOverlay>
 * ```
 */
export function ObjectOverlay({
  canvasRef: canvasRefProp,
  object,
  sx,
  children,
  ...rest
}: ObjectOverlayProps) {
  const contextCanvasRef = useCanvasRef();
  const canvasRef = canvasRefProp ?? contextCanvasRef;

  const stackRef = useRef<HTMLDivElement>(null);
  // Track previous width/height to skip redundant writes during pan
  // (only position changes during pan, not size).
  const prevSize = useRef({ w: '', h: '' });

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !object) return;

    function update() {
      const el = stackRef.current;
      if (!el || !canvas || !object) return;

      const zoom = canvas.getZoom();
      const vt = canvas.viewportTransform;
      if (!vt) return;

      const center = object.getCenterPoint();
      const actualWidth = (object.width ?? 0) * (object.scaleX ?? 1);
      const actualHeight = (object.height ?? 0) * (object.scaleY ?? 1);
      const screenCoords = util.transformPoint(center, vt);
      const screenWidth = actualWidth * zoom;
      const screenHeight = actualHeight * zoom;
      const angle = object.angle ?? 0;

      // Use transform for positioning — avoids layout recalculation,
      // only triggers compositing (GPU-accelerated).
      const tx = screenCoords.x - screenWidth / 2;
      const ty = screenCoords.y - screenHeight / 2;
      el.style.transform =
        angle !== 0
          ? `translate(${tx}px, ${ty}px) rotate(${angle}deg)`
          : `translate(${tx}px, ${ty}px)`;

      // Only write width/height when they actually change to avoid
      // triggering ResizeObserver during pan (where only position changes).
      const w = `${screenWidth}px`;
      const h = `${screenHeight}px`;
      if (prevSize.current.w !== w || prevSize.current.h !== h) {
        el.style.width = w;
        el.style.height = h;
        prevSize.current = { w, h };
      }
    }

    update();

    canvas.on('after:render', update);
    object.on('moving', update);
    object.on('scaling', update);
    object.on('rotating', update);

    return () => {
      canvas.off('after:render', update);
      object.off('moving', update);
      object.off('scaling', update);
      object.off('rotating', update);
      prevSize.current = { w: '', h: '' };
    };
  }, [canvasRef, object]);

  if (!object) return null;

  return (
    <Stack
      ref={stackRef}
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        willChange: 'transform',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
}
