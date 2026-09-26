// Password Input's Playground: its words the `value` extra, which typing sets (typing.dart keeps the
// field's controller in step; logged as Text Input's are: a sample the tester types, which the
// `value` control shows anyway); its size and states from their controls. Its label is shown by the
// `label` toggle, its words the `label text` extra (the IR holds the label as a toggle alone), a
// cleared one left out; mandatory while `mandatory` holds any text, as Text Input's. The helper and
// the forgot-password link from their controls, a cleared one left out; a tap on the link, which
// the app points at its reset flow, is logged, as is the keyboard's submit. The eye shows and
// hides the words inside the widget, which gives no callback, so nothing is logged for it. As the
// web's (stories/playground/password-input.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'typing.dart';

final passwordInputPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarPasswordInputSize.values);
    final enabled = !p.flag('disabled');
    final error = p.flag('error');
    final words = p.words('label text');
    final label = p.child('label').shown ? words : null;
    final mandatory = p.words('mandatory') != null;
    final helper = p.words('helper');
    final forgotPassword = p.words('forgotPassword');
    return PlaygroundText(
      text: p.text('value'),
      builder: (context, controller) => SolarPasswordInput(
        size: size,
        enabled: enabled,
        error: error,
        label: label,
        mandatory: mandatory,
        helper: helper,
        forgotPassword: forgotPassword,
        onForgotPassword: () => p.log('onForgotPassword'),
        placeholder: '•••••••••',
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
