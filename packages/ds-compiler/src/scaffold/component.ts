import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { COMPONENTS_DIR } from '../build.js';
import {
  axisValue,
  identifier,
  MANIFEST_SUFFIX,
} from '../components/manifest.js';
import { BASELINE_PROPERTIES } from '../components/properties.js';
import {
  ARIA_TRUE_STATES,
  PSEUDO_STATES,
  sortStates,
} from '../components/states.js';
import type { DsConfig } from '../config.js';
import { ScaffoldError, writeNewFile } from './tokens.js';

export { ScaffoldError } from './tokens.js';

export const KNOWN_TARGETS = ['tailwind', 'mui', 'flutter'] as const;

export interface ComponentScaffoldOptions {
  /** axis name -> values; the first value becomes the default. */
  axes: Record<string, string[]>;
  states: string[];
  /** Slot names other than root. */
  slots: string[];
}

/** state name -> pseudo-class name (without the colon). */
const PSEUDO_BY_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(PSEUDO_STATES).map(([pseudo, state]) => [state, pseudo]),
);
/** state name -> aria attribute name. */
const ARIA_ATTR_BY_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(ARIA_TRUE_STATES).map(([attr, state]) => [state, attr]),
);

function stateSelector(state: string): string {
  if (Object.hasOwn(PSEUDO_BY_STATE, state)) {
    return `:${PSEUDO_BY_STATE[state]}`;
  }
  if (Object.hasOwn(ARIA_ATTR_BY_STATE, state)) {
    return `[${ARIA_ATTR_BY_STATE[state]}="true"]`;
  }
  return `[data-state="${state}"]`;
}

function titleCase(name: string): string {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function assertIdentifier(value: string, what: string): void {
  const result = identifier.safeParse(value);
  if (!result.success) {
    throw new ScaffoldError(
      `${what} "${value}" ${result.error.issues[0].message}`,
    );
  }
}

function assertAxisValue(value: string, what: string): void {
  const result = axisValue.safeParse(value);
  if (!result.success) {
    throw new ScaffoldError(
      `${what} "${value}" ${result.error.issues[0].message}`,
    );
  }
}

function assertNoDuplicates(values: readonly string[], what: string): void {
  const seen = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) {
      throw new ScaffoldError(`duplicate ${what} "${v}"`);
    }
    seen.add(v);
  }
}

function validate(name: string, opts: ComponentScaffoldOptions): void {
  assertIdentifier(name, 'component name');
  for (const [axis, values] of Object.entries(opts.axes)) {
    assertIdentifier(axis, 'axis');
    if (values.length === 0) {
      throw new ScaffoldError(`axis "${axis}" needs at least one value`);
    }
    values.forEach((v) => assertAxisValue(v, `axis "${axis}" value`));
    assertNoDuplicates(values, `value in axis "${axis}"`);
  }
  opts.states.forEach((s) => assertIdentifier(s, 'state'));
  opts.slots.forEach((s) => {
    assertIdentifier(s, 'slot');
    if (s === 'root') {
      throw new ScaffoldError('slot "root" is implicit; do not list it');
    }
  });
  assertNoDuplicates(opts.slots, 'slot');
}

export function renderComponentManifest(
  name: string,
  opts: ComponentScaffoldOptions,
  _config: DsConfig,
): string {
  validate(name, opts);
  const manifest = {
    name,
    displayName: titleCase(name),
    description: 'TODO: describe the component in one sentence',
    axes: Object.fromEntries(
      Object.entries(opts.axes).map(([axis, values]) => [
        axis,
        { values, default: values[0] },
      ]),
    ),
    states: sortStates(opts.states),
    slots: {
      root: { element: 'div' },
      ...Object.fromEntries(opts.slots.map((s) => [s, { element: 'span' }])),
    },
    preview: {},
    targets: Object.fromEntries(
      KNOWN_TARGETS.map((t) => [
        t,
        { excluded: 'TODO: map this target or give a reason' },
      ]),
    ),
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function renderComponentCss(
  name: string,
  opts: ComponentScaffoldOptions,
  config: DsConfig,
): string {
  validate(name, opts);
  const root = `.${config.prefix}-${name}`;
  const blocks: string[] = [];
  blocks.push(
    [
      `${root} {`,
      `  /* TODO baseline: ${BASELINE_PROPERTIES.join(', ')} */`,
      '}',
    ].join('\n'),
  );
  for (const state of sortStates(opts.states)) {
    blocks.push(`${root}${stateSelector(state)} {\n  /* TODO */\n}`);
  }
  for (const [axis, values] of Object.entries(opts.axes)) {
    for (const value of values.slice(1)) {
      blocks.push(`${root}[data-${axis}="${value}"] {\n  /* TODO */\n}`);
    }
  }
  for (const slot of opts.slots) {
    blocks.push(`${root} ${root}__${slot} {\n  /* TODO */\n}`);
  }
  const header = [
    `/* ${config.name} component: ${name}`,
    ` * Selector grammar: ${root}[data-<axis>="<value>"]:<state> ${root}__<slot>`,
    ` * The default value of each axis is styled by the base rule; other values get their own rule.`,
    ` * Docs: docs/design-system/authoring-guide.md#components */`,
  ].join('\n');
  return `${header}\n\n${blocks.join('\n\n')}\n`;
}

export function scaffoldComponent(
  rootDir: string,
  name: string,
  opts: ComponentScaffoldOptions,
  config: DsConfig,
): { cssPath: string; manifestPath: string } {
  validate(name, opts);
  const dir = join(rootDir, COMPONENTS_DIR, name);
  if (existsSync(dir)) {
    throw new ScaffoldError(`${dir} already exists; scaffold never overwrites`);
  }
  const manifestText = renderComponentManifest(name, opts, config);
  const cssText = renderComponentCss(name, opts, config);
  mkdirSync(dirname(dir), { recursive: true });
  try {
    mkdirSync(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new ScaffoldError(
        `${dir} already exists; scaffold never overwrites`,
      );
    }
    throw err;
  }
  const cssPath = join(dir, `${name}.css`);
  const manifestPath = join(dir, `${name}${MANIFEST_SUFFIX}`);
  writeNewFile(manifestPath, manifestText);
  writeNewFile(cssPath, cssText);
  return { cssPath, manifestPath };
}
