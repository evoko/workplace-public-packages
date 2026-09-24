/// SOLAR StatusIndicator.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter StatusIndicator` from
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
    this.type = SolarStatusIndicatorType.success,
    this.size = SolarStatusIndicatorSize.md,
    this.label,
  });

  final SolarStatusIndicatorType type;
  final SolarStatusIndicatorSize size;

  /// What the status means, for a screen reader. Without it the mark is decorative.
  final String? label;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['innerPath', 'union', 'container', 'frame3'],
    'frame3': ['frame3InnerPath'],
    'container': ['containerInnerPath', 'icon', 'containerUnion'],
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
    final p = SolarStatusIndicatorProps(type: type, size: size);
    const rest = <WidgetState>{};
    String? at(String cell) => SolarStatusIndicatorRecipe.lookup(cell, p, rest);
    // A length, where `none` (no border, no auto layout) is none of it.
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
          : Positioned(
              left: x,
              top: extent('$child.y') ?? 0,
              child: layer(child),
            );
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
          direction: direction == 'k:HORIZONTAL'
              ? Axis.horizontal
              : Axis.vertical,
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
              : Border.all(
                  color: colour('$name.borderColor'),
                  width: borderWidth,
                ),
          borderRadius: BorderRadius.circular(length('$name.radius')),
          boxShadow: SolarStatusIndicatorRecipe.shadow(
            t,
            '$name.shadow',
            p,
            rest,
          ),
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
