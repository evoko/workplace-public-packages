import 'dart:math' as math;

import 'package:flutter/painting.dart';
import 'package:flutter_test/flutter_test.dart';
// The rule is internal: SolarAvatar draws with it.
import 'package:solar_flutter/src/solar_ink.dart';

double _lin(double c) =>
    c <= 0.04045 ? c / 12.92 : math.pow((c + 0.055) / 1.055, 2.4).toDouble();
double _luminance(Color c) =>
    0.2126 * _lin(c.r) + 0.7152 * _lin(c.g) + 0.0722 * _lin(c.b);
double contrast(Color a, Color b) {
  final x = _luminance(a);
  final y = _luminance(b);
  return (math.max(x, y) + 0.05) / (math.min(x, y) + 0.05);
}

Color hex(int rgb) => Color(0xff000000 | rgb);
Color rgb(int r, int g, int b) => Color.fromARGB(255, r, g, b);

void main() {
  group('solarInkOn, the web’s ink rule (internal/ink.ts)', () {
    test('reads at WCAG AA on every colour Figma samples', () {
      for (final c in [
        0xf5f5f5,
        0x878787,
        0x646464,
        0x222222,
        0xffe4df,
        0xe0032d,
        0x410001,
        0xfffbd5,
        0xc39900,
        0x392c01,
        0xecffe9,
        0x009600,
        0x002400,
        0xf0ffff,
        0x08b8c9,
        0x033238,
        0xe9f2ff,
        0x2569fd,
        0x03144b,
        0xf4edff,
        0x7b3aff,
        0x24004b,
        0xfff1fa,
        0xe136bc,
        0x4a003d,
      ]) {
        expect(
          contrast(hex(c), solarInkOn(hex(c))),
          greaterThanOrEqualTo(4.5),
          reason: c.toRadixString(16),
        );
      }
    });

    test('draws the web’s ink for the web’s colour', () {
      // The same values ink.test.mjs pins, so the two platforms draw one ink.
      expect(solarInkOn(hex(0xffe4df)), rgb(123, 6, 0));
      expect(solarInkOn(hex(0x410001)), rgb(255, 224, 219));
      expect(solarInkOn(hex(0xf5f5f5)), rgb(64, 64, 64));
      expect(solarInkOn(hex(0x2569fd)), rgb(250, 252, 255));
      expect(solarInkOn(hex(0xc39900)), rgb(69, 52, 0));
      expect(solarInkOn(hex(0xe136bc)), rgb(57, 0, 45));
    });
  });
}
