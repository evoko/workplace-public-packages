// Skeleton's Playground: its type and size, at Figma's size for them. As the web's
// (stories/playground/skeleton.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final skeletonPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarSkeleton(
    type: p.choice('type', SolarSkeletonType.values),
    size: p.choice('size', SolarSkeletonSize.values),
  ),
);
