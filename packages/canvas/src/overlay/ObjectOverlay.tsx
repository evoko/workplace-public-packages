import { useEffect, useRef, type RefObject, type ReactNode } from 'react';
import { Stack } from '@mui/material';
import type { StackProps } from '@mui/material';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import { util } from 'fabric';

export interface ObjectOverlayProps extends StackProps {
  /** Ref to the Fabric canvas instance. */
  canvasRef: RefObject<FabricCanvas | null>;
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
 * <ObjectOverlay canvasRef={canvasRef} object={deskObj}>
 *   <OverlayContent>
 *     <MyLabel>{desk.name}</MyLabel>
 *   </OverlayContent>
 * </ObjectOverlay>
 * ```
 */
export function ObjectOverlay({
  canvasRef,
  object,
  sx,
  children,
  ...rest
}: ObjectOverlayProps) {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
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

      el.style.left = `${screenCoords.x - screenWidth / 2}px`;
      el.style.top = `${screenCoords.y - screenHeight / 2}px`;
      el.style.width = `${screenWidth}px`;
      el.style.height = `${screenHeight}px`;
      el.style.transform = angle !== 0 ? `rotate(${angle}deg)` : '';
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
    };
  }, [canvasRef, object]);

  if (!object) return null;

  return (
    <Stack
      ref={stackRef}
      sx={{
        position: 'absolute',
        pointerEvents: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        overflow: 'hidden',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
}
