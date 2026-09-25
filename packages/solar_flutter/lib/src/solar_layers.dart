import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart' show OverflowBoxFit;

import 'solar_glyph.dart';
import 'solar_icon.dart';
import 'solar_own_size.dart';
import 'solar_target.dart';

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
    this.gradient,
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

  /// A background cell's gradient, where it is painted with one (Table's mobile fade); null for a
  /// recipe with none.
  final Gradient? Function(String cell)? gradient;
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
    this.repeats = const {},
    this.icons = const {},
    this.images = const {},
    this.builders = const {},
    this.slots = const {},
    this.content = const {},
    this.composed = const {},
    this.wraps = const {},
    this.fields = const {},
    this.truncates = const {},
    this.clips = const {},
  });

  /// The component's recipe under its props and states.
  final SolarLayerRecipe recipe;

  /// Each layer's children, as Figma nests them.
  final Map<String, List<String>> tree;

  /// The key every layer is named under: `statusIndicator`.
  final String keyPrefix;

  /// What each text layer says, by layer.
  final Map<String, String> text;

  /// A text layer Figma repeats in an auto layout (the calendar's weekdays, the IR's `repeat`), by
  /// layer: drawn once per item, each saying it, as Figma draws its copies. The first is keyed as
  /// the layer, so a check measures it; the others under `<keyPrefix>#<i>`.
  final Map<String, List<String>> repeats;

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

  /// The caller's children of a layer, laid out in it in place of the ones Figma draws as
  /// examples (Segmented Control's segments in its track), by layer.
  final Map<String, List<Widget>> content;

  /// A layer that is another SOLAR component (Tag's StatusIndicator), drawn as the widget the
  /// shell builds for it in the variant the recipe names, by layer.
  final Map<String, Widget> composed;

  /// A text that wraps onto more lines where it runs out of room (EmptyState's description), and
  /// how its lines align, by layer; every other text runs on one line, as a Figma text that hugs
  /// it does.
  final Map<String, TextAlign> wraps;

  /// A text the user edits (Text Input's words), by layer: drawn as the field the shell builds in
  /// the layer's text style, taking the room its row leaves, as Figma's text fills the field.
  final Map<String, Widget Function(TextStyle? style)> fields;

  /// A text that takes the room its row leaves, and is cut short with an ellipsis where it runs out
  /// (GlobalSearch's words, beside its Kbd), by layer.
  final Set<String> truncates;

  /// A box whose content is cut to its rounded corners (Split Dropdown's, whose two zones are
  /// tinted), by layer, as CSS's `overflow: hidden` cuts it.
  final Set<String> clips;

  /// These layers with other words, or under another key (a repeated layer's copies).
  SolarLayers _copy({
    required Map<String, String> text,
    required String keyPrefix,
  }) => SolarLayers(
    recipe: recipe,
    tree: tree,
    keyPrefix: keyPrefix,
    text: text,
    repeats: repeats,
    icons: icons,
    images: images,
    builders: builders,
    slots: slots,
    content: content,
    composed: composed,
    wraps: wraps,
    fields: fields,
    truncates: truncates,
    clips: clips,
  );

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
  /// A box's corners: each its own where the recipe gives one (a range's day, rounded on one side
  /// only), and otherwise the box's radius.
  BorderRadius _corners(String name) {
    final all = _length('$name.radius');
    Radius corner(String cell) => Radius.circular(
      recipe.lookup('$name.$cell') == null ? all : _length('$name.$cell'),
    );
    return BorderRadius.only(
      topLeft: corner('radiusTopLeft'),
      topRight: corner('radiusTopRight'),
      bottomRight: corner('radiusBottomRight'),
      bottomLeft: corner('radiusBottomLeft'),
    );
  }

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

  /// Whether [name] is as long along [axis] (`width`, `height`) as what it holds: it has no size of
  /// its own there, and either does not fill or fills a layer that hugs, which Figma resolves as a
  /// hug (a month filling a double calendar that hugs its months). A root that fills takes what
  /// the app gives it.
  bool _hugs(String name, String axis) {
    // A fill's extent is infinite: no size of its own.
    final extent = _extent('$name.$axis');
    if (extent != null && extent.isFinite) return false;
    if (!_fills('$name.$axis')) return true;
    final parent = _parentOf(name);
    return parent != null && _hugs(parent, axis);
  }

  /// A box's size along [axis]: the recipe's, but none where it fills along a parent that hugs
  /// along that axis, since the parent is as long as its children (a month in a double calendar
  /// that hugs its months). Filling across a parent that hugs, it keeps the fill, and the parent,
  /// sized to its widest child, gives it that width (the flex builder's IntrinsicWidth).
  double? _size(String name, String axis) {
    final extent = _extent('$name.$axis');
    final parent = _parentOf(name);
    if (!_fills('$name.$axis') || parent == null) return extent;
    final direction = recipe.lookup('$parent.direction');
    final along = direction == 'k:HORIZONTAL'
        ? 'width'
        : direction == 'k:VERTICAL'
        ? 'height'
        : null;
    return along == axis && _hugs(parent, axis) ? null : extent;
  }

  String? _parentOf(String name) {
    for (final MapEntry(:key, :value) in tree.entries) {
      if (value.contains(name)) return key;
    }
    return null;
  }

  /// The layer [name], keyed, drawn as this variant draws it: translucent where the recipe gives it
  /// an opacity (Node End's halo). The root keeps its own size on each axis it does not fill,
  /// whatever its parent gives it ([SolarOwnSize]): a Checkbox in a ListView is 16px, not a bar.
  Widget layer(String name) {
    final drawn = _built(name, _keyed(name));
    if (name != 'root') return drawn;
    final fillsWidth = _fills('root.width');
    final fillsHeight = _fills('root.height');
    return fillsWidth && fillsHeight
        ? drawn
        : SolarOwnSize(
            fillsWidth: fillsWidth,
            fillsHeight: fillsHeight,
            child: drawn,
          );
  }

  /// The layer, keyed, as drawn.
  Widget _keyed(String name) {
    final opacity = recipe.lookup('$name.opacity');
    final drawn = _drawn(name);
    return KeyedSubtree(
      key: Key('$keyPrefix.$name'),
      child: opacity == null || opacity == 'none'
          ? drawn
          : Opacity(opacity: recipe.dimension('$name.opacity')!, child: drawn),
    );
  }

  /// [drawn] in what the shell wraps the layer in, outermost, so a control's target (a Tag's
  /// close button) is not cut short by the box its layout puts it in.
  Widget _built(String name, Widget drawn) =>
      builders[name]?.call(drawn) ?? drawn;

  Widget _drawn(String name) {
    final child = composed[name];
    // A composed child in a box its parent's recipe sizes (a Button filling its card's row) takes
    // that box, not its own size; one the parent leaves unsized keeps its own.
    if (child != null) {
      final sized = [
        'width',
        'height',
      ].any((a) => _fills('$name.$a') || _extent('$name.$a') != null);
      if (!sized) return child;
      // A box of a fixed size (a TableHeader's 240px SearchField) is that size wherever it is laid
      // out, a row's unbounded length among them; one that fills takes what its layout gives it.
      double? fixed(String a) => switch (_extent('$name.$a')) {
        final v? when v.isFinite && !_fills('$name.$a') => v,
        _ => null,
      };
      final (width, height) = (fixed('width'), fixed('height'));
      final filled = SolarFill(child: child);
      return width == null && height == null
          ? filled
          : SizedBox(width: width, height: height, child: filled);
    }
    final field = fields[name];
    if (field != null) return field(_textStyle(name));
    final glyph = recipe.glyph(name);
    final words = text[name];
    final slot = slots[name];
    if (slot != null) {
      final width = _extent('$name.width');
      final height = _extent('$name.height');
      // A component slot (Banner's Buttons) has no colour of its own to give.
      final colour = recipe.lookup('$name.color') == null
          ? null
          : recipe.color('$name.color');
      // A control the caller gives where Figma sizes and places it (Text Area's Icon Buttons): at
      // its own size, centred in Figma's box, so the target Material pads it to on touch reaches
      // past the box, as a target of SOLAR's does, rather than moving it.
      if (colour == null && width != null && height != null) {
        return SolarTarget.inside(
          child: SizedBox(
            width: width,
            height: height,
            child: OverflowBox(
              maxWidth: double.infinity,
              maxHeight: double.infinity,
              child: slot,
            ),
          ),
        );
      }
      return IconTheme(
        data: IconThemeData(color: colour, size: width),
        child: SizedBox(width: width, height: height, child: slot),
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
        ? Text(
            words,
            softWrap: wraps.containsKey(name),
            textAlign: wraps[name],
            maxLines: truncates.contains(name) ? 1 : null,
            overflow: truncates.contains(name) ? TextOverflow.ellipsis : null,
            style: _textStyle(name),
          )
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

  /// Whether Figma places [child] by position rather than its parent's auto layout: from the
  /// parent's left, or its right where it is pinned there (a parent that grows).
  bool _isPlaced(String child) =>
      _extent('$child.x') != null || _extent('$child.right') != null;

  /// A child where Figma put it: at its position where its parent does not lay it out, from the
  /// edges it is pinned to (Text Area's buttons, to the field's bottom corners). Figma measures the
  /// position from the parent's outer edge, and the parent's border and padding ([inset]) hold its
  /// children in from it.
  Widget _placed(String child, EdgeInsets inset) {
    if (!_isPlaced(child)) return layer(child);
    final x = _extent('$child.x');
    // A placed layer that fills an axis spans from its place to the parent's far edge (Table's
    // mobile fade, as tall as the table), as the web's 100% of its containing box does.
    final right = _fills('$child.width') ? 0.0 : _extent('$child.right');
    final bottom = _fills('$child.height') ? 0.0 : _extent('$child.bottom');
    final spans = _fills('$child.height');
    return Positioned(
      left: x == null ? null : x - inset.left,
      right: right == null ? null : right - inset.right,
      top: bottom != null && !spans
          ? null
          : (_extent('$child.y') ?? 0) - inset.top,
      bottom: bottom == null ? null : bottom - inset.bottom,
      child: layer(child),
    );
  }

  /// The border and padding that hold [name]'s children in from its outer edge.
  EdgeInsets _inset(String name) {
    final edge = _length('$name.borderWidth');
    return EdgeInsets.fromLTRB(
      edge + _length('$name.paddingLeft'),
      edge + _length('$name.paddingTop'),
      edge + _length('$name.paddingRight'),
      edge + _length('$name.paddingBottom'),
    );
  }

  /// A child of an auto layout: filling it along the axis where the recipe says so, and, where it
  /// is fixed larger across than its parent (Tree Indent's 39px units in a 32px row), overflowing
  /// it as Figma and CSS draw it rather than squeezed to fit.
  Widget _inFlex(String child, bool horizontal, {bool hugs = false}) {
    final along = horizontal ? 'width' : 'height';
    final across = _extent('$child.${horizontal ? 'height' : 'width'}');
    Widget drawn = _keyed(child);
    if (across != null && across.isFinite) {
      drawn = OverflowBox(
        fit: OverflowBoxFit.deferToChild,
        maxWidth: horizontal ? null : double.infinity,
        maxHeight: horizontal ? double.infinity : null,
        child: drawn,
      );
    }
    drawn = _built(child, drawn);
    // A composed child the recipe hugs across a row (a TableFooter's Dropdown) is as wide as what
    // it holds, as Figma hugs it, even where the child fills what holds it alone (a field): a row
    // gives it no width to fill.
    if (horizontal &&
        composed.containsKey(child) &&
        recipe.lookup('$child.width') == 'k:HUG') {
      drawn = IntrinsicWidth(child: drawn);
    }
    // A field in a row that hugs its content (Number Input's inline number) is as wide as its
    // words; in any other, it takes the room its row leaves.
    if (fields.containsKey(child) && hugs) return IntrinsicWidth(child: drawn);
    final fills =
        _fills('$child.$along') ||
        fields.containsKey(child) ||
        (horizontal && truncates.contains(child));
    if (!fills) return drawn;
    // In a layer that hugs its content, a child that fills takes the room the others leave it and
    // no more, as Figma resolves a fill inside a hug (a Segmented Control's label, its words): the
    // layer is as long as what it holds, not as long as its parent allows.
    return hugs ? Flexible(child: drawn) : Expanded(child: drawn);
  }

  /// A layer's edge: one width all round, or one per side where Figma gives each its own (Number
  /// Input's side stepper, edged on its left alone); none where it has no width.
  Border? _border(String name) {
    const sides = ['Top', 'Right', 'Bottom', 'Left'];
    final perSide = sides.any(
      (side) => recipe.lookup('$name.border${side}Width') != null,
    );
    final widths = perSide
        ? [for (final side in sides) _length('$name.border${side}Width')]
        : List.filled(4, _length('$name.borderWidth'));
    if (widths.every((w) => w == 0)) return null;
    final colour = recipe.color('$name.borderColor');
    BorderSide side(double width) =>
        width == 0 ? BorderSide.none : BorderSide(color: colour, width: width);
    return Border(
      top: side(widths[0]),
      right: side(widths[1]),
      bottom: side(widths[2]),
      left: side(widths[3]),
    );
  }

  Widget _box(String name) {
    final given = this.content[name];
    final children = [
      if (given == null)
        for (final c in tree[name] ?? const <String>[])
          if (recipe.present(c)) c,
    ];
    final direction = recipe.lookup('$name.direction');
    final laid = direction == 'k:HORIZONTAL' || direction == 'k:VERTICAL';
    final placed = children.where(_isPlaced).toList();
    final flow = children.where((c) => !_isPlaced(c)).toList();
    Widget flex(List<String> laidOut) {
      final horizontal = direction == 'k:HORIZONTAL';
      final along = horizontal ? 'width' : 'height';
      final align = recipe.lookup('$name.align')!.substring(2).split('/');
      // Hugging, where nothing sizes the layer along its axis (_hugs).
      final hugs =
          recipe.lookup('$name.$along') == 'k:HUG' || _hugs(name, along);
      // Hugging across its axis with a child that fills across it (EmptyState's words under its
      // icon): as wide as its widest child, the filling one spanning that, as a shrink-to-fit box
      // lays out a child at 100% on the web; not as wide as its parent allows.
      final across = horizontal ? 'height' : 'width';
      final wraps =
          given == null &&
          _hugs(name, across) &&
          laidOut.any((c) => _fills('$c.$across'));
      final laidFlex = Flex(
        direction: horizontal ? Axis.horizontal : Axis.vertical,
        // A layer that hugs its content is as long as its children, as Figma's auto layout is.
        mainAxisSize: hugs ? MainAxisSize.min : MainAxisSize.max,
        mainAxisAlignment: _main[align.first]!,
        crossAxisAlignment: _cross[align.last]!,
        textBaseline: TextBaseline.alphabetic,
        spacing: _length('$name.gap'),
        children:
            given ??
            [
              for (final c in laidOut)
                if (repeats[c] case final items?)
                  for (final (i, item) in items.indexed)
                    _copy(
                      text: {...text, c: item},
                      keyPrefix: i == 0 ? keyPrefix : '$keyPrefix#$i',
                    )._inFlex(c, horizontal, hugs: hugs)
                else
                  _inFlex(c, horizontal, hugs: hugs),
            ],
      );
      if (!wraps) return laidFlex;
      return horizontal
          ? IntrinsicHeight(child: laidFlex)
          : IntrinsicWidth(child: laidFlex);
    }

    final padding = EdgeInsets.fromLTRB(
      _length('$name.paddingLeft'),
      _length('$name.paddingTop'),
      _length('$name.paddingRight'),
      _length('$name.paddingBottom'),
    );
    // Where the padding goes: around the content, or, for an auto layout with children placed
    // over it, around the laid-out ones alone.
    var padded = true;
    final Widget? content;
    // An auto layout is one even with nothing in it (RowExpand's empty title cell): its gap and
    // alignment are still the layer's.
    if (laid && placed.isEmpty) {
      content = flex(children);
    } else if (laid && given == null) {
      // An auto layout with children placed over it (Text Area's buttons, in the field's corners),
      // or with only placed ones (Launch Card's image, its favourite in a corner, its gap its own):
      // the laid-out ones in it, the placed ones where Figma put them, from inside the border, so
      // a placed child reaching into the padding is hit there too.
      padded = false;
      final edge = _length('$name.borderWidth');
      content = Stack(
        clipBehavior: Clip.none,
        children: [
          Padding(padding: padding, child: flex(flow)),
          for (final c in placed) _placed(c, EdgeInsets.all(edge)),
        ],
      );
    } else if (given != null && direction == 'k:GRID') {
      // A grid (Date Picker Open's days): the caller's rows, stacked by the grid's gap, as CSS lays
      // a grid's rows; each row the caller's, spaced by the same gap.
      content = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: _length('$name.gap'),
        children: given,
      );
    } else if (given != null) {
      content = Stack(clipBehavior: Clip.none, children: given);
    } else if (children.isEmpty) {
      content = null;
    } else {
      content = Stack(
        clipBehavior: Clip.none,
        children: [for (final c in children) _placed(c, _inset(name))],
      );
    }
    return Container(
      width: _size(name, 'width'),
      height: _size(name, 'height'),
      padding: padded ? padding : EdgeInsets.zero,
      clipBehavior: clips.contains(name) ? Clip.antiAlias : Clip.none,
      decoration: BoxDecoration(
        color: recipe.lookup('$name.background') == null
            ? null
            : recipe.color('$name.background'),
        gradient: recipe.gradient?.call('$name.background'),
        border: _border(name),
        borderRadius: _corners(name),
        boxShadow: recipe.lookup('$name.shadow') == null
            ? null
            : recipe.shadow('$name.shadow'),
        image: images[name],
      ),
      child: content,
    );
  }
}
