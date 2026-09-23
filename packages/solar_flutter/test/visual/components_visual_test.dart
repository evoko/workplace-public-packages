// Flutter visual parity: every variant of every generated component, pumped as the real widget,
// the platform state forced through a WidgetStatesController, and what is painted read back --
// the face's decoration, the border, the painted text style, the icons' theme, the laid-out
// geometry -- and compared with what Figma draws (spec/verify/<name>.json). Native widget tests,
// not Flutter web. Excused entries are reported to build/visual/<name>-gaps.json, not compared.
//
// Generic over the components (harness.dart); what is particular to one is its case, cases/.

import 'package:flutter_test/flutter_test.dart';

import 'cases/cases.dart';
import 'compare.dart';
import 'harness.dart';

final oracles = loadOracles();

/// `Icon Button` to `icon_button`, as the reports are named.
String fileOf(String component) =>
    component.toLowerCase().replaceAll(RegExp('[^a-z0-9]+'), '_');

void main() {
  test('every generated component has a visual case', () {
    expect(oracles.keys, isNotEmpty);
    for (final component in oracles.keys) {
      expect(
        cases,
        contains(component),
        reason:
            '$component has an oracle and no case: add test/visual/cases/${fileOf(component)}.dart and register it in cases.dart',
      );
    }
  });

  for (final component in oracles.keys.where(cases.containsKey)) {
    testWidgets('$component draws what Figma draws, in every variant', (
      tester,
    ) async {
      final (failures, gaps) = await check(tester, component, cases, oracles);
      report('${fileOf(component)}-gaps', gaps);
      report('${fileOf(component)}-failures', failures);
      expect(failures, isEmpty, reason: failures.join('\n'));
      // Every excused entry was reached and measured.
      // Every excused entry was reached and measured, but for a layer the variant does not draw.
      expect(gaps, hasLength(reachableExcuses(oracles[component]!)));
    });
  }

  testWidgets(
    'a difference nobody decided on fails, naming the variant and the property',
    (tester) async {
      const hovered = 'size=md, prio=secondary, state=hover, danger=false';
      // An oracle that says secondary hover is red: the painted recipe must now differ from it.
      final broken = loadOracle('button');
      final v = (broken['variants'] as List)
          .cast<Map<String, dynamic>>()
          .firstWhere((v) => v['figma'] == hovered);
      (v['layers']['root'] as Map<String, dynamic>)['background'] = '#ff0000';
      final (failures, _) = await check(
        tester,
        'Button',
        cases,
        {...oracles, 'Button': broken},
        only: {hovered},
      );
      expect(failures.map((f) => '${f.variant} ${f.layer}.${f.property}'), [
        '$hovered root.background',
      ]);
    },
  );

  testWidgets(
    'a composed child is checked against its own oracle, naming the layer inside it',
    (tester) async {
      const loading = 'size=md, prio=primary, state=loading, danger=false';
      final button = (oracles['Button']!['variants'] as List)
          .cast<Map<String, dynamic>>()
          .firstWhere((v) => v['figma'] == loading);
      final wanted =
          (button['layers']['spinner'] as Map)['variant']
              as Map<String, dynamic>;
      // A Spinner oracle that says this variant's track is red.
      final broken = loadOracle('spinner');
      final track =
          childVariant(broken, wanted)['layers']['track']
              as Map<String, dynamic>;
      track['borderColor'] = '#ff0000';
      final (failures, _) = await check(
        tester,
        'Button',
        cases,
        {...oracles, 'Spinner': broken},
        only: {loading},
      );
      expect(failures.map((f) => '${f.variant} ${f.layer}.${f.property}'), [
        '$loading spinner.track.borderColor',
      ]);
    },
  );
}
