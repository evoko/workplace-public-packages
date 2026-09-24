/// SOLAR SplitButton.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter SplitButton` from
/// spec/components/splitbutton.json, and owned by developers from then on: change it freely. What
/// it looks like is not here. That is the recipe, [SolarSplitButtonRecipe]: the control's colours,
/// border, shadow and focus ring by state, its halves' padding, and the rule between them.
///
/// The dominant action and a chevron that opens a menu of its variants: two buttons in one joined
/// control, drawn from Figma's layer tree with [SolarLayers]. The whole control takes the states of
/// whichever half is hovered, pressed or focused, as Figma draws them. The menu is the caller's
/// until Dropdown ([onMenuPressed]).
library;

import 'package:flutter/material.dart';

import '../generated/components/spinner.dart';
import '../generated/components/splitbutton.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarSplitButton extends StatelessWidget {
  const SolarSplitButton({
    super.key,
    required this.label,
    required this.onPressed,
    required this.onMenuPressed,
    this.menuLabel = 'More options',
    this.variant = SolarSplitButtonVariant.primary,
    this.size = SolarSplitButtonSize.md,
    this.disabled = false,
    this.loading = false,
    this.statesController,
  });

  /// The dominant action's label.
  final String label;

  /// The dominant action; null disables the control.
  final VoidCallback? onPressed;

  /// Opens the menu of the action's variants.
  final VoidCallback? onMenuPressed;

  /// The chevron's accessible name.
  final String menuLabel;

  final SolarSplitButtonVariant variant;
  final SolarSplitButtonSize size;
  final bool disabled;
  final bool loading;

  /// The control's states, where the caller keeps them.
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['action', 'divider', 'trigger', 'spinner'],
    'action': ['label'],
    'trigger': ['iconChevronDown'],
  };

  static const _halves = {'action', 'divider', 'trigger'};

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Disabled wins over loading, as in Figma's state order.
    final busy = loading && !disabled;
    final active = !disabled && !busy;
    final p = SolarSplitButtonProps(
      variant: variant,
      size: size,
      disabled: disabled,
      loading: busy,
    );
    return SolarTarget(
      child: SolarStatesScope(
        controller: statesController,
        builder: (context, controller) => ListenableBuilder(
          listenable: controller,
          builder: (context, _) {
            final states = {...controller.value};
            bool shows(String l) =>
                SolarSplitButtonRecipe.present(l, p, states);
            // What the loading state hides keeps its room, so the control does not resize.
            Widget kept(String l, Widget child) => Visibility(
              visible: shows(l),
              maintainSize: true,
              maintainAnimation: true,
              maintainState: true,
              child: child,
            );
            // Each half is a button of its own; both drive the one control's states.
            Widget half(String l, VoidCallback? onTap, Widget child) => kept(
              l,
              SolarPressable(
                onPressed: active ? onTap : null,
                statesController: controller,
                builder: (_, _) => child,
              ),
            );
            final mark = SolarLayers(
              recipe: SolarLayerRecipe(
                lookup: (c) => SolarSplitButtonRecipe.lookup(c, p, states),
                dimension: (c) =>
                    SolarSplitButtonRecipe.dimension(c, p, states),
                color: (c) => SolarSplitButtonRecipe.color(t, c, p, states),
                shadow: (c) => SolarSplitButtonRecipe.shadow(t, c, p, states),
                textStyle: (c) =>
                    SolarSplitButtonRecipe.textStyle(t, c, p, states),
                present: (l) =>
                    l == 'spinner' ? false : _halves.contains(l) || shows(l),
                glyph: (_) => null,
              ),
              tree: _tree,
              keyPrefix: 'splitButton',
              text: {'label': label},
              icons: const {'iconChevronDown': SolarIcons.chevronDownOutline},
              builders: {
                'action': (w) => half('action', onPressed, w),
                'divider': (w) => kept('divider', ExcludeSemantics(child: w)),
                'trigger': (w) => Semantics(
                  label: menuLabel,
                  child: half('trigger', onMenuPressed, w),
                ),
              },
            ).layer('root');
            if (!shows('spinner')) return mark;
            return Stack(
              alignment: Alignment.center,
              children: [
                mark,
                ExcludeSemantics(
                  child: SolarSpinner(
                    size: SolarSpinnerSize.values.byName(
                      SolarSplitButtonRecipe.lookup(
                        'spinner.variant.size',
                        p,
                        states,
                      )!.substring(2),
                    ),
                    variant: SolarSpinnerVariant.values.firstWhere(
                      (v) =>
                          'k:${v.figma}' ==
                          SolarSplitButtonRecipe.lookup(
                            'spinner.variant.style',
                            p,
                            states,
                          ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
