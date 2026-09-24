// Measuring a bespoke widget drawn by SolarLayers: every layer it keys, read back from what it
// built. Shared by the cases of the widgets that draw their own layers (StatusIndicator, Counter…).

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'harness.dart';

/// Every layer SolarLayers keyed `<prefix>.<layer>` inside [at]: a glyph's colours and stroke width
/// as [SolarGlyphView] holds them, a text's style as it is painted, a box's from its decoration,
/// and each one's place from its parent layer's corner.
Layers measureLayers(WidgetTester tester, Finder at, String prefix) {
  final lead = '$prefix.';
  final out = <String, Map<String, Object?>>{};
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
        textValues(
          tester
              .renderObject<RenderParagraph>(
                find.descendant(of: here, matching: find.byType(RichText)),
              )
              .text
              .style!,
        ),
      );
    } else {
      final container = child as Container;
      final d = container.decoration! as BoxDecoration;
      final border = d.border as Border?;
      final padding = (container.padding ?? EdgeInsets.zero).resolve(
        TextDirection.ltr,
      );
      final content = container.child;
      values.addAll({
        'background': d.color ?? Colors.transparent,
        'borderColor': border?.top.color ?? Colors.transparent,
        'borderWidth': border?.top.width ?? 0.0,
        'radius': (d.borderRadius as BorderRadius?)?.topLeft.x ?? 0.0,
        'shadow': d.boxShadow ?? const <BoxShadow>[],
        'paddingTop': padding.top,
        'paddingRight': padding.right,
        'paddingBottom': padding.bottom,
        'paddingLeft': padding.left,
        'gap': content is Flex ? content.spacing : 0.0,
      });
    }
    out[name] = values;
  }
  return out;
}
