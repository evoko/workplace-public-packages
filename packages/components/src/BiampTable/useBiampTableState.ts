import { type RowData, type TableState } from '@tanstack/react-table';
import { useCallback, useSyncExternalStore } from 'react';
import type {
  BiampTableFeatures,
  BiampTableInstance,
} from './biampTableFeatures';

/**
 * Subscribes the calling component to every state change of `table` and
 * returns the current state. BiampTable components read state through this
 * (v9 removed `table.getState()`) so they re-render even when the consumer
 * narrowed `useTable`'s selector.
 */
export function useBiampTableState<TData extends RowData>(
  table: BiampTableInstance<TData>,
): TableState<BiampTableFeatures> {
  // Key on the store, not the table: v9's useTable returns a new `table` object
  // every render, but `table.store` is stable for the table's lifetime.
  const { store } = table;
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const subscription = store.subscribe(() => onStoreChange());
      return () => subscription.unsubscribe();
    },
    [store],
  );
  const getSnapshot = useCallback(() => store.state, [store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
