// Compares what a widget paints with what the oracle says Figma draws. The Flutter twin of
// packages/components/test/visual/compare.mjs, with the same tolerances.

import 'dart:convert';
import 'dart:io';

import 'package:flutter/painting.dart';

/// The oracle for one component, `spec/verify/<name>.json`, read from the repository.
Map<String, dynamic> loadOracle(String name) =>
    jsonDecode(File('../../spec/verify/$name.json').readAsStringSync())
        as Map<String, dynamic>;

/// An oracle colour, `#rrggbb[aa]` or `transparent`, as a [Color].
Color oracleColour(String value) {
  if (value == 'transparent') return const Color(0x00000000);
  final hex = value.substring(1);
  final rgb = int.parse(hex.substring(0, 6), radix: 16);
  final alpha = hex.length == 8 ? int.parse(hex.substring(6), radix: 16) : 255;
  return Color((alpha << 24) | rgb);
}

/// A colour component in 0..1 as the 8-bit step it rounds to.
int _eight(double c) => (c * 255.0).round().clamp(0, 255);

/// Two colours agree within one 8-bit step; two clear colours agree whatever their RGB.
bool sameColour(Color a, Color b) {
  if (_eight(a.a) <= 1 && _eight(b.a) <= 1) return true;
  return (_eight(a.r) - _eight(b.r)).abs() <= 1 &&
      (_eight(a.g) - _eight(b.g)).abs() <= 1 &&
      (_eight(a.b) - _eight(b.b)).abs() <= 1 &&
      (_eight(a.a) - _eight(b.a)).abs() <= 3;
}

/// A CSS box-shadow list, as the oracle spells it (`0px 1px 1px 0px rgba(0, 0, 0, 0.05)`).
List<BoxShadow> oracleShadows(String value) {
  if (value == 'none' || value.isEmpty) return const [];
  final parts = <String>[];
  var depth = 0;
  var start = 0;
  for (var i = 0; i < value.length; i++) {
    if (value[i] == '(') depth++;
    if (value[i] == ')') depth--;
    if (value[i] == ',' && depth == 0) {
      parts.add(value.substring(start, i));
      start = i + 1;
    }
  }
  parts.add(value.substring(start));
  return [
    for (final part in parts)
      () {
        final colour = RegExp(r'rgba?\(([^)]*)\)').firstMatch(part);
        final c = colour!.group(1)!.split(',').map((s) => s.trim()).toList();
        final lengths = part
            .replaceFirst(colour.group(0)!, '')
            .trim()
            .split(RegExp(r'\s+'))
            .map((t) => double.parse(t.replaceFirst('px', '')))
            .toList();
        return BoxShadow(
          color: Color.fromRGBO(
            int.parse(c[0]),
            int.parse(c[1]),
            int.parse(c[2]),
            c.length > 3 ? double.parse(c[3]) : 1,
          ),
          offset: Offset(lengths[0], lengths[1]),
          blurRadius: lengths[2],
          spreadRadius: lengths.length > 3 ? lengths[3] : 0,
        );
      }(),
  ];
}

bool _sameShadows(List<BoxShadow> a, List<BoxShadow> b) =>
    a.length == b.length &&
    [
      for (var i = 0; i < a.length; i++)
        (a[i].offset - b[i].offset).distance <= 0.5 &&
            (a[i].blurRadius - b[i].blurRadius).abs() <= 0.5 &&
            (a[i].spreadRadius - b[i].spreadRadius).abs() <= 0.5 &&
            sameColour(a[i].color, b[i].color),
    ].every((ok) => ok);

/// Whether a painted value is what the oracle expects for a property.
bool agrees(String property, Object? figma, Object? painted) {
  if (painted == null) return false;
  switch (property) {
    case 'background':
    case 'borderColor':
    case 'color':
      return sameColour(oracleColour(figma! as String), painted as Color);
    case 'shadow':
      return _sameShadows(
        oracleShadows(figma! as String),
        painted as List<BoxShadow>,
      );
    case 'fontFamily':
      // Flutter names a package's font `packages/<package>/<family>`.
      return (painted as String).split('/').last == figma;
    case 'fontWeight':
      return (painted as FontWeight).value == figma;
    case 'textDecoration':
      return (painted as String) == figma;
    case 'letterSpacing':
      return ((painted as num) - (figma! as num)).abs() <= 0.02;
    default:
      return ((painted as num) - (figma! as num)).abs() <= 0.5;
  }
}

/// The oracle properties a renderer is measured on; the rest describe composition.
const measured = [
  'background',
  'borderColor',
  'borderWidth',
  'radius',
  'shadow',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'gap',
  'width',
  'height',
  'color',
  'fontFamily',
  'fontWeight',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'textDecoration',
];

/// One difference: a failure, or an excused gap when [finding] is set.
class Difference {
  Difference(
    this.variant,
    this.layer,
    this.property,
    this.figma,
    this.painted, [
    this.finding,
  ]);

  final String variant;
  final String layer;
  final String property;
  final Object? figma;
  final Object? painted;
  final String? finding;

  Map<String, Object?> toJson() => {
    'variant': variant,
    'layer': layer,
    'property': property,
    'figma': figma,
    'painted': '$painted',
    if (finding != null) 'finding': finding,
  };

  @override
  String toString() =>
      '$variant · $layer.$property: Figma $figma, painted $painted';
}

/// Every measured property of one layer. A property the oracle has and the measurement lacks is a
/// failure: a platform that cannot measure something must say so, not skip it.
void compareLayer(
  String variant,
  String layer,
  Map<String, dynamic> expected,
  Map<String, Object?> painted,
  List<dynamic> excused,
  List<Difference> failures,
  List<Difference> gaps,
) {
  for (final property in measured) {
    if (!expected.containsKey(property)) continue;
    if (property == 'borderColor' && expected['borderWidth'] == 0) continue;
    final figma = expected[property];
    final excuse = excused.cast<Map<String, dynamic>>().where(
      (e) => e['layer'] == layer && e['property'] == property,
    );
    if (excuse.isNotEmpty) {
      gaps.add(
        Difference(
          variant,
          layer,
          property,
          figma,
          painted[property],
          excuse.first['finding'] as String,
        ),
      );
      continue;
    }
    if (!agrees(property, figma, painted[property])) {
      failures.add(
        Difference(variant, layer, property, figma, painted[property]),
      );
    }
  }
}

/// Writes a report beside the build output, where CI can keep it.
void report(String name, List<Difference> differences) {
  final file = File('build/visual/$name.json')..createSync(recursive: true);
  file.writeAsStringSync(
    const JsonEncoder.withIndent('  ')
        .convert(differences.map((d) => d.toJson()).toList()),
  );
}
