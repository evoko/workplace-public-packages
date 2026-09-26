// Event Row's Playground: its words from their controls; who did it, shown by the `leading` toggle,
// a sample person's SolarAvatar, md. Its More control stands for the More menu, since the widget
// draws its own icon: `_none` hides it, else it offers the sample actions (cards.dart). Pressable,
// as an app's feed row is: its press is logged. As the web's (stories/playground/event-row.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';

final eventRowPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarEventRow(
    leading: p.child('leading').shown
        ? const SolarAvatar(
            size: SolarAvatarSize.md,
            type: SolarAvatarType.text,
            name: 'Dana Scully',
          )
        : null,
    title: p.text('title'),
    product: p.text('productTag'),
    meta: p.text('metaText'),
    timestamp: p.text('timestamp'),
    moreItems: p.icon('more') != null ? sampleMoreItems(p) : null,
    onPressed: () => p.log('onPressed'),
  ),
);
