import { Stack, StackProps } from '@mui/material';
import { useEffect, useRef, type ReactNode } from 'react';

export interface OverlayContentProps extends StackProps {
  children?: ReactNode;
  /** Padding in pixels between the content and the parent bounds. Default: 4 */
  padding?: number;
  /** Maximum scale factor applied to the content. Default: 2 */
  maxScale?: number;
}

/**
 * Scales its children to fit within the parent's bounds (typically an
 * `ObjectOverlay`). Content is measured at its natural size then scaled
 * down or up (capped at `maxScale`) to fill the available space while
 * maintaining aspect ratio.
 *
 * @example
 * ```tsx
 * <ObjectOverlay canvasRef={canvasRef} object={obj}>
 *   <OverlayContent padding={4} maxScale={2}>
 *     <MyBadge>{label}</MyBadge>
 *   </OverlayContent>
 * </ObjectOverlay>
 * ```
 */
export function OverlayContent({
  children,
  padding = 4,
  maxScale = 2,
  sx,
  ...rest
}: OverlayContentProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    function fit() {
      if (!outer || !inner) return;

      const containerW = outer.clientWidth;
      const containerH = outer.clientHeight;

      // scrollWidth/scrollHeight give the intrinsic size regardless of
      // CSS transforms, so we always get the natural content dimensions.
      const natW = inner.scrollWidth;
      const natH = inner.scrollHeight;

      if (natW === 0 || natH === 0 || containerW <= 0 || containerH <= 0) {
        inner.style.transform = '';
        inner.style.removeProperty('--overlay-scale');
        return;
      }

      // Padding is added to the content's effective size so it scales
      // proportionally with the content — never causing overflow.
      const scale = Math.min(
        containerW / (natW + padding * 2),
        containerH / (natH + padding * 2),
        maxScale,
      );
      inner.style.transform = `scale(${scale})`;
      // Expose the scale so `FixedSizeContent` children can counter-scale.
      inner.style.setProperty('--overlay-scale', String(scale));
    }

    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    // Also observe the inner Stack so we recalculate when children toggle
    // display (e.g. FixedSizeContent collapsing via display:none).
    observer.observe(inner);
    fit();

    return () => observer.disconnect();
  }, [padding, maxScale]);

  return (
    <Stack
      ref={outerRef}
      sx={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...sx,
      }}
      {...rest}
    >
      <Stack
        ref={innerRef}
        sx={{
          transformOrigin: 'center center',
          flexShrink: 0,
          width: 'max-content',
        }}
      >
        {children}
      </Stack>
    </Stack>
  );
}
