/// SOLAR Bar Stack.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarBarStackRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarBarStackRecipe]: the frame that clips
/// the segments to rounded ends, its direction and the gap between them, read cell by cell.
///
/// A single column or row split into its categories, as the description says: the caller's
/// [segments], each a [SolarBar] in its colour, as long as its value's share of the whole, down
/// ([orientation] vertical) or across. It fills the box it is given. Decorative: what it shows is
/// the caller's to say.
library;

import 'package:flutter/material.dart';

import '../generated/components/bar.dart';
import '../generated/components/bar_stack.dart';
import '../solar_layers.dart';
import 'solar_bar.dart';
import 'solar_theme_of.dart';

/// One category: its share (any positive number, of the segments' sum) and its Bar colour.
class SolarBarStackSegment {
  const SolarBarStackSegment({required this.value, required this.color});

  final double value;
  final SolarBarColor color;
}

class SolarBarStack extends StatelessWidget {
  const SolarBarStack({
    super.key,
    required this.segments,
    this.orientation = SolarBarStackOrientation.vertical,
  });

  /// The categories, first at the stack's start (its top, where vertical), as Figma draws them.
  final List<SolarBarStackSegment> segments;

  final SolarBarStackOrientation orientation;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarBarStackProps(orientation: orientation);
    const states = <WidgetState>{};
    final total = segments.fold<double>(0, (sum, s) => sum + s.value);
    return ExcludeSemantics(
      child: SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: (c) => SolarBarStackRecipe.lookup(c, p, states),
          dimension: (c) => SolarBarStackRecipe.dimension(c, p, states),
          color: (c) => SolarBarStackRecipe.color(t, c, p, states),
          shadow: (c) => SolarBarStackRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarBarStackRecipe.textStyle(t, c, p, states),
          present: (l) => SolarBarStackRecipe.present(l, p, states),
          glyph: (_) => null,
        ),
        tree: SolarBarStackRecipe.tree,
        keyPrefix: 'barStack',
        // The frame clips its segments to its rounded ends, as Figma's clipping frame does.
        clips: const {'root'},
        content: {
          'root': [
            for (final s in segments)
              Expanded(
                // A share in thousandths: Flex takes whole numbers.
                flex: total <= 0
                    ? 1
                    : (s.value / total * 1000).round().clamp(1, 1000),
                child: SolarBar(color: s.color),
              ),
          ],
        },
      ).layer('root'),
    );
  }
}
