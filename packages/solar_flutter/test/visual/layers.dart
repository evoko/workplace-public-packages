// Measuring a bespoke widget drawn by SolarLayers: every layer it keys, read back from what it
// built. Shared by the cases of the widgets that draw their own layers (StatusIndicator, Counter…).

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'compare.dart';
import 'harness.dart';

/// Every layer SolarLayers keyed `<prefix>.<layer>` inside [at]: a glyph's colours and stroke width
/// as [SolarGlyphView] holds them, a text's style as it is painted, a box's from its decoration,
/// and each one's place from its parent layer's corner. A layer that is another drawn component
/// (Tag's StatusIndicator, Toast's Tag), whose own root is keyed `<its prefix>.root`, is measured
/// as its own check measures it, at any depth, for the harness to check against its own oracle.
/// Where a layer is placed from its parent, each edge as the oracle names it.
const _places = ['x', 'y', 'right', 'bottom', 'centerX', 'centerY'];

Layers measureLayers(WidgetTester tester, Finder at, String prefix) {
  final lead = '$prefix.';
  final out = <String, Map<String, Object?>>{};
  // Each laid-out layer's Flex (its parent's layout) and where it starts along it, for its rank.
  final flows = <String, (Element, double)>{};
  for (final keyed in tester.widgetList<KeyedSubtree>(
    find.descendant(of: at, matching: find.byType(KeyedSubtree)),
  )) {
    final key = keyed.key;
    if (key is! ValueKey<String> || !key.value.startsWith(lead)) continue;
    final name = key.value.substring(lead.length);
    // Inside [at]: a Button Group holds a counter in each of its buttons, all keyed alike.
    final here = find.descendant(of: at, matching: find.byKey(key)).first;
    final size = tester.getSize(here);
    // A layer a Visibility hides, keeping its room (a SplitButton half while loading), is not drawn.
    final hidden = tester
        .widgetList<Visibility>(
          find.ancestor(of: here, matching: find.byType(Visibility)),
        )
        .any((v) => !v.visible);
    final values = <String, Object?>{
      'drawn': !hidden,
      'width': size.width,
      'height': size.height,
    };
    // The place, from the nearest layer above this one.
    Element? parent;
    tester.element(here).visitAncestorElements((e) {
      final k = e.widget.key;
      if (k is ValueKey<String> && k.value.startsWith(lead)) {
        parent = e;
        return false;
      }
      return true;
    });
    if (parent != null) {
      final corner = tester.getTopLeft(here);
      final box = parent!.renderObject! as RenderBox;
      final origin = box.localToGlobal(Offset.zero);
      values['x'] = corner.dx - origin.dx;
      values['y'] = corner.dy - origin.dy;
      // From the far edges too, for a layer pinned to them (placementOf).
      values['right'] = origin.dx + box.size.width - (corner.dx + size.width);
      values['bottom'] =
          origin.dy + box.size.height - (corner.dy + size.height);
      // And from its centre, for a layer pinned to the parent's (a Tooltip's arrow).
      values['centerX'] =
          corner.dx + size.width / 2 - (origin.dx + box.size.width / 2);
      values['centerY'] =
          corner.dy + size.height / 2 - (origin.dy + box.size.height / 2);
      // Laid out by its parent's Flex, where one holds it before the parent does; a placed layer
      // is in the parent's Stack instead.
      Element? flex;
      tester.element(here).visitAncestorElements((e) {
        if (e == parent) return false;
        if (e.widget is Flex) {
          flex = e;
          return false;
        }
        return true;
      });
      if (flex != null && !hidden) {
        final horizontal = (flex!.widget as Flex).direction == Axis.horizontal;
        flows[name] = (flex!, horizontal ? corner.dx : corner.dy);
      }
    }
    final inner = _composedPrefix(tester, keyed, here);
    if (inner != null) {
      // Its look as its own check measures it; where its parent puts it, on its root, as the web
      // check has it (a Coachmark's Node End, at its connector's end).
      final layers = measureLayers(tester, here, inner);
      layers['root'] = {
        ...?layers['root'],
        for (final edge in _places)
          if (values[edge] != null) edge: values[edge],
      };
      out[name] = {'drawn': !hidden, 'layers': layers};
      continue;
    }
    // A translucent layer (Node End's halo) is its drawing inside an Opacity.
    var child = keyed.child;
    if (child is Opacity) {
      values['opacity'] = child.opacity;
      child = child.child!;
    }
    if (child is SolarIcon) {
      values['color'] = child.color;
    } else if (child is IconTheme) {
      // A slot the caller fills (an icon probe), in the colour the recipe gives it.
      values['color'] = child.data.color;
    } else if (child is SolarGlyphView) {
      values.addAll({
        'background': child.fill,
        'borderColor': child.stroke,
        'borderWidth': child.strokeWidth,
      });
    } else if (child is Text) {
      values.addAll(
        paragraphValues(
          tester.renderObject<RenderParagraph>(
            find.descendant(of: here, matching: find.byType(RichText)),
          ),
        ),
      );
    } else if (child is! Container) {
      // A text the user edits (Text Input's words, the shell's field), in the style its words are
      // painted in; or a control the caller gives (Text Area's Icon Buttons), which its own check
      // measures, where the case does.
      final words = find.descendant(
        of: here,
        matching: find.byType(EditableText),
      );
      if (words.evaluate().isNotEmpty) {
        values.addAll({
          ...textValues(tester.widget<EditableText>(words).style),
          'words': wordsIn(tester, here),
        });
      }
    } else {
      final container = child;
      final d = container.decoration! as BoxDecoration;
      final border = d.border as Border?;
      // An auto layout with children placed over it (Text Area's field) pads its laid-out
      // children alone, the first of its stack.
      final stacked = container.child;
      final inner =
          stacked is Stack &&
              stacked.children.isNotEmpty &&
              stacked.children.first is Padding
          ? stacked.children.first as Padding
          : null;
      final padding = (inner?.padding ?? container.padding ?? EdgeInsets.zero)
          .resolve(TextDirection.ltr);
      // A layer that hugs a child filling across it is its Flex in an IntrinsicWidth or
      // IntrinsicHeight (SolarLayers), whose gap is the Flex's.
      final wrapped = inner?.child ?? container.child;
      final content = switch (wrapped) {
        IntrinsicWidth(:final child) || IntrinsicHeight(:final child) => child,
        _ => wrapped,
      };
      values.addAll({
        // A layer painted with a gradient (Table's fade) shows it over its colour.
        'background': d.gradient is LinearGradient
            ? paintedGradient(d.gradient! as LinearGradient)
            : d.color ?? Colors.transparent,
        // The colour of a side that is drawn, where only some are (Number Input's side stepper).
        'borderColor':
            [border?.top, border?.right, border?.bottom, border?.left]
                .firstWhere((s) => s != null && s.width > 0, orElse: () => null)
                ?.color ??
            Colors.transparent,
        'borderWidth': border?.top.width ?? 0.0,
        'borderTopWidth': border?.top.width ?? 0.0,
        'borderRightWidth': border?.right.width ?? 0.0,
        'borderBottomWidth': border?.bottom.width ?? 0.0,
        'borderLeftWidth': border?.left.width ?? 0.0,
        'radius': (d.borderRadius as BorderRadius?)?.topLeft.x ?? 0.0,
        'radiusTopLeft': (d.borderRadius as BorderRadius?)?.topLeft.x ?? 0.0,
        'radiusTopRight': (d.borderRadius as BorderRadius?)?.topRight.x ?? 0.0,
        'radiusBottomRight':
            (d.borderRadius as BorderRadius?)?.bottomRight.x ?? 0.0,
        'radiusBottomLeft':
            (d.borderRadius as BorderRadius?)?.bottomLeft.x ?? 0.0,
        'shadow': d.boxShadow ?? const <BoxShadow>[],
        'paddingTop': padding.top,
        'paddingRight': padding.right,
        'paddingBottom': padding.bottom,
        'paddingLeft': padding.left,
        'gap': content is Flex ? content.spacing : 0.0,
      });
      // A dashed edge is drawn over the box, its border clear (SolarDashedDecoration): its colour
      // and Figma's pattern are the decoration's.
      final dashed = container.foregroundDecoration;
      if (dashed is SolarDashedDecoration) {
        values['borderColor'] = dashed.color;
        values['borderDash'] = dashed.dash;
      } else {
        values['borderDash'] = false;
      }
    }
    out[name] = values;
  }
  // Its rank among the siblings its parent lays out, by where each falls along the parent's axis,
  // for a layer whose variants lay them out in different orders (a Popover's tip).
  for (final MapEntry(key: name, value: (flex, at)) in flows.entries) {
    final rank = flows.values.where((f) => f.$1 == flex && f.$2 < at).length;
    final own = out[name]!;
    // A composed child's, on its root, as its place is.
    final composed = own['layers'] as Layers?;
    if (composed != null) {
      composed['root'] = {...?composed['root'], 'order': rank};
    } else {
      own['order'] = rank;
    }
  }
  return out;
}

/// The prefix of the drawn component a layer is (a Tag in a Toast), from the key of its own root,
/// or null where the layer is drawn by the one measured.
String? _composedPrefix(WidgetTester tester, KeyedSubtree keyed, Finder here) {
  var child = keyed.child;
  if (child is Opacity) child = child.child!;
  if (child is SolarIcon ||
      child is IconTheme ||
      child is SolarGlyphView ||
      child is Text ||
      child is Container) {
    return null;
  }
  for (final inner in tester.widgetList<KeyedSubtree>(
    find.descendant(of: here, matching: find.byType(KeyedSubtree)),
  )) {
    final key = inner.key;
    if (key is ValueKey<String> && key.value.endsWith('.root')) {
      return key.value.substring(0, key.value.length - '.root'.length);
    }
  }
  return null;
}

/// The children a component holds that its case keyed by their Figma layers (a menu's rows, a
/// list's items), each measured as that child's check measures one, into [into]. [prefixes] maps
/// the start of a layer's name to the child's own key prefix (`'dropdownItem'` to `'dropdownItem'`,
/// `'divider'` to `'divider'`).
void measureHeld(
  WidgetTester tester,
  Finder of,
  Layers into,
  Map<String, String> prefixes,
) {
  for (final keyed in tester.widgetList<KeyedSubtree>(
    find.descendant(of: of, matching: find.byType(KeyedSubtree)),
  )) {
    final key = keyed.key;
    if (key is! ValueKey<String> || key.value.contains('.')) continue;
    for (final MapEntry(key: start, value: prefix) in prefixes.entries) {
      if (!key.value.startsWith(start)) continue;
      into[key.value] = {
        'drawn': true,
        'layers': measureLayers(tester, find.byKey(key), prefix),
      };
    }
  }
}
