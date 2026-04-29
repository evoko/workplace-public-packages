import { type Theme } from '@mui/material';

export const stickyHoverBg = {
  '.MuiTableRow-hover:hover > &, .Mui-selected > &': {
    bgcolor: ({ palette }: Theme) =>
      palette.mode === 'dark' ? palette.grey[800] : palette.grey[100],
  },
} as const;

export function cellSx(
  sticky: 'left' | 'right' | undefined,
  minWidth: number | string | undefined,
  zIndex: number,
) {
  if (sticky) {
    return {
      position: 'sticky',
      [sticky]: 0,
      zIndex,
      width: 0,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      bgcolor: 'background.paper',
      ...(zIndex < 3 && stickyHoverBg),
    } as const;
  }
  const mw = minWidth ?? 40;
  return {
    minWidth: mw,
    whiteSpace: 'nowrap',
    '&:has([data-truncate])': { maxWidth: mw, whiteSpace: 'normal' },
  };
}
