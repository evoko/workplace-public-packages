/**
 * The stories every component gets: its Playground, from its playground builder (playground/) and
 * the codegen's controls, and its Variants, from its visual-check case (how to render one oracle
 * variant) and the codegen's data (how its states are marked). A component's story file is two
 * lines that name it; `npm run solar:codegen` writes it with the shell.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { FAILURES, STATES } from 'virtual:solar';
import { CASES } from '../test/visual/cases/index.js';
import type { Excuse, OracleVariant } from '../test/visual/cases/types.js';
import {
  argTypesFor,
  argsFor,
  playgroundRender,
} from './playground/adapter.js';
import { PLAYGROUND_BUILDERS } from './playground/registry.generated.js';
import { DrawnVariant, type StageProps } from './variant-stage.js';
import type { DrawVariant } from './workbench/preview.js';

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
 * One oracle variant drawn, its state forced, as the Variants page draws it in each tile: what the
 * workbench's Inspect dialog draws large (its Preview), so the two cannot differ.
 */
export function VariantStage({
  component,
  index,
  ...stage
}: StageProps & { component: string; index: number }) {
  return (
    <DrawnVariant
      component={component}
      index={index}
      states={STATES[component]}
      {...stage}
    />
  );
}

/** The one-variant renderer the Playground's workbench bar draws its Inspect preview with. */
function drawVariantOf(component: string): DrawVariant {
  return function drawVariant(index, stage) {
    return <VariantStage component={component} index={index} {...stage} />;
  };
}

function Tile({
  component,
  index,
  v,
  mode,
}: {
  component: string;
  index: number;
  v: OracleVariant;
  mode: Mode;
}) {
  const layers = (v as OracleVariant & { layers?: unknown }).layers;
  const excused = excusesIn(v, mode);
  const open = excused.filter((e) => !e.decision);
  const failed = (FAILURES[component]?.[mode] ?? []).filter(
    (f) => f.variant === v.figma,
  );
  return (
    <figure style={tile}>
      <VariantStage component={component} index={index} style={stage} />
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
      {CASES[component].oracle.variants.map((v, i) => (
        <Tile key={v.figma} component={component} index={i} v={v} mode={mode} />
      ))}
    </div>
  );
}

function caseOf(component: string) {
  const c = CASES[component];
  if (!c) throw new Error(`${component}: no case in test/visual/cases/`);
  return c;
}

/** A component's playground builder, from the generated registry (every component has one). */
function builderOf(component: string) {
  const b = PLAYGROUND_BUILDERS[component];
  if (!b) throw new Error(`${component}: no playground builder in playground/`);
  return b;
}

/**
 * A component's controls and how the Playground renders them: through its playground builder
 * (playground/), with a control for every slot and a width, live and two-way.
 */
export function meta(component: string): Meta {
  return {
    args: argsFor(component),
    argTypes: argTypesFor(component),
    render: playgroundRender(
      component,
      builderOf(component),
      drawVariantOf(component),
    ),
  } satisfies Meta;
}

/** The component live, with its controls, Reset and the event log (meta's render). */
export function playground(component: string): StoryObj {
  builderOf(component);
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
