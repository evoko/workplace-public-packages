// Autocomplete's Playground: five sample suggestions (samples.dart), which the words typed filter.
// The words in the field are the `value` extra, which typing sets and choosing a suggestion fills:
// typing.dart's PlaygroundText keeps them in the controller, beside the focus the widget takes
// with it. Typing (`onChanged`) and choosing (`onSelected`) are logged. Its label is shown by the
// `label` toggle, in the `label text` extra's words; its helper, icons, size and states from their
// controls, a cleared helper left out, mandatory while `mandatory` holds any text. It shows Figma's
// "Search..." while empty. As the web's (stories/playground/autocomplete.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';
import 'typing.dart';

final autocompletePlayground = SolarPlaygroundBuilder(
  build: (p) {
    final label = p.flag('label') ? p.text('label text') : '';
    return PlaygroundAutocomplete(
      p: p,
      size: p.choice('size', SolarAutocompleteSize.values),
      enabled: !p.flag('disabled'),
      error: p.flag('error'),
      label: label.isEmpty ? null : label,
      mandatory: p.words('mandatory') != null,
      helper: p.words('helper'),
      leadingIcon: p.icon('leadingIcon'),
      trailingIcon: p.icon('trailingIcon'),
    );
  },
);

/// The Autocomplete over the `value` extra, with the focus it keeps beside its controller; where
/// [autofocus] holds, it takes the focus as it is first built, so its suggestions show for the
/// words it holds (Autocomplete Open).
class PlaygroundAutocomplete extends StatefulWidget {
  const PlaygroundAutocomplete({
    super.key,
    required this.p,
    this.size = SolarAutocompleteSize.md,
    this.enabled = true,
    this.error = false,
    this.label,
    this.mandatory = false,
    this.helper,
    this.leadingIcon,
    this.trailingIcon,
    this.autofocus = false,
  });

  final SolarPlayground p;
  final SolarAutocompleteSize size;
  final bool enabled, error, mandatory, autofocus;
  final String? label, helper;
  final Widget? leadingIcon, trailingIcon;

  @override
  State<PlaygroundAutocomplete> createState() => _PlaygroundAutocompleteState();
}

class _PlaygroundAutocompleteState extends State<PlaygroundAutocomplete> {
  final _focus = FocusNode();

  @override
  void dispose() {
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    return PlaygroundText(
      text: p.text('value'),
      // Typing, and a suggestion chosen, change the controller's words.
      onChanged: (words) => p.set('value', words),
      builder: (context, controller) => SolarAutocomplete<String>(
        controller: controller,
        focusNode: _focus,
        autofocus: widget.autofocus,
        size: widget.size,
        enabled: widget.enabled,
        error: widget.error,
        label: widget.label,
        mandatory: widget.mandatory,
        helper: widget.helper,
        leadingIcon: widget.leadingIcon,
        trailingIcon: widget.trailingIcon,
        placeholder: 'Search...',
        options: sampleCities,
        onChanged: (words) => p.log('onChanged', words),
        onSelected: (city) => p.log('onSelected', city),
      ),
    );
  }
}
