import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const listItemCase = VisualCase(build: buildListItem, measure: measureListItem);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its avatar is an Avatar,
/// measured as that check measures one.
Layers measureListItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarListItem), 'listItem');
