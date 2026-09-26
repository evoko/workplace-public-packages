// PIN Input's Playground: its digits the `value` extra, which typing sets (typing.dart keeps the
// field's controller in step), and its `length` extra (4 to 6). The widget takes digits only, as
// many as the code has, so the builder gives it the digits the control's words hold, up to the
// length, and writes them back where the words held more (a letter from the panel, or a code longer
// than a shorter length): the control shows what the cells hold. Every change is logged, and the
// code once complete. Its label is shown by the `label` toggle, its words the `label text` extra
// (the IR holds the label as a toggle alone), a cleared one left out; mandatory while `mandatory`
// holds any text, as Text Input's; its helper, error message (shown in error), size and states from
// their controls. As the web's (stories/playground/pin-input.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'typing.dart';

final pinInputPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final length = p.whole('length');
    final words = p.text('value');
    final digits = words.replaceAll(RegExp(r'\D'), '');
    final code = digits.length > length ? digits.substring(0, length) : digits;
    // The words from the panel, as the cells hold them, once this frame is drawn.
    if (code != words) {
      WidgetsBinding.instance.addPostFrameCallback((_) => p.set('value', code));
    }
    final size = p.choice('size', SolarPINInputSize.values);
    final enabled = !p.flag('disabled');
    final error = p.flag('error');
    final text = p.words('label text');
    final label = p.child('label').shown ? text : null;
    final mandatory = p.words('mandatory') != null;
    final helper = p.words('helper');
    final errorMessage = p.words('errorMessage');
    return PlaygroundText(
      text: code,
      builder: (context, controller) => SolarPINInput(
        size: size,
        enabled: enabled,
        error: error,
        label: label,
        mandatory: mandatory,
        helper: helper,
        errorMessage: errorMessage,
        length: length,
        controller: controller,
        onChanged: (value) {
          p.set('value', value);
          p.log('onChanged', value);
        },
        onCompleted: (value) => p.log('onCompleted', value),
      ),
    );
  },
);
