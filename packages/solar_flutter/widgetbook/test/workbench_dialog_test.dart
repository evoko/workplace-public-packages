// The Inspect dialog's preview and keys, which are Flutter's own (the shared scenarios,
// workbench_scenarios_test.dart, cover the rest): the outline sits on the selected layer's keyed
// widget, drawn large, and follows it through a resize; a tap on a part of the component selects
// its layer; a component Material draws (Button) names the selected layer beside the preview and
// takes no pointing; Escape closes the dialog but, in an open Select, the Select alone; and the
// focus goes back to Inspect when the dialog closes. Against the bar (lib/workbench/bar.dart) and a fake
// service answering with bar-scenarios.json's fixtures, each component drawn from its own oracle.

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/main.dart' show solarTheme;
import 'package:solar_widgetbook/workbench/bar.dart';
import 'package:solar_widgetbook/workbench/client.dart';

import 'helpers.dart';

const _scenarios = '../../codegen/src/workbench/bar-scenarios.json';

/// A fixture of bar-scenarios.json, its `$fixture` references resolved.
Object? _fixture(String name) {
  final file =
      jsonDecode(File(_scenarios).readAsStringSync()) as Map<String, dynamic>;
  final fixtures = file['fixtures'] as Map<String, dynamic>;
  Object? resolve(Object? v) {
    if (v is List) return [for (final x in v) resolve(x)];
    if (v is! Map) return v;
    return {
      if (v[r'$fixture'] case final String f) ...(resolve(fixtures[f]) as Map),
      for (final e in v.entries)
        if (e.key != r'$fixture') e.key: resolve(e.value),
    };
  }

  return resolve(fixtures[name]);
}

Map<String, dynamic> _oracle(String file) =>
    jsonDecode(File('../../../spec/verify/$file').readAsStringSync())
        as Map<String, dynamic>;

/// A Semantics widget with exactly this label.
Finder _labelled(String label) => find.byWidgetPredicate(
  (w) => w is Semantics && w.properties.label == label,
  description: 'Semantics "$label"',
);

Finder get _preview => _labelled('Preview');
Finder get _outline => _labelled('Selected layer outline');

/// The widget keyed `<prefix>.<layer>` in the preview, the outermost.
Finder _keyed(String key) =>
    find.descendant(of: _preview, matching: find.byKey(ValueKey(key))).first;

/// The tree item of [layer], whose label starts with its name.
Finder _item(String layer) => find.byWidgetPredicate(
  (w) =>
      w is SolarTreeItem && (w.label == layer || w.label.startsWith('$layer ')),
);

bool _selected(WidgetTester tester, String layer) =>
    tester.widget<SolarTreeItem>(_item(layer)).selected;

/// Pumps [component]'s bar in the web suite's room (or [window]), its service answering [status]
/// and [inspection], and opens Inspect. Where [pane], the bar is drawn as Widgetbook draws a use
/// case: in a pane beside a sidebar, under a navigator and a theme of its own.
Future<void> _open(
  WidgetTester tester, {
  required String component,
  required String status,
  required String inspection,
  required String oracle,
  Size window = const Size(1280, 720),
  bool pane = false,
}) async {
  tester.view
    ..physicalSize = window
    ..devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final never = Completer<http.Response>();
  final client = MockClient((r) async {
    final body = switch (r.url.path) {
      '/health' => {'service': 'solar-workbench'},
      '/status' => _fixture(status),
      '/component' => {
        ...(_fixture(inspection)! as Map),
        'variant': int.parse(r.url.queryParameters['variant']!),
      },
      // The events are long-polled; none comes.
      '/events' => null,
      _ => throw StateError('no route ${r.url.path}'),
    };
    if (body == null) return never.future;
    return http.Response.bytes(
      utf8.encode(jsonEncode(body)),
      200,
      headers: {'content-type': 'application/json'},
    );
  });
  final bar = WorkbenchBar(
    component: component,
    platform: 'flutter',
    client: HttpWorkbenchClient('http://workbench.test', client: client),
    oracle: _oracle(oracle),
  );
  final theme = solarTheme(SolarTheme.light, Brightness.light);
  await tester.pumpWidget(
    pane
        ? MaterialApp(
            home: Row(
              children: [
                const Spacer(),
                Expanded(
                  flex: 2,
                  child: Theme(
                    data: theme,
                    child: Navigator(
                      onGenerateRoute: (_) => MaterialPageRoute<void>(
                        builder: (_) => Scaffold(body: bar),
                      ),
                    ),
                  ),
                ),
                const Spacer(),
              ],
            ),
          )
        : MaterialApp(
            theme: theme,
            home: Scaffold(body: bar),
          ),
  );
  await tester.pumpAndSettle();
  await tester.tap(find.text('Inspect'));
  await tester.pumpAndSettle();
  expect(_labelled('Inspect $component'), findsOneWidget);
}

void _expectOn(WidgetTester tester, Finder layer) {
  final a = tester.getRect(_outline);
  final b = tester.getRect(layer);
  expect(
    [
      a.left - b.left,
      a.top - b.top,
      a.width - b.width,
      a.height - b.height,
    ].every((d) => d.abs() <= 1),
    isTrue,
    reason: 'the outline $a sits on $b',
  );
}

void main() {
  setUpAll(loadBundledFonts);

  Future<void> openOptionCard(WidgetTester tester) => _open(
    tester,
    component: 'Option Card',
    status: 'status-option-card',
    inspection: 'option-card-inspection',
    oracle: 'option-card.json',
  );

  Future<void> openButton(WidgetTester tester) => _open(
    tester,
    component: 'Button',
    status: 'status',
    inspection: 'inspection',
    oracle: 'button.json',
  );

  testWidgets("on Option Card the outline's rect is the keyed layer's", (
    tester,
  ) async {
    await openOptionCard(tester);
    expect(_outline, findsOneWidget);
    _expectOn(tester, _keyed('optionCard.root'));
    await tester.tap(_item('container'));
    await tester.pumpAndSettle();
    _expectOn(tester, _keyed('optionCard.container'));
    await tester.tap(_item('iconPlus'));
    await tester.pumpAndSettle();
    _expectOn(tester, _keyed('optionCard.iconPlus'));
  });

  testWidgets(
    'on Option Card the preview is drawn large, and the outline follows a resize',
    (tester) async {
      await openOptionCard(tester);
      // The builder draws it 240 wide; the preview scales it to its pane.
      expect(tester.getRect(_keyed('optionCard.root')).width, greaterThan(240));
      await tester.tap(_item('container'));
      await tester.pumpAndSettle();
      final before = tester.getRect(_keyed('optionCard.container'));
      tester.view.physicalSize = const Size(1024, 640);
      await tester.pumpAndSettle();
      expect(
        tester.getRect(_keyed('optionCard.container')),
        isNot(before),
        reason: 'the resize moved the layer',
      );
      _expectOn(tester, _keyed('optionCard.container'));
    },
  );

  testWidgets('on Option Card a tap on a part selects its layer', (
    tester,
  ) async {
    await openOptionCard(tester);
    await tester.tapAt(tester.getCenter(_keyed('optionCard.label')));
    await tester.pumpAndSettle();
    expect(_selected(tester, 'label'), isTrue);
    expect(_selected(tester, 'root'), isFalse);
    _expectOn(tester, _keyed('optionCard.label'));
    // The Plus inside the container: the innermost layer under the tap.
    await tester.tapAt(tester.getCenter(_keyed('optionCard.iconPlus')));
    await tester.pumpAndSettle();
    expect(_selected(tester, 'iconPlus'), isTrue);
    _expectOn(tester, _keyed('optionCard.iconPlus'));
  });

  testWidgets(
    'on Button the selected layer is named beside the preview, and a tap selects nothing',
    (tester) async {
      await openButton(tester);
      expect(_outline, findsNothing);
      expect(
        find.descendant(of: _preview, matching: find.textContaining('root:')),
        findsOneWidget,
      );
      await tester.tap(_item('label'));
      await tester.pumpAndSettle();
      expect(
        find.descendant(of: _preview, matching: find.textContaining('label:')),
        findsOneWidget,
      );
      // The label's words, where Button draws them: nothing is selected, nothing outlined, and the
      // button drawn never sees the tap.
      final words = find.descendant(of: _preview, matching: find.text('Label'));
      expect(words, findsOneWidget);
      await tester.tapAt(tester.getCenter(words));
      await tester.pumpAndSettle();
      await tester.tapAt(tester.getTopLeft(_preview) + const Offset(1, 1));
      await tester.pumpAndSettle();
      expect(_selected(tester, 'label'), isTrue);
      expect(_selected(tester, 'root'), isFalse);
      expect(_outline, findsNothing);
    },
  );

  testWidgets('Escape closes the dialog; in an open Select, the Select alone', (
    tester,
  ) async {
    await openButton(tester);
    final axis = find.byWidgetPredicate(
      (w) => w is SolarSelect && w.label == 'size',
    );
    await tester.tap(
      find.descendant(of: axis, matching: find.byType(SolarPressable)),
    );
    await tester.pumpAndSettle();
    expect(find.byType(SolarDropdownItem), findsWidgets);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(find.byType(SolarDropdownItem), findsNothing);
    expect(_labelled('Inspect Button'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(_labelled('Inspect Button'), findsNothing);
    // The bar is back, Inspect offered again, and focused.
    expect(find.text('Inspect'), findsOneWidget);
    expect(FocusManager.instance.primaryFocus?.debugLabel, 'Inspect');
  });

  testWidgets('at 1440 × 900 in a Widgetbook pane, the dialog covers the window, and no property or layer '
      'name breaks or is cut', (tester) async {
    const window = Size(1440, 900);
    await _open(
      tester,
      component: 'Button',
      status: 'status',
      inspection: 'inspection',
      oracle: 'button.json',
      window: window,
      pane: true,
    );
    expect(tester.getRect(_labelled('Inspect Button')), Offset.zero & window);
    expect(tester.getRect(find.byType(SolarScrim)), Offset.zero & window);

    /// [text] laid out whole on one line: its words fit their box, none cut or wrapped.
    void oneLine(Finder text) {
      for (final e in text.evaluate()) {
        final p = e.renderObject! as RenderParagraph;
        final words = p.text.toPlainText();
        expect(p.didExceedMaxLines, isFalse, reason: '$words is cut');
        expect(
          p.getMaxIntrinsicWidth(double.infinity),
          lessThanOrEqualTo(p.size.width + 0.5),
          reason: '$words fits its box',
        );
        expect(
          p.getMinIntrinsicHeight(double.infinity),
          closeTo(p.size.height, 0.5),
          reason: '$words lays out on one line',
        );
      }
    }

    final properties = _labelled('Properties');
    final layers = _labelled('Layers');
    for (final layer in ['root', 'label', 'counter', 'iconLeading']) {
      await tester.tap(_item(layer));
      await tester.pumpAndSettle();
      final inspection = _fixture('inspection')! as Map;
      final cells = [
        for (final l in inspection['layers'] as List)
          if (l['name'] == layer) ...(l['cells'] as List),
      ];
      for (final c in cells) {
        final words = [c['cell'] as String, c['entry'] as String];
        for (final w in words) {
          final text = find.descendant(of: properties, matching: find.text(w));
          expect(text, findsWidgets, reason: '$w in the table');
          oneLine(text);
        }
      }
    }
    for (final l in (_fixture('inspection')! as Map)['layers'] as List) {
      final text = find.descendant(
        of: layers,
        matching: find.text(l['name'] as String),
      );
      expect(text, findsOneWidget, reason: '${l['name']} in the tree');
      oneLine(text);
    }
  });

  testWidgets('Close closes the dialog, and the focus goes back to Inspect', (
    tester,
  ) async {
    await openButton(tester);
    await tester.tap(
      find.byWidgetPredicate(
        (w) => w is SolarIconButton && w.semanticLabel == 'Close',
      ),
    );
    await tester.pumpAndSettle();
    expect(_labelled('Inspect Button'), findsNothing);
    expect(FocusManager.instance.primaryFocus?.debugLabel, 'Inspect');
  });
}
