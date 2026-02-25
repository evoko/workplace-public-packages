import { Stack, StackProps } from '@mui/material';
import { useEffect, useRef, type ReactNode } from 'react';

export interface FixedSizeContentProps extends StackProps {
  children?: ReactNode;
  /**
   * When `true` (default), content is hidden entirely if it would overflow the
   * overlay container. When `false`, overflowing content is clipped by the
   * parent's `overflow: hidden`.
   */
  hideOnOverflow?: boolean;
}

/**
 * Keeps children at their natural CSS pixel size inside an `OverlayContent`,
 * counter-scaling against `OverlayContent`'s fit-to-container transform.
 * Icons and other siblings still scale to fill the object bounds as usual,
 * while text wrapped in `FixedSizeContent` stays at a constant screen size.
 *
 * Uses the `--overlay-scale` CSS custom property set by `OverlayContent`.
 * When used outside `OverlayContent` (e.g. directly inside `ObjectOverlay`),
 * the fallback of 1 means no counter-scaling is applied and children render
 * at their natural size.
 *
 * @example
 * ```tsx
 * <ObjectOverlay canvasRef={canvasRef} object={obj}>
 *   <OverlayContent>
 *     <Stack alignItems="center">
 *       <MyIcon />                      {// scales to fit}
 *       <FixedSizeContent>
 *         <Typography>Always 14px</Typography>
 *       </FixedSizeContent>
 *     </Stack>
 *   </OverlayContent>
 * </ObjectOverlay>
 * ```
 */
export function FixedSizeContent({
  children,
  hideOnOverflow = true,
  sx,
  ...rest
}: FixedSizeContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hideOnOverflow) return;

    // Find the nearest ancestor with overflow:hidden (OverlayContent outer
    // Stack or ObjectOverlay's Stack) to use as the clipping boundary.
    let clipAncestor: HTMLElement | null = el.parentElement;
    while (clipAncestor) {
      if (getComputedStyle(clipAncestor).overflow === 'hidden') break;
      clipAncestor = clipAncestor.parentElement;
    }
    if (!clipAncestor) return;

    const ancestor = clipAncestor;

    function check() {
      // Use requestAnimationFrame to ensure OverlayContent has already
      // updated --overlay-scale (both ResizeObservers fire in the same
      // microtask batch, so layout is settled by the next frame).
      requestAnimationFrame(() => {
        if (!el) return;
        // getBoundingClientRect gives visual (post-transform) sizes,
        // so the counter-scale is already factored in.
        const contentRect = el.getBoundingClientRect();
        const containerRect = ancestor.getBoundingClientRect();
        const fits =
          contentRect.width <= containerRect.width + 1 &&
          contentRect.height <= containerRect.height + 1;
        el.style.visibility = fits ? 'visible' : 'hidden';
      });
    }

    const observer = new ResizeObserver(check);
    observer.observe(ancestor);
    check();

    return () => observer.disconnect();
  }, [hideOnOverflow]);

  return (
    <Stack
      ref={ref}
      sx={{
        transform: 'scale(calc(1 / var(--overlay-scale, 1)))',
        transformOrigin: 'center center',
        flexShrink: 0,
        width: 'max-content',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
}
