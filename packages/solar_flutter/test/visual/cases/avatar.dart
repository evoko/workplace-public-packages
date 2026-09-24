import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const avatarCase = VisualCase(build: buildAvatar, measure: measureAvatar);

/// The avatar and its initials, as SolarLayers keyed them (layers.dart).
Layers measureAvatar(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarAvatar), 'avatar');
