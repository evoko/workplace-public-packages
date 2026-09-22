import 'dart:math' as math;

import 'package:flutter/material.dart' show Theme;
import 'package:flutter/widgets.dart';

import 'generated/tokens.dart' show SolarIconSize, SolarTheme;
import 'svg_path.dart';

/// The vector types and the widgets that draw them.
///
/// Hand written, not generated, the same way `icon.tsx` is on the React side: the files under
/// `lib/src/generated/` are recipes -- geometry and a name -- and everything that is behaviour
/// rather than data is decided once, here. Only `lib/src/generated/` is machine owned.

/// One filled subpath of a SOLAR vector.
@immutable
class SolarVectorPath {
  /// Creates a path from SVG path data.
  const SolarVectorPath(this.d, {this.evenOdd = false, this.fill});

  /// SVG path data, byte identical to the string the web target ships.
  ///
  /// It is replayed by [parseSvgPath], which accepts exactly what the generator validated:
  /// `M L C H V Z`, absolute only.
  final String d;

  /// Whether the path is filled by the even-odd rule rather than the non-zero rule.
  ///
  /// 75 paths in the SOLAR corpus are even-odd. Without this they render as filled blobs
  /// instead of shapes with holes.
  final bool evenOdd;

  /// The colour this path is drawn in.
  ///
  /// Null means the colour the widget was given, matching `currentColor` on the web: an icon
  /// path always inherits, a logo path never does. A path that names a colour ignores the
  /// widget's, which is what lets one painter serve both icons and brand marks.
  final Color? fill;
}

/// One drawing: a viewBox extent and the paths inside it.
@immutable
class SolarVector {
  /// Creates a vector from its viewBox extent and its paths.
  const SolarVector({
    required this.width,
    required this.height,
    required this.paths,
  });

  /// The viewBox width. Every SOLAR viewBox starts at the origin, so this is its extent.
  final double width;

  /// The viewBox height. 24 for every icon but `zone` outline, which is drawn 25 tall.
  final double height;

  /// The paths, painted in order.
  final List<SolarVectorPath> paths;

  /// The drawing's intrinsic ratio, which is what keeps a 36 x 12 wordmark a wordmark.
  double get aspectRatio => width / height;
}

/// Parsed paths, keyed by the [SolarVectorPath] they came from.
///
/// [parseSvgPath] scans strings up to 3913 characters, and a painter repaints far more often
/// than the data changes, so the result is kept rather than rebuilt on every frame. The vectors
/// are compile-time constants with no `==` of their own, so the [Expando] is keyed on identity;
/// being weak, it also holds nothing alive that the program has otherwise dropped.
final Expando<Path> _parsed = Expando<Path>('SolarVectorPath');

Path _pathOf(SolarVectorPath source) {
  final Path? cached = _parsed[source];
  if (cached != null) {
    return cached;
  }
  final Path path = parseSvgPath(source.d)
    ..fillType = source.evenOdd ? PathFillType.evenOdd : PathFillType.nonZero;
  _parsed[source] = path;
  return path;
}

/// Paints a [SolarVector] into a box, scaled to fit and centred.
///
/// The fit is `BoxFit.contain`: one scale factor for both axes. SVG does this for free through
/// the default `preserveAspectRatio`, so Flutter has to match it or `zone` -- the one icon drawn
/// on a `0 0 24 25` viewBox -- would render stretched here and letterboxed on the web.
class SolarVectorPainter extends CustomPainter {
  /// Creates a painter for [vector], drawing inheriting paths in [color].
  const SolarVectorPainter(this.vector, this.color);

  /// The drawing.
  final SolarVector vector;

  /// The colour for paths that inherit one. A path with its own [SolarVectorPath.fill]
  /// ignores it.
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty) {
      return;
    }
    final double scale = math.min(
      size.width / vector.width,
      size.height / vector.height,
    );
    canvas.save();
    canvas.translate(
      (size.width - vector.width * scale) / 2,
      (size.height - vector.height * scale) / 2,
    );
    canvas.scale(scale);
    final Paint paint = Paint()..isAntiAlias = true;
    for (final SolarVectorPath source in vector.paths) {
      paint.color = source.fill ?? color;
      canvas.drawPath(_pathOf(source), paint);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(SolarVectorPainter oldDelegate) =>
      oldDelegate.vector != vector || oldDelegate.color != color;
}

Widget _labelled(String? semanticLabel, Widget child) => Semantics(
      label: semanticLabel,
      image: semanticLabel == null ? null : true,
      child: ExcludeSemantics(child: child),
    );

/// A SOLAR icon, drawn from its vector data.
///
/// ```dart
/// const SolarIcon(SolarIcons.chevronRightOutline)
/// ```
///
/// **Colour.** An icon is monochrome and takes its colour from its surroundings, the way
/// `currentColor` works on the web. The first of these that is set wins:
///
/// 1. the explicit [color];
/// 2. the ambient [SolarTheme] extension's `colors.iconPrimary`;
/// 3. `IconTheme.of(context).color`, so an icon inside a button or a list tile matches the
///    Material icons beside it;
/// 4. black, which is only reached if a caller has removed the default icon theme.
///
/// **Size.** [size] is the side of a square box and defaults to [SolarIconSize.lg] (24). The
/// drawing is scaled to fit that box with its aspect ratio kept, so `zone` stays 24 x 25.
///
/// **Semantics.** [semanticLabel] names the icon for assistive technology. Without one the icon
/// is excluded from the semantics tree, because an unlabelled icon sits beside a label that
/// already says what it means.
class SolarIcon extends StatelessWidget {
  /// Creates an icon drawing [icon].
  const SolarIcon(
    this.icon, {
    super.key,
    this.size,
    this.color,
    this.semanticLabel,
  });

  /// The drawing, normally a constant from `SolarIcons`.
  final SolarVector icon;

  /// The side of the square box to draw into. Defaults to [SolarIconSize.lg].
  final double? size;

  /// The colour to draw in. See the class doc for what is used when this is null.
  final Color? color;

  /// The accessible name. Without one the icon is hidden from assistive technology.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final double side = size ?? SolarIconSize.lg;
    final Color resolved = color ??
        Theme.of(context).extension<SolarTheme>()?.colors.iconPrimary ??
        IconTheme.of(context).color ??
        const Color(0xFF000000);

    return _labelled(
      semanticLabel,
      SizedBox(
        width: side,
        height: side,
        child: CustomPaint(
          size: Size(side, side),
          painter: SolarVectorPainter(icon, resolved),
        ),
      ),
    );
  }
}

/// A SOLAR brand mark, drawn from its vector data.
///
/// ```dart
/// const SolarLogo(SolarLogos.biampDarkSm)
/// ```
///
/// **It takes no colour.** A logo carries the colours SOLAR drew it in and a tinted brand mark
/// is a brand violation, so there is no `color` argument for the compiler to accept -- the
/// inverse of [SolarIcon], and enforced by the type rather than by a comment asking nicely.
///
/// **[size] sets the height** and the width follows the mark's aspect ratio. The Biamp wordmark
/// is 36 x 12: one length on both axes would squash it.
class SolarLogo extends StatelessWidget {
  /// Creates a logo drawing [logo].
  const SolarLogo(this.logo, {super.key, this.size, this.semanticLabel});

  /// The drawing, normally a constant from `SolarLogos`.
  final SolarVector logo;

  /// The height to draw at. Defaults to [SolarIconSize.lg]; SOLAR publishes no logo scale.
  final double? size;

  /// The accessible name. Without one the logo is hidden from assistive technology.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final double height = size ?? SolarIconSize.lg;
    final double width = height * logo.aspectRatio;

    return _labelled(
      semanticLabel,
      SizedBox(
        width: width,
        height: height,
        child: CustomPaint(
          size: Size(width, height),
          // Every logo path carries its own fill, so this colour is never used. The painter
          // needs one because it also serves icons, where every path inherits.
          painter: SolarVectorPainter(logo, const Color(0xFF000000)),
        ),
      ),
    );
  }
}
