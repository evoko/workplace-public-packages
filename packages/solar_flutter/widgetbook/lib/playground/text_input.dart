// Text Input's Playground: its words the `value` extra, which typing sets (typing.dart keeps the
// field's controller in step); its label, helper and icons from their controls, a cleared label or
// helper left out. Figma's `mandatory` is the star's text layer, so the field is mandatory while
// that control holds any text. As the web's (stories/playground/text-input.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'typing.dart';

final textInputPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarTextInputSize.values);
    final enabled = !p.flag('disabled');
    final error = p.flag('error');
    final label = p.words('label');
    final mandatory = p.words('mandatory') != null;
    final helper = p.words('helper');
    final leadingIcon = p.icon('leadingIcon');
    final trailingIcon = p.icon('trailingIcon');
    return PlaygroundText(
      text: p.text('value'),
      builder: (context, controller) => SolarTextInput(
        size: size,
        enabled: enabled,
        error: error,
        label: label,
        mandatory: mandatory,
        helper: helper,
        leadingIcon: leadingIcon,
        trailingIcon: trailingIcon,
        placeholder: 'Text',
        controller: controller,
        onChanged: (text) {
          p.set('value', text);
          p.log('onChanged', text);
        },
        onSubmitted: (text) => p.log('onSubmitted', text),
      ),
    );
  },
);
