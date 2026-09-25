/**
 * The SOLAR MUI theme's `components` block: stock MUI components styled from SOLAR recipes, per
 * the decisions in `spec/overlay/mui-theme.yaml`, so an app's own MUI Button draws what Figma
 * draws, as `@bwp-web/components`' Button does (the pipeline review's item 14).
 *
 * For each MUI key: `defaultProps` as decided, and a `variants` entry for every combination of the
 * MUI props the decision maps, its style the SOLAR recipe's for the axis values those props are
 * (`solarButtonStyle({ variant: 'secondary', danger: false, size: 'md' })` for an outlined,
 * primary, medium MUI Button), with the fixed axes at their value, and the recipe's selectors for
 * a layer moved to where MUI's own markup has it (`slots`). The styles are the recipe's at run time
 * (the generated module calls `solar<Name>Style`), so a recipe change reaches the theme with no
 * change here; every value stays a `var(--solar-*)`, and the tokens' `data-theme` switches it.
 *
 * A decision naming a component, an axis, a value or a layer the IR does not have fails the build.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { layerClass } from '../util/classes.mjs';
import { pascal } from '../util/naming.mjs';
import { packagesDir, specDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';

export const DECISIONS = join(specDir, 'overlay', 'mui-theme.yaml');
const OUT = join(packagesDir, 'styles', 'src', 'generated', 'mui');

/** The decisions, checked against the IRs. */
export function loadMuiTheme(specs, text = readFileSync(DECISIONS, 'utf8')) {
  const where = 'spec/overlay/mui-theme.yaml';
  const doc = parse(text) ?? {};
  const byName = new Map(specs.map((s) => [s.component, s]));
  for (const [key, d] of Object.entries(doc)) {
    const fail = (why) => {
      throw new Error(`${where}: ${key}: ${why}`);
    };
    if (!/^Mui[A-Z]\w*$/.test(key)) fail('is no MUI component key');
    if (!d?.reason) fail('has no reason');
    const spec = byName.get(d.component);
    if (!spec) fail(`names ${d.component}, which is no generated component`);
    const axes = [
      ...Object.values(d.props ?? {}).map((p) => [p.axis, p.values]),
      ...Object.entries(d.fixed ?? {}).map(([axis, v]) => [axis, { v }]),
    ];
    for (const [axis, values] of axes) {
      const def = spec.api[axis];
      if (!def)
        fail(`maps to ${d.component}'s ${axis}, which its IR has no axis for`);
      const allowed =
        def.type === 'boolean' ? [true, false] : (def.values ?? []);
      for (const v of Object.values(values))
        if (!allowed.includes(v))
          fail(
            `maps to ${d.component}'s ${axis} ${v}, which its IR does not have`,
          );
    }
    for (const layer of Object.keys(d.slots ?? {}))
      if (!(layer in spec.layers))
        fail(
          `moves ${d.component}'s layer ${layer}, which its IR does not have`,
        );
  }
  return doc;
}

/** Every combination of the MUI props' values, as [muiProps, solarProps]. */
function combinations(d) {
  let out = [[{}, { ...(d.fixed ?? {}) }]];
  for (const [prop, { axis, values }] of Object.entries(d.props ?? {}))
    out = out.flatMap(([mui, solar]) =>
      Object.entries(values).map(([m, s]) => [
        { ...mui, [prop]: m },
        { ...solar, [axis]: s },
      ]),
    );
  return out;
}

/** The generated module's text. */
export function renderMuiThemeComponents(specs, doc) {
  const byName = new Map(specs.map((s) => [s.component, s]));
  const imports = new Set();
  const entries = Object.entries(doc).map(([key, d]) => {
    const spec = byName.get(d.component);
    const style = `solar${pascal(d.component)}Style`;
    imports.add(
      `import { ${style} } from './components/${d.component.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.js';`,
    );
    const moves = Object.entries(d.slots ?? {}).map(([layer, to]) => [
      `& .${layerClass(spec, layer)}`,
      to,
    ]);
    const call = (solar) => {
      const recipe = `${style}(${JSON.stringify(solar)})`;
      return d.restate?.length
        ? `restated(${recipe}, ${JSON.stringify(d.restate)})`
        : recipe;
    };
    const styled = (solar) =>
      moves.length
        ? `moved(${call(solar)}, ${JSON.stringify(moves)})`
        : call(solar);
    // A stock component only: a SOLAR shell on the same MUI component (our own Button is an MUI
    // Button, variant text) carries data-solar, and draws its own recipe.
    const matches = (mui) =>
      `(p) => stock(p)${Object.entries(mui)
        .map(([k, v]) => ` && p.${k} === ${JSON.stringify(v)}`)
        .join('')}`;
    const variants = combinations(d)
      .map(
        ([mui, solar]) =>
          `      { props: ${matches(mui)}, style: ${styled(solar)} },`,
      )
      .join('\n');
    return `  // ${d.component}'s recipe (spec/overlay/mui-theme.yaml).
  ${key}: {
    defaultProps: ${JSON.stringify(d.defaultProps ?? {})},
    variants: [
${variants}
    ],
  },`;
  });
  return `// Generated by @bwp-web/codegen from spec/overlay/mui-theme.yaml and the component recipes. Do not edit.
// The stock MUI components the SOLAR MUI theme styles, each from a SOLAR component's recipe
// (createSolarThemeOptions' components). Every value is a var(--solar-*).

${[...imports].sort().join('\n')}

type Style = Record<string, unknown>;
type Props = Record<string, unknown>;

/** A stock MUI component, not one a SOLAR shell draws its own recipe on (it carries data-solar). */
const stock = (p: Props) => p['data-solar'] === undefined;

/**
 * A recipe's style with each of \`cells\` stated in every state of the root (\`&:hover\`,
 * \`&.Mui-disabled\`…) at its resting value, where the recipe leaves it as at rest: MUI's own
 * variant changes it there, which the recipe for SOLAR's shell, on MUI's plain text variant, does
 * not need to undo.
 */
function restated(style: Style, cells: string[]): Style {
  const out: Style = { ...style };
  for (const [key, value] of Object.entries(style)) {
    if (!/^&[:.](?!:)/.test(key) || !value || typeof value !== 'object') continue;
    const block = { ...(value as Style) };
    for (const cell of cells)
      if (!(cell in block) && cell in style) block[cell] = style[cell];
    out[key] = block;
  }
  return out;
}

/** A recipe's style with each layer's selector moved to where MUI's own markup has it. */
function moved(style: Style, moves: [string, string][]): Style {
  const out: Style = {};
  for (const [key, value] of Object.entries(style)) {
    const to = moves.find(([from]) => from === key)?.[1] ?? key;
    const v =
      value && typeof value === 'object' ? moved(value as Style, moves) : value;
    out[to] =
      to in out && typeof out[to] === 'object' && typeof v === 'object'
        ? { ...(out[to] as Style), ...(v as Style) }
        : v;
  }
  return out;
}

/** One MUI component's theme entry: its default props, and a recipe's style per prop combination. */
export interface SolarMuiComponent {
  defaultProps: Record<string, unknown>;
  variants: { props: (p: Props) => boolean; style: Style }[];
}

export const solarMuiComponents: Record<string, SolarMuiComponent> = {
${entries.join('\n')}
};

/**
 * Which SOLAR component each themed MUI component draws, and how its MUI props map onto the SOLAR
 * axes: the decisions, as data, for an app or a check that goes from one to the other.
 */
export const solarMuiThemeDecisions = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(doc).map(([key, d]) => [
        key,
        {
          component: d.component,
          props: d.props ?? {},
          fixed: d.fixed ?? {},
          slots: d.slots ?? {},
        },
      ]),
    ),
    null,
    2,
  )} as const;
`;
}

export function emitMuiThemeComponents(specs) {
  const doc = loadMuiTheme(specs);
  writeGenerated(
    join(OUT, 'theme-components.ts'),
    renderMuiThemeComponents(specs, doc),
  );
  return Object.keys(doc).length;
}
