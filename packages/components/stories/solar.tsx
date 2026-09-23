/**
 * The stories every component gets, built from its visual-check case (how to render one oracle
 * variant) and the codegen's data (its API, how its states are marked). A component's story file
 * is two lines that name it; `npm run solar:scaffold` writes it with the shell.
 */

import type { ArgTypes, Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect, useRef } from 'react';
import { SPECS, STATES } from 'virtual:solar';
import { CASES } from '../test/visual/cases/index.js';
import type { OracleVariant } from '../test/visual/cases/types.js';

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

function Tile({ component, v }: { component: string; v: OracleVariant }) {
  const { wrapper, cls } = forcing(component, v.state);
  const at = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (cls) at.current?.firstElementChild?.classList.add(cls);
  });
  const layers = (v as OracleVariant & { layers?: unknown }).layers;
  return (
    <figure style={tile}>
      <div ref={at} className={wrapper} style={stage}>
        {CASES[component].render(v)}
      </div>
      <figcaption style={caption}>{v.figma}</figcaption>
      <details style={caption}>
        <summary>Figma values</summary>
        <pre style={values}>{JSON.stringify(layers, null, 1)}</pre>
      </details>
    </figure>
  );
}

function Variants({ component }: { component: string }) {
  return (
    <div style={grid}>
      {CASES[component].oracle.variants.map((v) => (
        <Tile key={v.figma} component={component} v={v} />
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
    render: (args: Record<string, unknown>) => (
      <>{c.render({ figma: '', props: args, state: 'default' })}</>
    ),
  } satisfies Meta;
}

/** One set of props, with controls; hover, press and focus it to see its states. */
export function playground(component: string): StoryObj {
  caseOf(component);
  return {};
}

/** Every variant Figma draws, its state forced, with what Figma says each looks like. */
export function variants(component: string): StoryObj {
  caseOf(component);
  return {
    parameters: { controls: { disable: true } },
    render: () => <Variants component={component} />,
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
const values = {
  maxHeight: 240,
  overflow: 'auto',
  fontSize: 'var(--solar-type-font-size-10)',
};
