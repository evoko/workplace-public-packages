// Card's Playground: its words, icon, status and states from their controls, a cleared helper left
// out; its Tag the `tag label` words, shown by the `tag` toggle; its content a neutral placeholder,
// a SolarSkeleton, shown by the `content` toggle. Its More control stands for the More menu, since
// the widget draws its own icon: `_none` hides it, else it offers the sample actions (cards.dart).
// Pressable, as an app's card is: its press is logged. As the web's (stories/playground/card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';

final cardPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final tag = p.child('tag');
    final tagText = tag.text ?? '';
    return SolarCard(
      disabled: p.flag('disabled'),
      status: p.choice('status', SolarCardStatus.values),
      loading: p.flag('loading'),
      title: p.text('title'),
      icon: p.icon('icon'),
      helper: p.words('helper'),
      tag: tag.shown && tagText.isNotEmpty ? tagText : null,
      moreItems: p.icon('more') != null ? sampleMoreItems(p) : null,
      onPressed: () => p.log('onPressed'),
      children: [if (p.flag('content')) const SolarSkeleton()],
    );
  },
);
