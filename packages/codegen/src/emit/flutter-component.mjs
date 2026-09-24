/**
 * Emits a component's recipe for Flutter: the IR as a `const` map of token *names*, a resolver
 * that applies the same precedence the CSS cascade gives the MUI recipe, and a `ButtonStyle`
 * built from `WidgetStateProperty.resolveWith`, so hover, pressed, focus and disabled resolve the
 * way Flutter expects rather than through an if-ladder in the widget.
 *
 * Names rather than values, because the values switch with Light and Dark: a colour is a field of
 * the ambient `SolarTheme`'s `SolarColors`, reached through a generated switch, never a literal.
 *
 * What is Flutter-specific lives here: which style builder each base control takes (`BUILDERS`),
 * which IR cell drives which of its properties (`FLUTTER_STYLE`), and how each state is detected
 * (`stateTest`).
 */

import { join } from 'node:path';
import { table as descriptorTable } from '../components/index.mjs';
import { flattenSpec } from '../spec.mjs';
import { pascal, quote } from '../util/naming.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { dartName, RESERVED, STATIC_CLASS } from './flutter.mjs';
import { restateOverlaps, stateSelectors } from './mui-component.mjs';

const OUT_DIR = join(
  packagesDir,
  'solar_flutter',
  'lib',
  'src',
  'generated',
  'components',
);

/**
 * Which state wins when several hold, highest first, for one component. It is the MUI recipe's
 * cascade order read backwards -- there the later rule wins at equal specificity -- so the two
 * platforms cannot disagree about whether disabled beats hover.
 */
export const statePrecedence = (component) =>
  Object.keys(stateSelectors(component))
    .filter((s) => s !== 'default')
    .reverse();

/** The `WidgetState` Flutter tracks for each platform state. */
const WIDGET_STATE = { hover: 'hovered', pressed: 'pressed', focus: 'focused' };

/**
 * How a state is detected, the same for every component, since Flutter tracks the same
 * `WidgetState`s whatever the control (MUI's classes are what differ, `STATE_SELECTORS`): a
 * platform state is its `WidgetState`, a state that is a prop is the prop, and `disabled` is also
 * what Flutter marks a control with no handler. A loading control has none either, so where there
 * is a `loading` prop the disabled look waits for the prop and loading shows, as the MUI selector
 * does; disabled and loading together is disabled, which the shell settles by passing loading only
 * to an enabled control.
 */
export function stateTest(spec, state) {
  if (WIDGET_STATE[state] && spec.states.includes(state))
    return `s.contains(WidgetState.${WIDGET_STATE[state]})`;
  if (spec.api[state]?.type !== 'boolean')
    throw new Error(`${spec.component}: no Flutter test for state ${state}`);
  if (state !== 'disabled') return `p.${state}`;
  return spec.api.loading?.type === 'boolean'
    ? 'p.disabled || (!p.loading && s.contains(WidgetState.disabled))'
    : 'p.disabled || s.contains(WidgetState.disabled)';
}

/**
 * The style builder each base control takes, by its Flutter name. Button's and Icon Button's
 * stock controls both take a `ButtonStyle`; a bespoke widget, or one whose stock control has no
 * style object to build (CircularProgressIndicator), reads the recipe cell by cell instead.
 */
export const BUILDERS = {
  FilledButton: 'ButtonStyle',
  IconButton: 'ButtonStyle',
};

/**
 * Which IR cell each property of the base control's style is read from, by component. A cell the IR
 * lacks is an error, and so is a table for a base with no builder, or a base with a builder and no
 * table.
 */
export const FLUTTER_STYLE = descriptorTable('flutter', 'style');

/**
 * Cells one Flutter property draws for more than one layer, where MUI styles each: ButtonStyle has
 * one `iconColor` and one `iconSize` for both icons, CircularProgressIndicator one `strokeWidth`
 * for its track and indicator. Where the IR's two differ, the emitter refuses rather than drawing
 * one layer with the other's value.
 */
export const FLUTTER_SHARED = descriptorTable('flutter', 'shared');

/** One IR entry as the string the Dart map holds. */
function encode(entry, at) {
  if (entry.token) return `t:${entry.token}`;
  if (entry.none) return 'none';
  if (entry.keyword !== undefined) return `k:${entry.keyword}`;
  if (entry.value !== undefined) return `b:${entry.value}`;
  if (entry.literal !== undefined) {
    if (!entry.allowed)
      throw new Error(
        `${at}: literal ${entry.literal} is not allowed by the overlay`,
      );
    return `px:${entry.literal}`;
  }
  throw new Error(`${at}: cannot encode ${JSON.stringify(entry)}`);
}

/** The IR flattened to `<layer>.<cell>|<scope…>` keys, in a stable order. */
function flatten(spec, glyphs = []) {
  const cells = {};
  // A glyph is structured data, not a string: the cell holds its index in the recipe's glyph
  // list, one entry per distinct drawing.
  const glyphIndex = (glyph) => {
    const key = JSON.stringify(glyph);
    let i = glyphs.findIndex((g) => JSON.stringify(g) === key);
    if (i < 0) i = glyphs.push(glyph) - 1;
    return `g:${i}`;
  };
  // A layer with no auto-layout in a variant (the recipe writes it `none`) has no gap or padding:
  // inset.none, as the MUI recipe has it, so a shell reads a length there like any other.
  const insets = /\.(gap|padding(Top|Right|Bottom|Left))\|/;
  const put = (key, entry) =>
    (cells[key] = entry.glyph
      ? glyphIndex(entry.glyph)
      : entry.none && insets.test(key)
        ? 't:inset.none'
        : encode(entry, key));
  for (const [layer, s] of Object.entries(spec.style)) {
    for (const [cell, e] of Object.entries(s.base))
      put(`${layer}.${cell}|base`, e);
    for (const [size, c] of Object.entries(s.size))
      for (const [cell, e] of Object.entries(c))
        put(`${layer}.${cell}|size|${size}`, e);
    for (const [combo, states] of Object.entries(s.appearance))
      for (const [state, c] of Object.entries(states))
        for (const [cell, e] of Object.entries(c))
          put(`${layer}.${cell}|appearance|${combo}|${state}`, e);
    for (const [size, byCombo] of Object.entries(s.combined ?? {}))
      for (const [combo, states] of Object.entries(byCombo))
        for (const [state, c] of Object.entries(states))
          for (const [cell, e] of Object.entries(c))
            put(`${layer}.${cell}|combined|${size}|${combo}|${state}`, e);
  }
  return cells;
}

/**
 * @returns {{dart: string, cells: Record<string, string>, file: string}}
 */
export function renderFlutterComponent(spec, tokens) {
  // A component whose base control takes a style object gets a builder for it (Button's
  // ButtonStyle); one without gets the recipe alone, which its shell reads cell by cell.
  const builderOf = BUILDERS[spec.base?.flutter] ?? null;
  if (builderOf && !FLUTTER_STYLE[spec.component])
    throw new Error(
      `${spec.component}: ${spec.base.flutter} takes a ${builderOf}, and FLUTTER_STYLE has no table for it`,
    );
  if (!builderOf && FLUTTER_STYLE[spec.component])
    throw new Error(
      `${spec.component}: FLUTTER_STYLE has a table, and its base ${spec.base?.flutter ?? '(none)'} has no style builder`,
    );
  const table = FLUTTER_STYLE[spec.component] ?? {};
  const glyphs = [];
  // Read through the overlaps, as the MUI recipe is: a pressed control is hovered too, and each
  // cell is looked up in the strongest state that has it.
  const cells = flatten({ ...spec, style: restateOverlaps(spec) }, glyphs);
  const cellNames = new Set(Object.keys(cells).map((k) => k.split('|')[0]));
  for (const [prop, cell] of Object.entries(table))
    if (!cellNames.has(cell))
      throw new Error(
        `${spec.component}: ${prop} reads ${cell}, which the IR does not have`,
      );
  for (const [cell, other] of Object.entries(
    FLUTTER_SHARED[spec.component] ?? {},
  )) {
    const of = (name) =>
      Object.fromEntries(
        Object.entries(cells)
          .filter(([k]) => k.split('|')[0] === name)
          .map(([k, v]) => [k.slice(name.length), v]),
      );
    if (JSON.stringify(of(cell)) !== JSON.stringify(of(other)))
      throw new Error(
        `${spec.component}: Flutter draws ${cell} and ${other} with one property, and the IR gives them different values`,
      );
  }
  // Every state the IR keys an entry by must be one the resolver can detect, and one it resolves in
  // the component's order.
  const precedence = statePrecedence(spec.component);
  for (const key of Object.keys(cells)) {
    const state = key.split('|').at(-1);
    if (key.includes('|appearance|') || key.includes('|combined|'))
      if (state !== 'default') {
        stateTest(spec, state);
        if (!precedence.includes(state))
          throw new Error(
            `${spec.component}: state ${state} has no place in the state order (STATE_SELECTORS)`,
          );
      }
  }

  // Token names to Dart expressions, for exactly the tokens the recipe uses.
  const all = new Map(flattenSpec(tokens).map((t) => [t.name, t]));
  const used = [
    ...new Set(
      Object.values(cells)
        .filter((v) => v.startsWith('t:'))
        .map((v) => v.slice(2)),
    ),
  ].sort();
  const colors = [];
  const shadows = [];
  const dimensions = [];
  const typography = [];
  for (const name of used) {
    const t = all.get(name);
    if (!t) throw new Error(`${spec.component}: ${name} is not a token`);
    const [head, ...rest] = name.split('.');
    const field = dartName(rest.join('.'));
    if (t.type === 'color') {
      if (!t.modes)
        throw new Error(
          `${spec.component}: ${name} is a primitive; the recipe must use a semantic colour`,
        );
      colors.push(`      't:${name}' => c.${field},`);
    } else if (t.type === 'shadow')
      shadows.push(`      't:${name}' => t.shadows.${field},`);
    else if (t.type === 'typography')
      typography.push(`      't:${name}' => t.typography.${field},`);
    else if (t.type === 'dimension' && !t.modes && STATIC_CLASS[head])
      dimensions.push(`      't:${name}' => ${STATIC_CLASS[head]}.${field},`);
    else
      throw new Error(
        `${spec.component}: no Flutter conversion for ${name} (${t.type})`,
      );
  }

  const name = pascal(spec.component);
  const enums = [];
  const spelled = new Set();
  const fields = [];
  const params = [];
  for (const [prop, def] of Object.entries(spec.api)) {
    if (def.type === 'boolean') {
      fields.push(`  final bool ${prop};`);
      params.push(`    this.${prop} = ${def.default},`);
    } else {
      const type = `Solar${name}${pascal(prop)}`;
      // A value that is a Dart keyword (Spinner's `default`) is escaped with `$`, as token names
      // are, and the enum then carries Figma's spelling, which the recipe's keys are written in.
      const id = (v) => (RESERVED.has(v) ? `$${v}` : v);
      if (def.values.some((v) => RESERVED.has(v))) {
        spelled.add(prop);
        enums.push(
          `enum ${type} {\n${def.values.map((v) => `  ${id(v)}('${v}')`).join(',\n')};\n\n  const ${type}(this.figma);\n\n  /// The value as Figma spells it, which the recipe is keyed by.\n  final String figma;\n}`,
        );
      } else enums.push(`enum ${type} { ${def.values.join(', ')} }`);
      fields.push(`  final ${type} ${prop};`);
      params.push(`    this.${prop} = ${type}.${id(def.default)},`);
    }
  }
  const firstCombo = Object.values(spec.style)
    .flatMap((st) => Object.keys(st.appearance))
    .at(0);
  const appearanceAxes =
    firstCombo?.split(', ').map((part) => part.split('=')[0]) ?? [];
  // The states this component can be in, in precedence order; a test of a prop the component
  // does not have (a Spinner is never disabled) would not compile.
  const holds = precedence.filter(
    (st) => spec.api[st]?.type === 'boolean' || spec.states.includes(st),
  );
  const sizeExpr = 'size' in spec.api ? 'p.size.name' : "''";
  const combo = appearanceAxes
    .map(
      (a) =>
        `${a}=\${p.${a}${spec.api[a].type === 'boolean' ? '' : spelled.has(a) ? '.figma' : '.name'}}`,
    )
    .join(', ');
  const cell = (key) => `'${table[key]}'`;
  // What a ButtonStyle needs from every component, and what only some have: an icon button has no
  // label, so no text style.
  const REQUIRED = [
    'background',
    'shadow',
    'radius',
    'borderColor',
    'borderWidth',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'height',
    'width',
  ];
  if (builderOf === 'ButtonStyle')
    for (const key of REQUIRED)
      if (!table[key])
        throw new Error(
          `${spec.component}: FLUTTER_STYLE names no cell for the ButtonStyle's ${key}`,
        );
  const optional = (key, line) => (table[key] ? line : '');

  const entries = Object.entries(cells)
    .map(([k, v]) => `    ${quote(k)}: ${quote(v)},`)
    .join('\n');

  const shown = [
    'BoxShadow',
    'Color',
    'Colors',
    'TextStyle',
    'WidgetState',
    ...(builderOf === 'ButtonStyle'
      ? [
          'BorderRadius',
          'BorderSide',
          'BoxDecoration',
          'ButtonStyle',
          'DecoratedBox',
          'EdgeInsetsDirectional',
          'NoSplash',
          'RoundedRectangleBorder',
          'Size',
          'VisualDensity',
          'WidgetStateProperty',
          'WidgetStatePropertyAll',
        ]
      : []),
  ].sort();
  const builder =
    builderOf === 'ButtonStyle'
      ? `
  static BorderSide _side(SolarTheme t, Solar${name}Props p, Set<WidgetState> s) {
    final width = lookup(${cell('borderWidth')}, p, s);
    if (width == null || width == 'none') return BorderSide.none;
    return BorderSide(color: color(t, ${cell('borderColor')}, p, s), width: dimension(${cell('borderWidth')}, p, s)!);
  }

  static BorderRadius _radius(Solar${name}Props p, Set<WidgetState> s) =>
      BorderRadius.circular(dimension(${cell('radius')}, p, s) ?? 0);

  /// A [ButtonStyle] for a ${spec.base.flutter} that draws SOLAR's ${spec.component}.
  ///
  /// The background and the shadows are painted by one [BoxDecoration] in [ButtonStyle.backgroundBuilder]:
  /// ButtonStyle has elevation but no box shadows, and a Flutter shadow paints under the whole
  /// box, so drawing it over a separately coloured Material would darken the button's face, which
  /// CSS never does. Material's own overlay, splash and density are switched off, because every
  /// SOLAR state has its own explicit colours and sizes.
  static ButtonStyle style(SolarTheme t, [Solar${name}Props p = const Solar${name}Props()]) {
    WidgetStateProperty<T> by<T>(T Function(Set<WidgetState> s) f) => WidgetStateProperty.resolveWith(f);
    const none = <WidgetState>{};
    final width = dimension(${cell('width')}, p, none);
    final height = dimension(${cell('height')}, p, none);
    return ButtonStyle(
      backgroundColor: const WidgetStatePropertyAll(Colors.transparent),
${optional(
  'foreground',
  `      foregroundColor: by((s) => color(t, ${cell('foreground')}, p, s)),
`,
)}${optional(
          'iconColor',
          `      iconColor: by((s) => color(t, ${cell('iconColor')}, p, s)),
`,
        )}${optional(
          'iconSize',
          `      iconSize: WidgetStatePropertyAll(dimension(${cell('iconSize')}, p, none)),
`,
        )}${optional(
          'textStyle',
          `      textStyle: by((s) => textStyle(t, ${cell('textStyle')}, p, s)),
`,
        )}      padding: by((s) => EdgeInsetsDirectional.only(
            start: dimension(${cell('paddingLeft')}, p, s) ?? 0,
            end: dimension(${cell('paddingRight')}, p, s) ?? 0,
            top: dimension(${cell('paddingTop')}, p, s) ?? 0,
            bottom: dimension(${cell('paddingBottom')}, p, s) ?? 0,
          )),
      minimumSize: WidgetStatePropertyAll(Size(width ?? 0, height ?? 0)),
      fixedSize: width == null ? null : WidgetStatePropertyAll(Size(width, height ?? 0)),
      side: by((s) => _side(t, p, s)),
      shape: by((s) => RoundedRectangleBorder(borderRadius: _radius(p, s))),
      elevation: const WidgetStatePropertyAll(0),
      shadowColor: const WidgetStatePropertyAll(Colors.transparent),
      surfaceTintColor: const WidgetStatePropertyAll(Colors.transparent),
      overlayColor: const WidgetStatePropertyAll(Colors.transparent),
      splashFactory: NoSplash.splashFactory,
      visualDensity: VisualDensity.standard,
      backgroundBuilder: (context, s, child) => DecoratedBox(
        decoration: BoxDecoration(
          color: color(t, ${cell('background')}, p, s),
          borderRadius: _radius(p, s),
          boxShadow: shadow(t, ${cell('shadow')}, p, s),
        ),
        child: child,
      ),
    );
  }
`
      : '';

  // The shapes the component draws itself, Figma's path data byte for byte.
  const pathDart = (p) =>
    `SolarVectorPath(${quote(p.d)}${p.evenOdd ? ', evenOdd: true' : ''})`;
  const glyphDart = glyphs.length
    ? `
  /// The shapes the layers draw themselves (a cell's \`g:<n>\` is the nth), Figma's path data.
  static const List<SolarGlyph> glyphs = <SolarGlyph>[
${glyphs
  .map(
    (g) =>
      `    SolarGlyph(width: ${g.width.toFixed(1)}, height: ${g.height.toFixed(1)}, fill: <SolarVectorPath>[${g.fill.map(pathDart).join(', ')}], stroke: <SolarVectorPath>[${g.stroke.map(pathDart).join(', ')}]),`,
  )
  .join('\n')}
  ];

  /// The shape a layer draws under these props and states, or null where it draws none.
  static SolarGlyph? glyph(String layer, Solar${name}Props p, Set<WidgetState> s) {
    final v = lookup('$layer.glyph', p, s);
    return v != null && v.startsWith('g:') ? glyphs[int.parse(v.substring(2))] : null;
  }
`
    : '';

  const dart = `// SOLAR ${spec.component} recipe for Flutter. Generated by @bwp-web/codegen from spec/components/${spec.component.toLowerCase()}.json. Do not edit.
//
// The recipe is data: token *names*, keyed by layer and cell and by the base, size, appearance
// and combined sections of the IR. Values resolve against the ambient SolarTheme, so Light and
// Dark switch with the theme and no colour here is a literal.

import 'package:flutter/foundation.dart' show immutable;
import 'package:flutter/material.dart'
    show ${shown.join(', ')};

${glyphs.length ? "import '../../solar_glyph.dart';\nimport '../../solar_icon.dart' show SolarVectorPath;\n" : ''}import '../tokens.dart';

${enums.join('\n\n')}

/// The props a SOLAR ${spec.component} takes. Hover, pressed and focus are not here: they are
/// platform states, tracked by Flutter as [WidgetState]s.
@immutable
class Solar${name}Props {
${
  // A component with no props (Scrim, drawn with no variants) has an empty constructor: Dart
  // refuses empty braces for named parameters.
  params.length
    ? `  const Solar${name}Props({\n${params.join('\n')}\n  });\n\n${fields.join('\n')}`
    : `  const Solar${name}Props();`
}
}

abstract final class Solar${name}Recipe {
  /// Every IR entry, as \`<layer>.<cell>|<section>…\` to a token name (\`t:\`), a keyword (\`k:\`),
  /// \`none\`, a presence (\`b:\`) or a literal the overlay allowed (\`px:\`).
  static const Map<String, String> cells = {
${entries}
  };

  /// Which state wins when several hold, highest first: the MUI recipe's cascade, read backwards.
  static const List<String> statePrecedence = ${holds.length ? '' : '<String>'}[${holds.map((s) => `'${s}'`).join(', ')}];

  static bool _holds(String state, Solar${name}Props p, Set<WidgetState> s) => switch (state) {
${holds.map((st) => `        '${st}' => ${stateTest(spec, st)},`).join('\n')}
        _ => false,
      };

  /// The entry for one cell under these props and states, by the IR's precedence: a state that
  /// holds beats the resting value, the per-size-and-appearance entry beats the per-appearance
  /// one, and the resting value falls back through appearance, size and base.
  static String? lookup(String cell, Solar${name}Props p, Set<WidgetState> s) {
    ${combo ? 'final' : 'const'} combo = '${combo}';
    ${'size' in spec.api ? 'final' : 'const'} size = ${sizeExpr};
    for (final state in statePrecedence) {
      if (!_holds(state, p, s)) continue;
      final hit = cells['$cell|combined|$size|$combo|$state'] ??
          cells['$cell|appearance|$combo|$state'];
      if (hit != null) return hit;
    }
    return cells['$cell|combined|$size|$combo|default'] ??
        cells['$cell|appearance|$combo|default'] ??
        cells['$cell|size|$size'] ??
        cells['$cell|base'];
  }

  static Color color(SolarTheme t, String cell, Solar${name}Props p, Set<WidgetState> s) {
${colors.length ? '    final c = t.colors;\n' : ''}    return switch (lookup(cell, p, s)) {
      'none' => Colors.transparent,
${colors.join('\n')}
      final v => throw StateError('$cell: no colour for $v'),
    };
  }

  static List<BoxShadow> shadow(SolarTheme t, String cell, Solar${name}Props p, Set<WidgetState> s) =>
      switch (lookup(cell, p, s)) {
        'none' || null => const <BoxShadow>[],
${shadows.join('\n')}
        final v => throw StateError('$cell: no shadow for $v'),
      };

  /// A length in logical pixels, or null where the IR says the layer hugs its content.
  static double? dimension(String cell, Solar${name}Props p, Set<WidgetState> s) {
    final v = lookup(cell, p, s);
    if (v == null || v == 'k:HUG') return null;
    if (v == 'k:FILL') return double.infinity;
    if (v.startsWith('px:')) return double.parse(v.substring(3));
    return switch (v) {
${dimensions.join('\n')}
      _ => throw StateError('$cell: no length for $v'),
    };
  }

  static TextStyle? textStyle(SolarTheme t, String cell, Solar${name}Props p, Set<WidgetState> s) =>
      switch (lookup(cell, p, s)) {
        'none' || null => null,
${typography.join('\n')}
        final v => throw StateError('$cell: no text style for $v'),
      };

  /// Whether a layer is drawn: the shell reads this, the style does not.
  static bool present(String layer, Solar${name}Props p, Set<WidgetState> s) =>
      lookup('$layer.present', p, s) != 'b:false';
${glyphDart}
${builder}}
`;
  return {
    dart,
    cells,
    file: `${spec.component.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.dart`,
  };
}

/** Writes every component's Dart file and the library that exports them. */
export function emitFlutterComponents(specs, tokens) {
  const rendered = specs.map((spec) => renderFlutterComponent(spec, tokens));
  for (const r of rendered) writeGenerated(join(OUT_DIR, r.file), r.dart);
  writeGenerated(
    join(OUT_DIR, 'components.dart'),
    '// Generated by @bwp-web/codegen. Do not edit.\n\n' +
      rendered.map((r) => `export '${r.file}';\n`).join(''),
  );
  return rendered.length;
}
