// One oracle variant drawn as the Flutter visual checks draw it: the component's variant builder
// (solar_flutter_variants, the checks' own), its platform state forced through the widget's states
// controller. The Variants use case lays every variant out with it, and the workbench's Inspect
// dialog draws the variant in view with it (workbench/preview.dart), so the two cannot differ.

import 'package:flutter/widgets.dart';
import 'package:solar_flutter_variants/solar_flutter_variants.dart';

List<Map<String, dynamic>> variantsOf(Map<String, dynamic> oracle) =>
    (oracle['variants'] as List).cast<Map<String, dynamic>>();

VariantBuilder builderOf(String component) {
  final b = builders[component];
  if (b == null) {
    throw StateError(
      '$component has an oracle and no builder in test/visual/builders/',
    );
  }
  return b;
}

/// [component] in its oracle's variant [index], with a states controller of its own holding the
/// variant's platform state (a pressed one hovered too). Another variant is another stage: keyed by
/// Figma's name, a new one starts from its own state.
class VariantStage extends StatelessWidget {
  const VariantStage({
    super.key,
    required this.component,
    required this.oracle,
    required this.index,
  });

  final String component;
  final Map<String, dynamic> oracle;

  /// The variant's index in the oracle, as the workbench's inspection numbers it.
  final int index;

  @override
  Widget build(BuildContext context) {
    final variant = variantsOf(oracle)[index];
    return _Stage(
      key: ValueKey('$component:${variant['figma']}'),
      build: builderOf(component),
      variant: variant,
      oracle: oracle,
    );
  }
}

class _Stage extends StatefulWidget {
  const _Stage({
    super.key,
    required this.build,
    required this.variant,
    required this.oracle,
  });

  final VariantBuilder build;
  final Map<String, dynamic> variant;
  final Map<String, dynamic> oracle;

  @override
  State<_Stage> createState() => _StageState();
}

class _StageState extends State<_Stage> {
  late final states = WidgetStatesController(
    statesFor(widget.variant['state'] as String?),
  );

  @override
  void dispose() {
    states.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      widget.build(widget.variant, states, widget.oracle);
}
