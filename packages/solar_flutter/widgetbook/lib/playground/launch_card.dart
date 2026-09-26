// Launch Card's Playground: its words from their controls, a cleared body left out; its picture the
// sample (samples.dart), shown by the `image` toggle; its app's icon, shown by `appIcon`, the sample
// picture (cards.dart); its Tag the `tag label` words, shown by `tag`. Its favourite, a
// SolarIconButton (sm, round, tertiary), sits on the picture, shown by `favourite`, or beside the
// name where there is none, shown by `favouriteNoImage`. Its actions, shown by `actions`, are a
// Button Group of Learn more and Open, as the README composes them. Every tap is logged, a Button's
// with its words; pressable, as an app's launcher is: its press is logged. As the web's
// (stories/playground/launch-card.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';
import 'samples.dart';

final launchCardPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final image = p.child('image').shown;
    final onImage = p.child('favourite').shown;
    final beside = p.child('favouriteNoImage').shown;
    final tag = p.child('tag');
    final tagText = tag.text ?? '';
    return SolarLaunchCard(
      name: p.text('name'),
      body: p.words('bodyText'),
      appIcon: p.child('appIcon').shown ? sampleAppIcon() : null,
      tag: tag.shown && tagText.isNotEmpty ? tagText : null,
      image: image ? samplePicture : null,
      favourite: (image ? onImage : beside)
          ? SolarIconButton(
              size: SolarIconButtonSize.sm,
              shape: SolarIconButtonShape.round,
              prio: SolarIconButtonPrio.tertiary,
              icon: const SolarIcon(SolarIcons.starOutline),
              semanticLabel: 'Favourite',
              onPressed: () => p.log('onPressed', 'favourite'),
            )
          : null,
      actions: p.child('actions').shown
          ? SolarButtonGroup(
              children: [
                SolarButton(
                  prio: SolarButtonPrio.secondary,
                  onPressed: () => p.log('onPressed', 'Learn more'),
                  child: const Text('Learn more'),
                ),
                SolarButton(
                  onPressed: () => p.log('onPressed', 'Open'),
                  child: const Text('Open'),
                ),
              ],
            )
          : null,
      onPressed: () => p.log('onPressed'),
    );
  },
);
