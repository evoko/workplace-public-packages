// Number Input's Playground: its number the `value` extra, as words, so that an empty field (the
// widget's null) is '' and the control holds what the field holds: typing or a step sets it to the
// number's words, and words from the panel that are no number give an empty field. Its range the
// `min` and `max` extras, to which its steppers clamp it (typing is not clamped: validating is the
// app's, on blur). Its label is shown by the `label` toggle, its words the `label text` extra (the
// IR holds the label as a toggle alone), a cleared one left out; mandatory while `mandatory` holds
// any text, as Text Input's; its helper, size, stepper and states from their controls. The widget
// keeps its own words, and takes the number, so no PlaygroundText. As the web's
// (stories/playground/number-input.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// A number as the control holds it: its words, a whole one without a point; '' for none.
String _wordsOf(num? n) => n == null
    ? ''
    : (n == n.roundToDouble() ? n.round().toString() : n.toString());

/// The control's words as the number they say, or null where they say none.
num? _numberOf(String words) {
  final n = num.tryParse(words.trim());
  return n != null && n.isFinite ? n : null;
}

final numberInputPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final words = p.words('label text');
    return SolarNumberInput(
      size: p.choice('size', SolarNumberInputSize.values),
      enabled: !p.flag('disabled'),
      error: p.flag('error'),
      stepper: p.choice('stepper', SolarNumberInputStepper.values),
      label: p.child('label').shown ? words : null,
      mandatory: p.words('mandatory') != null,
      helper: p.words('helper'),
      min: p.whole('min'),
      max: p.whole('max'),
      value: _numberOf(p.text('value')),
      onChanged: (value) {
        p.set('value', _wordsOf(value));
        p.log('onChanged', value);
      },
    );
  },
);
