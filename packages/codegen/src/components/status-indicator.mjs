/**
 * SOLAR StatusIndicator, beyond its IR: where MUI draws each layer, and the two shell templates,
 * run once by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawing (its overlay's `drawing`): every type is its own shape, from other layers. The shells
 * walk Figma's layer tree, drawing a layer as a glyph where its entry has one and as a box where
 * it does not, and placing it where the recipe says.
 */

import { dartField, dartParam } from '../scaffold/helpers.mjs';

/** Each layer's children, in Figma's order, from the IR. */
const treeOf = (spec) => {
  const tree = {};
  for (const [name, l] of Object.entries(spec.layers))
    if (l.parent !== null) (tree[l.parent] ??= []).push(name);
  return tree;
};

export default {
  name: 'StatusIndicator',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: (() => {
      const layers = [
        'root',
        'innerPath',
        'union',
        'container',
        'frame3',
        'frame3InnerPath',
        'containerInnerPath',
        'icon',
        'containerUnion',
      ];
      return Object.fromEntries(
        layers.map((l) => [
          l,
          l === 'root' ? '&' : `& .SolarStatusIndicator-${l}`,
        ]),
      );
    })(),
    // A mark is an inline box of its own size, and a frame in it is a flex box, as Figma's auto
    // layout is; a placed layer is absolute in it. A glyph's two outlines are filled, never
    // stroked: `stroke` on the glyph only names the stroke outline's colour.
    resets: {
      display: 'inline-flex',
      position: 'relative',
      boxSizing: 'border-box',
      flexShrink: '0',
      '& .SolarStatusIndicator-box': {
        display: 'flex',
        boxSizing: 'border-box',
      },
      '& .SolarStatusIndicator-glyph': {
        display: 'block',
        overflow: 'visible',
      },
      '& .SolarGlyph-fill, & .SolarGlyph-stroke': { stroke: 'none' },
    },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      for (const axis of ['type', 'size'])
        if (!spec.api[axis])
          throw new Error(`StatusIndicator: the IR has no ${axis}`);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR StatusIndicator.
 *
 * Scaffolded once by \`npm run solar:scaffold StatusIndicator\` from spec/components/statusindicator.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, \`solarStatusIndicatorStyle\` and \`solarStatusIndicatorCompose\` in
 * \`@bwp-web/styles/mui\`: each type's disc or triangle, its mark, their colours and where they sit.
 *
 * Bespoke: a drawn mark. Each type is its own drawing, so this walks Figma's layer tree and draws a
 * layer as a glyph (an SVG of Figma's outline) where the recipe has one and as a box where it does
 * not. Decorative unless given a \`label\`, which it then announces as an image. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import {
  solarStatusIndicatorCompose,
  solarStatusIndicatorStyle,
  type SolarStatusIndicatorParts,
  type SolarStatusIndicatorProps,
} from '@bwp-web/styles/mui';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface StatusIndicatorProps
  extends SolarStatusIndicatorProps,
    // MUI types BoxProps' ref for any element; the component's own, a <span>, comes from forwardRef.
    Omit<BoxProps, keyof SolarStatusIndicatorProps | 'children' | 'ref'> {
  /**
   * What the status means, for a screen reader. Without it the mark is decorative and hidden from
   * assistive technology, so say the status in words beside it.
   */
  label?: string;
}

type Glyph = { width: number; height: number; fill: Path[]; stroke: Path[] };
type Path = { d: string; evenOdd: boolean };

/** One layer, drawn as Figma draws it in this variant, or nothing where it is hidden. */
function layer(name: string, parts: Record<string, SolarStatusIndicatorParts>): ReactNode {
  const p = parts[name] ?? {};
  if (p.present === false) return null;
  const place: CSSProperties | undefined =
    typeof p.x === 'number'
      ? { position: 'absolute', left: p.x, top: typeof p.y === 'number' ? p.y : 0 }
      : undefined;
  const glyph = typeof p.glyph === 'object' && p.glyph !== null ? (p.glyph as Glyph) : null;
  if (glyph)
    return (
      <svg
        key={name}
        className={\`SolarStatusIndicator-\${name} SolarStatusIndicator-glyph\`}
        viewBox={\`0 0 \${glyph.width} \${glyph.height}\`}
        style={place}
        aria-hidden
      >
        {glyph.fill.map((path, i) => (
          <path
            key={\`f\${i}\`}
            className="SolarGlyph-fill"
            d={path.d}
            fillRule={path.evenOdd ? 'evenodd' : 'nonzero'}
          />
        ))}
        {glyph.stroke.map((path, i) => (
          <path
            key={\`s\${i}\`}
            className="SolarGlyph-stroke"
            d={path.d}
            fillRule={path.evenOdd ? 'evenodd' : 'nonzero'}
          />
        ))}
      </svg>
    );
  return (
    <span key={name} className={\`SolarStatusIndicator-\${name} SolarStatusIndicator-box\`} style={place}>
      {(TREE[name] ?? []).map((child) => layer(child, parts))}
    </span>
  );
}

export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  function StatusIndicator({ ${api.join(', ')}, label, sx, ...rest }, ref) {
    const parts = solarStatusIndicatorCompose({ ${api.join(', ')} });
    return (
      <Box
        component="span"
        ref={ref}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        {...rest}
        sx={[solarStatusIndicatorStyle({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {(TREE.root ?? []).map((child) => layer(child, parts))}
      </Box>
    );
  },
);
`;
    },
    flutter: (spec) => {
      for (const axis of ['type', 'size'])
        if (!spec.api[axis])
          throw new Error(`StatusIndicator: the IR has no ${axis}`);
      const api = Object.entries(spec.api);
      const tree = treeOf(spec);
      const dartTree = Object.entries(tree)
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      return `/// SOLAR StatusIndicator.
///
/// Scaffolded once by \`npm run solar:scaffold -- --flutter StatusIndicator\` from
/// spec/components/statusindicator.json, and owned by developers from then on: change it freely.
/// What it looks like is not here. That is the recipe, [SolarStatusIndicatorRecipe]: each type's
/// disc or triangle, its mark, their colours and where they sit, read cell by cell.
///
/// Bespoke: a drawn mark. Each type is its own drawing, so this walks Figma's layer tree and draws
/// a layer as a glyph ([SolarGlyphView]) where the recipe has one and as a box where it does not.
/// Decorative unless given a [label], which it then announces.
library;

import 'package:flutter/material.dart';

import '../generated/components/statusindicator.dart';
import '../solar_glyph.dart';
import 'solar_theme_of.dart';

class SolarStatusIndicator extends StatelessWidget {
  const SolarStatusIndicator({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('StatusIndicator', prop, def)},`).join('\n')}
    this.label,
  });

${api.map(([prop, def]) => dartField('StatusIndicator', prop, def)).join('\n')}

  /// What the status means, for a screen reader. Without it the mark is decorative.
  final String? label;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${dartTree}
  };

  static const _main = {
    'MIN': MainAxisAlignment.start,
    'CENTER': MainAxisAlignment.center,
    'MAX': MainAxisAlignment.end,
  };
  static const _cross = {
    'MIN': CrossAxisAlignment.start,
    'CENTER': CrossAxisAlignment.center,
    'MAX': CrossAxisAlignment.end,
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarStatusIndicatorProps(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
    const rest = <WidgetState>{};
    String? at(String cell) => SolarStatusIndicatorRecipe.lookup(cell, p, rest);
    // A length, where \`none\` (no border, no auto layout) is none of it.
    double length(String cell) {
      final v = at(cell);
      if (v == null || v == 'none') return 0;
      return SolarStatusIndicatorRecipe.dimension(cell, p, rest) ?? 0;
    }

    double? extent(String cell) {
      final v = at(cell);
      if (v == null || v == 'none') return null;
      return SolarStatusIndicatorRecipe.dimension(cell, p, rest);
    }

    Color colour(String cell) =>
        SolarStatusIndicatorRecipe.color(t, cell, p, rest);
    bool shows(String layer) =>
        SolarStatusIndicatorRecipe.present(layer, p, rest);

    late final Widget Function(String) layer;

    // A child where Figma put it: at its position where its parent does not lay it out.
    Widget placed(String child) {
      final x = extent('$child.x');
      return x == null
          ? layer(child)
          : Positioned(left: x, top: extent('$child.y') ?? 0, child: layer(child));
    }

    Widget box(String name) {
      final children = [
        for (final c in _tree[name] ?? const <String>[])
          if (shows(c)) c,
      ];
      final direction = at('$name.direction');
      final laid = direction == 'k:HORIZONTAL' || direction == 'k:VERTICAL';
      final Widget content;
      if (laid && !children.any((c) => extent('$c.x') != null)) {
        final align = at('$name.align')!.substring(2).split('/');
        content = Flex(
          direction: direction == 'k:HORIZONTAL' ? Axis.horizontal : Axis.vertical,
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: _main[align.first]!,
          crossAxisAlignment: _cross[align.last]!,
          spacing: length('$name.gap'),
          children: [for (final c in children) layer(c)],
        );
      } else {
        content = Stack(
          clipBehavior: Clip.none,
          children: [for (final c in children) placed(c)],
        );
      }
      final borderWidth = length('$name.borderWidth');
      return Container(
        width: extent('$name.width'),
        height: extent('$name.height'),
        padding: EdgeInsets.fromLTRB(
          length('$name.paddingLeft'),
          length('$name.paddingTop'),
          length('$name.paddingRight'),
          length('$name.paddingBottom'),
        ),
        decoration: BoxDecoration(
          color: colour('$name.background'),
          border: borderWidth == 0
              ? null
              : Border.all(color: colour('$name.borderColor'), width: borderWidth),
          borderRadius: BorderRadius.circular(length('$name.radius')),
          boxShadow: SolarStatusIndicatorRecipe.shadow(t, '$name.shadow', p, rest),
        ),
        child: content,
      );
    }

    layer = (String name) {
      final glyph = SolarStatusIndicatorRecipe.glyph(name, p, rest);
      return KeyedSubtree(
        key: Key('statusIndicator.$name'),
        child: glyph != null
            ? SolarGlyphView(
                glyph,
                fill: colour('$name.background'),
                stroke: colour('$name.borderColor'),
                strokeWidth: length('$name.borderWidth'),
              )
            : box(name),
      );
    };

    final mark = layer('root');
    return label == null
        ? ExcludeSemantics(child: mark)
        : Semantics(label: label, image: true, child: mark);
  }
}
`;
    },
  },
};
