import { Box, type Theme } from '@mui/material';
import { type Row } from '@tanstack/react-table';
import { type ReactNode } from 'react';

// ── Expand guideline geometry ────────────────────────────────────
// Only used when `alwaysExpanded` is on. Per-depth indent matches the inner
// Box's `pl: row.depth * 28`; cell-pl matches the expand cell's `pl: 12px`.
// The vertical line at level k sits 4px to the right of where the parent
// (depth k-1) text content begins — close enough to read as anchored to the
// parent, far enough to not collide with the first character. The horizontal
// elbow stops 12px short of the child's text so the line reads as pointing at
// the child without touching it. For the first child of a parent, the elbow's
// top vertical is extended 12px upward so it visually reaches into the parent
// row instead of starting at the cell boundary.
const guidelineIndent = 28;
const guidelineCellPaddingLeft = 12;
const guidelineLineOffsetFromParentText = 4;
const guidelineElbowGapToChildText = 12;
const guidelineFirstChildTopExtension = 12;
const guidelineColor = ({ palette }: Theme) => palette.dividers.secondary;
const guidelineStroke = '0.6px';

function isLastChildOfParent<TData>(row: Row<TData>): boolean {
  const parent = row.getParentRow();
  if (!parent) return false;
  const siblings = parent.subRows;
  return siblings[siblings.length - 1]?.id === row.id;
}

function isFirstChildOfParent<TData>(row: Row<TData>): boolean {
  const parent = row.getParentRow();
  if (!parent) return false;
  return parent.subRows[0]?.id === row.id;
}

function getAncestorAtDepth<TData>(
  row: Row<TData>,
  targetDepth: number,
): Row<TData> | undefined {
  let current: Row<TData> | undefined = row;
  while (current && current.depth > targetDepth) {
    current = current.getParentRow();
  }
  return current && current.depth === targetDepth ? current : undefined;
}

export function ExpandGuidelines<TData>({ row }: { row: Row<TData> }) {
  const verticalX = (k: number) =>
    guidelineCellPaddingLeft +
    (k - 1) * guidelineIndent +
    guidelineLineOffsetFromParentText;
  const elbowEnd =
    guidelineCellPaddingLeft +
    row.depth * guidelineIndent -
    guidelineElbowGapToChildText;

  const lines: ReactNode[] = [];

  for (let k = 1; k < row.depth; k++) {
    const ancestor = getAncestorAtDepth(row, k);
    if (!ancestor || isLastChildOfParent(ancestor)) continue;
    lines.push(
      <Box
        key={`v-${k}`}
        aria-hidden
        sx={{
          position: 'absolute',
          left: `${verticalX(k)}px`,
          top: 0,
          bottom: 0,
          width: guidelineStroke,
          bgcolor: guidelineColor,
          pointerEvents: 'none',
        }}
      />,
    );
  }

  const elbowX = verticalX(row.depth);
  const rowIsLast = isLastChildOfParent(row);
  const rowIsFirst = isFirstChildOfParent(row);
  const elbowTopOffset = rowIsFirst ? -guidelineFirstChildTopExtension : 0;

  lines.push(
    <Box
      key="v-elbow-top"
      aria-hidden
      sx={{
        position: 'absolute',
        left: `${elbowX}px`,
        top: `${elbowTopOffset}px`,
        height: `calc(50% - ${elbowTopOffset}px)`,
        width: guidelineStroke,
        bgcolor: guidelineColor,
        pointerEvents: 'none',
      }}
    />,
  );

  if (!rowIsLast) {
    lines.push(
      <Box
        key="v-elbow-bottom"
        aria-hidden
        sx={{
          position: 'absolute',
          left: `${elbowX}px`,
          top: '50%',
          bottom: 0,
          width: guidelineStroke,
          bgcolor: guidelineColor,
          pointerEvents: 'none',
        }}
      />,
    );
  }

  lines.push(
    <Box
      key="h-elbow"
      aria-hidden
      sx={{
        position: 'absolute',
        left: `${elbowX}px`,
        top: '50%',
        width: `${elbowEnd - elbowX}px`,
        height: guidelineStroke,
        bgcolor: guidelineColor,
        pointerEvents: 'none',
      }}
    />,
  );

  return <>{lines}</>;
}
