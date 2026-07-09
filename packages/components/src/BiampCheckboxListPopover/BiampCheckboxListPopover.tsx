import { Checkbox, Divider, PopoverProps, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import {
  BiampListPopover,
  BiampListPopoverItem,
  BiampListPopoverScrollArea,
} from '../BiampListPopover';

export type BiampCheckboxListItem = {
  /** Stable identifier passed back to `onToggleItem`. */
  id: string;
  /** Row label. */
  label: ReactNode;
  /** Whether the row's checkbox is checked. */
  checked: boolean;
  /** Accessible label for the checkbox. Falls back to `label` when it's a string. */
  ariaLabel?: string;
};

export type BiampCheckboxListPopoverProps = Omit<PopoverProps, 'children'> & {
  /** Checkbox rows to render. */
  items: BiampCheckboxListItem[];
  /** Called with the item's `id` when its row is toggled. */
  onToggleItem: (id: string) => void;
  /** Show the fixed "select all" row above the list. @default true */
  showSelectAll?: boolean;
  /** Label for the "select all" row. @default 'Show all' */
  selectAllLabel?: string;
  /** Called with the desired next state when the "select all" row is toggled. */
  onToggleAll?: (checked: boolean) => void;
  /** Height cap before the item list scrolls. @default 340 */
  maxHeight?: number | string;
};

function resolveAria(label: ReactNode, ariaLabel?: string): string | undefined {
  if (ariaLabel) return ariaLabel;
  return typeof label === 'string' ? label : undefined;
}

/**
 * Checkbox list popover with an optional "select all" toggle — the styling used
 * by the table column-visibility menu, decoupled from any data source. Drive it
 * with a plain `items` array and the `onToggle*` callbacks.
 */
export function BiampCheckboxListPopover({
  items,
  onToggleItem,
  showSelectAll = true,
  selectAllLabel = 'Show all',
  onToggleAll,
  maxHeight,
  ...popoverProps
}: BiampCheckboxListPopoverProps) {
  const allChecked = items.length > 0 && items.every((item) => item.checked);

  return (
    <BiampListPopover {...popoverProps}>
      {showSelectAll && (
        <>
          <BiampListPopoverItem onClick={() => onToggleAll?.(!allChecked)}>
            <Checkbox
              checked={allChecked}
              slotProps={{ input: { 'aria-label': selectAllLabel } }}
            />
            <Typography variant="caption" fontWeight={600}>
              {selectAllLabel}
            </Typography>
          </BiampListPopoverItem>
          <Divider />
        </>
      )}
      <BiampListPopoverScrollArea maxHeight={maxHeight}>
        {items.map((item) => (
          <BiampListPopoverItem
            key={item.id}
            onClick={() => onToggleItem(item.id)}
          >
            <Checkbox
              checked={item.checked}
              sx={{ py: 1 }}
              slotProps={{
                input: {
                  'aria-label': resolveAria(item.label, item.ariaLabel),
                },
              }}
            />
            <Typography variant="caption">{item.label}</Typography>
          </BiampListPopoverItem>
        ))}
      </BiampListPopoverScrollArea>
    </BiampListPopover>
  );
}
