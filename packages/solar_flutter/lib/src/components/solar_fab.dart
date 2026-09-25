/// SOLAR FAB.
///
/// Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
/// [SolarFABRecipe]: each size and type, its colours by state, its shadow and its focus ring.
///
/// The screen's one most important action. It wraps Flutter's FilledButton, as SolarButton does,
/// restyled by [SolarFABRecipe.style]; where it floats is the app's (a Scaffold's
/// floatingActionButton takes it). It is extended when it has a label, its [child], and an icon alone
/// otherwise, which then needs a [semanticLabel].
library;

import 'package:flutter/material.dart';

import '../generated/components/fab.dart';
import '../generated/components/spinner.dart';
import '../solar_button_themes.dart';
import '../solar_own_size.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarFAB extends StatelessWidget {
  const SolarFAB({
    super.key,
    required this.onPressed,
    required this.icon,
    this.child,
    this.size = SolarFABSize.sm,
    this.loading = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  }) : assert(
         child != null || semanticLabel != null,
         'SOLAR FAB: an icon FAB needs a semanticLabel.',
       );

  /// Called when it is tapped; null disables it, as for any Flutter button.
  final VoidCallback? onPressed;

  /// The action's icon: add, compose, scan.
  final Widget icon;

  /// The label, which makes it an extended FAB.
  final Widget? child;

  final SolarFABSize size;
  final bool loading;

  /// The accessible name, required when there is no label.
  final String? semanticLabel;

  final FocusNode? focusNode;
  final bool autofocus;
  final WidgetStatesController? statesController;

  /// Whether it is disabled: by a null [onPressed], as Flutter's own buttons are, not a parameter of
  /// its own.
  bool get disabled => onPressed == null;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Disabled wins over loading, as in Figma's state order.
    final busy = loading && !disabled;
    final p = SolarFABProps(
      size: size,
      disabled: disabled,
      loading: busy,
      type: child == null ? SolarFABType.icon : SolarFABType.extended,
    );
    const rest = <WidgetState>{};
    bool shows(String layer) => SolarFABRecipe.present(layer, p, rest);
    final gap = SolarFABRecipe.dimension('root.gap', p, rest) ?? 0;
    // Loading hides the icon and the label but keeps their room, so the FAB does not resize.
    Widget kept(String layer, Widget child) => Visibility(
      visible: shows(layer),
      maintainSize: true,
      maintainAnimation: true,
      maintainState: true,
      maintainSemantics: true,
      child: child,
    );
    final content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        kept('icon', icon),
        if (child != null) ...[SizedBox(width: gap), kept('label', child!)],
      ],
    );

    Widget button = FilledButton(
      onPressed: disabled || busy ? null : onPressed,
      // The recipe, under the app's SolarFABThemeData where its theme has one.
      style: SolarFABThemeData.styled(context, SolarFABRecipe.style(t, p)),
      focusNode: focusNode,
      autofocus: autofocus,
      statesController: statesController,
      child: Stack(
        alignment: Alignment.center,
        children: [
          content,
          if (shows('spinner'))
            ExcludeSemantics(
              child: SolarSpinner(
                size: SolarSpinnerSize.values.byName(
                  SolarFABRecipe.lookup(
                    'spinner.variant.size',
                    p,
                    rest,
                  )!.substring(2),
                ),
                variant: SolarSpinnerVariant.values.firstWhere(
                  (v) =>
                      'k:${v.figma}' ==
                      SolarFABRecipe.lookup('spinner.variant.style', p, rest),
                ),
              ),
            ),
        ],
      ),
    );
    if (semanticLabel != null) {
      button = MergeSemantics(
        child: Semantics(label: semanticLabel, child: button),
      );
    }
    // Its own size wherever it is put, as Figma draws it, not the width a ListView forces on a
    // Flutter button (owner decision 2026-09-25); a parent that shares its row gives SolarFill.
    return SolarOwnSize(child: button);
  }
}
