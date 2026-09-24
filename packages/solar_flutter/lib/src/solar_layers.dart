import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart' show OverflowBoxFit;

import 'solar_glyph.dart';
import 'solar_icon.dart';

/// One component's recipe as a bespoke widget reads it, under one set of props and states: each
/// function is the generated recipe's method of the same name with the props and states applied.
///
/// Hand written, like [SolarGlyphView]: the generated recipes are static classes, one per
/// component, so a shell hands [SolarLayers] its own recipe as these closures.
@immutable
class SolarLayerRecipe {
  /// Creates the recipe from the generated recipe's methods.
  const SolarLayerRecipe({
    required this.lookup,
    required this.dimension,
    required this.color,
    required this.shadow,
    required this.textStyle,
    required this.present,
    required this.glyph,
  });

  /// The raw entry for a cell: a token (`t:`), a keyword (`k:`), `none`, a length (`px:`).
  final String? Function(String cell) lookup;

  /// A length in logical pixels, or null where the layer hugs its content.
  final double? Function(String cell) dimension;

  /// A colour cell's colour.
  final Color Function(String cell) color;

  /// A shadow cell's shadows.
  final List<BoxShadow> Function(String cell) shadow;

  /// A typography cell's text style.
  final TextStyle? Function(String cell) textStyle;

  /// Whether a layer is drawn in this variant.
  final bool Function(String layer) present;

  /// The layer's outline where it draws one in this variant.
  final SolarGlyph? Function(String layer) glyph;
}

/// Draws a bespoke component's layers as Figma nests them: each layer as a glyph
/// ([SolarGlyphView]) where the recipe gives it an outline, as a [SolarIcon] or as text where the
/// shell gives it one, and otherwise as a box, laid out by its auto layout or, where it has none, with each
/// child at the place the recipe gives it.
///
/// Each layer is keyed `<keyPrefix>.<layer>`, so the visual check finds and measures it
/// (`test/visual/layers.dart`). Every value is the recipe's; nothing here is a design value.
class SolarLayers {
  /// Draws [tree]'s layers from [recipe].
  const SolarLayers({
    required this.recipe,
    required this.tree,
    required this.keyPrefix,
    this.text = const {},
    this.icons = const {},
    this.images = const {},
    this.builders = const {},
    this.slots = const {},
  });

  /// The component's recipe under its props and states.
  final SolarLayerRecipe recipe;

  /// Each layer's children, as Figma nests them.
  final Map<String, List<String>> tree;

  /// The key every layer is named under: `statusIndicator`.
  final String keyPrefix;

  /// What each text layer says, by layer.
  final Map<String, String> text;

  /// The SOLAR icon each icon layer draws, by layer (RowExpand's chevrons).
  final Map<String, SolarVector> icons;

  /// The picture a box shows, by layer (Avatar's photo), inside its border and radius.
  final Map<String, DecorationImage> images;

  /// What the caller fills a slot with, by layer (Link's icons): drawn in the layer's box, in the
  /// colour and size the recipe gives the layer, as an icon theme.
  final Map<String, Widget> slots;

  /// What a shell wraps a drawn layer in, by layer (SplitButton's halves, each a pressable): the
  /// keyed layer, as drawn, is the argument.
  final Map<String, Widget Function(Widget layer)> builders;

  static const _main = {
    'MIN': MainAxisAlignment.start,
    'CENTER': MainAxisAlignment.center,
    'MAX': MainAxisAlignment.end,
    'SPACE_BETWEEN': MainAxisAlignment.spaceBetween,
  };
  static const _cross = {
    'MIN': CrossAxisAlignment.start,
    'CENTER': CrossAxisAlignment.center,
    'MAX': CrossAxisAlignment.end,
    'BASELINE': CrossAxisAlignment.baseline,
  };

  /// A length, where `none` (no border, no auto layout) is none of it.
  double _length(String cell) {
    final v = recipe.lookup(cell);
    if (v == null || v == 'none') return 0;
    return recipe.dimension(cell) ?? 0;
  }

  /// A size, or null where the layer hugs its content or has no size of its own.
  double? _extent(String cell) {
    final v = recipe.lookup(cell);
    if (v == null || v == 'none') return null;
    return recipe.dimension(cell);
  }

  bool _fills(String cell) => recipe.lookup(cell) == 'k:FILL';

  /// The layer [name], keyed, drawn as this variant draws it: translucent where the recipe gives it
  /// an opacity (Node End's halo).
  Widget layer(String name) {
    final opacity = recipe.lookup('$name.opacity');
    final drawn = _drawn(name);
    final keyed = KeyedSubtree(
      key: Key('$keyPrefix.$name'),
      child: opacity == null || opacity == 'none'
          ? drawn
          : Opacity(opacity: recipe.dimension('$name.opacity')!, child: drawn),
    );
    return builders[name]?.call(keyed) ?? keyed;
  }

  Widget _drawn(String name) {
    final glyph = recipe.glyph(name);
    final words = text[name];
    final slot = slots[name];
    if (slot != null) {
      final width = _extent('$name.width');
      return IconTheme(
        data: IconThemeData(color: recipe.color('$name.color'), size: width),
        child: SizedBox(
          width: width,
          height: _extent('$name.height'),
          child: slot,
        ),
      );
    }
    final icon = icons[name];
    if (icon != null) {
      return SolarIcon(
        icon,
        size: _extent('$name.width'),
        color: recipe.color('$name.color'),
      );
    }
    return glyph != null
        ? SolarGlyphView(
            glyph,
            fill: recipe.color('$name.background'),
            stroke: recipe.color('$name.borderColor'),
            strokeWidth: _length('$name.borderWidth'),
          )
        : words != null
        ? Text(words, softWrap: false, style: _textStyle(name))
        : _box(name);
  }

  /// A text layer's style: the recipe's alone. Nothing of the style around it shows through, so a
  /// Counter's count in a button whose label underlines on hover is not underlined.
  TextStyle? _textStyle(String name) {
    final style = recipe.textStyle('$name.typography');
    return style?.copyWith(
      color: recipe.color('$name.color'),
      decoration: style.decoration ?? TextDecoration.none,
    );
  }

  /// A child where Figma put it: at its position where its parent does not lay it out.
  Widget _placed(String child) {
    final x = _extent('$child.x');
    return x == null
        ? layer(child)
        : Positioned(
            left: x,
            top: _extent('$child.y') ?? 0,
            child: layer(child),
          );
  }

  /// A child of an auto layout: filling it along the axis where the recipe says so, and, where it
  /// is fixed larger across than its parent (Tree Indent's 39px units in a 32px row), overflowing
  /// it as Figma and CSS draw it rather than squeezed to fit.
  Widget _inFlex(String child, bool horizontal) {
    final along = horizontal ? 'width' : 'height';
    final across = _extent('$child.${horizontal ? 'height' : 'width'}');
    Widget drawn = layer(child);
    if (across != null && across.isFinite) {
      drawn = OverflowBox(
        fit: OverflowBoxFit.deferToChild,
        maxWidth: horizontal ? null : double.infinity,
        maxHeight: horizontal ? double.infinity : null,
        child: drawn,
      );
    }
    return _fills('$child.$along') ? Expanded(child: drawn) : drawn;
  }

  Widget _box(String name) {
    final children = [
      for (final c in tree[name] ?? const <String>[])
        if (recipe.present(c)) c,
    ];
    final direction = recipe.lookup('$name.direction');
    final laid = direction == 'k:HORIZONTAL' || direction == 'k:VERTICAL';
    final Widget? content;
    // An auto layout is one even with nothing in it (RowExpand's empty title cell): its gap and
    // alignment are still the layer's.
    if (laid && !children.any((c) => _extent('$c.x') != null)) {
      final horizontal = direction == 'k:HORIZONTAL';
      final along = horizontal ? 'width' : 'height';
      final align = recipe.lookup('$name.align')!.substring(2).split('/');
      content = Flex(
        direction: horizontal ? Axis.horizontal : Axis.vertical,
        // A layer that hugs its content is as long as its children, as Figma's auto layout is.
        mainAxisSize: recipe.lookup('$name.$along') == 'k:HUG'
            ? MainAxisSize.min
            : MainAxisSize.max,
        mainAxisAlignment: _main[align.first]!,
        crossAxisAlignment: _cross[align.last]!,
        textBaseline: TextBaseline.alphabetic,
        spacing: _length('$name.gap'),
        children: [for (final c in children) _inFlex(c, horizontal)],
      );
    } else if (children.isEmpty) {
      content = null;
    } else {
      content = Stack(
        clipBehavior: Clip.none,
        children: [for (final c in children) _placed(c)],
      );
    }
    final borderWidth = _length('$name.borderWidth');
    return Container(
      width: _extent('$name.width'),
      height: _extent('$name.height'),
      padding: EdgeInsets.fromLTRB(
        _length('$name.paddingLeft'),
        _length('$name.paddingTop'),
        _length('$name.paddingRight'),
        _length('$name.paddingBottom'),
      ),
      decoration: BoxDecoration(
        color: recipe.lookup('$name.background') == null
            ? null
            : recipe.color('$name.background'),
        border: borderWidth == 0
            ? null
            : Border.all(
                color: recipe.color('$name.borderColor'),
                width: borderWidth,
              ),
        borderRadius: BorderRadius.circular(_length('$name.radius')),
        boxShadow: recipe.lookup('$name.shadow') == null
            ? null
            : recipe.shadow('$name.shadow'),
        image: images[name],
      ),
      child: content,
    );
  }
}
