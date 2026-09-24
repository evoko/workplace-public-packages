import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';

const statusIndicatorCase = VisualCase(
  build: buildStatusIndicator,
  measure: measureStatusIndicator,
);

const _prefix = 'statusIndicator.';

/// Every layer the mark draws, by its key: a glyph's colours and stroke width as [SolarGlyphView]
/// holds them, a box's from its decoration, and each one's place from its parent layer's corner.
Layers measureStatusIndicator(WidgetTester tester) {
  final mark = find.byType(SolarStatusIndicator);
  final out = <String, Map<String, Object?>>{};
  for (final keyed in tester.widgetList<KeyedSubtree>(
    find.descendant(of: mark, matching: find.byType(KeyedSubtree)),
  )) {
    final key = keyed.key;
    if (key is! ValueKey<String> || !key.value.startsWith(_prefix)) continue;
    final name = key.value.substring(_prefix.length);
    final at = find.byKey(key);
    final size = tester.getSize(at);
    final values = <String, Object?>{
      'drawn': true,
      'width': size.width,
      'height': size.height,
    };
    // The place, from the nearest layer above this one.
    Element? parent;
    tester.element(at).visitAncestorElements((e) {
      final k = e.widget.key;
      if (k is ValueKey<String> && k.value.startsWith(_prefix)) {
        parent = e;
        return false;
      }
      return true;
    });
    if (parent != null) {
      final corner = tester.getTopLeft(at);
      final box = parent!.renderObject! as RenderBox;
      final origin = box.localToGlobal(Offset.zero);
      values['x'] = corner.dx - origin.dx;
      values['y'] = corner.dy - origin.dy;
    }
    if (keyed.child is SolarGlyphView) {
      final g = keyed.child as SolarGlyphView;
      values.addAll({
        'background': g.fill,
        'borderColor': g.stroke,
        'borderWidth': g.strokeWidth,
      });
    } else {
      final container = keyed.child as Container;
      final d = container.decoration! as BoxDecoration;
      final border = d.border as Border?;
      final padding = (container.padding ?? EdgeInsets.zero).resolve(
        TextDirection.ltr,
      );
      final child = container.child;
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
        'gap': child is Flex ? child.spacing : 0.0,
      });
    }
    out[name] = values;
  }
  return out;
}
