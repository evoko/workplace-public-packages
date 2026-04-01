import { Stack, StackProps } from '@mui/material';
import { useEffect, useRef, type ReactNode } from 'react';

export interface OverlayContentProps extends StackProps {
  children?: ReactNode;
  /** Padding in pixels between the content and the parent bounds. Default: 6 */
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
 * <ObjectOverlay object={obj}>
 *   <OverlayContent padding={6} maxScale={2}>
 *     <MyBadge>{label}</MyBadge>
 *   </OverlayContent>
 * </ObjectOverlay>
 * ```
 */
export function OverlayContent({
  children,
  padding = 6,
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

    // Cache natural content dimensions to avoid expensive
    // scrollWidth/scrollHeight reads on every container resize (e.g. zoom).
    // These only change when the inner content changes (children toggle
    // display, text changes, etc.), not when the container resizes.
    let natW = 0;
    let natH = 0;

    function fit() {
      if (!outer || !inner) return;

      const containerW = outer.clientWidth;
      const containerH = outer.clientHeight;

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

    const observer = new ResizeObserver((entries) => {
      // Only re-measure natural content dimensions when the inner element
      // changes (e.g. FixedSizeContent collapsing via display:none).
      // Container-only resizes (zoom/pan) reuse the cached values.
      for (const entry of entries) {
        if (entry.target === inner) {
          natW = inner.scrollWidth;
          natH = inner.scrollHeight;
          break;
        }
      }
      fit();
    });
    observer.observe(outer);
    observer.observe(inner);

    // Initial measurement and fit.
    natW = inner.scrollWidth;
    natH = inner.scrollHeight;
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
          alignItems: 'center',
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
