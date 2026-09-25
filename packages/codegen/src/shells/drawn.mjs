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
import { publicLayers } from '../util/classes.mjs';
import { dartEnumValue } from '../emit/flutter.mjs';
import { dartField, dartParam } from './helpers.mjs';

/**
 * What a drawn component's elements need beyond the recipe: its root is an inline box of its own
 * size, and a frame in it a flex box, as Figma's auto layout is (the recipe says which way);
 * a placed layer is absolute in it. A text runs on one line, as a Figma text that hugs it does.
 * An icon or a glyph keeps its size beside a layer that fills the row (Banner's message), as in
 * Figma, where only what fills gives way. A glyph's two outlines are filled, never stroked:
 * `stroke` on the glyph only names the stroke outline's colour.
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
    [`& .${P}-glyph`]: {
      display: 'block',
      overflow: 'visible',
      flexShrink: '0',
    },
    [`& .${P}-drawnIcon`]: { flexShrink: '0' },
    '& .SolarGlyph-fill, & .SolarGlyph-stroke': { stroke: 'none' },
    ...more,
  };
};

/**
 * A drawn shell's layer tree and its slots' layers, as the two constants its drawing takes (`tree`,
 * `slots`): a slot's layer is drawn with its public class, `Solar<Name>-<slot>`, and every other
 * layer with its internal one, `Solar<Name>--<layer>` (util/classes.mjs).
 */
export const treeConsts = (spec) =>
  `const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};\n` +
  `const SLOTS: Record<string, string> = ${JSON.stringify(publicLayers(spec))};`;

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
 * the icon each draws: its React component in `@bwp-web/assets` and its `SolarIcons` constant. A
 * layer whose icon follows one axis (PaginationNav's chevron, by its direction) has `byAxis`, the
 * icon for each of the axis's values, which the drawn helpers choose by the prop; any other layer
 * that draws two icons is refused.
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
    const solid = entries.some((e) => e?.['variant.solid']?.keyword === 'true');
    const of = (name) => ({
      react: `Icon${pascal(name)}`,
      dart: `SolarIcons.${camel(name)}${solid ? 'Solid' : 'Outline'}`,
    });
    const base = spec.style[layer]?.base?.component?.keyword?.slice(
      'Icon/'.length,
    );
    const byAxis = names.size > 1 ? iconAxisOf(spec, layer, base) : null;
    out.push({
      layer,
      ...of(byAxis ? base : [...names][0]),
      solid,
      ...(byAxis
        ? {
            byAxis: {
              axis: byAxis.axis,
              values: Object.fromEntries(
                Object.entries(byAxis.values).map(([v, name]) => [v, of(name)]),
              ),
            },
          }
        : {}),
    });
  }
  return out;
}

/**
 * The axis a layer's icon follows, and its icon at each value: the icon its appearance entries at
 * rest name, keyed by one axis alone (`direction=next`), the base's elsewhere. Refused where the
 * icon changes otherwise (by size, or state, or two axes together).
 */
function iconAxisOf(spec, layer, base) {
  const fail = () => {
    throw new Error(
      `${spec.component} ${layer}: one layer draws icons by more than one axis`,
    );
  };
  const style = spec.style[layer];
  if (
    Object.values(style.size ?? {}).some((e) => e.component) ||
    style.combined
  )
    fail();
  let axis = null;
  const values = {};
  for (const [key, states] of Object.entries(style.appearance ?? {})) {
    for (const [state, entry] of Object.entries(states))
      if (entry.component && state !== 'default') fail();
    const icon = states.default?.component?.keyword;
    if (!icon) continue;
    const pairs = key.split(', ').map((p) => p.split('='));
    if (pairs.length !== 1 || (axis && axis !== pairs[0][0])) fail();
    axis = pairs[0][0];
    values[pairs[0][1]] = icon.slice('Icon/'.length);
  }
  if (!axis || !spec.api[axis]?.values) fail();
  for (const v of spec.api[axis].values) values[v] ??= base;
  return { axis, values };
}

/** The React expression for an icon layer's icon: its component, or the one of its axis's value. */
export function reactIcon(i, spec) {
  const el = (x) => `<${x.react}${i.solid ? ' variant="solid"' : ''} />`;
  if (!i.byAxis) return el(i);
  const { axis, values } = i.byAxis;
  const map = Object.entries(values)
    .map(([v, x]) => `${JSON.stringify(v)}: ${el(x)}`)
    .join(', ');
  return `({ ${map} } as const)[${axis} ?? ${JSON.stringify(spec.api[axis].default)}]`;
}

/** The Dart expression for an icon layer's icon: its constant, or the one of its axis's value. */
export function dartIcon(i, spec) {
  if (!i.byAxis) return i.dart;
  const { axis, values } = i.byAxis;
  const type = `Solar${pascal(spec.component)}${pascal(axis)}`;
  return `switch (${axis}) {${Object.entries(values)
    .map(([v, x]) => ` ${type}.${dartEnumValue(v)} => ${x.dart},`)
    .join('')} }`;
}

/** Whether any entry of the recipe draws a glyph. */
const hasGlyphs = (spec) => JSON.stringify(spec.style).includes('"glyph":{');

/** `Trend Badge` to `trend_badge.dart`, as the Flutter emitter names the recipe. */
export const dartFile = (name) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.dart`;

/**
 * `Trend Badge` to `trendBadge`, the key every Flutter layer is named under; a leading acronym is
 * lowercased whole (`PIN Input` to `pinInput`).
 */
export const keyPrefixOf = (name) =>
  pascal(name).replace(/^[A-Z]+(?=[A-Z][a-z]|$)|^[A-Z]/, (m) =>
    m.toLowerCase(),
  );

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
 * @param {string} [o.icons] more of the icons map, entries by layer (a slot's filling:
 *   `icon: <span>{icon}</span>`)
 * @param {Record<string, string>} [o.present] whether a layer is drawn, an expression by layer,
 *   over the recipe's answer (a slot left empty is not drawn)
 * @param {string} [o.content] the caller's children of a layer, drawn in it in place of Figma's
 *   examples, an object expression by layer (Options List's rows)
 * @param {string} [o.before] JSX drawn in the root before its layers (a fieldset's legend)
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
  const iconNames = icons.flatMap((i) =>
    i.byAxis ? Object.values(i.byAxis.values).map((x) => x.react) : [i.react],
  );
  const iconImport = icons.length
    ? `import { ${[...new Set(iconNames)].sort().join(', ')} } from '@bwp-web/assets';\n`
    : '';
  const iconEntries = [
    ...icons.map((i) => `${i.layer}: ${reactIcon(i, spec)}`),
    ...(o.icons ? [o.icons] : []),
  ];
  const iconMap = iconEntries.length ? `{ ${iconEntries.join(', ')} }` : null;
  const present = Object.entries(o.present ?? {});
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solar${P}Style\` and \`solar${P}Compose\` in \`@bwp-web/styles/mui\`: ${o.look}.`;
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
${treeConsts(spec)}
${o.types ? `\n${o.types.trim()}\n` : ''}
export interface ${P}Props
  extends Solar${P}Props,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, ${omit}> {${o.props ? `\n${indent(o.props, 2)}\n` : ''}}

export const ${P} = forwardRef<${refType}, ${P}Props>(function ${P}(
  { ${destructured} },
  ref,
) {
${o.prelude ? `${indent(o.prelude, 2)}\n` : ''}  const ${present.length ? 'composed' : 'parts'} = solar${P}Compose(${args}${o.state ? `, ${o.state}` : ''});${
    present.length
      ? `\n  const parts = {\n    ...composed,\n${present.map(([l, e]) => `    ${l}: { ...composed.${l}, present: ${e} },`).join('\n')}\n  };`
      : ''
  }
  return (
    <Box
      component=${element.startsWith('{') ? element : `"${element}"`}
      ref={ref}
${o.attrs ? `${indent(o.attrs, 6)}\n` : ''}      {...rest}
      sx={[solar${P}Style(${args}), ...(Array.isArray(sx) ? sx : [sx])]}
    >${o.before ? `\n      ${o.before}` : ''}
      {drawChildren('root', {
        prefix: 'Solar${P}',
        tree: TREE, slots: SLOTS,
        parts,${o.text ? `\n        text: ${o.text},` : ''}${o.content ? `\n        content: ${o.content},` : ''}${iconMap ? `\n        icons: ${iconMap},` : ''}
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
 *   of the control around it (SolarStatesBuilder), a Button's. `true` is pressable whenever it has
 *   one (a Step one can go back to).
 * @param {boolean} [o.link] announced as a link, where it is pressable (Link), not a button
 * @param {object} [o.control] makes it a control always (Checkbox), whatever is around it:
 *   `onPressed`, the expression called on a tap (null disables it), and `semantics`, the
 *   [SolarPressable] arguments that announce it (`checked: checked,`). Its callback is one of
 *   `o.params`; the widget takes a `statesController`. `drawnIn` names a parameter, the states
 *   it is drawn in where it is a part of another control (a Dropdown Item's box): given, it is
 *   drawn in them with no input and no semantics of its own. `focusNode` names the parameter that
 *   is its focus (a calendar's day); `target: false` leaves it no padded 44 × 44 target, where
 *   it touches its neighbours (a calendar's days, as a menu's rows).
 * @param {Record<string, string>} [o.values] the value the recipe reads for a prop, where it is
 *   not the prop as given (a mixed box is drawn checked), and for an axis the overlay derives
 *   from content (Tag's type), which is no prop
 * @param {string} [o.builders] what the shell wraps a layer in, a map literal by layer (Tag's
 *   close button)
 * @param {string} [o.composed] the widget a layer that is another component is drawn as, a map
 *   literal by layer (Tag's StatusIndicator), in `p` and `states`
 * @param {string} [o.wraps] the texts that wrap, and how their lines align, a map literal by layer
 * @param {string} [o.truncates] the texts that take their row's room and are cut short, a set
 *   literal (GlobalSearch's words)
 * @param {string} [o.clips] the boxes whose content is cut to their rounded corners, a set
 *   literal (Split Dropdown's root)
 * @param {string} [o.images] the pictures boxes show, a map literal by layer (Launch Card Full
 *   Screen's image)
 * @param {boolean} [o.restyle] takes the colours a composing component draws it in (Toast's Tag:
 *   its root's fill and edge), a `restyle` map by cell
 * @param {string} [o.slots] the slots the caller fills, a map literal by layer (Link's icons)
 * @param {string} [o.content] the caller's children of a layer, drawn in it in place of Figma's
 *   examples, a map literal by layer of widget lists (a menu's rows)
 * @param {(recipe: string) => string} [o.present] whether layer `l` is drawn, around the recipe's
 *   answer, an expression in `l` (a slot left empty is not drawn)
 * @param {string} [o.text] the text layers' words, a map literal by layer
 * @param {string} [o.wrap] the returned widget, around `mark` (the drawn root)
 * @param {string} [o.disabledBy] the callback whose absence disables it, as Flutter's own controls
 *   are disabled (`onPressed`, `onChanged`): the widget takes no `disabled`, and the recipe reads
 *   it as that callback's being null, or as `o.disabledWhen` where it is more (a Checkbox drawn
 *   in a row, by the row's disabled state). The descriptor's `api.flutter.disabled` names the
 *   same callback, for the parity test.
 * @param {string} [o.disabledWhen] the expression that is `disabled`, where not the callback's
 *   being null
 */
export function drawnFlutter(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const api = Object.entries(spec.api);
  // The props the widget takes as parameters: all the IR's, but one a callback's absence says.
  const own = o.disabledBy ? api.filter(([prop]) => prop !== 'disabled') : api;
  const disabledGetter = o.disabledBy
    ? `/// Whether it is disabled: by a null [${o.disabledBy}], as Flutter's own controls are, not a
/// parameter of its own.
bool get disabled => ${o.disabledWhen ?? `${o.disabledBy} == null`};`
    : null;
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
  // A component with no props (EmptyState) reads its recipe under constant ones.
  const propsArgs = [
    ...api.map(([prop]) => `${prop}: ${o.values?.[prop] ?? prop}`),
    ...Object.entries(o.values ?? {})
      .filter(([k]) => !spec.api[k])
      .map(([k, v]) => `${k}: ${v}`),
  ];
  const params = [
    ...own.map(([prop, def]) => `    ${dartParam(P, prop, def)},`),
    ...(o.params ? [indent(o.params, 4)] : []),
    ...(o.pressable
      ? ['    this.onPressed,', '    this.statesController,']
      : []),
    ...(o.control ? ['    this.statesController,'] : []),
    ...(o.restyle ? ['    this.restyle = const {},'] : []),
  ].join('\n');
  const pressableFields = `/// Called when it is tapped, which makes it a control of its own; without it, it takes the
/// states of the control around it (a Button's).
final VoidCallback? onPressed;

/// Its states, where the caller keeps them.
final WidgetStatesController? statesController;`;
  const controlFields = `/// Its states, where the caller keeps them.
final WidgetStatesController? statesController;`;
  const restyleFields = `/// The colours a component that holds it draws it in, by cell (Toast's: \`root.background\`,
/// \`root.borderColor\`), over the recipe's.
final Map<String, Color> restyle;`;
  const fields = [
    o.fields,
    disabledGetter,
    o.pressable ? pressableFields : null,
    o.control ? controlFields : null,
    o.restyle ? restyleFields : null,
  ]
    .filter(Boolean)
    .join('\n\n');
  const layers = (states) => `SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => ${R}.lookup(c, p, ${states}),
        dimension: (c) => ${R}.dimension(c, p, ${states}),
        color: (c) => ${o.restyle ? 'restyle[c] ?? ' : ''}${R}.color(t, c, p, ${states}),
        shadow: (c) => ${R}.shadow(t, c, p, ${states}),
        textStyle: (c) => ${R}.textStyle(t, c, p, ${states}),
        present: (l) => ${o.present ? o.present(`${R}.present(l, p, ${states})`) : `${R}.present(l, p, ${states})`},
        glyph: ${glyphs ? `(l) => ${R}.glyph(l, p, ${states})` : '(_) => null'},
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(name)}',${o.text ? `\n      text: ${o.text},` : ''}${o.slots ? `\n      slots: ${o.slots},` : ''}${o.content ? `\n      content: ${o.content},` : ''}${o.builders ? `\n      builders: ${o.builders},` : ''}${o.composed ? `\n      composed: ${o.composed},` : ''}${o.wraps ? `\n      wraps: ${o.wraps},` : ''}${o.truncates ? `\n      truncates: ${o.truncates},` : ''}${o.clips ? `\n      clips: ${o.clips},` : ''}${o.images ? `\n      images: ${o.images},` : ''}${icons.length ? `\n      icons: ${icons.some((i) => i.byAxis) ? '' : 'const '}{${icons.map((i) => `'${i.layer}': ${dartIcon(i, spec)}`).join(', ')}},` : ''}
    ).layer('root')`;
  const draw = o.control
    ? `    Widget draw(Set<WidgetState> states) => ${layers('states')};
    final mark = ${
      o.control.drawnIn
        ? `${o.control.drawnIn} != null
        ? ExcludeSemantics(child: draw(${o.control.drawnIn}!))
        : `
        : ''
    }SolarPressable(
      onPressed: ${o.control.onPressed},
      statesController: statesController,${
        o.control.focusNode
          ? `
      focusNode: ${o.control.focusNode},`
          : ''
      }
${o.control.semantics ? `${indent(o.control.semantics, 6)}\n` : ''}      target: ${o.control.target === false ? 'false' : 'true'},
      builder: (_, states) => draw(states),
    );`
    : o.pressable
      ? `    Widget draw(Set<WidgetState> states) => ${layers('states')};
    // A control of its own only when it has something to do; otherwise it takes the states of
    // the control around it (a Counter in a Button).
    final mark = onPressed == null && statesController == null
        ? SolarStatesBuilder(builder: (_, states) => draw(states))
        : SolarPressable(
            onPressed: ${o.pressable === true ? 'onPressed' : `${o.pressable} ? onPressed : null`},
            statesController: statesController,${o.link ? '\n            link: true,' : ''}
            target: true,
      builder: (_, states) => draw(states),
          );`
      : `    ${o.states ? `final states = ${o.states};` : 'const states = <WidgetState>{};'}
    final mark = ${layers('states')};`;
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [${R}]: ${o.look}.`;
  return `/// SOLAR ${name}.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(o.about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/${dartFile(name)}';
${icons.length ? "import '../generated/icons.dart';\n" : ''}import '../solar_layers.dart';
${o.pressable || o.control ? "import '../solar_states.dart';\n" : ''}${o.imports ? `${o.imports.trim()}\n` : ''}import 'solar_theme_of.dart';

class Solar${P} extends StatelessWidget {
  const Solar${P}({
    super.key,
${params}
  });

${own.map(([prop, def]) => dartField(P, prop, def)).join('\n')}
${fields ? `\n${indent(fields, 2)}\n` : ''}
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };
${o.members ? `\n${indent(o.members, 2)}\n` : ''}
  @override
  Widget build(BuildContext context) {
${o.prelude ? `${indent(o.prelude, 4)}\n` : ''}    final t = solarThemeOf(context);
    ${propsArgs.length ? 'final' : 'const'} p = Solar${P}Props(${propsArgs.join(', ')});
${draw}
    return ${o.wrap ? o.wrap.trim() : 'mark'};
  }
}
`;
}
