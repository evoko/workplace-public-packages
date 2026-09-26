// Text Area's Playground: its words the `value` extra, which typing sets (typing.dart keeps the
// field's controller in step); its label, helper and size from their controls, a cleared label or
// helper left out, and mandatory while `mandatory` holds any text (the star's layer), as Text
// Input's. The footer's toggle shows or hides the helper and the count together, as Figma's does.
// The count shows while `charCount` holds words, which say what it counts against: Figma's "0/500"
// is a count of at most 500, the number after the slash (none, the count alone). Its buttons are
// SOLAR Icon Buttons at sm, shown by their toggles: the call to action a primary send, disabled
// while there is nothing to send, and the attachment a secondary attach; a tap on either is logged
// with its slot. As the web's (stories/playground/text-area.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'typing.dart';

/// The most characters the count's words name, after a slash ("0/500"), or none.
int? _maxOf(String? count) {
  final max = RegExp(r'/\s*(\d+)\s*$').firstMatch(count ?? '')?.group(1);
  return max == null ? null : int.parse(max);
}

final textAreaPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarTextAreaSize.values);
    final enabled = !p.flag('disabled');
    final error = p.flag('error');
    final label = p.words('label');
    final mandatory = p.words('mandatory') != null;
    final value = p.text('value');
    final footer = p.flag('footer');
    final helper = p.words('helper');
    final count = p.words('charCount');
    final cta = p.child('cta').shown;
    final attachment = p.child('attachment').shown;
    return PlaygroundText(
      text: value,
      builder: (context, controller) => SolarTextArea(
        size: size,
        enabled: enabled,
        error: error,
        label: label,
        mandatory: mandatory,
        helper: footer ? helper : null,
        charCount: footer && count != null,
        maxLength: footer ? _maxOf(count) : null,
        cta: cta
            ? SolarIconButton(
                size: SolarIconButtonSize.sm,
                shape: SolarIconButtonShape.square,
                prio: SolarIconButtonPrio.primary,
                icon: const SolarIcon(SolarIcons.sendOutline),
                semanticLabel: 'Send',
                onPressed: !enabled || value.isEmpty
                    ? null
                    : () => p.log('onPressed', 'cta'),
              )
            : null,
        attachment: attachment
            ? SolarIconButton(
                size: SolarIconButtonSize.sm,
                shape: SolarIconButtonShape.square,
                prio: SolarIconButtonPrio.secondary,
                icon: const SolarIcon(SolarIcons.attachmentOutline),
                semanticLabel: 'Attach',
                onPressed: enabled
                    ? () => p.log('onPressed', 'attachment')
                    : null,
              )
            : null,
        placeholder: 'Enter text...',
        controller: controller,
        onChanged: (text) {
          p.set('value', text);
          p.log('onChanged', text);
        },
      ),
    );
  },
);
