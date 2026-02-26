import { Stack, StackProps } from '@mui/material';
import { useEffect, useRef, type ReactNode } from 'react';

export interface OverlayBadgeProps extends StackProps {
  children?: ReactNode;
  /**
   * Maximum scale factor applied to the badge. Default: 2
   */
  maxScale?: number;
  /**
   * Minimum scale factor applied to the badge. Default: 0.75
   */
  minScale?: number;
  /** Top offset. Number values are interpreted as pixels. */
  top?: number | string;
  /** Right offset. Number values are interpreted as pixels. */
  right?: number | string;
  /** Bottom offset. Number values are interpreted as pixels. */
  bottom?: number | string;
  /** Left offset. Number values are interpreted as pixels. */
  left?: number | string;
}

/** Convert a number to a px string; pass strings through unchanged. */
function toPx(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

/**
 * An absolutely-positioned badge that scales proportionally within an
 * `ObjectOverlay` (or `OverlayContent`). The badge captures the overlay's
 * initial dimensions as a baseline and scales relative to that — growing
 * when the overlay gets larger (zoom in) and shrinking when it gets smaller
 * (zoom out), clamped between `minScale` and `maxScale`.
 *
 * Position the badge using the `top`, `right`, `bottom`, and `left` props.
 * Scaling always happens from the center so the badge stays visually
 * centered at its anchor point.
 *
 * When placed inside `OverlayContent`, the badge automatically
 * counter-scales against the parent's `--overlay-scale` transform so it
 * maintains its own independent size.
 *
 * @example
 * ```tsx
 * <ObjectOverlay canvasRef={canvasRef} object={obj}>
 *   <OverlayContent>
 *     <MyIcon />
 *     <FixedSizeContent><Typography>Label</Typography></FixedSizeContent>
 *   </OverlayContent>
 *   <OverlayBadge top={2} right={2}>
 *     <StatusDot />
 *   </OverlayBadge>
 * </ObjectOverlay>
 * ```
 */
export function OverlayBadge({
  children,
  maxScale = 2,
  minScale = 0.75,
  top,
  right,
  bottom,
  left,
  sx,
  ...rest
}: OverlayBadgeProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Capture the overlay's initial dimensions as the baseline (zoom ≈ 1).
  // The scale is then relative to this baseline — larger overlay → scale up,
  // smaller overlay → scale down.
  const baseSize = useRef<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Use the parent element (typically ObjectOverlay's Stack) as the
    // sizing boundary.  Its dimensions are set by ObjectOverlay's effect
    // and reflect the canvas object's screen-space size.
    const ancestor = el.parentElement;
    if (!ancestor) return;

    function update() {
      requestAnimationFrame(() => {
        if (!el || !ancestor) return;

        const containerW = ancestor.clientWidth;
        const containerH = ancestor.clientHeight;

        if (containerW <= 0 || containerH <= 0) {
          el.style.transform = '';
          return;
        }

        // Record the first valid measurement as the baseline.
        if (!baseSize.current) {
          baseSize.current = { w: containerW, h: containerH };
        }

        // Scale relative to the baseline, clamped to [minScale, maxScale].
        const ratio = Math.min(
          containerW / baseSize.current.w,
          containerH / baseSize.current.h,
        );
        const ownScale = Math.max(minScale, Math.min(ratio, maxScale));

        // When inside OverlayContent the parent's scale transform creates a
        // containing block. Counter-scale so the badge keeps its own size.
        const overlayScale =
          parseFloat(
            getComputedStyle(el).getPropertyValue('--overlay-scale'),
          ) || 1;

        el.style.transform = `scale(${ownScale / overlayScale})`;
      });
    }

    const observer = new ResizeObserver(update);
    observer.observe(ancestor);
    update();

    return () => {
      observer.disconnect();
      baseSize.current = null;
    };
  }, [maxScale, minScale]);

  return (
    <Stack
      ref={ref}
      sx={{
        position: 'absolute',
        top: toPx(top),
        right: toPx(right),
        bottom: toPx(bottom),
        left: toPx(left),
        transformOrigin: 'center center',
        pointerEvents: 'auto',
        width: 'max-content',
        height: 'max-content',
        flexShrink: 0,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
}
