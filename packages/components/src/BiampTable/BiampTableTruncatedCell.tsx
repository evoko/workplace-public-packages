import { Box, Tooltip } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

/**
 * Renders cell content with single-line truncation (ellipsis).
 * A tooltip showing the full text appears only when the content is actually truncated.
 * The Tooltip popup is only mounted when `open` is true, so there is zero DOM
 * overhead for non-truncated cells.
 */
export function BiampTableTruncatedCell({
  children,
}: {
  children: React.ReactNode;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleMouseEnter = useCallback(() => {
    const el = textRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setOpen(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Tooltip
      title={children}
      open={open}
      arrow
      placement="top"
      disableInteractive
    >
      <Box
        ref={textRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
