/// SOLAR BackButton.
///
/// Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
/// [SolarBackButtonRecipe]: its sizes, its colours by state, its shadow and focus ring.
///
/// Back to the previous view or a parent: one per view, top left. It wraps Flutter's FilledButton,
/// as SolarButton does, with SOLAR's ArrowLeft icon. Its label, the [child], is 'Back' by default;
/// give the destination where it helps ('Back to Devices'), or null for the arrow alone, which is
/// then named by [semanticLabel].
library;

import 'package:flutter/material.dart';

import '../generated/components/backbutton.dart';
import '../generated/components/spinner.dart';
import '../generated/icons.dart';
import '../solar_icon.dart';
import '../solar_button_themes.dart';
import '../solar_own_size.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarBackButton extends StatelessWidget {
  const SolarBackButton({
    super.key,
    required this.onPressed,
    this.child = const Text('Back'),
    this.semanticLabel = 'Back',
    this.size = SolarBackButtonSize.md,
    this.loading = false,
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  });

  /// Called when it is tapped; null disables it, as for any Flutter button.
  final VoidCallback? onPressed;

  /// Where it goes back to: 'Back' by default; null for the arrow alone.
  final Widget? child;

  /// The arrow alone's accessible name.
  final String semanticLabel;

  final SolarBackButtonSize size;
  final bool loading;

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
    final p = SolarBackButtonProps(
      size: size,
      disabled: disabled,
      loading: busy,
    );
    const rest = <WidgetState>{};
    bool shows(String layer) => SolarBackButtonRecipe.present(layer, p, rest);
    final gap = SolarBackButtonRecipe.dimension('root.gap', p, rest) ?? 0;
    // Loading hides the arrow and the label but keeps their room, so the button does not resize.
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
        kept('iconArrowLeft', const _Arrow(key: Key('iconArrowLeft'))),
        if (child != null) ...[SizedBox(width: gap), kept('label', child!)],
      ],
    );

    Widget button = FilledButton(
      onPressed: disabled || busy ? null : onPressed,
      // The recipe, under the app's SolarBackButtonThemeData where its theme has one.
      style: SolarBackButtonThemeData.styled(
        context,
        SolarBackButtonRecipe.style(t, p),
      ),
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
                  SolarBackButtonRecipe.lookup(
                    'spinner.variant.size',
                    p,
                    rest,
                  )!.substring(2),
                ),
                variant: SolarSpinnerVariant.values.firstWhere(
                  (v) =>
                      'k:${v.figma}' ==
                      SolarBackButtonRecipe.lookup(
                        'spinner.variant.style',
                        p,
                        rest,
                      ),
                ),
              ),
            ),
        ],
      ),
    );
    if (child == null) {
      button = MergeSemantics(
        child: Semantics(label: semanticLabel, child: button),
      );
    }
    // Its own size wherever it is put, as Figma draws it, not the width a ListView forces on a
    // Flutter button (owner decision 2026-09-25); a parent that shares its row gives SolarFill.
    return SolarOwnSize(child: button);
  }
}

/// SOLAR's ArrowLeft, in the colour and size the button's icon theme gives it.
class _Arrow extends StatelessWidget {
  const _Arrow({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = IconTheme.of(context);
    return SolarIcon(
      SolarIcons.arrowLeftOutline,
      size: theme.size,
      color: theme.color,
    );
  }
}
