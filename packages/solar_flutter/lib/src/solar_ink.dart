import 'dart:math' as math;
import 'dart:ui' show Color;

/// The ink for text on a colour the caller chose: Avatar's initials on the caller's colour.
///
/// Owner decision, 2026-09-24: the initials take the colour's hue, as Figma's samples do (the 700
/// on the 50, the 100 on the 800), as vivid as sRGB holds, at a lightness far enough from it to
/// read. They start at Figma's own lightness (OKLCH 0.37 dark, 0.93 light), on the side that reads
/// better, and move toward black or white only as far as WCAG AA's 4.5:1 needs; where that side
/// cannot reach it, the other does. A grey's ink is a grey. The colour is computed, not a token,
/// since no SOLAR token names text on any colour: a governance gap the design review raises.
///
/// Hand written: the same rule, step for step, as the web's `internal/ink.ts`, so both platforms
/// draw one ink for one colour. The colour's alpha is not weighed.
Color solarInkOn(Color colour) {
  final bg = [colour.r, colour.g, colour.b];
  final (_, chroma, h) = _oklch(bg);
  final c = chroma < _grey ? 0.0 : _vivid;
  final dark = _inGamut(_dark, c, h);
  final light = _inGamut(_light, c, h);
  final sides = _contrast(bg, dark) >= _contrast(bg, light)
      ? const [(_dark, 0.0), (_light, 1.0)]
      : const [(_light, 1.0), (_dark, 0.0)];
  for (final (from, to) in sides) {
    final ink = _reaching(bg, c, h, from, to);
    if (ink != null) return _colour(ink);
  }
  // One side's extreme always reads at AA on an opaque colour, so this is not reached.
  return _colour(_inGamut(sides.first.$2, c, h));
}

/// Figma's lightness for a sample's text: its 700 on light colours, its 100 on dark ones.
const _dark = 0.37;
const _light = 0.93;

/// WCAG 2.1 AA, for text.
const _aa = 4.5;

/// Below this chroma a colour is a grey, and its ink is too; above it the ink is its hue as vivid
/// as sRGB holds at the ink's lightness.
const _grey = 0.01;
const _vivid = 0.4;

double _lin(double c) =>
    c <= 0.04045 ? c / 12.92 : math.pow((c + 0.055) / 1.055, 2.4).toDouble();
double _gam(double c) => c <= 0.0031308
    ? 12.92 * c
    : 1.055 * math.pow(c, 1 / 2.4).toDouble() - 0.055;

double _luminance(List<double> c) =>
    0.2126 * _lin(c[0]) + 0.7152 * _lin(c[1]) + 0.0722 * _lin(c[2]);

double _contrast(List<double> a, List<double> b) {
  final x = _luminance(a);
  final y = _luminance(b);
  return (math.max(x, y) + 0.05) / (math.min(x, y) + 0.05);
}

double _cbrt(double v) => math.pow(v, 1 / 3).toDouble();

(double, double, double) _oklch(List<double> c) {
  final r = _lin(c[0]);
  final g = _lin(c[1]);
  final b = _lin(c[2]);
  final l = _cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  final m = _cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  final s = _cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  final bigL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  final a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  final bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return (bigL, math.sqrt(a * a + bb * bb), math.atan2(bb, a));
}

List<double> _linear(double bigL, double c, double h) {
  final a = c * math.cos(h);
  final b = c * math.sin(h);
  final l = math.pow(bigL + 0.3963377774 * a + 0.2158037573 * b, 3).toDouble();
  final m = math.pow(bigL - 0.1055613458 * a - 0.0638541728 * b, 3).toDouble();
  final s = math.pow(bigL - 0.0894841775 * a - 1.291485548 * b, 3).toDouble();
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/// The colour at lightness [bigL] in the hue [h], as much of chroma [c] as sRGB holds there, in
/// the 8-bit steps it is drawn in, so the contrast weighed is the drawn colour's.
List<double> _inGamut(double bigL, double c, double h) {
  bool fits(double chroma) =>
      _linear(bigL, chroma, h).every((v) => v >= -1e-6 && v <= 1 + 1e-6);
  var lo = 0.0;
  var hi = c;
  if (!fits(hi)) {
    for (var i = 0; i < 24; i++) {
      final mid = (lo + hi) / 2;
      if (fits(mid)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
  } else {
    lo = hi;
  }
  return [
    for (final v in _linear(bigL, lo, h))
      (_gam(v.clamp(0.0, 1.0)) * 255).round() / 255,
  ];
}

/// From lightness [from] toward [to] (0 or 1), the nearest that reads at AA, or null if none.
List<double>? _reaching(
  List<double> bg,
  double c,
  double h,
  double from,
  double to,
) {
  List<double> at(double l) => _inGamut(l, c, h);
  if (_contrast(bg, at(from)) >= _aa) return at(from);
  if (_contrast(bg, at(to)) < _aa) return null;
  var near = from;
  var far = to;
  for (var i = 0; i < 24; i++) {
    final mid = (near + far) / 2;
    if (_contrast(bg, at(mid)) >= _aa) {
      far = mid;
    } else {
      near = mid;
    }
  }
  return at(far);
}

Color _colour(List<double> c) =>
    Color.from(alpha: 1, red: c[0], green: c[1], blue: c[2]);
