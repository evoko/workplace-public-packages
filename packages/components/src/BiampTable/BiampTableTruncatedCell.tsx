import React, { useCallback, useRef, useState } from 'react';

/**
 * Renders cell content with single-line truncation (ellipsis).
 * A tooltip showing the full text appears only when the content is actually truncated.
 */
export function BiampTableTruncatedCell({
  children,
}: {
  children: React.ReactNode;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseEnter = useCallback(() => {
    const el = textRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setTooltipVisible(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  return (
    <div
      data-truncate
      ref={textRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
        position: 'relative',
      }}
    >
      {children}
      {tooltipVisible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            padding: '4px 8px',
            borderRadius: 4,
            backgroundColor: 'var(--solar-surface-inverse, #333)',
            color: 'var(--solar-text-inverse, #fff)',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1500,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
