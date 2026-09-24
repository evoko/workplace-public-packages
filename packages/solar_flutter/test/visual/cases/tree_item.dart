import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const treeItemCase = VisualCase(build: buildTreeItem, measure: measureTreeItem);

/// The row and its parts, as SolarLayers keyed them (layers.dart); its indent, checkbox, status,
/// tag and counter each measured as its own check measures one.
Layers measureTreeItem(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarTreeItem), 'treeItem');
