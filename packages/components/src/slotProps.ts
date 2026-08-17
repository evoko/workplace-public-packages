// Shared plumbing for components that expose a `slotProps` bag. Package-internal
// — not re-exported from `src/index.ts`.
import type { SxProps, Theme } from '@mui/material';

export type SlotPropsOrFn<TProps, TCtx> = TProps | ((ctx: TCtx) => TProps);

export function resolveSlot<TProps, TCtx>(
  slot: SlotPropsOrFn<TProps, TCtx> | undefined,
  ctx: TCtx,
): TProps | undefined {
  if (!slot) return undefined;
  return typeof slot === 'function' ? (slot as (c: TCtx) => TProps)(ctx) : slot;
}

export function mergeSx(
  ...inputs: Array<SxProps<Theme> | false | null | undefined>
): SxProps<Theme> {
  return inputs
    .filter((v): v is SxProps<Theme> => Boolean(v))
    .flatMap((v) => (Array.isArray(v) ? v : [v])) as SxProps<Theme>;
}

/**
 * Layers one entry of a MUI `slotProps` bag over a component's own defaults for
 * that slot, per key. MUI types each entry as `props | ((ownerState) => props)`,
 * so a plain spread would silently drop the callback form.
 */
export function mergeSlotProps<TSlot>(
  ownProps: Record<string, unknown>,
  userProps: TSlot | undefined,
): TSlot {
  return (
    typeof userProps === 'function'
      ? (ownerState: unknown) => ({
          ...ownProps,
          ...(userProps as (state: unknown) => object)(ownerState),
        })
      : { ...ownProps, ...userProps }
  ) as TSlot;
}
