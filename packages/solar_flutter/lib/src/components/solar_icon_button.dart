/// SOLAR Icon Button.
///
/// Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
/// [SolarIconButtonRecipe], which regenerates from Figma on every `solar:codegen`. This file is
/// behaviour: the props, the icon, loading and accessibility, with the same props as the React
/// IconButton.
///
/// It wraps Flutter's IconButton, which supplies focus, keyboard activation, hover and press;
/// [SolarIconButtonRecipe.style] restyles it.
library;

import 'package:flutter/material.dart';

import '../generated/components/icon_button.dart';
import '../generated/components/spinner.dart';
import '../solar_button_themes.dart';
import '../solar_own_size.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarIconButton extends StatelessWidget {
  const SolarIconButton({
    super.key,
    required this.onPressed,
    required this.icon,
    required this.semanticLabel,
    this.size = SolarIconButtonSize.sm,
    this.shape = SolarIconButtonShape.square,
    this.prio = SolarIconButtonPrio.primary,
    this.loading = false,
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  });

  /// Called when the button is tapped; null disables it, as for any Flutter button.
  final VoidCallback? onPressed;

  /// The icon, which is the whole of what the button says.
  final Widget icon;

  /// The accessible name. An icon alone is not a name, so it is required.
  final String semanticLabel;

  final SolarIconButtonSize size;
  final SolarIconButtonShape shape;
  final SolarIconButtonPrio prio;
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
    // Disabled wins over loading, as in Figma's state order, so a disabled button shows no spinner.
    final busy = loading && !disabled;
    final p = SolarIconButtonProps(
      size: size,
      shape: shape,
      prio: prio,
      disabled: disabled,
      loading: busy,
    );
    const rest = <WidgetState>{};
    bool shows(String layer) => SolarIconButtonRecipe.present(layer, p, rest);

    // Merged, so the name and the button's own tap action are one node for a screen reader: a
    // Semantics label alone makes a second node, and the button inside it stays unnamed.
    final Widget button = IconButton(
      onPressed: disabled || busy ? null : onPressed,
      // The recipe, under the app's SolarIconButtonThemeData where its theme has one.
      style: SolarIconButtonThemeData.styled(
        context,
        SolarIconButtonRecipe.style(t, p),
      ),
      focusNode: focusNode,
      autofocus: autofocus,
      statesController: statesController,
      icon: Stack(
        alignment: Alignment.center,
        children: [
          // Loading hides the icon but keeps its room, as Figma does, so the button does not
          // resize.
          Visibility(
            visible: shows('icon'),
            maintainSize: true,
            maintainAnimation: true,
            maintainState: true,
            child: icon,
          ),
          if (shows('spinner'))
            // Which Spinner, Figma picks per variant; its `style` axis is the Spinner's
            // `variant` prop.
            ExcludeSemantics(
              child: SolarSpinner(
                size: SolarSpinnerSize.values.byName(
                  SolarIconButtonRecipe.lookup(
                    'spinner.variant.size',
                    p,
                    rest,
                  )!.substring(2),
                ),
                variant: SolarSpinnerVariant.values.firstWhere(
                  (v) =>
                      'k:${v.figma}' ==
                      SolarIconButtonRecipe.lookup(
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
    // Its own size wherever it is put, as Figma draws it, not the width a ListView forces on a
    // Flutter button (owner decision 2026-09-25); a parent that sizes it gives SolarFill.
    return SolarOwnSize(
      child: MergeSemantics(
        child: Semantics(label: semanticLabel, child: button),
      ),
    );
  }
}
