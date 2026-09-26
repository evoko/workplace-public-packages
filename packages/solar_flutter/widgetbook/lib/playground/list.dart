// List's Playground: in a card or not from its control; its items, three sample ListItems with a
// Divider between each two, shown by the `items` toggle (off, the list is empty). Each row's tap is
// logged with its words; which row is current is the app's, and none is here. As the web's
// (stories/playground/list.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final listPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarList(
    inCard: p.flag('inCard'),
    children: [
      if (p.flag('items'))
        for (final row in sampleRows)
          SolarListItem(label: row, onPressed: () => p.log('onPressed', row)),
    ],
  ),
);
