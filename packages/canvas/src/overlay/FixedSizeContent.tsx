import { Stack, StackProps } from '@mui/material';
import { useEffect, useRef, type ReactNode } from 'react';

export interface FixedSizeContentProps extends StackProps {
  children?: ReactNode;
  /**
   * When `true` (default), content is collapsed (`display: none`) if showing
   * it would cause `OverlayContent` to shrink below its natural size
   * vertically. Horizontal overflow is always handled by truncation (ellipsis).
   * When `false`, no automatic hiding is applied.
   */
  hideOnOverflow?: boolean;
  /**
   * Horizontal padding in pixels subtracted from the available width when
   * calculating the truncation `maxWidth`. Default: 4
   */
  truncationPadding?: number;
}

/**
 * Keeps children at their natural CSS pixel size inside an `OverlayContent`,
 * counter-scaling against `OverlayContent`'s fit-to-container transform.
 * Icons and other siblings still scale to fill the object bounds as usual,
 * while text wrapped in `FixedSizeContent` stays at a constant screen size.
 *
 * Text that overflows horizontally is truncated with an ellipsis. When
 * `hideOnOverflow` is `true` (default), the element is fully collapsed
 * (`display: none`) as soon as the overlay container is too short to fit
 * both the fixed-size content and its siblings at natural size, so
 * `OverlayContent` recalculates its scale using only the remaining siblings.
 * Once there is enough room again (e.g. zooming in), the element reappears.
 *
 * Uses the `--overlay-scale` CSS custom property set by `OverlayContent`.
 * When used outside `OverlayContent` (e.g. directly inside `ObjectOverlay`),
 * the fallback of 1 means no counter-scaling is applied and children render
 * at their natural size.
 *
 * @example
 * ```tsx
 * <ObjectOverlay object={obj}>
 *   <OverlayContent>
 *     <Stack alignItems="center">
 *       <MyIcon />                      {// scales to fit}
 *       <FixedSizeContent>
 *         <Typography noWrap>Always 14px, truncates</Typography>
 *       </FixedSizeContent>
 *     </Stack>
 *   </OverlayContent>
 * </ObjectOverlay>
 * ```
 */
export function FixedSizeContent({
  children,
  hideOnOverflow = true,
  truncationPadding = 4,
  sx,
  ...rest
}: FixedSizeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Total parent content height (siblings + this text) measured while visible.
  // Used to decide whether showing the text would cause OverlayContent to
  // shrink below scale 1.  Stable across show/hide cycles because it is only
  // updated while the element is visible.
  const totalContentHeightRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Find the nearest ancestor with overflow:hidden (OverlayContent outer
    // Stack) to use as the clipping boundary.  Its size is set via
    // ObjectOverlay based on zoom and object dimensions, independent of
    // content, so there is no feedback loop.
    let clipAncestor: HTMLElement | null = el.parentElement;
    while (clipAncestor) {
      if (getComputedStyle(clipAncestor).overflow === 'hidden') break;
      clipAncestor = clipAncestor.parentElement;
    }
    if (!clipAncestor) return;

    const ancestor = clipAncestor;

    // Measure total content height while the element is visible on mount.
    totalContentHeightRef.current = el.parentElement?.scrollHeight ?? 0;

    function check() {
      // Defer to the next frame so OverlayContent's ResizeObserver has
      // already updated --overlay-scale.
      requestAnimationFrame(() => {
        if (!el) return;
        const containerRect = ancestor.getBoundingClientRect();

        // Constrain width to the container (minus padding) so text truncates
        // with ellipsis before reaching the edge.
        el.style.maxWidth = `${Math.max(0, containerRect.width - truncationPadding * 2)}px`;

        if (!hideOnOverflow) return;

        // Check whether the total content (siblings + this text) fits
        // vertically at natural size.  This comparison is stable because
        // totalContentHeightRef is only updated while the element is visible,
        // so the cached value does not change when the element hides.
        const fits = containerRect.height >= totalContentHeightRef.current;

        if (fits && el.style.display === 'none') {
          // Show, then re-measure in case content changed while hidden.
          el.style.display = '';
          totalContentHeightRef.current = el.parentElement?.scrollHeight ?? 0;
          // Re-check with the updated measurement to prevent showing
          // when the content barely doesn't fit.
          if (containerRect.height < totalContentHeightRef.current) {
            el.style.display = 'none';
          }
        } else if (!fits && el.style.display !== 'none') {
          el.style.display = 'none';
        }

        // Keep the cache fresh while visible.
        if (el.style.display !== 'none') {
          totalContentHeightRef.current = el.parentElement?.scrollHeight ?? 0;
        }
      });
    }

    const observer = new ResizeObserver(check);
    observer.observe(ancestor);
    check();

    return () => observer.disconnect();
  }, [hideOnOverflow, truncationPadding]);

  return (
    <Stack
      ref={ref}
      sx={{
        transform: 'scale(calc(1 / var(--overlay-scale, 1)))',
        transformOrigin: 'center center',
        flexShrink: 0,
        width: 'max-content',
        overflow: 'hidden',
        alignItems: 'center',
        '& > *': {
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
}
