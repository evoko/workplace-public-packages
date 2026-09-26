// Device Card's Playground: its words, type and state from their controls, a cleared one left out;
// its health a Tag of the `tag` extra's words (cleared, none); its action, shown by the `button`
// toggle, a SolarButton, sm and secondary, its tap logged with the slot (`onPressed: "button"`). A
// batch's devices, shown by the `devices` toggle, are a SolarDropdown, md, of sample devices:
// choosing one goes to it, as an app's does, so it is logged and not kept. Pressable, as an app's
// card is: its press is logged. As the web's (stories/playground/device-card.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final deviceCardPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final button = p.child('button');
    return SolarDeviceCard(
      loading: p.flag('loading'),
      type: p.choice('type', SolarDeviceCardType.values),
      name: p.text('name'),
      details: p.words('details'),
      count: p.words('count'),
      tag: p.words('tag'),
      action: button.shown
          ? SolarButton(
              size: SolarButtonSize.sm,
              prio: SolarButtonPrio.secondary,
              onPressed: () => p.log('onPressed', 'button'),
              child: Text(button.text ?? ''),
            )
          : null,
      devices: p.child('devices').shown
          ? SolarDropdown<SampleOption>(
              size: SolarDropdownSize.md,
              placeholder: 'Devices',
              value: null,
              options: [
                for (final o in sampleOptions)
                  SolarDropdownOption(value: o, label: sampleOptionWords(o)),
              ],
              onChanged: (o) => p.log('onChanged', sampleOptionWords(o)),
            )
          : null,
      onPressed: () => p.log('onPressed'),
    );
  },
);
