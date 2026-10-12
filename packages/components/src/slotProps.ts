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

/**
 * MUI 9's sx-array composition as a typed helper: flattens its inputs into one
 * sx array, dropping falsy entries. Pass a component's defaults first and the
 * caller's `sx` after them so the caller wins. Inputs may be objects, arrays,
 * theme functions or falsy values (e.g. `condition && extra`).
 */
export function mergeSx(
  ...inputs: Array<SxProps<Theme> | false | null | undefined>
): SxProps<Theme> {
  return inputs
    .filter((v): v is SxProps<Theme> => Boolean(v))
    .flatMap((v) => (Array.isArray(v) ? v : [v])) as SxProps<Theme>;
}
