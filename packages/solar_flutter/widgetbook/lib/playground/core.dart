/// The viewer-free core of the Flutter Playground: a component's controls from the generated
/// controls.dart, the icon an icon control picks, the event log's lines, what `set` accepts, and
/// the SolarPlayground a builder renders from. It imports no viewer, so the Widgetbook adapter
/// (adapter.dart) and the tests build the same Playground from it. It mirrors the web's core,
/// packages/components/stories/playground/core.tsx.
library;

import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'controls.dart';
import 'icons.dart';
import 'playground.dart';

const _booleanKinds = {'boolean', 'child', 'content'};
const _textKinds = {'text', 'childText'};
const _numberKinds = {'number', 'integer'};

/// What an icon control offers: none, the sample, then every SOLAR icon in both styles.
final iconOptions = <String>[
  playgroundIconNone,
  playgroundIconSample,
  for (final s in playgroundIcons) ...[s, '$s$playgroundIconSolid'],
];

/// One control of a component's Playground, from the generated list (controls.mjs, extras.mjs).
class PlaygroundControl {
  const PlaygroundControl({
    required this.name,
    required this.kind,
    required this.initial,
    this.options,
    this.dartOptions,
    this.slot,
    this.min,
    this.max,
    this.step,
  });

  PlaygroundControl.fromMap(Map<String, Object?> m)
    : this(
        name: m['name']! as String,
        kind: m['kind']! as String,
        initial: m['default'],
        options: (m['options'] as List?)?.cast<String>(),
        dartOptions: (m['dartOptions'] as List?)?.cast<String>(),
        slot: m['slot'] as String?,
        min: m['min'] as num?,
        max: m['max'] as num?,
        step: m['step'] as num?,
      );

  final String name;

  /// select, boolean, color, text, icon, child, childText, content, width, number or integer.
  final String kind;
  final Object? initial;

  /// A select's values, and the same values as the Flutter enum emitter names them.
  final List<String>? options;
  final List<String>? dartOptions;

  /// The component slot a childText control gives words to.
  final String? slot;

  /// A number or integer control's bounds and step.
  final num? min;
  final num? max;
  final num? step;

  /// What a dropdown knob offers.
  List<String> get choices => switch (kind) {
    'icon' => iconOptions,
    'width' => playgroundWidths,
    _ => options ?? const [],
  };

  bool _inBounds(num n) =>
      (min == null || n >= min!) && (max == null || n <= max!);

  /// Throws an ArgumentError unless [value] fits this control: what `set` accepts (core.tsx
  /// `checkValue`).
  void check(Object? value) {
    Never fail(String what) =>
        throw ArgumentError.value(value, name, 'a $kind control takes $what');
    final bounds = 'within ${min ?? '-∞'}…${max ?? '∞'}';
    switch (kind) {
      case 'boolean' || 'child' || 'content':
        if (value is! bool) fail('a bool');
      case 'text' || 'childText':
        if (value is! String) fail('a String');
      case 'color':
        if (value != null && value is! Color && value is! String) {
          fail('a Color, a #rrggbb String or null');
        }
        colorOf(value);
      case 'select' || 'icon' || 'width':
        if (!choices.contains(value)) fail('one of its options');
      case 'integer':
        if (value is! int || !_inBounds(value)) fail('an int $bounds');
      case 'number':
        if (value is! num || !value.isFinite || !_inBounds(value)) {
          fail('a num $bounds');
        }
      default:
        throw StateError('$name: no control of kind "$kind"');
    }
  }
}

/// A colour control's value as a Color: a Color, `#rrggbb` or `#aarrggbb`, or null.
Color? colorOf(Object? value) {
  if (value is Color || value == null) return value as Color?;
  if (value is String && value.startsWith('#')) {
    final hex = value.substring(1);
    final argb = int.tryParse(hex.length == 6 ? 'ff$hex' : hex, radix: 16);
    if (argb != null && (hex.length == 6 || hex.length == 8)) {
      return Color(argb);
    }
  }
  throw ArgumentError.value(value, 'value', 'not a colour');
}

/// A component's controls: its IR's, its width, then its extras, as the codegen lists them.
List<PlaygroundControl> controlsOf(String component) {
  final generated = playgroundControls[component];
  if (generated == null) {
    throw StateError('$component: no Playground controls in controls.dart');
  }
  return [for (final m in generated) PlaygroundControl.fromMap(m)];
}

/// An icon control's value as a widget: none, the builder's sample, or the SOLAR icon the value
/// names (`chevron-right`, `chevron-right solid`); null where it names none.
Widget? playgroundIcon(Object? value) {
  if (value is! String || value == playgroundIconNone) return null;
  if (value == playgroundIconSample) {
    return const SolarIcon(SolarIcons.plusOutline);
  }
  final vector = solarIconsByName[value];
  return vector == null ? null : SolarIcon(vector);
}

/// One line of the event log: the event, and its detail in JSON unless null (core.tsx `logLine`).
String logLine(String event, [Object? detail]) => detail == null
    ? event
    : '$event: ${jsonEncode(detail, toEncodable: (o) => o.toString())}';

/// The log with [line] added, newest first, kept to the log's length (core.tsx `withLine`).
List<String> withLine(List<String> lines, String line) =>
    [line, ...lines].take(playgroundLogLength).toList();

/// A number control's value as a number, where it is one.
num? _numberOf(Object? value) => switch (value) {
  final num n when n.isFinite => n,
  final String s => num.tryParse(s.trim()),
  _ => null,
};

/// The SolarPlayground a builder renders from, over [read] (a control's current value by name).
/// `set` is checked against the control ([PlaygroundControl.check]) before it reaches [write];
/// `log` is [onLog]'s. [onRead], where given, hears every control a builder reads, a component
/// slot's words with its toggle (the tests prove a builder reads every control). It mirrors
/// core.tsx `makePlayground`.
class ControlledPlayground implements SolarPlayground {
  ControlledPlayground({
    required List<PlaygroundControl> controls,
    required this.read,
    required this.write,
    required this.onLog,
    this.onRead,
  }) : _byName = {for (final c in controls) c.name: c};

  final Map<String, PlaygroundControl> _byName;

  /// A control's current value.
  final Object? Function(String name) read;

  /// Sets a control, once checked.
  final void Function(PlaygroundControl control, Object? value) write;

  /// Adds a line to the log.
  final void Function(String event, Object? detail) onLog;

  /// Hears every control a builder reads.
  final void Function(String name)? onRead;

  /// The control [name]; throws where there is none.
  PlaygroundControl controlNamed(String name) =>
      _byName[name] ??
      (throw ArgumentError.value(
        name,
        'name',
        'not one of this Playground\'s controls',
      ));

  PlaygroundControl _read(String name, [Set<String>? kinds, String? what]) {
    final c = controlNamed(name);
    if (kinds != null && !kinds.contains(c.kind)) {
      throw ArgumentError.value(name, 'name', 'a ${c.kind} control, not $what');
    }
    onRead?.call(name);
    return c;
  }

  @override
  Object? value(String name) {
    _read(name);
    return read(name);
  }

  @override
  bool flag(String name) {
    _read(name, _booleanKinds, 'a toggle');
    return read(name) == true;
  }

  @override
  String text(String name) {
    _read(name, _textKinds, 'a text control');
    final v = read(name);
    return v is String ? v : '';
  }

  @override
  String? words(String name) {
    final t = text(name);
    return t.isEmpty ? null : t;
  }

  @override
  int whole(String name) {
    final c = _read(name, _numberKinds, 'a number');
    final n = _numberOf(read(name)) ?? _numberOf(c.initial) ?? 0;
    var w = n.round();
    if (c.min != null && w < c.min!) w = c.min!.ceil();
    if (c.max != null && w > c.max!) w = c.max!.floor();
    return w;
  }

  @override
  T choice<T extends Enum>(String name, List<T> values) {
    final c = _read(name, const {'select'}, 'a select');
    final options = c.options ?? const [];
    var i = options.indexOf('${read(name)}');
    if (i < 0) i = options.indexOf('${c.initial}');
    return values.byName((c.dartOptions ?? options)[i]);
  }

  @override
  void set(String name, Object? value) {
    final c = controlNamed(name);
    c.check(value);
    write(c, value);
  }

  @override
  void setChoice(String name, Enum value) {
    final c = controlNamed(name);
    if (c.kind != 'select') {
      throw ArgumentError.value(
        name,
        'name',
        'a ${c.kind} control, not a select',
      );
    }
    final i = (c.dartOptions ?? c.options ?? const []).indexOf(value.name);
    if (i < 0) {
      throw ArgumentError.value(value, name, 'not one of its options');
    }
    set(name, c.options![i]);
  }

  @override
  void log(String event, [Object? detail]) => onLog(event, detail);

  @override
  Widget? icon(String slot) {
    _read(slot, const {'icon'}, 'an icon');
    return playgroundIcon(read(slot));
  }

  @override
  ({bool shown, String? text}) child(String slot) {
    _read(slot, const {'child'}, 'a component slot');
    final words = _byName.values
        .where((c) => c.kind == 'childText' && c.slot == slot)
        .firstOrNull;
    if (words != null) onRead?.call(words.name);
    final text = words == null ? null : read(words.name);
    return (shown: read(slot) == true, text: text is String ? text : null);
  }
}
