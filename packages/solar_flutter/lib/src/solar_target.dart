import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

/// The smallest target a finger should have to hit, 44 × 44, WCAG's floor, around a control drawn
/// smaller (a 16px Checkbox). SOLAR asks for it and publishes no variable for it: "Drawn heights
/// are the visible control; the 44×44px WCAG hit area is padded in code (no target-size variable
/// exists yet)."
///
/// ⚠️ Governance gap: the one raw target size in the widgets, here, until SOLAR publishes a
/// target-size variable, which then replaces it. The web's twin is `TARGET` in the codegen's
/// `shells/target.mjs`.
const double solarTargetSize = 44;

/// A control's target, at least [solarTargetSize] square, around the control as drawn.
///
/// Hand written, like [SolarPressable]. Flutter tests a pointer against each widget's own box, so
/// a target can only reach as far as the box around it. A control on its own ([SolarTarget.new],
/// a Checkbox) takes that room, as Material's controls do, where the theme pads tap targets
/// ([MaterialTapTargetSize.padded], on touch platforms), and draws centred in it; a tap anywhere
/// in it is the control's. A control inside another ([SolarTarget.inside], a Tag's close button)
/// takes no room, and reaches as far past itself as the component around it lets a pointer reach.
class SolarTarget extends SingleChildRenderObjectWidget {
  /// The target of a control on its own.
  const SolarTarget({super.key, required super.child}) : _takesRoom = true;

  /// The target of a control inside another component.
  const SolarTarget.inside({super.key, required super.child})
    : _takesRoom = false;

  final bool _takesRoom;

  bool _pads(BuildContext context) =>
      _takesRoom &&
      Theme.of(context).materialTapTargetSize == MaterialTapTargetSize.padded;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderSolarTarget(_pads(context));

  @override
  void updateRenderObject(BuildContext context, RenderObject renderObject) {
    (renderObject as _RenderSolarTarget).pads = _pads(context);
  }
}

class _RenderSolarTarget extends RenderShiftedBox {
  _RenderSolarTarget(this._pads) : super(null);

  bool _pads;
  set pads(bool value) {
    if (value == _pads) return;
    _pads = value;
    markNeedsLayout();
  }

  @override
  void performLayout() {
    final child = this.child;
    if (child == null) {
      size = constraints.constrain(Size.zero);
      return;
    }
    child.layout(constraints, parentUsesSize: true);
    final drawn = child.size;
    size = _pads
        ? constraints.constrain(
            Size(
              math.max(drawn.width, solarTargetSize),
              math.max(drawn.height, solarTargetSize),
            ),
          )
        : drawn;
    (child.parentData! as BoxParentData).offset = Alignment.center.alongOffset(
      size - drawn as Offset,
    );
  }

  /// The child's box in this one.
  Rect get _drawn {
    final child = this.child!;
    return (child.parentData! as BoxParentData).offset & child.size;
  }

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) {
    if (child == null) return false;
    final drawn = _drawn;
    final target = Rect.fromCenter(
      center: drawn.center,
      width: math.max(drawn.width, solarTargetSize),
      height: math.max(drawn.height, solarTargetSize),
    );
    if (!target.contains(position) && !size.contains(position)) return false;
    // A tap in the target is the control's: outside the drawing, it lands on the drawing's middle
    // line, across from where it fell (a text field's caret goes there), or on its centre where it
    // fell beside it too. A rounded corner may be cut off; its middle line never is.
    final at = drawn.contains(position)
        ? position
        : Offset(
            position.dx >= drawn.left && position.dx < drawn.right
                ? position.dx
                : drawn.center.dx,
            position.dy >= drawn.top && position.dy < drawn.bottom
                ? position.dy
                : drawn.center.dy,
          );
    final hit = result.addWithPaintOffset(
      offset: drawn.topLeft,
      position: at,
      hitTest: (result, transformed) =>
          child!.hitTest(result, position: transformed),
    );
    if (hit) result.add(BoxHitTestEntry(this, position));
    return hit;
  }
}
