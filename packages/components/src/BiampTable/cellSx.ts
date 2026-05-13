import { type Theme } from '@mui/material';

export const stickyHoverBg = {
  '.MuiTableRow-hover:hover > &, .Mui-selected > &': {
    bgcolor: ({ palette }: Theme) => palette.background.info,
  },
} as const;

export function cellSx(
  sticky: 'left' | 'right' | undefined,
  minWidth: number | string | undefined,
  zIndex: number,
) {
  if (sticky) {
    const isHeader = zIndex >= 3;
    return {
      position: 'sticky',
      [sticky]: 0,
      zIndex,
      width: 0,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      bgcolor: isHeader
        ? ({ palette }: Theme) =>
            palette.mode === 'dark'
              ? palette.grey[900]
              : palette.background.paper
        : 'background.paper',
      ...(!isHeader && stickyHoverBg),
    } as const;
  }
  const mw = minWidth ?? 40;
  return {
    minWidth: mw,
    whiteSpace: 'nowrap',
    '&:has([data-truncate])': { maxWidth: mw, whiteSpace: 'normal' },
  };
}
