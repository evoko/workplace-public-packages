/**
 * Shared plumbing for components that expose a `slotProps` bag. Package-internal
 * — not re-exported from `src/index.ts`.
 *
 * Lives at the package root rather than inside a component folder because both
 * `BiampTable` and the `LandingPage` cards use it.
 */
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
 * Layers one entry of a MUI `slotProps` bag — `slotProps.input`,
 * `slotProps.select`, … — over the defaults a component set for that same slot,
 * so a consumer adding a key does not silently drop the component's own.
 *
 * MUI types each entry as `props | ((ownerState) => props)` and resolves the
 * callback form at render time (`useSlot` → `resolveComponentProps`), so a plain
 * `{ ...own, ...user }` would drop a consumer's callback entirely — spreading a
 * function yields no keys. Shallow by design: the consumer's individual keys
 * win, the rest survive.
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
