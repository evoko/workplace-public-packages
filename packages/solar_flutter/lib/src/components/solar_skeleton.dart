/// SOLAR Skeleton.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Skeleton` from
/// spec/components/skeleton.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarSkeletonRecipe]: each type's size and radius,
/// and its colour, read cell by cell.
///
/// Bespoke: Flutter has no skeleton. It is drawn with [SolarLayers], and pulses as the web's MUI
/// Skeleton does, fading to 40% and back over [SolarMotion.durationSlower] each way; not at all
/// where the platform asks for no animation, as SOLAR removes decorative motion. Figma's sizes are
/// the content's, for the three sizes; [width] and [height] take the real content's. Decorative:
/// excluded from semantics, so mark the region loading.
library;

import 'package:flutter/material.dart';

import '../generated/components/skeleton.dart';
import '../generated/tokens.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarSkeleton extends StatefulWidget {
  const SolarSkeleton({
    super.key,
    this.type = SolarSkeletonType.text,
    this.size = SolarSkeletonSize.sm,
    this.width,
    this.height,
  });

  final SolarSkeletonType type;
  final SolarSkeletonSize size;

  /// The real content's width, where it is known; otherwise Figma's for the type and size.
  final double? width;

  /// The real content's height, where it is known.
  final double? height;

  @override
  State<SolarSkeleton> createState() => _SolarSkeletonState();
}

class _SolarSkeletonState extends State<SolarSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: SolarMotion.durationSlower,
  );

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{};

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      _pulse.value = 0;
      _pulse.stop();
    } else if (!_pulse.isAnimating) {
      _pulse.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSkeletonProps(type: widget.type, size: widget.size);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSkeletonRecipe.lookup(c, p, states),
        dimension: (c) => switch (c) {
          'root.width' when widget.width != null => widget.width,
          'root.height' when widget.height != null => widget.height,
          _ => SolarSkeletonRecipe.dimension(c, p, states),
        },
        color: (c) => SolarSkeletonRecipe.color(t, c, p, states),
        shadow: (c) => SolarSkeletonRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSkeletonRecipe.textStyle(t, c, p, states),
        present: (l) => SolarSkeletonRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'skeleton',
    ).layer('root');
    return ExcludeSemantics(
      child: FadeTransition(
        opacity: _pulse.drive(
          Tween<double>(
            begin: 1,
            end: 0.4,
          ).chain(CurveTween(curve: SolarMotion.easeBoth)),
        ),
        child: mark,
      ),
    );
  }
}
