// Token Input's Playground: its entries the `tokens` extra, one text, comma-separated (each entry
// trimmed, empty ones dropped), which adding (the keyboard's action) and removing an entry (its
// close button, or Backspace in the empty draft) set; an entry typed with a comma in it is two
// entries, as the control reads it, so the control and the field always hold the same. Its draft
// the `draft` extra, which typing sets: the widget keeps it in the caller's controller, with no
// callback of its own, so typing.dart's PlaygroundText hears it change (typing, and the widget
// clearing it once added) and nothing is logged for it. How many entries it draws before a Counter
// counts the rest, the `maxVisible` extra. Its label, helper, size and states from their controls,
// a cleared label or helper left out, mandatory while `mandatory` holds any text, as Text Input's.
// It shows Figma's "Add items…" while empty. As the web's (stories/playground/token-input.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'typing.dart';

/// The entries a comma-separated text holds, trimmed, the empty ones dropped.
List<String> _entriesOf(String text) => [
  for (final entry in text.split(','))
    if (entry.trim().isNotEmpty) entry.trim(),
];

final tokenInputPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarTokenInputSize.values);
    final enabled = !p.flag('disabled');
    final error = p.flag('error');
    final readonly = p.flag('readonly');
    final label = p.words('label');
    final mandatory = p.words('mandatory') != null;
    final helper = p.words('helper');
    final maxVisible = p.whole('maxVisible');
    final tokens = _entriesOf(p.text('tokens'));
    return PlaygroundText(
      text: p.text('draft'),
      onChanged: (draft) => p.set('draft', draft),
      builder: (context, controller) => SolarTokenInput(
        size: size,
        enabled: enabled,
        error: error,
        readonly: readonly,
        label: label,
        mandatory: mandatory,
        helper: helper,
        maxVisible: maxVisible,
        placeholder: 'Add items…',
        value: tokens,
        onChanged: (value) {
          final entries = _entriesOf(value.join(','));
          p.set('tokens', entries.join(', '));
          p.log('onChanged', entries);
        },
        controller: controller,
      ),
    );
  },
);
