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
