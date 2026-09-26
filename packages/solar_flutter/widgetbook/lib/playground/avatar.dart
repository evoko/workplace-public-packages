// Avatar's Playground: its size, type and colour (none, SOLAR's neutral avatar, at first); named by
// the `name` extra, whose initials it shows unless `initials` holds the app's own; a photo or logo
// avatar shows the sample picture while `picture` is on. As the web's
// (stories/playground/avatar.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'core.dart';
import 'playground.dart';
import 'samples.dart';

final avatarPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarAvatar(
    size: p.choice('size', SolarAvatarSize.values),
    type: p.choice('type', SolarAvatarType.values),
    color: colorOf(p.value('color')),
    name: p.text('name'),
    initials: p.words('initials'),
    image: p.flag('picture') ? samplePicture : null,
  ),
);
