/// What a Playground builder gets and gives, in Flutter: the same members as the web's
/// (packages/components/stories/playground/types.ts), independent of Widgetbook, so a builder is
/// tested with a fake and the adapter is the only code that knows the viewer. The one
/// implementation is core.dart's ControlledPlayground, which the adapter and the tests share.
library;

import 'package:flutter/widgets.dart';

/// The interface a builder renders from. Every member takes a control's name and throws an
/// ArgumentError for a name that is not one of the component's controls, or (the typed accessors,
/// [icon], [child]) one of another kind, so a misspelt or misread control fails at once.
abstract interface class SolarPlayground {
  /// A control's current value, for a kind no typed accessor covers (a colour, a `Color` or null).
  Object? value(String name);

  /// A boolean, a component slot's toggle or a content toggle: on or off.
  bool flag(String name);

  /// A text control's words; '' where it holds none.
  String text(String name);

  /// A text control's words, or null where it holds none: for an optional text slot.
  String? words(String name);

  /// A number or integer control as a whole number within its bounds; its default if cleared.
  int whole(String name);

  /// A select's value, one of its options, as the Flutter enum value the codegen names it
  /// (`dartOptions`, at the option's index: `full-width` is `fullWidth`, `default` `$default`).
  T choice<T extends Enum>(String name, List<T> values);

  /// Sets a control: the component's own change reaches the panel. The value must fit the
  /// control: a bool for a toggle, a String for words, one of a select's options, an int within
  /// an integer's bounds, a num within a number's, a `Color`, `#rrggbb` or null for a colour.
  /// Does nothing once the Playground is gone.
  void set(String name, Object? value);

  /// Sets a select to the option [value] names (the inverse of [choice]).
  void setChoice(String name, Enum value);

  /// Adds a line to the event log: the event's name, and `: <detail>` in JSON unless the detail is
  /// null. Name the event as the widget's callback is named (`onChanged`). Does nothing once the
  /// Playground is gone.
  void log(String event, [Object? detail]);

  /// The icon an icon slot's control picked, as a widget, or null (`_none`, or no such icon).
  Widget? icon(String slot);

  /// A component slot's toggle and, where it has one, its words.
  ({bool shown, String? text}) child(String slot);
}

/// A component's Playground in Flutter. Its extra controls are the codegen's
/// (packages/codegen/src/playground/extras.mjs), in the generated controls.dart, not the
/// builder's. A builder that keeps state (a field's controller, an overlay's route) returns a
/// StatefulWidget from [build]; the adapter keeps it across the rebuild every knob change makes.
class SolarPlaygroundBuilder {
  const SolarPlaygroundBuilder({required this.build});
  final Widget Function(SolarPlayground p) build;
}
