import { useEffect, useRef, type RefObject } from 'react';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import { util } from 'fabric';

export interface UseObjectOverlayOptions {
  /**
   * Automatically scale the overlay content so it fits within the object
   * bounds at the current zoom level.
   * Default: false.
   */
  autoScaleContent?: boolean;
  /**
   * CSS selector for a text element inside the overlay. When
   * `autoScaleContent` is enabled and the computed scale drops below a
   * threshold, elements matching this selector are hidden (via
   * `display: none`) so only icons remain visible.
   * Default: undefined (no text hiding).
   */
  textSelector?: string;
  /**
   * Minimum content scale at which `textSelector` elements remain visible.
   * Below this threshold, matched elements are hidden.
   * Default: 0.5.
   */
  textMinScale?: number;
}

/**
 * Position a DOM element over a Fabric canvas object, kept in sync with
 * pan, zoom, move, scale, and rotate transforms.
 *
 * Returns a ref to attach to the overlay container element. The element
 * must be positioned absolutely within a relative-positioned parent that
 * wraps the `<Canvas>` component.
 *
 * @example
 * ```tsx
 * const overlayRef = useObjectOverlay(canvasRef, object, {
 *   autoScaleContent: true,
 *   textSelector: '.desk-text',
 * });
 *
 * return (
 *   <div ref={overlayRef} style={{ position: 'absolute', pointerEvents: 'none' }}>
 *     <CanvasDeskIcon />
 *     <span className="desk-text">{name}</span>
 *   </div>
 * );
 * ```
 */
export function useObjectOverlay(
  canvasRef: RefObject<FabricCanvas | null>,
  object: FabricObject | null | undefined,
  options?: UseObjectOverlayOptions,
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !object) return;

    function update() {
      const el = containerRef.current;
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

      el.style.left = `${screenCoords.x - screenWidth / 2}px`;
      el.style.top = `${screenCoords.y - screenHeight / 2}px`;
      el.style.width = `${screenWidth}px`;
      el.style.height = `${screenHeight}px`;

      const angle = object.angle ?? 0;
      el.style.rotate = angle !== 0 ? `${angle}deg` : '';

      const opts = optionsRef.current;
      if (opts?.autoScaleContent) {
        // Scale content based on the smaller dimension
        const contentScale = Math.min(screenWidth, screenHeight) / 100;
        const clampedScale = Math.max(0.1, Math.min(contentScale, 2));
        el.style.setProperty('--overlay-scale', String(clampedScale));

        if (opts.textSelector) {
          const textMinScale = opts.textMinScale ?? 0.5;
          const textEls = el.querySelectorAll<HTMLElement>(opts.textSelector);
          const display = clampedScale < textMinScale ? 'none' : '';
          textEls.forEach((t) => {
            t.style.display = display;
          });
        }
      }
    }

    // Initial position
    update();

    // Subscribe to events that affect object screen position
    canvas.on('after:render', update);
    canvas.on('mouse:wheel', update);
    object.on('moving', update);
    object.on('scaling', update);
    object.on('rotating', update);

    return () => {
      canvas.off('after:render', update);
      canvas.off('mouse:wheel', update);
      object.off('moving', update);
      object.off('scaling', update);
      object.off('rotating', update);
    };
  }, [canvasRef, object]);

  return containerRef;
}
