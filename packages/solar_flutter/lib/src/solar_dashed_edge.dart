import 'dart:math' as math;

import 'package:flutter/widgets.dart';

/// A dashed edge, drawn over a box: FileUpload's drop zone, Option Card's create tile, Time Slot's
/// half-hour rule. Flutter's borders are solid, so [SolarLayers] draws a dashed layer's border
/// clear, keeping its width, and this over it in Figma's pattern ([dash], each dash's length and the
/// gap after it), round the box's corners where every side is edged alike, along each edged side
/// otherwise.
///
/// Hand written, as [SolarLayers] is. The web draws CSS's `dashed`, whose lengths the browser picks.
class SolarDashedDecoration extends Decoration {
  const SolarDashedDecoration({
    required this.color,
    required this.widths,
    required this.dash,
    this.radius = BorderRadius.zero,
  });

  /// The edge's colour.
  final Color color;

  /// Each side's width, top, right, bottom and left; 0 draws none.
  final List<double> widths;

  /// Figma's pattern: each dash's length and the gap after it, repeated.
  final List<double> dash;

  /// The box's corners.
  final BorderRadius radius;

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) => _Painter(this);

  @override
  bool operator ==(Object other) =>
      other is SolarDashedDecoration &&
      other.color == color &&
      other.radius == radius &&
      _same(other.widths, widths) &&
      _same(other.dash, dash);

  @override
  int get hashCode =>
      Object.hash(color, radius, Object.hashAll(widths), Object.hashAll(dash));

  static bool _same(List<double> a, List<double> b) =>
      a.length == b.length &&
      [for (var i = 0; i < a.length; i++) i].every((i) => a[i] == b[i]);
}

class _Painter extends BoxPainter {
  _Painter(this.d);

  final SolarDashedDecoration d;

  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration configuration) {
    final size = configuration.size;
    if (size == null || d.dash.every((l) => l <= 0)) return;
    final box = offset & size;
    final paint = Paint()
      ..color = d.color
      ..style = PaintingStyle.stroke;
    final w = d.widths;
    if (w.every((x) => x == w.first) && w.first > 0) {
      // Every side alike: one outline round the corners, at the middle of the edge.
      paint.strokeWidth = w.first;
      final half = w.first / 2;
      Radius inner(Radius r) =>
          Radius.elliptical(math.max(0, r.x - half), math.max(0, r.y - half));
      final rrect = RRect.fromRectAndCorners(
        box.deflate(half),
        topLeft: inner(d.radius.topLeft),
        topRight: inner(d.radius.topRight),
        bottomRight: inner(d.radius.bottomRight),
        bottomLeft: inner(d.radius.bottomLeft),
      );
      _dashed(canvas, Path()..addRRect(rrect), paint);
      return;
    }
    // Sides of their own (Time Slot's rule, its top alone): each along its side, inside the box.
    final lines = [
      (
        w[0],
        Offset(box.left, box.top + w[0] / 2),
        Offset(box.right, box.top + w[0] / 2),
      ),
      (
        w[1],
        Offset(box.right - w[1] / 2, box.top),
        Offset(box.right - w[1] / 2, box.bottom),
      ),
      (
        w[2],
        Offset(box.left, box.bottom - w[2] / 2),
        Offset(box.right, box.bottom - w[2] / 2),
      ),
      (
        w[3],
        Offset(box.left + w[3] / 2, box.top),
        Offset(box.left + w[3] / 2, box.bottom),
      ),
    ];
    for (final (width, from, to) in lines) {
      if (width <= 0) continue;
      paint.strokeWidth = width;
      _dashed(
        canvas,
        Path()
          ..moveTo(from.dx, from.dy)
          ..lineTo(to.dx, to.dy),
        paint,
      );
    }
  }

  /// [path] in [SolarDashedDecoration.dash]'s pattern, from its start.
  void _dashed(Canvas canvas, Path path, Paint paint) {
    for (final metric in path.computeMetrics()) {
      var at = 0.0;
      var i = 0;
      while (at < metric.length) {
        final length = d.dash[i % d.dash.length];
        if (i.isEven) {
          canvas.drawPath(
            metric.extractPath(at, math.min(at + length, metric.length)),
            paint,
          );
        }
        at += math.max(length, 0.01);
        i++;
      }
    }
  }
}
