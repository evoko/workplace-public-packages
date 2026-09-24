/**
 * The shells of a drawn component: one that draws its own layers from its recipe, as Figma nests
 * them, rather than wrapping a stock control (StatusIndicator, Counter, Kbd…). Both shells hand the
 * layer tree to the shared runtime helpers -- `internal/layers.tsx` on the web, [SolarLayers] in
 * Flutter -- so a descriptor's templates (src/components/<name>.mjs) say only what is the
 * component's own: its props beyond the IR's, what its text layers say, its semantics.
 *
 * The templates are functions of the IR: the API, the layer tree and the layer names come from
 * it, never retyped.
 */

import { camel, pascal } from '../util/naming.mjs';
import { dartField, dartParam } from './helpers.mjs';

/**
 * What a drawn component's elements need beyond the recipe: its root is an inline box of its own
 * size, and a frame in it a flex box, as Figma's auto layout is (the recipe says which way);
 * a placed layer is absolute in it. A text runs on one line, as a Figma text that hugs it does.
 * A glyph's two outlines are filled, never stroked: `stroke` on the glyph only names the stroke
 * outline's colour.
 */
export const drawnResets = (name, more = {}) => {
  const P = `Solar${pascal(name)}`;
  return {
    display: 'inline-flex',
    position: 'relative',
    boxSizing: 'border-box',
    flexShrink: '0',
    [`& .${P}-box`]: { display: 'flex', boxSizing: 'border-box' },
    [`& .${P}-text`]: { whiteSpace: 'nowrap' },
    [`& .${P}-glyph`]: { display: 'block', overflow: 'visible' },
    '& .SolarGlyph-fill, & .SolarGlyph-stroke': { stroke: 'none' },
    ...more,
  };
};

/** Each layer's children, in Figma's order, from the IR. */
export const treeOf = (spec) => {
  const tree = {};
  for (const [name, l] of Object.entries(spec.layers))
    if (l.parent !== null) (tree[l.parent] ??= []).push(name);
  return tree;
};

/**
 * A doc comment's text, re-wrapped to the repository's 100 columns under `lead` (` * `, `/// `):
 * paragraphs are split on blank lines and kept apart by an empty comment line.
 */
export function wrapDoc(text, lead, width = 100) {
  const out = [];
  for (const paragraph of text.trim().split(/\n\s*\n/)) {
    if (out.length) out.push(lead.trimEnd());
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (line && lead.length + line.length + 1 + word.length > width) {
        out.push(lead + line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    if (line) out.push(lead + line);
  }
  return out.join('\n');
}

/** Every entry of one layer's style, whatever its section. */
const entriesOf = (style) => [
  style.base,
  ...Object.values(style.size ?? {}),
  ...Object.values(style.appearance ?? {}).flatMap(Object.values),
  ...Object.values(style.combined ?? {}).flatMap((c) =>
    Object.values(c).flatMap(Object.values),
  ),
];

/**
 * The layers that draw a SOLAR icon of their own (RowExpand's chevrons, `Icon/ChevronRight`), with
 * the icon each draws: its React component in `@bwp-web/assets` and its `SolarIcons` constant. One
 * icon per layer; a layer that is a different icon in another variant is refused, for now.
 */
export function iconsOf(spec) {
  const out = [];
  for (const [layer, def] of Object.entries(spec.layers)) {
    // A slot is the caller's to fill (Link's icons), not an icon the shell draws.
    if (def.type !== 'INSTANCE' || spec.slots[layer]) continue;
    const entries = entriesOf(spec.style[layer] ?? { base: {} });
    const names = new Set(
      entries
        .map((e) => e?.component?.keyword)
        .filter((k) => k?.startsWith('Icon/'))
        .map((k) => k.slice('Icon/'.length)),
    );
    if (names.size === 0) continue;
    if (names.size > 1)
      throw new Error(
        `${spec.component} ${layer}: one layer draws ${[...names].join(', ')}`,
      );
    const [name] = names;
    const solid = entries.some((e) => e?.['variant.solid']?.keyword === 'true');
    out.push({
      layer,
      react: `Icon${pascal(name)}`,
      solid,
      dart: `SolarIcons.${camel(name)}${solid ? 'Solid' : 'Outline'}`,
    });
  }
  return out;
}

/** Whether any entry of the recipe draws a glyph. */
const hasGlyphs = (spec) => JSON.stringify(spec.style).includes('"glyph":{');

/** `Counter` to `counter.json`, `Trend Badge` to `trend-badge.json`, as the stage names the IR. */
const irFile = (name) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;

/** `Trend Badge` to `trend_badge.dart`, as the Flutter emitter names the recipe. */
const dartFile = (name) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.dart`;

/** `Trend Badge` to `trendBadge`, the key every Flutter layer is named under. */
export const keyPrefixOf = (name) => {
  const p = pascal(name);
  return p[0].toLowerCase() + p.slice(1);
};

/**
 * A React shell.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.look what the recipe holds, for the doc comment
 * @param {string} o.about the rest of the doc comment: why it is bespoke, how it reads
 * @param {string} [o.element] the root element, `span` by default, or a JSX expression for one
 *   that depends on the props (`{onClick ? 'button' : 'span'}`)
 * @param {string} [o.refType] its DOM type, `HTMLSpanElement` by default
 * @param {string[]} [o.react] more names imported from React (`type ReactNode`)
 * @param {string} [o.imports] more import lines
 * @param {string} [o.types] declarations before the props interface
 * @param {string} [o.props] members of the props interface beyond the IR's
 * @param {string[]} [o.own] those props, destructured
 * @param {string[]} [o.omit] Box props the component's own replace
 * @param {string} [o.prelude] statements before the render, which may return early
 * @param {string} [o.attrs] JSX attributes on the root, before the caller's
 * @param {string} [o.text] the text layers' words, an object expression by layer
 * @param {string} [o.state] the composition's state expression, `'default'` by default
 */
export function drawnReact(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const api = Object.keys(spec.api);
  const destructured = [...api, ...(o.own ?? []), 'sx', '...rest'].join(', ');
  const args = `{ ${api.join(', ')} }`;
  const element = o.element ?? 'span';
  const refType = o.refType ?? 'HTMLSpanElement';
  const omit = ['keyof Solar' + P + 'Props', "'children'", "'ref'"]
    .concat((o.omit ?? []).map((p) => `'${p}'`))
    .join(' | ');
  const indent = (text, n) =>
    text
      .trim()
      .split('\n')
      .map((l) => (l ? ' '.repeat(n) + l : l))
      .join('\n');
  const icons = iconsOf(spec);
  const iconImport = icons.length
    ? `import { ${[...new Set(icons.map((i) => i.react))].sort().join(', ')} } from '@bwp-web/assets';\n`
    : '';
  const iconMap = icons.length
    ? `{ ${icons.map((i) => `${i.layer}: <${i.react}${i.solid ? ' variant="solid"' : ''} />`).join(', ')} }`
    : null;
  const header = `Scaffolded once by \`npm run solar:scaffold ${name}\` from spec/components/${irFile(name)}, and owned by developers from then on: change it freely. What it looks like is not here. That is the recipe, \`solar${P}Style\` and \`solar${P}Compose\` in \`@bwp-web/styles/mui\`: ${o.look}.`;
  return `/**
 * SOLAR ${name}.
 *
${wrapDoc(header, ' * ')}
 *
${wrapDoc(`${o.about.trim()} The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import Box, { type BoxProps } from '@mui/material/Box';
${iconImport}${o.imports ? `${o.imports.trim()}\n` : ''}import { ${['forwardRef', ...(o.react ?? [])].join(', ')} } from 'react';
import {
  solar${P}Compose,
  solar${P}Style,
  type Solar${P}Props,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};
${o.types ? `\n${o.types.trim()}\n` : ''}
export interface ${P}Props
  extends Solar${P}Props,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, ${omit}> {${o.props ? `\n${indent(o.props, 2)}\n` : ''}}

export const ${P} = forwardRef<${refType}, ${P}Props>(function ${P}(
  { ${destructured} },
  ref,
) {
${o.prelude ? `${indent(o.prelude, 2)}\n` : ''}  const parts = solar${P}Compose(${args}${o.state ? `, ${o.state}` : ''});
  return (
    <Box
      component=${element.startsWith('{') ? element : `"${element}"`}
      ref={ref}
${o.attrs ? `${indent(o.attrs, 6)}\n` : ''}      {...rest}
      sx={[solar${P}Style(${args}), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'Solar${P}',
        tree: TREE,
        parts,${o.text ? `\n        text: ${o.text},` : ''}${iconMap ? `\n        icons: ${iconMap},` : ''}
      })}
    </Box>
  );
});
`;
}

/**
 * A Flutter widget.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.look what the recipe holds, for the doc comment
 * @param {string} o.about the rest of the doc comment
 * @param {string} [o.imports] more import lines
 * @param {string} [o.params] constructor parameters beyond the IR's props
 * @param {string} [o.fields] their fields, with their doc comments
 * @param {string} [o.members] more members of the class
 * @param {string} [o.prelude] statements before the layers, which may return early
 * @param {string} [o.states] the states expression, a `Set<WidgetState>`; none by default
 * @param {string} [o.pressable] makes it a control where it is given an `onPressed` (an
 *   interactive Counter): the expression that says it is enabled. Otherwise it takes the states
 *   of the control around it (SolarStatesBuilder), a Button's.
 * @param {boolean} [o.link] announced as a link, where it is pressable (Link), not a button
 * @param {string} [o.slots] the slots the caller fills, a map literal by layer (Link's icons)
 * @param {(recipe: string) => string} [o.present] whether layer `l` is drawn, around the recipe's
 *   answer, an expression in `l` (a slot left empty is not drawn)
 * @param {string} [o.text] the text layers' words, a map literal by layer
 * @param {string} [o.wrap] the returned widget, around `mark` (the drawn root)
 */
export function drawnFlutter(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const api = Object.entries(spec.api);
  const glyphs = hasGlyphs(spec);
  const tree = Object.entries(treeOf(spec))
    .map(
      ([parent, kids]) =>
        `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
    )
    .join('\n');
  const indent = (text, n) =>
    text
      .trim()
      .split('\n')
      .map((l) => (l ? ' '.repeat(n) + l : l))
      .join('\n');
  const R = `Solar${P}Recipe`;
  const icons = iconsOf(spec);
  const params = [
    ...api.map(([prop, def]) => `    ${dartParam(P, prop, def)},`),
    ...(o.params ? [indent(o.params, 4)] : []),
    ...(o.pressable
      ? ['    this.onPressed,', '    this.statesController,']
      : []),
  ].join('\n');
  const pressableFields = `/// Called when it is tapped, which makes it a control of its own; without it, it takes the
/// states of the control around it (a Button's).
final VoidCallback? onPressed;

/// Its states, where the caller keeps them.
final WidgetStatesController? statesController;`;
  const fields = [o.fields, o.pressable ? pressableFields : null]
    .filter(Boolean)
    .join('\n\n');
  const layers = (states) => `SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => ${R}.lookup(c, p, ${states}),
        dimension: (c) => ${R}.dimension(c, p, ${states}),
        color: (c) => ${R}.color(t, c, p, ${states}),
        shadow: (c) => ${R}.shadow(t, c, p, ${states}),
        textStyle: (c) => ${R}.textStyle(t, c, p, ${states}),
        present: (l) => ${o.present ? o.present(`${R}.present(l, p, ${states})`) : `${R}.present(l, p, ${states})`},
        glyph: ${glyphs ? `(l) => ${R}.glyph(l, p, ${states})` : '(_) => null'},
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(name)}',${o.text ? `\n      text: ${o.text},` : ''}${o.slots ? `\n      slots: ${o.slots},` : ''}${icons.length ? `\n      icons: const {${icons.map((i) => `'${i.layer}': ${i.dart}`).join(', ')}},` : ''}
    ).layer('root')`;
  const draw = o.pressable
    ? `    Widget draw(Set<WidgetState> states) => ${layers('states')};
    // A control of its own only when it has something to do; otherwise it takes the states of
    // the control around it (a Counter in a Button).
    final mark = onPressed == null && statesController == null
        ? SolarStatesBuilder(builder: (_, states) => draw(states))
        : SolarPressable(
            onPressed: ${o.pressable} ? onPressed : null,
            statesController: statesController,${o.link ? '\n            link: true,' : ''}
            builder: (_, states) => draw(states),
          );`
    : `    ${o.states ? `final states = ${o.states};` : 'const states = <WidgetState>{};'}
    final mark = ${layers('states')};`;
  const header = `Scaffolded once by \`npm run solar:scaffold -- --flutter ${name}\` from spec/components/${irFile(name)}, and owned by developers from then on: change it freely. What it looks like is not here. That is the recipe, [${R}]: ${o.look}.`;
  return `/// SOLAR ${name}.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(o.about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/${dartFile(name)}';
${icons.length ? "import '../generated/icons.dart';\n" : ''}import '../solar_layers.dart';
${o.pressable ? "import '../solar_states.dart';\n" : ''}${o.imports ? `${o.imports.trim()}\n` : ''}import 'solar_theme_of.dart';

class Solar${P} extends StatelessWidget {
  const Solar${P}({
    super.key,
${params}
  });

${api.map(([prop, def]) => dartField(P, prop, def)).join('\n')}
${fields ? `\n${indent(fields, 2)}\n` : ''}
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };
${o.members ? `\n${indent(o.members, 2)}\n` : ''}
  @override
  Widget build(BuildContext context) {
${o.prelude ? `${indent(o.prelude, 4)}\n` : ''}    final t = solarThemeOf(context);
    final p = Solar${P}Props(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
${draw}
    return ${o.wrap ? o.wrap.trim() : 'mark'};
  }
}
`;
}
