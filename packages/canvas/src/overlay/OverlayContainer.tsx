import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Stack } from '@mui/material';
import type { Canvas as FabricCanvas } from 'fabric';
import { useCanvasRef } from '../context/useCanvasRef';

/**
 * Context flag set by `OverlayContainer`. When `true`, `ObjectOverlay`
 * positions itself relative to the canvas origin (without viewport
 * translation), because the container already applies the translation.
 */
export const OverlayContainerContext = createContext(false);

export function useIsInsideOverlayContainer(): boolean {
  return useContext(OverlayContainerContext);
}

export interface OverlayContainerProps {
  /**
   * Ref to the Fabric canvas instance. Optional when rendered inside a
   * {@link ViewCanvasProvider} or {@link EditCanvasProvider}.
   */
  canvasRef?: RefObject<FabricCanvas | null>;
  children?: ReactNode;
}

/**
 * Wrapper for `ObjectOverlay` elements that optimises panning performance.
 *
 * During pan, every overlay moves by the same pixel delta (the viewport
 * translation changes, but object positions and zoom stay the same).
 * `OverlayContainer` applies the viewport translation on a single wrapper
 * element, so panning requires **one DOM write** instead of one per overlay.
 *
 * Individual `ObjectOverlay` elements inside the container position
 * themselves relative to the canvas origin (without viewport translation)
 * and cache their position to skip redundant writes during pan.
 * Only when zoom changes or an object moves do they update.
 *
 * @example
 * ```tsx
 * <OverlayContainer canvasRef={canvas.canvasRef}>
 *   {objects.map((obj) => (
 *     <ObjectOverlay key={obj.data?.id} object={obj}>
 *       <OverlayContent>…</OverlayContent>
 *     </ObjectOverlay>
 *   ))}
 * </OverlayContainer>
 * ```
 */
export function OverlayContainer({
  canvasRef: canvasRefProp,
  children,
}: OverlayContainerProps) {
  const contextCanvasRef = useCanvasRef();
  const canvasRef = canvasRefProp ?? contextCanvasRef;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef?.current;
    const el = containerRef.current;
    if (!canvas || !el) return;

    function updateContainer() {
      if (!canvas || !el) return;
      const vt = canvas.viewportTransform;
      if (!vt) return;
      el.style.transform = `translate(${vt[4]}px, ${vt[5]}px)`;
    }

    updateContainer();
    canvas.on('after:render', updateContainer);

    return () => {
      canvas.off('after:render', updateContainer);
    };
  }, [canvasRef]);

  return (
    <OverlayContainerContext.Provider value={true}>
      <Stack
        ref={containerRef}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      >
        {children}
      </Stack>
    </OverlayContainerContext.Provider>
  );
}
