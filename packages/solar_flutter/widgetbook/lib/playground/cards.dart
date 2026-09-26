// What the cards' Playground builders share: a card's More menu, its sample actions each logged
// with its words as it is chosen (`onSelected`, the item's callback), as an app's menu acts; and the
// stand-in for an app's icon. As the web's (stories/playground/cards.ts).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

List<SolarCardMoreItem> sampleMoreItems(SolarPlayground p) => [
  for (final label in sampleMoreActions)
    SolarCardMoreItem(
      label: label,
      onSelected: () => p.log('onSelected', label),
    ),
];

/// An app's icon: the sample picture, since solar_flutter has no App Icons (the web's is
/// Workplace's, from @bwp-web/assets).
Widget sampleAppIcon() => Image(image: samplePicture, fit: BoxFit.cover);
