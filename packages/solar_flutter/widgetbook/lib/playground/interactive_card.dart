// Interactive Card's Playground: its words, icon and states from their controls. Its control is the
// `control` select's, drawn while that control's slot toggle (`checkbox`, `radioButton`, `toggle`)
// is on; its drag handle shown by `dragHandle`; its actions, shown by `actions`, three sample
// SolarIconButtons (sm, square, secondary, as the README composes them), each tap logged with its
// name. The card is a choice, as in an app's list of them: its control, or a press on the card,
// selects it (a radio's press only chooses it), which sets `selected` and is logged. As the web's
// (stories/playground/interactive-card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// Each control's slot, whose toggle shows it.
const _slots = {
  SolarInteractiveCardControl.checkbox: 'checkbox',
  SolarInteractiveCardControl.radio: 'radioButton',
  SolarInteractiveCardControl.toggle: 'toggle',
};

/// The sample actions, by name.
const _actions = [
  ('Edit', SolarIcons.editOutline),
  ('Duplicate', SolarIcons.duplicateOutline),
  ('Delete', SolarIcons.deleteOutline),
];

final interactiveCardPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final control = p.choice('control', SolarInteractiveCardControl.values);
    final shown = {for (final s in _slots.values) s: p.child(s).shown};
    final drawn = shown[_slots[control]] ?? false
        ? control
        : SolarInteractiveCardControl.none;
    final selected = p.flag('selected');
    return SolarInteractiveCard(
      selected: selected,
      dragging: p.flag('dragging'),
      control: drawn,
      dragHandle: p.child('dragHandle').shown,
      icon: p.icon('icon'),
      title: p.text('title'),
      description: p.words('description'),
      actions: p.child('actions').shown
          ? [
              for (final (name, icon) in _actions)
                SolarIconButton(
                  size: SolarIconButtonSize.sm,
                  shape: SolarIconButtonShape.square,
                  prio: SolarIconButtonPrio.secondary,
                  icon: SolarIcon(icon),
                  semanticLabel: name,
                  onPressed: () => p.log('onPressed', name),
                ),
            ]
          : null,
      onSelectedChanged: (next) {
        p.set('selected', next);
        p.log('onSelectedChanged', next);
      },
      onPressed: () {
        p.set(
          'selected',
          drawn == SolarInteractiveCardControl.radio ? true : !selected,
        );
        p.log('onPressed');
      },
    );
  },
);
