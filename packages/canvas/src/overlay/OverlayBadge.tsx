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
  /**
   * Position on the inscribed ellipse instead of the rectangle edge.
   * The angle is derived from which anchor props (`top`, `right`, etc.)
   * are specified — e.g. `top` + `right` → 45° (top-right of the circle).
   * The anchor values are then applied as pixel offsets from the ellipse point.
   * Default: false
   */
  circular?: boolean;
}

/** Convert a number to a px string; pass strings through unchanged. */
function toPx(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

/** Derive an angle (degrees) from which anchor props are defined. */
function deriveAngle(
  top: number | string | undefined,
  right: number | string | undefined,
  bottom: number | string | undefined,
  left: number | string | undefined,
): number {
  const hasTop = top !== undefined;
  const hasRight = right !== undefined;
  const hasBottom = bottom !== undefined;
  const hasLeft = left !== undefined;

  if (hasTop && hasRight) return 45;
  if (hasTop && hasLeft) return 135;
  if (hasBottom && hasRight) return 315;
  if (hasBottom && hasLeft) return 225;
  if (hasTop) return 90;
  if (hasRight) return 0;
  if (hasBottom) return 270;
  if (hasLeft) return 180;
  return 45; // default: top-right
}

/** Return the percentage position on the inscribed ellipse at the given angle. */
function ellipsePosition(angleDeg: number): { pctX: number; pctY: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    pctX: 50 + 50 * Math.cos(rad),
    pctY: 50 - 50 * Math.sin(rad),
  };
}

/** Extract a numeric pixel value from a prop, or 0 for strings/undefined. */
function toNum(v: number | string | undefined): number {
  return typeof v === 'number' ? v : 0;
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
  circular = false,
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

        const scale = `scale(${ownScale / overlayScale})`;
        el.style.transform = circular
          ? `translate(-50%, -50%) ${scale}`
          : scale;
      });
    }

    const observer = new ResizeObserver(update);
    observer.observe(ancestor);
    update();

    return () => {
      observer.disconnect();
      baseSize.current = null;
    };
  }, [maxScale, minScale, circular]);

  // For circular mode, compute position on the inscribed ellipse.
  const positionSx = circular
    ? (() => {
        const angle = deriveAngle(top, right, bottom, left);
        const { pctX, pctY } = ellipsePosition(angle);
        const leftOffset = toNum(left) - toNum(right);
        const topOffset = toNum(top) - toNum(bottom);
        return {
          left: `calc(${pctX}% + ${leftOffset}px)`,
          top: `calc(${pctY}% + ${topOffset}px)`,
        };
      })()
    : {
        top: toPx(top),
        right: toPx(right),
        bottom: toPx(bottom),
        left: toPx(left),
      };

  return (
    <Stack
      ref={ref}
      sx={{
        position: 'absolute',
        ...positionSx,
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
