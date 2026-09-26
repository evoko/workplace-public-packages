// PropertyList's Playground: in a card or not from its control; its items, three sample
// PropertyRows (a status Tag, a setting's Toggle, an action's Button), shown by the `items` toggle
// (off, the list is empty). Their values are the entity's, which the Playground holds none of: a
// switch and a press are logged, and kept by none. As the web's
// (stories/playground/property-list.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final propertyListPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarPropertyList(
    inCard: p.flag('inCard'),
    children: [
      if (p.flag('items')) ...[
        const SolarPropertyRow(
          label: 'Status',
          tag: SolarTag(status: SolarTagStatus.success, label: 'Online'),
        ),
        SolarPropertyRow(
          label: 'Alerts',
          description: 'Email me when it goes offline',
          toggle: SolarToggle(
            onChanged: (on) => p.log('onChanged', on),
            semanticLabel: 'Alerts',
          ),
        ),
        SolarPropertyRow(
          label: 'Firmware',
          description: 'Version 2.4.1',
          button: SolarButton(
            size: SolarButtonSize.md,
            prio: SolarButtonPrio.secondary,
            onPressed: () => p.log('onPressed', 'Update'),
            child: const Text('Update'),
          ),
        ),
      ],
    ],
  ),
);
