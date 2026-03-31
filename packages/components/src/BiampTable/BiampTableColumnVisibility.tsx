import type { Table, VisibilityState } from '@tanstack/react-table';
import React, { useCallback, useEffect, useRef } from 'react';
import './tanstack-meta';

/**
 * A looser alternative to TanStack's `VisibilityState` (`Record<string, boolean>`).
 * Accepts `Partial<Record<string, boolean>>` so callers don't need to cast
 * from URL params or partial objects. Internally, `undefined` values are
 * treated as `true` (visible).
 */
export type ColumnVisibility = Partial<Record<string, boolean>>;

/**
 * Converts a `ColumnVisibility` to TanStack's `VisibilityState`.
 * Use this when passing to `useReactTable({ state: { columnVisibility } })`.
 */
export function toVisibilityState(
  visibility: ColumnVisibility,
): VisibilityState {
  return visibility as VisibilityState;
}

/**
 * Reads `meta.defaultVisible` from all leaf columns and returns a
 * `ColumnVisibility` map. Columns without `defaultVisible` are omitted
 * (treated as visible by default).
 */
export function getDefaultColumnVisibility<TData>(
  table: Table<TData>,
): ColumnVisibility {
  const result: ColumnVisibility = {};
  for (const col of table.getAllLeafColumns()) {
    const dv = col.columnDef.meta?.defaultVisible;
    if (dv !== undefined) result[col.id] = dv;
  }
  return result;
}

/**
 * Returns the number of columns whose visibility differs from the default.
 * When `defaultVisibility` is omitted, auto-derives from `meta.defaultVisible`
 * on each column definition.
 */
export function getColumnVisibilityDirtyCount<TData>(
  table: Table<TData>,
  defaultVisibility?: ColumnVisibility,
): number {
  const current = table.getState().columnVisibility;
  const defaults = defaultVisibility ?? getDefaultColumnVisibility(table);
  let count = 0;
  for (const col of table.getAllLeafColumns()) {
    const isVisible = current[col.id] ?? true;
    const wasVisible = defaults[col.id] ?? true;
    if (isVisible !== wasVisible) count++;
  }
  return count;
}

export type BiampTableColumnVisibilityProps<TData> = {
  /** TanStack Table instance to connect to. */
  table: Table<TData>;
  /** Label for the "show all" toggle. @default "Show all" */
  showAllLabel?: string;
  /** The anchor element to position the popover near. When null, the popover is hidden. */
  anchorEl: HTMLElement | null;
  /** Called when the popover should close. */
  onClose: () => void;
};

const listItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px 0 0',
  cursor: 'pointer',
  listStyle: 'none',
};

export function BiampTableColumnVisibility<TData>({
  table,
  showAllLabel = 'Show all',
  anchorEl,
  onClose,
}: BiampTableColumnVisibilityProps<TData>) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);

  // Click-outside handling
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    },
    [anchorEl, onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const allVisible = table
    .getAllLeafColumns()
    .every((col) => col.getIsVisible());

  // Position below and to the right of the anchor
  const rect = anchorEl!.getBoundingClientRect();

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        zIndex: 1300,
        borderRadius: 6,
        border: '0.6px solid var(--solar-border-default)',
        boxShadow: '0px 1px 1px 0px rgba(0,0,0,0.05)',
        backgroundColor: 'var(--solar-surface-default, #fff)',
        minWidth: 150,
      }}
    >
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li
          style={listItemStyle}
          onClick={() => table.toggleAllColumnsVisible(!allVisible)}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '6px 0 6px 8px',
            }}
          >
            <input
              type="checkbox"
              checked={allVisible}
              onChange={() => table.toggleAllColumnsVisible(!allVisible)}
              aria-label={`${showAllLabel} columns`}
              style={{ marginRight: 8 }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--solar-text-default)',
              }}
            >
              {showAllLabel}
            </span>
          </label>
        </li>
        <li>
          <hr
            style={{
              margin: 0,
              border: 'none',
              borderTop: '1px solid var(--solar-border-default)',
            }}
          />
        </li>
        <li
          style={{
            maxHeight: 340,
            overflow: 'auto',
            overscrollBehavior: 'none',
          }}
        >
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {table.getAllLeafColumns().map((column) => {
              const columnName =
                column.columnDef.meta?.columnLabel ??
                (typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id);
              return (
                <li
                  key={column.id}
                  style={{
                    ...listItemStyle,
                    padding: '0 12px 0 0',
                  }}
                  onClick={column.getToggleVisibilityHandler()}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'var(--solar-surface-hover, rgba(0,0,0,0.04))';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'transparent';
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '8px 0 8px 8px',
                      width: '100%',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      aria-label={`Show ${columnName}`}
                      style={{ marginRight: 8 }}
                    />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--solar-text-default)',
                      }}
                    >
                      {columnName}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </div>
  );
}
