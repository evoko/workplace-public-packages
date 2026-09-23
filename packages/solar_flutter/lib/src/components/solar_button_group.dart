/// SOLAR Button Group.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter "Button Group"` from
/// spec/components/button-group.json, and owned by developers from then on: change it freely.
/// What it looks like is not here. That is the recipe, [SolarButtonGroupRecipe]: the direction, the
/// gap, the padding, the full-width bar's divider, and its buttons filling it, read cell by cell.
///
/// Bespoke: a row or column of the caller's buttons, which it never changes.
library;

import 'package:flutter/material.dart';

import '../generated/components/button_group.dart';
import 'solar_theme_of.dart';

class SolarButtonGroup extends StatelessWidget {
  const SolarButtonGroup({
    super.key,
    required this.children,
    this.orientation = SolarButtonGroupOrientation.horizontal,
    this.fullWidth = false,
  }) : assert(
         !(orientation == SolarButtonGroupOrientation.vertical && fullWidth),
         'SOLAR Button Group: Figma draws no vertical full-width group.',
       );

  /// Two to five SOLAR buttons, of one size.
  final List<Widget> children;

  final SolarButtonGroupOrientation orientation;
  final bool fullWidth;

  static const _main = {
    'MIN': MainAxisAlignment.start,
    'CENTER': MainAxisAlignment.center,
    'MAX': MainAxisAlignment.end,
    'SPACE_BETWEEN': MainAxisAlignment.spaceBetween,
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarButtonGroupProps(
      orientation: orientation,
      fullWidth: fullWidth,
    );
    const rest = <WidgetState>{};
    String? at(String cell) => SolarButtonGroupRecipe.lookup(cell, p, rest);
    double length(String cell) =>
        SolarButtonGroupRecipe.dimension(cell, p, rest) ?? 0;

    final horizontal = at('root.direction') == 'k:HORIZONTAL';
    final main = _main[at('root.align')!.substring(2).split('/').first]!;
    // A side of its own where the recipe has one (the full-width divider), else the uniform border.
    final colour = SolarButtonGroupRecipe.color(t, 'root.borderColor', p, rest);
    BorderSide side(String name) {
      final cell = at('root.border${name}Width') != null
          ? 'root.border${name}Width'
          : 'root.borderWidth';
      final v = at(cell);
      if (v == null || v == 'none') return BorderSide.none;
      return BorderSide(color: colour, width: length(cell));
    }

    // Every button fills the group, as Figma draws them: equal shares of a row, the full width of
    // a column.
    final fills = at('secondaryCTA.width') == 'k:FILL';
    return Semantics(
      container: true,
      explicitChildNodes: true,
      child: SizedBox(
        width: at('root.width') == 'k:FILL' ? double.infinity : null,
        child: DecoratedBox(
          decoration: BoxDecoration(
            border: Border(
              top: side('Top'),
              right: side('Right'),
              bottom: side('Bottom'),
              left: side('Left'),
            ),
          ),
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              length('root.paddingLeft'),
              length('root.paddingTop'),
              length('root.paddingRight'),
              length('root.paddingBottom'),
            ),
            child: Flex(
              direction: horizontal ? Axis.horizontal : Axis.vertical,
              mainAxisSize: horizontal ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: main,
              crossAxisAlignment: !horizontal && fills
                  ? CrossAxisAlignment.stretch
                  : CrossAxisAlignment.center,
              spacing: length('root.gap'),
              children: [
                for (final child in children)
                  horizontal && fills ? Expanded(child: child) : child,
              ],
            ),
          ),
        ),
      ),
    );
  }
}
