// Action Card's Playground: its words, icon and status from their controls; its content, the
// `description` words, shown by the `content` toggle (a cleared description left out). Its calls to
// action, shown by the `cta` toggle, are SolarButtons, sm, as Figma draws them, each shown by its
// own toggle in its words: the primary a secondary once `done` and a danger primary in `danger`, as
// Figma draws it; the widget keeps the primary alone in either. Their taps are logged with the slot
// (`onPressed: "primaryCTA"`); its More menu offers the sample actions (cards.dart). Pressable, as an
// app's card is: its press is logged. As the web's (stories/playground/action-card.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';

final actionCardPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final status = p.choice('status', SolarActionCardStatus.values);
    final cta = p.child('cta').shown;
    final primary = p.child('primaryCTA');
    final secondary = p.child('secondaryCTA');
    final description = p.words('description');
    return SolarActionCard(
      status: status,
      icon: p.icon('icon'),
      title: p.text('title'),
      description: p.flag('content') ? description : null,
      primaryAction: cta && primary.shown
          ? SolarButton(
              size: SolarButtonSize.sm,
              prio: status == SolarActionCardStatus.done
                  ? SolarButtonPrio.secondary
                  : SolarButtonPrio.primary,
              danger: status == SolarActionCardStatus.danger,
              onPressed: () => p.log('onPressed', 'primaryCTA'),
              child: Text(primary.text ?? ''),
            )
          : null,
      secondaryAction: cta && secondary.shown
          ? SolarButton(
              size: SolarButtonSize.sm,
              prio: SolarButtonPrio.secondary,
              onPressed: () => p.log('onPressed', 'secondaryCTA'),
              child: Text(secondary.text ?? ''),
            )
          : null,
      moreItems: sampleMoreItems(p),
      onPressed: () => p.log('onPressed'),
    );
  },
);
