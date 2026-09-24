import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarBreadcrumbs in one oracle variant, named as the web case is: Figma's trail of links, as
/// many as it holds (seven where it is past five, "multiple", collapsed as Figma draws it), the
/// last the current page. A trail has no states of its own.
Widget buildBreadcrumbs(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final n = RegExp(r'items=(\d+)').firstMatch(v['figma'] as String)?.group(1);
  return SolarBreadcrumbs(
    children: [
      for (var i = 0; i < (n == null ? 7 : int.parse(n)); i++)
        SolarBreadcrumbItem(label: 'Label', onPressed: () {}),
    ],
  );
}
