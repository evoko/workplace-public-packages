import 'dart:math' as math;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import 'solar_target.dart';

/// A component at its own size, however its parent constrains it: a Checkbox stays 16px, a Tag
/// hugs its words and a Button its label, in a ListView that makes every child as wide as the
/// list, as Figma draws them and as the web's inline boxes are. Only on the axes the component does
/// not fill: a card that fills its width still takes the list's.
///
/// Where the parent gives more room than the component takes, the component sits at the room's
/// start, top and leading edge (left in a left-to-right app), as the web lays out an inline box
/// (owner decision 2026-09-25). A tap there reaches it within the 44 × 44 target around what is
/// drawn ([solarTargetSize]), and misses beyond it, so a tap across a list row does not press a
/// checkbox at its start.
///
/// A parent that sizes a SOLAR component itself (a Button Group's buttons, which share its row)
/// says so with [SolarFill], and the component takes the size it is given.
class SolarOwnSize extends StatelessWidget {
  const SolarOwnSize({
    super.key,
    this.fillsWidth = false,
    this.fillsHeight = false,
    required this.child,
  });

  /// Whether the component takes the width its parent gives (Figma's FILL).
  final bool fillsWidth;

  /// Whether the component takes the height its parent gives.
  final bool fillsHeight;

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final sized = SolarFill.of(context);
    return _OwnSizeBox(
      fillsWidth: fillsWidth || sized,
      fillsHeight: fillsHeight || sized,
      textDirection: Directionality.maybeOf(context) ?? TextDirection.ltr,
      // What the component holds keeps its own size again (a Counter in a grouped Button).
      child: sized ? SolarFill.reset(child: child) : child,
    );
  }
}

/// Says that the SOLAR component under it is sized by its parent (a Button Group's buttons, each
/// its share of the row; a composed child in the box its parent's recipe gives it), so it fills
/// what it is given rather than keeping its own size ([SolarOwnSize]). It reaches the nearest
/// component only.
class SolarFill extends InheritedWidget {
  const SolarFill({super.key, required super.child}) : _fills = true;

  /// Ends a [SolarFill] above: what a sized component holds keeps its own size.
  const SolarFill.reset({super.key, required super.child}) : _fills = false;

  final bool _fills;

  /// Whether a parent sizes the component at [context].
  static bool of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SolarFill>()?._fills ?? false;

  @override
  bool updateShouldNotify(SolarFill oldWidget) => oldWidget._fills != _fills;
}

class _OwnSizeBox extends SingleChildRenderObjectWidget {
  const _OwnSizeBox({
    required this.fillsWidth,
    required this.fillsHeight,
    required this.textDirection,
    required super.child,
  });

  final bool fillsWidth;
  final bool fillsHeight;
  final TextDirection textDirection;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderOwnSize(fillsWidth, fillsHeight, textDirection);

  @override
  void updateRenderObject(BuildContext context, RenderObject renderObject) {
    (renderObject as _RenderOwnSize)
      ..fillsWidth = fillsWidth
      ..fillsHeight = fillsHeight
      ..textDirection = textDirection;
  }
}

class _RenderOwnSize extends RenderShiftedBox {
  _RenderOwnSize(this._fillsWidth, this._fillsHeight, this._textDirection)
    : super(null);

  bool _fillsWidth;
  set fillsWidth(bool value) {
    if (value == _fillsWidth) return;
    _fillsWidth = value;
    markNeedsLayout();
  }

  bool _fillsHeight;
  set fillsHeight(bool value) {
    if (value == _fillsHeight) return;
    _fillsHeight = value;
    markNeedsLayout();
  }

  TextDirection _textDirection;
  set textDirection(TextDirection value) {
    if (value == _textDirection) return;
    _textDirection = value;
    markNeedsLayout();
  }

  /// The parent's constraints, loosened on each axis the component does not fill.
  BoxConstraints _forChild(BoxConstraints c) => BoxConstraints(
    minWidth: _fillsWidth ? c.minWidth : 0,
    maxWidth: c.maxWidth,
    minHeight: _fillsHeight ? c.minHeight : 0,
    maxHeight: c.maxHeight,
  );

  @override
  void performLayout() {
    final child = this.child;
    if (child == null) {
      size = constraints.constrain(Size.zero);
      return;
    }
    child.layout(_forChild(constraints), parentUsesSize: true);
    size = constraints.constrain(child.size);
    (child.parentData! as BoxParentData).offset = AlignmentDirectional.topStart
        .resolve(_textDirection)
        .alongOffset(size - child.size as Offset);
  }

  @override
  Size computeDryLayout(covariant BoxConstraints constraints) => constraints
      .constrain(child?.getDryLayout(_forChild(constraints)) ?? Size.zero);

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) {
    final child = this.child;
    if (child == null || !size.contains(position)) return false;
    final drawn = (child.parentData! as BoxParentData).offset & child.size;
    final target = Rect.fromCenter(
      center: drawn.center,
      width: math.max(drawn.width, solarTargetSize),
      height: math.max(drawn.height, solarTargetSize),
    );
    if (!target.contains(position)) return false;
    // Inside the target, the nearest point of what is drawn, as SolarTarget reaches it.
    final at = Offset(
      position.dx.clamp(drawn.left, drawn.right - 0.01),
      position.dy.clamp(drawn.top, drawn.bottom - 0.01),
    );
    final hit = result.addWithPaintOffset(
      offset: drawn.topLeft,
      position: at,
      hitTest: (result, transformed) =>
          child.hitTest(result, position: transformed),
    );
    if (hit) result.add(BoxHitTestEntry(this, position));
    return hit;
  }
}
