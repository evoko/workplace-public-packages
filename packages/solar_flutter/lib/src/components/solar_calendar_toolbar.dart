/// SOLAR Calendar Toolbar.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarCalendarToolbarRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarCalendarToolbarRecipe]: the bar, its groups, its range's text style, and which Button and
/// Icon Button each of its own controls is, read cell by cell.
///
/// The toolbar over a calendar view, as the description says, drawn from Figma's layer tree with
/// [SolarLayers]. On the left its own previous and next Icon Buttons and Today Button, which call
/// [onPrevious], [onNext] and [onToday] (named by [previousLabel], [nextLabel] and [todayLabel]),
/// and the [range] the view shows ("October 5 – 11, 2026"). On the right the caller's view switcher
/// ([views], a [SolarSegmentedControl]: Day, Week, Month, Agenda) and [action] (a [SolarButton], a
/// new event). It spans its view. What each control does is the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/button.dart';
import '../generated/components/calendar_toolbar.dart';
import '../generated/components/icon_button.dart';
import '../generated/icons.dart';
import '../solar_icon.dart';
import '../solar_layers.dart';
import 'solar_button.dart';
import 'solar_icon_button.dart';
import 'solar_theme_of.dart';

class SolarCalendarToolbar extends StatelessWidget {
  const SolarCalendarToolbar({
    super.key,
    required this.range,
    this.views,
    this.action,
    this.onPrevious,
    this.onNext,
    this.onToday,
    this.previousLabel = 'Previous',
    this.nextLabel = 'Next',
    this.todayLabel = 'Today',
  });

  /// The range the view shows, in the caller's words ("October 5 – 11, 2026").
  final String range;

  /// The view switcher: a [SolarSegmentedControl] (sm).
  final Widget? views;

  /// The action on the right: a [SolarButton] (sm), a new event.
  final Widget? action;

  /// Called by the previous button: the range before.
  final VoidCallback? onPrevious;

  /// Called by the next button: the range after.
  final VoidCallback? onNext;

  /// Called by the Today button: the range with today in it.
  final VoidCallback? onToday;

  /// What the previous button says to a screen reader.
  final String previousLabel;

  /// What the next button says to a screen reader.
  final String nextLabel;

  /// The Today button's words.
  final String todayLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarCalendarToolbarProps();
    const states = <WidgetState>{};
    String variant(String layer, String axis) =>
        SolarCalendarToolbarRecipe.lookup(
          '$layer.variant.$axis',
          p,
          states,
        )!.substring(2);
    // Each of its own controls is the Button or Icon Button the recipe names for its layer.
    Widget iconButton(
      String layer,
      SolarVector icon,
      String label,
      VoidCallback? onPressed,
    ) => SolarIconButton(
      onPressed: onPressed,
      semanticLabel: label,
      size: SolarIconButtonSize.values.byName(variant(layer, 'size')),
      shape: SolarIconButtonShape.values.byName(variant(layer, 'shape')),
      prio: SolarIconButtonPrio.values.byName(variant(layer, 'prio')),
      icon: Builder(
        builder: (context) {
          final theme = IconTheme.of(context);
          return SolarIcon(icon, size: theme.size, color: theme.color);
        },
      ),
    );
    bool drawn(String l) => SolarCalendarToolbarRecipe.present(l, p, states);
    return Semantics(
      container: true,
      child: SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: (c) => SolarCalendarToolbarRecipe.lookup(c, p, states),
          dimension: (c) => SolarCalendarToolbarRecipe.dimension(c, p, states),
          color: (c) => SolarCalendarToolbarRecipe.color(t, c, p, states),
          shadow: (c) => SolarCalendarToolbarRecipe.shadow(t, c, p, states),
          textStyle: (c) =>
              SolarCalendarToolbarRecipe.textStyle(t, c, p, states),
          // A slot left empty is not drawn.
          present: (l) => switch (l) {
            'views' => views != null && drawn(l),
            'action' => action != null && drawn(l),
            _ => drawn(l),
          },
          glyph: (_) => null,
        ),
        tree: SolarCalendarToolbarRecipe.tree,
        keyPrefix: 'calendarToolbar',
        text: {'range': range},
        composed: {
          'prev': iconButton(
            'prev',
            SolarIcons.chevronLeftOutline,
            previousLabel,
            onPrevious,
          ),
          'next': iconButton(
            'next',
            SolarIcons.chevronRightOutline,
            nextLabel,
            onNext,
          ),
          'todayButton': SolarButton(
            onPressed: onToday,
            size: SolarButtonSize.values.byName(variant('todayButton', 'size')),
            prio: SolarButtonPrio.values.byName(variant('todayButton', 'prio')),
            child: Text(todayLabel),
          ),
          'views': ?views,
          'action': ?action,
        },
      ).layer('root'),
    );
  }
}
