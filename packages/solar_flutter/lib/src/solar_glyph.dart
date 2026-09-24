import 'package:flutter/widgets.dart';

import 'solar_icon.dart' show SolarVector, SolarVectorPainter, SolarVectorPath;

/// A shape a component draws itself: Checkbox's tick and dash, StatusIndicator's marks,
/// Sparkline's sample line, Spinner's ring.
///
/// Hand written, like [SolarVector]; the generated recipes hold the data. Figma records a drawn
/// layer's outline twice over: the fill's, and the stroke's as a region of its own. Both are
/// filled when drawn, the fill's in the layer's fill colour and the stroke's in its stroke colour,
/// in a box the layer's own size.
@immutable
class SolarGlyph {
  /// Creates a glyph from its box and its two sets of outlines.
  const SolarGlyph({
    required this.width,
    required this.height,
    this.fill = const <SolarVectorPath>[],
    this.stroke = const <SolarVectorPath>[],
  });

  /// The box the paths are drawn in, the layer's size in Figma.
  final double width;

  /// See [width].
  final double height;

  /// The fill's outline, drawn in the layer's fill colour.
  final List<SolarVectorPath> fill;

  /// The stroke's outline, drawn in the layer's stroke colour.
  final List<SolarVectorPath> stroke;

  /// The fill as a [SolarVector], for [SolarVectorPainter].
  SolarVector get fillVector =>
      SolarVector(width: width, height: height, paths: fill);

  /// The stroke as a [SolarVector], for [SolarVectorPainter].
  SolarVector get strokeVector =>
      SolarVector(width: width, height: height, paths: stroke);
}

/// A [SolarGlyph] drawn at its own size: the fill's outline in [fill], the stroke's in [stroke].
///
/// A glyph's stroke is an outline of its own, already the stroke's width, so [strokeWidth] draws
/// nothing: it is the recipe's width, carried as the web carries `stroke-width`, so what a
/// component drew can be read back.
class SolarGlyphView extends StatelessWidget {
  /// Creates the view of [glyph].
  const SolarGlyphView(
    this.glyph, {
    super.key,
    required this.fill,
    required this.stroke,
    this.strokeWidth = 0,
  });

  /// The drawing.
  final SolarGlyph glyph;

  /// The fill's colour.
  final Color fill;

  /// The stroke's colour.
  final Color stroke;

  /// The stroke's width in the recipe.
  final double strokeWidth;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: glyph.width,
    height: glyph.height,
    child: CustomPaint(
      painter: SolarVectorPainter(glyph.fillVector, fill),
      foregroundPainter: SolarVectorPainter(glyph.strokeVector, stroke),
    ),
  );
}
