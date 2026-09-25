/// SOLAR Sparkline.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarSparklineRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarSparklineRecipe]: the frame, the
/// line's box, and its stroke's colour and width, by trend and size, read cell by cell.
///
/// A tiny inline trend, as the description says, drawn from Figma's layer tree with [SolarLayers]:
/// no axes or chrome, the line in its [trend]'s colour, [size] sm or md. Given [data], the values
/// are drawn as a line scaled into the line's box, first to last, the highest at its top, and the
/// trend follows from them where none is given: up where the last is above the first, down where
/// below, flat otherwise (owner decision). Without data it draws Figma's sample line. It is an
/// image, named by [semanticLabel].
library;

import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../generated/components/sparkline.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

/// The trend a series shows: its last value against its first.
SolarSparklineTrend sparklineTrendOf(List<num> data) {
  if (data.length < 2) return SolarSparklineTrend.flat;
  final d = data.last - data.first;
  return d > 0
      ? SolarSparklineTrend.up
      : d < 0
      ? SolarSparklineTrend.down
      : SolarSparklineTrend.flat;
}

/// The series as points in a box: first to last across it, the highest at its top.
List<Offset> sparklinePoints(List<num> data, Size box) {
  if (data.isEmpty) return const [];
  final lo = data.reduce(math.min).toDouble();
  final hi = data.reduce(math.max).toDouble();
  return [
    for (final (i, v) in data.indexed)
      Offset(
        data.length == 1 ? box.width / 2 : i * box.width / (data.length - 1),
        hi == lo
            ? box.height / 2
            : box.height - (v - lo) / (hi - lo) * box.height,
      ),
  ];
}

class SolarSparkline extends StatelessWidget {
  const SolarSparkline({
    super.key,
    this.data,
    this.trend,
    this.size = SolarSparklineSize.sm,
    this.semanticLabel,
  });

  /// The values, first to last; without them it draws Figma's sample.
  final List<num>? data;

  /// Its trend; from [data] where not given.
  final SolarSparklineTrend? trend;

  final SolarSparklineSize size;

  /// What it shows, for a screen reader ("Revenue, rising").
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSparklineProps(
      trend:
          trend ??
          (data == null ? SolarSparklineTrend.up : sparklineTrendOf(data!)),
      size: size,
    );
    const states = <WidgetState>{};
    final figma = SolarSparklineRecipe.glyph('line', p, states);
    final line = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSparklineRecipe.lookup(c, p, states),
        dimension: (c) => SolarSparklineRecipe.dimension(c, p, states),
        color: (c) => SolarSparklineRecipe.color(t, c, p, states),
        shadow: (c) => SolarSparklineRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSparklineRecipe.textStyle(t, c, p, states),
        present: (l) => SolarSparklineRecipe.present(l, p, states),
        glyph: (l) => SolarSparklineRecipe.glyph(l, p, states),
      ),
      tree: SolarSparklineRecipe.tree,
      keyPrefix: 'sparkline',
      builders: {
        // The data's line in the line's box, stroked in the recipe's colour and width.
        if (data != null && figma != null)
          'line': (_) => CustomPaint(
            size: Size(figma.width, figma.height),
            painter: _Line(
              sparklinePoints(data!, Size(figma.width, figma.height)),
              SolarSparklineRecipe.color(t, 'line.borderColor', p, states),
              SolarSparklineRecipe.dimension('line.borderWidth', p, states) ??
                  1,
            ),
          ),
      },
    ).layer('root');
    return Semantics(
      image: true,
      label: semanticLabel,
      child: ExcludeSemantics(child: line),
    );
  }
}

class _Line extends CustomPainter {
  const _Line(this.points, this.color, this.width);

  final List<Offset> points;
  final Color color;
  final double width;

  @override
  void paint(Canvas canvas, Size size) {
    if (points.length < 2) return;
    final path = Path()..moveTo(points.first.dx, points.first.dy);
    for (final p in points.skip(1)) {
      path.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(
      path,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = width
        ..strokeJoin = StrokeJoin.round
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(_Line old) =>
      old.color != color || old.width != width || old.points != points;
}
