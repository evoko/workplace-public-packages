/**
 * The stories every component gets, built from its visual-check case (how to render one oracle
 * variant) and the codegen's data (its API, how its states are marked). A component's story file
 * is two lines that name it; `npm run solar:codegen` writes it with the shell.
 */

import type { ArgTypes, Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect, useRef } from 'react';
import { FAILURES, SPECS, STATES } from 'virtual:solar';
import { CASES } from '../test/visual/cases/index.js';
import type { Excuse, OracleVariant } from '../test/visual/cases/types.js';

type Mode = 'light' | 'dark';

/** The mode the toolbar shows, from the themes addon's global. */
const modeOf = (globals: Record<string, unknown>): Mode =>
  globals.theme === 'Dark' ? 'dark' : 'light';

/**
 * What the oracle excuses in a variant, in one mode: Dark's own list where it differs from Light's,
 * each entry marked where Dark alone has it.
 */
function excusesIn(v: OracleVariant, mode: Mode) {
  const light = v.excused ?? [];
  if (mode === 'light' || !v.dark?.excused)
    return light.map((e) => ({ ...e, darkOnly: false }));
  const key = (e: Excuse) => `${e.layer}.${e.property}.${e.finding}`;
  const inLight = new Set(light.map(key));
  return v.dark.excused.map((e) => ({ ...e, darkOnly: !inLight.has(key(e)) }));
}

/**
 * How the Variants grid forces a platform state: a pseudo-class through the pseudo-states addon,
 * which rewrites `:hover` into a class a wrapper can set, or the class MUI sets for the state
 * (Button's focus is `Mui-focusVisible`), put on the control. A pressed control is hovered too, as
 * a pointer pressing it is.
 */
function forcing(component: string, state: string) {
  const selector = STATES[component]?.[state] ?? '';
  const pseudo = /^&:(hover|active|focus-visible|focus)\b/.exec(selector)?.[1];
  const cls = /^&\.([\w-]+)/.exec(selector)?.[1];
  const wrapper = [
    ...(state === 'pressed' ? ['pseudo-hover-all'] : []),
    ...(pseudo ? [`pseudo-${pseudo}-all`] : []),
  ].join(' ');
  return { wrapper, cls };
}

function Tile({
  component,
  v,
  mode,
}: {
  component: string;
  v: OracleVariant;
  mode: Mode;
}) {
  const { wrapper, cls } = forcing(component, v.state);
  const at = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (cls) at.current?.firstElementChild?.classList.add(cls);
  });
  const layers = (v as OracleVariant & { layers?: unknown }).layers;
  const excused = excusesIn(v, mode);
  const open = excused.filter((e) => !e.decision);
  const failed = (FAILURES[component]?.[mode] ?? []).filter(
    (f) => f.variant === v.figma,
  );
  return (
    <figure style={tile}>
      <div ref={at} className={wrapper} style={stage}>
        {CASES[component].render(v)}
      </div>
      <figcaption style={caption}>{v.figma}</figcaption>
      {failed.length > 0 && (
        <p style={{ ...badge, ...failing }}>
          {failed.length} failed in the last check:{' '}
          {failed.map((f) => `${f.layer}.${f.property}`).join(', ')}
        </p>
      )}
      {excused.length > 0 && (
        <details style={caption}>
          <summary>
            <span style={{ ...badge, ...(open.length ? opened : settled) }}>
              {open.length
                ? `${open.length} open of ${excused.length} excused`
                : `${excused.length} excused, all decided`}
            </span>
          </summary>
          <ul style={list}>
            {excused.map((e) => (
              <li key={`${e.layer}.${e.property}`}>
                <code>
                  {e.layer}.{e.property}
                </code>
                {e.darkOnly ? ' (Dark only)' : ''}: Figma{' '}
                {JSON.stringify(e.figma)}.{' '}
                {e.decision
                  ? `${e.decision}: ${e.reason ?? e.finding}`
                  : `Open: ${e.finding}`}
              </li>
            ))}
          </ul>
        </details>
      )}
      <details style={caption}>
        <summary>Figma values</summary>
        <pre style={values}>{JSON.stringify(layers, null, 1)}</pre>
      </details>
    </figure>
  );
}

function Variants({ component, mode }: { component: string; mode: Mode }) {
  return (
    <div style={grid}>
      {CASES[component].oracle.variants.map((v) => (
        <Tile key={v.figma} component={component} v={v} mode={mode} />
      ))}
    </div>
  );
}

/** Storybook controls from the IR's API: a select per axis, a toggle per boolean. */
function argTypesOf(component: string): ArgTypes {
  return Object.fromEntries(
    Object.entries(SPECS[component].api).map(([prop, axis]) => [
      prop,
      axis.type === 'boolean'
        ? { control: 'boolean' as const }
        : axis.type === 'color'
          ? { control: 'color' as const }
          : { control: 'select' as const, options: axis.values },
    ]),
  );
}

function caseOf(component: string) {
  const c = CASES[component];
  if (!c) throw new Error(`${component}: no case in test/visual/cases/`);
  return c;
}

/** A component's controls, from its IR's API, and how the Playground renders them. */
export function meta(component: string) {
  const c = caseOf(component);
  const api = SPECS[component].api;
  return {
    args: Object.fromEntries(
      Object.entries(api).map(([p, a]) => [p, a.default]),
    ),
    argTypes: argTypesOf(component),
    // The resting variant, with the controls' props: a case that draws what Figma nests (Button
    // Group's Buttons) reads it from the variant's layers.
    render: (args: Record<string, unknown>) => (
      <>
        {c.render({
          ...c.oracle.variants[0],
          figma: '',
          props: args,
          state: 'default',
        })}
      </>
    ),
  } satisfies Meta;
}

/** One set of props, with controls; hover, press and focus it to see its states. */
export function playground(component: string): StoryObj {
  caseOf(component);
  return {};
}

/**
 * Every variant Figma draws, its state forced, with what Figma says each looks like, what the
 * oracle excuses in it for the mode showing (a badge: how many, and how many still open), and what
 * the last web check found wrong.
 */
export function variants(component: string): StoryObj {
  caseOf(component);
  return {
    parameters: { controls: { disable: true } },
    render: (_, { globals }) => (
      <Variants component={component} mode={modeOf(globals)} />
    ),
  };
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 'var(--solar-inset-md)',
};
const tile = {
  margin: 0,
  padding: 'var(--solar-inset-sm)',
  border: 'var(--solar-border-default) solid var(--solar-color-border-subtle)',
  borderRadius: 'var(--solar-radius-container)',
};
const stage = { minHeight: 56, display: 'flex', alignItems: 'center' };
const caption = {
  color: 'var(--solar-color-text-secondary)',
  fontFamily: 'var(--solar-type-font-family-inter)',
  fontSize: 'var(--solar-type-font-size-11)',
  marginTop: 'var(--solar-inset-xs)',
};
const badge = {
  display: 'inline-block',
  margin: 0,
  padding: '0 var(--solar-inset-xs)',
  borderRadius: 'var(--solar-radius-pill)',
  fontFamily: 'var(--solar-type-font-family-inter)',
  fontSize: 'var(--solar-type-font-size-11)',
};
const settled = {
  background: 'var(--solar-color-surface-muted)',
  color: 'var(--solar-color-text-secondary)',
};
const opened = {
  background: 'var(--solar-color-surface-feedback-warning-subtle)',
  color: 'var(--solar-color-text-feedback-warning)',
};
const failing = {
  marginTop: 'var(--solar-inset-xs)',
  background: 'var(--solar-color-surface-feedback-danger-subtle)',
  color: 'var(--solar-color-text-feedback-danger)',
};
const list = {
  margin: 0,
  paddingLeft: 'var(--solar-inset-md)',
  fontSize: 'var(--solar-type-font-size-10)',
};
const values = {
  maxHeight: 240,
  overflow: 'auto',
  fontSize: 'var(--solar-type-font-size-10)',
};
