/**
 * The viewer-free core of the web Playground: a component's controls from the codegen's data, its
 * Storybook argTypes and defaults, the icon an icon control picks, the event log's lines, and the
 * `Playground` a builder renders from. It takes the data (`virtual:solar`'s PLAYGROUND) as an
 * argument and imports no viewer, so the Storybook adapter (adapter.tsx), the Playwright page
 * (test/visual/playground-page.tsx) and the unit tests all build the same Playground from it.
 */

import * as assets from '@bwp-web/assets';
import { IconPlus, type IconProps } from '@bwp-web/assets';
import type { ArgTypes } from '@storybook/react-vite';
import type { ComponentType, ReactNode } from 'react';
import type {
  ControlKind,
  ControlValue,
  Playground,
  PlaygroundBuilder,
  PlaygroundControl,
  PlaygroundData,
} from './types.js';

const BOOLEAN_KINDS = new Set<ControlKind>(['boolean', 'child', 'content']);
const TEXT_KINDS = new Set<ControlKind>(['text', 'childText']);
const NUMBER_KINDS = new Set<ControlKind>(['number', 'integer']);

/** A component's controls: its IR's, its width, then its extras, as the codegen lists them. */
export function controlsOf(
  data: PlaygroundData,
  component: string,
): PlaygroundControl[] {
  const controls = data.components[component];
  if (!controls) throw new Error(`${component}: no Playground controls`);
  return controls;
}

/** Every control at its default: the Playground's first values, and what Reset restores. */
export const defaultsOf = (
  controls: PlaygroundControl[],
): Record<string, ControlValue> =>
  Object.fromEntries(controls.map((c) => [c.name, c.default]));

/** What an icon control offers: none, the sample, then every SOLAR icon in both styles. */
const iconOptionsCache = new WeakMap<PlaygroundData, string[]>();
export function iconOptions(data: PlaygroundData): string[] {
  let options = iconOptionsCache.get(data);
  if (!options) {
    const { iconNone, iconSample, iconSolid } = data.values;
    options = [
      iconNone,
      iconSample,
      ...data.icons.flatMap((s) => [s, `${s}${iconSolid}`]),
    ];
    iconOptionsCache.set(data, options);
  }
  return options;
}

/** A control's Storybook argType. */
export function argTypeOf(
  control: PlaygroundControl,
  data: PlaygroundData,
): ArgTypes[string] {
  switch (control.kind) {
    case 'select':
      return { control: 'select', options: control.options };
    case 'boolean':
    case 'child':
    case 'content':
      return { control: 'boolean' };
    case 'color':
      return { control: 'color' };
    case 'text':
    case 'childText':
      return { control: 'text' };
    case 'number':
    case 'integer':
      return {
        control: {
          type: 'number',
          min: control.min,
          max: control.max,
          step: control.step ?? (control.kind === 'integer' ? 1 : undefined),
        },
      };
    case 'icon':
      return { control: 'select', options: iconOptions(data) };
    case 'width':
      return { control: 'select', options: data.values.widths };
  }
}

/** A component's Storybook argTypes, one per control. */
export const argTypesOf = (data: PlaygroundData, component: string): ArgTypes =>
  Object.fromEntries(
    controlsOf(data, component).map((c) => [c.name, argTypeOf(c, data)]),
  );

/** The @bwp-web/assets icon components, by name (the namespace also holds logos and data). */
const iconComponents = assets as unknown as Record<
  string,
  ComponentType<IconProps> | undefined
>;

/**
 * An icon control's value as an element: none, the builder's sample, or the @bwp-web/assets
 * component the icon spec names for the stem, in the chosen style. A value that names no icon
 * gives undefined, as `_none` does, rather than failing the render; the unit test proves every
 * stem resolves.
 */
export function iconElement(
  value: unknown,
  data: PlaygroundData,
): ReactNode | undefined {
  const { iconNone, iconSample, iconSolid } = data.values;
  if (typeof value !== 'string' || value === iconNone) return undefined;
  if (value === iconSample) return <IconPlus />;
  const solid = value.endsWith(iconSolid);
  const stem = solid ? value.slice(0, -iconSolid.length) : value;
  const Icon = iconComponents[data.iconComponents[stem] ?? ''];
  if (!Icon) return undefined;
  return solid ? <Icon variant="solid" /> : <Icon />;
}

/** One line of the event log: the event, and its detail in JSON unless null or undefined. */
export const logLine = (event: string, detail?: unknown) =>
  detail === undefined || detail === null
    ? event
    : `${event}: ${JSON.stringify(detail)}`;

/** The log with `line` added, newest first, kept to the log's length. */
export const withLine = (lines: string[], line: string, data: PlaygroundData) =>
  [line, ...lines].slice(0, data.values.logLength);

/** Throws unless `value` fits `control`: what `set` accepts. */
export function checkValue(
  control: PlaygroundControl,
  value: unknown,
  data: PlaygroundData,
): void {
  const { kind, name } = control;
  const fail = (what: string) => {
    throw new TypeError(
      `Playground control "${name}" (${kind}) takes ${what}, not ${JSON.stringify(value)}`,
    );
  };
  const inBounds = (n: number) =>
    (control.min === undefined || n >= control.min) &&
    (control.max === undefined || n <= control.max);
  const bounds = `within ${control.min ?? '-∞'}…${control.max ?? '∞'}`;
  if (BOOLEAN_KINDS.has(kind)) {
    if (typeof value !== 'boolean') fail('a boolean');
  } else if (TEXT_KINDS.has(kind)) {
    if (typeof value !== 'string') fail('a string');
  } else if (kind === 'color') {
    if (value !== null && typeof value !== 'string') fail('a string or null');
  } else if (kind === 'select') {
    if (!control.options?.includes(value as string))
      fail(`one of ${JSON.stringify(control.options)}`);
  } else if (kind === 'icon') {
    if (!iconOptions(data).includes(value as string)) fail('an icon value');
  } else if (kind === 'width') {
    if (!data.values.widths.includes(value as string))
      fail(`one of ${JSON.stringify(data.values.widths)}`);
  } else if (kind === 'integer') {
    if (!Number.isInteger(value) || !inBounds(value as number))
      fail(`an integer ${bounds}`);
  } else if (kind === 'number') {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      !inBounds(value)
    )
      fail(`a number ${bounds}`);
  }
}

/** A component slot's toggle and its words, from the controls' current values. */
export function childOf(
  controls: PlaygroundControl[],
  values: Record<string, unknown>,
  slot: string,
): { shown: boolean; text: string | undefined; words?: string } {
  const words = controls.find((c) => c.kind === 'childText' && c.slot === slot);
  const text = words ? values[words.name] : undefined;
  return {
    shown: values[slot] === true,
    text: typeof text === 'string' ? text : undefined,
    words: words?.name,
  };
}

/** A number control's value as a number, where it is one (a URL gives a string). */
function numberOf(value: unknown): number | undefined {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(n) ? n : undefined;
}

/**
 * The Playground a builder renders from, over `values` (the controls' current values by name).
 * `set` is checked against the control (checkValue) before it reaches the caller's; `log` is the
 * caller's. `onRead`, where given, hears every control a builder reads, a component slot's words
 * with its toggle (the unit test proves a builder reads every control).
 */
export function makePlayground({
  data,
  controls,
  values,
  set,
  log,
  onRead,
}: {
  data: PlaygroundData;
  controls: PlaygroundControl[];
  values: Record<string, unknown>;
  set: (name: string, value: ControlValue) => void;
  log: (event: string, detail?: unknown) => void;
  onRead?: (name: string) => void;
}): Playground {
  const byName = new Map(controls.map((c) => [c.name, c]));
  const control = (name: string, kinds?: Set<ControlKind>, what?: string) => {
    const c = byName.get(name);
    if (!c)
      throw new Error(`"${name}" is not one of this Playground's controls`);
    if (kinds && !kinds.has(c.kind))
      throw new Error(`"${name}" is a ${c.kind} control, not ${what}`);
    onRead?.(name);
    return c;
  };
  const text = (name: string) => {
    control(name, TEXT_KINDS, 'a text control');
    const v = values[name];
    return typeof v === 'string' ? v : '';
  };
  return {
    value: (name) => {
      control(name);
      return (values[name] ?? null) as ControlValue;
    },
    flag: (name) => {
      control(name, BOOLEAN_KINDS, 'a toggle');
      return values[name] === true;
    },
    text,
    words: (name) => text(name) || undefined,
    whole: (name) => {
      const c = control(name, NUMBER_KINDS, 'a number');
      const n = numberOf(values[name]) ?? numberOf(c.default) ?? 0;
      return Math.min(
        Math.max(Math.round(n), c.min ?? -Infinity),
        c.max ?? Infinity,
      );
    },
    choice: <T extends string = string>(name: string) => {
      const c = control(name, new Set(['select']), 'a select');
      const v = values[name];
      return (
        typeof v === 'string' && c.options?.includes(v) ? v : c.default
      ) as T;
    },
    set: (name, value) => {
      const c = byName.get(name);
      if (!c)
        throw new Error(`"${name}" is not one of this Playground's controls`);
      checkValue(c, value, data);
      set(name, value);
    },
    log,
    icon: (slot) => {
      control(slot, new Set(['icon']), 'an icon');
      return iconElement(values[slot], data);
    },
    child: (slot) => {
      control(slot, new Set(['child']), 'a component slot');
      const { shown, text, words } = childOf(controls, values, slot);
      if (words) onRead?.(words);
      return { shown, text };
    },
  };
}

/**
 * A viewer's local copy of its args, for a viewer whose args reach the story after a round trip
 * (Storybook's `updateArgs`): the args last seen, the copy the builder reads, and the values `set`
 * has sent that the args do not carry yet, by name.
 */
export interface ArgsSync {
  seen: Record<string, unknown>;
  local: Record<string, unknown>;
  pending: Record<string, unknown>;
}

/** The copy before any `set`: the args themselves. */
export const startSync = (args: Record<string, unknown>): ArgsSync => ({
  seen: args,
  local: args,
  pending: {},
});

/**
 * The copy once new args arrive: a pending value the args now carry is confirmed and dropped; one
 * they do not carry yet stays, the copy keeping it (an older round trip ended while the tester
 * typed on); a control with nothing pending takes the args' value (the panel, or Reset).
 */
export function syncArgs(
  sync: ArgsSync,
  args: Record<string, unknown>,
  controls: PlaygroundControl[],
): ArgsSync {
  const pending = { ...sync.pending };
  const local = { ...sync.local };
  for (const { name } of controls) {
    if (!(name in pending)) local[name] = args[name];
    else if (Object.is(pending[name], args[name])) delete pending[name];
  }
  return { seen: args, local, pending };
}

/**
 * The Playground's column: Reset, the width box and the event log, each at its start, apart by
 * SOLAR's stack spacing. As Flutter's adapter lays them out (widgetbook/lib/playground/adapter.dart).
 */
export const columnStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 'var(--solar-stack-md)',
};

/**
 * The box the component sits in, in the Playground's column: at `auto` a block as wide as the
 * column, the component at its start, and otherwise the width picked. A filling component (a
 * ProgressBar, an Alert) takes the box's width, and a hugging one (a Button) keeps its own, as in a
 * page. As Flutter's (a box of the width, loosening it for the component).
 */
export function WidthBox({
  width,
  children,
}: {
  width: unknown;
  children: ReactNode;
}) {
  const picked = typeof width === 'string' && width !== 'auto';
  return (
    <div
      data-width-box=""
      style={{ alignSelf: 'stretch', width: picked ? `${width}px` : undefined }}
    >
      {children}
    </div>
  );
}

/**
 * Renders a builder as a component of its own, so its `render` may use hooks, and a builder that
 * keeps state keeps it across the Playground's re-renders.
 */
export function BuilderHost({
  builder,
  p,
}: {
  builder: PlaygroundBuilder;
  p: Playground;
}) {
  return <>{builder.render(p)}</>;
}
