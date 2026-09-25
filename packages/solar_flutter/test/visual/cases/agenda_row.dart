import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import '../layers.dart';

const agendaRowCase = VisualCase(
  build: buildAgendaRow,
  measure: measureAgendaRow,
);

/// The row and its parts, as SolarLayers keyed them (layers.dart), its attendee Avatar as the
/// Avatar check measures one.
Layers measureAgendaRow(WidgetTester tester) =>
    measureLayers(tester, find.byType(SolarAgendaRow), 'agendaRow');
