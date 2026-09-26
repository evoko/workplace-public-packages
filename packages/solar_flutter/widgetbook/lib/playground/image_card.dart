// Image Card's Playground: its words and states from their controls, a cleared one left out; the
// sample picture (samples.dart) fills a filled one's image; its More menu the sample actions
// (cards.dart). Its Checkbox, shown while it is selected and while the pointer or the keyboard is on
// it, selects it, as an app's grid does: `selected` is set, and the change logged. Pressable, as an
// app's image is (to open it): its press is logged. As the web's (stories/playground/image-card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';
import 'samples.dart';

final imageCardPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarImageCard(
    filled: p.flag('filled'),
    selected: p.flag('selected'),
    title: p.words('title'),
    subtitle: p.words('subtitle'),
    label: p.words('label'),
    image: samplePicture,
    onSelectedChanged: (selected) {
      p.set('selected', selected);
      p.log('onSelectedChanged', selected);
    },
    moreItems: sampleMoreItems(p),
    onPressed: () => p.log('onPressed'),
  ),
);
