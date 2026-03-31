import {
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';

export interface FixedSizeContentProps extends HTMLAttributes<HTMLDivElement> {
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
 *     <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
 *       <MyIcon />
 *       <FixedSizeContent>
 *         <span style={{ whiteSpace: 'nowrap' }}>Always 14px, truncates</span>
 *       </FixedSizeContent>
 *     </div>
 *   </OverlayContent>
 * </ObjectOverlay>
 * ```
 */
export function FixedSizeContent({
  children,
  hideOnOverflow = true,
  truncationPadding = 4,
  style,
  ...rest
}: FixedSizeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Total parent content height (siblings + this text) measured while visible.
  const totalContentHeightRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Find the nearest ancestor with overflow:hidden (OverlayContent outer
    // div) to use as the clipping boundary.
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
      requestAnimationFrame(() => {
        if (!el) return;
        const containerRect = ancestor.getBoundingClientRect();

        // Constrain width to the container (minus padding) so text truncates
        // with ellipsis before reaching the edge.
        el.style.maxWidth = `${Math.max(0, containerRect.width - truncationPadding * 2)}px`;

        if (!hideOnOverflow) return;

        const fits = containerRect.height >= totalContentHeightRef.current;

        if (fits && el.style.display === 'none') {
          el.style.display = '';
          totalContentHeightRef.current = el.parentElement?.scrollHeight ?? 0;
          if (containerRect.height < totalContentHeightRef.current) {
            el.style.display = 'none';
          }
        } else if (!fits && el.style.display !== 'none') {
          el.style.display = 'none';
        }

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

  const baseStyle: CSSProperties = {
    transform: 'scale(calc(1 / var(--overlay-scale, 1)))',
    transformOrigin: 'center center',
    flexShrink: 0,
    width: 'max-content',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...style,
  };

  return (
    <div ref={ref} style={baseStyle} {...rest}>
      {children}
    </div>
  );
}
