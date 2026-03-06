import type { RowSelectionState, SortingState } from '@tanstack/react-table';

/** A single-field server-side order, matching typical GraphQL order input types. */
export type ServerSideOrder<F extends string> = {
  field: F;
  desc?: boolean;
};

/**
 * Convert a server-side order object to TanStack SortingState.
 *
 * @param order - `{ field, desc? }` from URL params / GraphQL
 * @param fieldToColumnId - optional map when column IDs differ from order field names
 */
export function orderToSorting<F extends string>(
  order: ServerSideOrder<F> | undefined,
  fieldToColumnId?: Partial<Record<F, string>>,
): SortingState {
  if (!order) return [];
  const id = fieldToColumnId?.[order.field] ?? order.field;
  return [{ id, desc: order.desc ?? false }];
}

/**
 * Convert TanStack SortingState back to a server-side order object.
 *
 * @param sorting - TanStack sorting state
 * @param columnIdToField - optional map when column IDs differ from order field names
 */
export function sortingToOrder<F extends string>(
  sorting: SortingState,
  columnIdToField?: Record<string, F>,
): ServerSideOrder<F> | undefined {
  if (sorting.length === 0) return undefined;
  const { id, desc } = sorting[0];
  const field = (columnIdToField?.[id] ?? id) as F;
  return { field, desc };
}

/**
 * Convert an array of selected row IDs to TanStack RowSelectionState.
 */
export function selectedIdsToRowSelection(ids: string[]): RowSelectionState {
  const state: RowSelectionState = {};
  for (const id of ids) {
    state[id] = true;
  }
  return state;
}

/**
 * Convert TanStack RowSelectionState to an array of selected row IDs.
 */
export function rowSelectionToSelectedIds(
  selection: RowSelectionState,
): string[] {
  return Object.keys(selection).filter((key) => selection[key]);
}

/**
 * Build bidirectional mappings between TanStack column IDs and server-side order
 * field enum values from column definitions that carry `meta.orderField`.
 */
export function getOrderFieldMappings<F extends string = string>(
  columns: { id?: string; meta?: { orderField?: string } }[],
): {
  columnIdToField: Record<string, F>;
  fieldToColumnId: Partial<Record<F, string>>;
} {
  const columnIdToField: Record<string, F> = {};
  const fieldToColumnId: Partial<Record<F, string>> = {};
  for (const col of columns) {
    const orderField = col.meta?.orderField as F | undefined;
    if (col.id && orderField) {
      columnIdToField[col.id] = orderField;
      fieldToColumnId[orderField] = col.id;
    }
  }
  return { columnIdToField, fieldToColumnId };
}

/**
 * Derives default column visibility from column definitions' `meta.defaultVisible`.
 * Columns without `defaultVisible` are omitted (treated as visible by TanStack).
 */
export function getDefaultColumnVisibilityFromDefs(
  columns: { id?: string; meta?: { defaultVisible?: boolean } }[],
): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  for (const col of columns) {
    if (col.id != null && col.meta?.defaultVisible !== undefined) {
      defaults[col.id] = col.meta.defaultVisible;
    }
  }
  return defaults;
}

/**
 * Returns only the entries in `visibility` that differ from `defaults`.
 * Columns not present in `defaults` are treated as visible (`true`) by default.
 * Use this to strip default-matching entries before persisting to URL params.
 */
export function getDirtyColumnVisibility(
  visibility: Record<string, boolean>,
  defaults: Record<string, boolean>,
): Record<string, boolean> {
  const dirty: Record<string, boolean> = {};
  for (const [id, visible] of Object.entries(visibility)) {
    if (visible !== (defaults[id] ?? true)) {
      dirty[id] = visible;
    }
  }
  return dirty;
}
