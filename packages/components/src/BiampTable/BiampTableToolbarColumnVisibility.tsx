import { ColumnsIcon } from '@bwp-web/assets';
import type { Table } from '@tanstack/react-table';
import React, { type ReactNode, useState } from 'react';
import {
  BiampTableColumnVisibility,
  type ColumnVisibility,
  getColumnVisibilityDirtyCount,
  getDefaultColumnVisibility,
} from './BiampTableColumnVisibility';
import {
  BiampTableToolbarActionButton,
  type BiampTableToolbarActionButtonProps,
} from './BiampTableToolbarActionButton';

export type BiampTableToolbarColumnVisibilityProps<TData> = {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Icon for the toolbar trigger button. @default <ColumnsIcon variant="xs" /> */
  icon?: ReactNode;
  /** Accessible label for the toolbar trigger button. @default "Columns" */
  label?: string;
  /**
   * Default column visibility map used to compute the badge count.
   * When omitted, auto-derived from `meta.defaultVisible` on each column.
   */
  defaultColumnVisibility?: ColumnVisibility;
  /** Called after column visibility changes. */
  onChange?: (visibility: ColumnVisibility) => void;
  /** Label for the "show all" toggle inside the popover. @default "Show all" */
  showAllLabel?: string;
} & Omit<
  BiampTableToolbarActionButtonProps,
  'icon' | 'label' | 'onClick' | 'badgeContent' | 'onChange'
>;

export function BiampTableToolbarColumnVisibility<TData>({
  table,
  icon = <ColumnsIcon variant="xs" />,
  label = 'Columns',
  defaultColumnVisibility,
  onChange,
  showAllLabel,
  ...actionButtonProps
}: BiampTableToolbarColumnVisibilityProps<TData>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const defaults = defaultColumnVisibility ?? getDefaultColumnVisibility(table);
  const dirtyCount = getColumnVisibilityDirtyCount(table, defaults);

  return (
    <>
      <BiampTableToolbarActionButton
        label={label}
        icon={icon}
        badgeContent={dirtyCount}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          setAnchorEl(e.currentTarget)
        }
        {...actionButtonProps}
      />
      <BiampTableColumnVisibility
        table={table}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        onChange={onChange}
        showAllLabel={showAllLabel}
      />
    </>
  );
}
