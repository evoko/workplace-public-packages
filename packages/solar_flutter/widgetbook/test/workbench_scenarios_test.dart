// The workbench bar's shared scenarios (packages/codegen/src/workbench/bar-scenarios.json), which
// Storybook's bar runs too (packages/components/test/visual/workbench-scenarios.spec.mjs): one test
// each, against Widgetbook's bar (lib/workbench/bar.dart) with its real HTTP client, its requests
// answered by package:http's MockClient as the scenario's fake service. Fixtures and platforms are
// resolved as the web's driver resolves them (codegen/src/workbench/bar-scenarios.mjs). A step, an
// expectation or a fake's key this driver does not know fails the scenario, as does a control in the
// bar the vocabulary does not name. What is Flutter's own (the focus, the spacing) is
// workbench_bar_test.dart.

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/main.dart' show solarTheme;
import 'package:solar_widgetbook/workbench/bar.dart';
import 'package:solar_widgetbook/workbench/client.dart';

import 'helpers.dart';

/// The file, from the widgetbook package's directory, where `flutter test` runs.
const _file = '../../codegen/src/workbench/bar-scenarios.json';
const _platform = 'flutter';
const _selects = {'Set to', 'Scope', 'Variant', 'Layer'};

/// The text fields, by action, and the start of each one's label: the pending edit's reason,
/// Report's note, and Send to agent's.
const _fields = {'Reason': 'Why', 'Note': 'Note', 'Agent note': 'Agent note'};
const _fieldActions = {
  'reason': 'Reason',
  'note': 'Note',
  'agentNote': 'Agent note',
};

/// The file's vocabulary: its actions, the controls this bar may draw beyond them, the routes the
/// service runs one at a time, and the fake's keys.
late final Map<String, dynamic> _vocabulary;
List<String> get _actions => (_vocabulary['actions'] as List).cast<String>();
List<String> get _own =>
    ((_vocabulary['platformActions'] as Map)[_platform] as List).cast<String>();
Set<String> get _serial =>
    ((_vocabulary['serial'] as Map)['routes'] as List).cast<String>().toSet();
Set<String> get _fakeKeys =>
    (_vocabulary['fake'] as Map).keys.cast<String>().toSet();
const _answerKeys = {'answer', 'status', 'refuse', 'events', 'hold'};

/// [value] with every `{ "$fixture": name, ...over }` a copy of `fixtures[name]` with the object's
/// other keys put over it, each resolved in turn.
Object? _resolve(Object? value, Map<String, dynamic> fixtures) {
  if (value is List) return [for (final v in value) _resolve(v, fixtures)];
  if (value is! Map) return value;
  final name = value[r'$fixture'] as String?;
  final out = <String, Object?>{};
  if (name != null) {
    if (!fixtures.containsKey(name)) throw StateError('no fixture $name');
    final base = _resolve(fixtures[name], fixtures);
    if (base is! Map) {
      if (value.length > 1) throw StateError('fixture $name is no object');
      return base;
    }
    out.addAll(base.cast<String, Object?>());
  }
  for (final e in value.entries) {
    if (e.key != r'$fixture') {
      out[e.key as String] = _resolve(e.value, fixtures);
    }
  }
  return out;
}

/// [value] with `$platform` and `$other`, as values and as keys, the platforms they name.
Object? _forPlatform(Object? value) {
  String name(String s) => switch (s) {
    r'$platform' => _platform,
    r'$other' => 'web',
    _ => s,
  };
  return switch (value) {
    final List<Object?> l => [for (final v in l) _forPlatform(v)],
    final String s => name(s),
    final Map<Object?, Object?> m => {
      for (final e in m.entries) name(e.key as String): _forPlatform(e.value),
    },
    _ => value,
  };
}

List<Map<String, dynamic>> _scenarios() {
  final file =
      jsonDecode(File(_file).readAsStringSync()) as Map<String, dynamic>;
  final fixtures = (file['fixtures'] as Map).cast<String, dynamic>();
  _vocabulary = (file['vocabulary'] as Map).cast<String, dynamic>();
  return [
    for (final s in file['scenarios'] as List)
      (_forPlatform(_resolve(s, fixtures)) as Map).cast<String, dynamic>(),
  ];
}

/// The fake service a scenario describes: what it was sent ([calls], the POSTs; [reads], the other
/// GETs than /events), and its events, long-polled.
class _FakeService {
  _FakeService(this.fake)
    : status = fake['status'],
      starting = (fake['startingTimes'] as int?) ?? 0,
      answers = ((fake['answers'] as Map?) ?? const {})
          .cast<String, dynamic>() {
    for (final k in fake.keys) {
      if (!_fakeKeys.contains(k)) fail('no such fake key: $k');
    }
    for (final MapEntry(key: route, value: a) in answers.entries) {
      for (final k in (a as Map).keys) {
        if (!_answerKeys.contains(k)) fail('no such answer key: $route.$k');
      }
    }
  }

  final Map<String, dynamic> fake;
  final Map<String, dynamic> answers;
  Object? status;
  int starting;
  final calls = <List<Object?>>[];
  final reads = <List<Object?>>[];
  final problems = <String>[];
  var _seq = 0;
  final _sent = <Map<String, Object?>>[];
  var _waiting = <void Function()>[];

  /// What a serial route answering says it is doing, which GET /status answers as busy meanwhile.
  String? _busy;

  /// The answers held (hold), by route, until a release step.
  final _held = <String, Completer<void>>{};

  void release(String route) {
    final held = _held.remove(route);
    if (held == null) fail('no answer held at $route');
    held.complete();
  }

  void emit(Map<String, dynamic> event) {
    _seq++;
    _sent.add({'seq': _seq, ...event});
    final waiting = _waiting;
    _waiting = [];
    for (final w in waiting) {
      w();
    }
  }

  http.Response _json(Object? body, [int code = 200]) => http.Response.bytes(
    utf8.encode(jsonEncode(body)),
    code,
    headers: {'content-type': 'application/json'},
  );

  http.Response _refusal(Map<String, dynamic> a) {
    final r = (a['refuse'] as Map).cast<String, dynamic>();
    return _json({'error': r['error']}, r['status'] as int);
  }

  Map<String, dynamic>? _answer(String route) =>
      (answers[route] as Map?)?.cast<String, dynamic>();

  Future<http.Response> handle(http.Request r) async {
    final route = r.url.path.substring(1);
    if (r.method == 'GET') {
      switch (route) {
        case 'events':
          final after = int.parse(r.url.queryParameters['after']!);
          http.Response reply() => _json({
            'seq': _seq,
            'events': [
              for (final e in _sent)
                if ((e['seq'] as int) > after) e,
            ],
          });
          if (_seq > after) return reply();
          final answer = Completer<http.Response>();
          _waiting.add(() => answer.complete(reply()));
          return answer.future;
        case 'health':
          reads.add(['health']);
          if (fake['health'] == false) {
            throw http.ClientException('connection refused', r.url);
          }
          return _json({'service': 'solar-workbench'});
        case 'status':
          reads.add(['status']);
          if (starting > 0) {
            starting--;
            return _json({'error': 'the workbench is still starting'}, 503);
          }
          final a = _answer('status');
          if (a?['refuse'] != null) return _refusal(a!);
          final now = (status! as Map).cast<String, Object?>();
          return _json({...now, 'busy': _busy ?? now['busy']});
        case 'component':
          final asked = {
            'name': r.url.queryParameters['name'],
            'variant': int.parse(r.url.queryParameters['variant']!),
          };
          reads.add(['component', asked]);
          final a = _answer('component');
          if (a?['refuse'] != null) return _refusal(a!);
          return _json({
            ...(fake['inspection'] as Map).cast<String, Object?>(),
            'variant': asked['variant'],
          });
      }
    } else {
      calls.add([route, jsonDecode(r.body)]);
      final a = _answer(route);
      if (a == null) {
        problems.add('the scenario gives no answer to $route');
        return _json({'error': 'no answer to $route'}, 500);
      }
      // As the service's serial runs it, where the scenario gives no events of its own.
      final serial = _serial.contains(route) && !a.containsKey('events');
      if (serial) {
        _busy = 'working: $route';
        emit({'type': 'busy', 'message': _busy});
      }
      for (final e in (a['events'] as List?) ?? const []) {
        emit((e as Map).cast());
      }
      if (a['hold'] == true) {
        final held = _held[route] = Completer<void>();
        await held.future;
      }
      if (a.containsKey('status')) status = a['status'];
      if (serial) {
        _busy = null;
        if (a['refuse'] case final Map<Object?, Object?> r) {
          emit({'type': 'failed', 'message': r['error']});
        }
        emit({'type': 'changed'});
      }
      if (a['refuse'] != null) return _refusal(a);
      return _json(a.containsKey('answer') ? a['answer'] : status);
    }
    problems.add('an unknown request: ${r.method} $route');
    return _json({'error': 'no route $route'}, 404);
  }
}

final _bar = find.byType(WorkbenchBar);
Finder _inBar(Finder f) => find.descendant(of: _bar, matching: f);

/// The bar's action of this name: a button, a Select by its label, or a text field by its label's
/// start.
Finder _action(String name) {
  if (_selects.contains(name)) {
    return _inBar(
      find.byWidgetPredicate((w) => w is SolarSelect && w.label == name),
    );
  }
  if (_fields[name] case final start?) {
    return _inBar(
      find.byWidgetPredicate(
        (w) => w is SolarTextArea && (w.label?.startsWith(start) ?? false),
      ),
    );
  }
  return find.ancestor(
    of: _inBar(find.text(name)),
    matching: find.byType(SolarButton),
  );
}

bool _enabled(Widget w) => switch (w) {
  final SolarButton b => b.onPressed != null && !b.loading,
  // Read dynamically: a SolarSelect<String>'s onChanged is no ValueChanged<Object?>.
  final SolarSelect<Object?> s => s.enabled && (s as dynamic).onChanged != null,
  final SolarTextArea t => t.enabled,
  _ => throw StateError('no action: $w'),
};

/// The errors the bar shows, found by their key.
List<String> _errors(WidgetTester tester) => [
  for (final t in tester.widgetList<Text>(
    _inBar(find.byKey(WorkbenchBar.errorKey)),
  ))
    t.data ?? '',
];

/// The actions the bar offers, by the vocabulary's names: every button, Select and text area in it;
/// a control no name finds is listed as `unknown: <its words>`.
List<String> _offered(WidgetTester tester) {
  final names = <String>{};
  for (final b in tester.widgetList<SolarButton>(
    _inBar(find.byType(SolarButton)),
  )) {
    final child = b.child;
    names.add(
      child is Text && _actions.contains(child.data)
          ? child.data!
          : 'unknown: button $child',
    );
  }
  for (final s in tester.widgetList<SolarSelect<Object?>>(
    _inBar(find.byWidgetPredicate((w) => w is SolarSelect)),
  )) {
    names.add(
      _selects.contains(s.label) ? s.label! : 'unknown: Select ${s.label}',
    );
  }
  for (final t in tester.widgetList<SolarTextArea>(
    _inBar(find.byType(SolarTextArea)),
  )) {
    final name = _fields.entries
        .where((f) => t.label?.startsWith(f.value) ?? false)
        .firstOrNull
        ?.key;
    names.add(name ?? 'unknown: text area ${t.label}');
  }
  return names.where((n) => !_own.contains(n)).toList()..sort();
}

void main() {
  // SOLAR's own font, so a Confirmation Dialog's buttons fit as they do in the app.
  setUpAll(loadBundledFonts);

  for (final scenario in _scenarios()) {
    testWidgets(scenario['name'] as String, (tester) async {
      final service = _FakeService(
        (scenario['fake'] as Map).cast<String, dynamic>(),
      );
      final starting = service.starting;

      Future<void> settle() => tester.pumpAndSettle();

      /// One expectation; [last] (or naming an action) also checks every action offered is named.
      Future<void> check(Map<String, dynamic> e, {bool last = false}) async {
        if (last || ['enabled', 'disabled', 'absent'].any(e.containsKey)) {
          expect(
            _offered(tester),
            [
              ...((e['enabled'] as List?) ?? const []),
              ...((e['disabled'] as List?) ?? const []),
            ].cast<String>().toList()..sort(),
            reason: 'the actions offered',
          );
        }
        for (final MapEntry(key: kind, value: v) in e.entries) {
          switch (kind) {
            case 'calls':
              expect(service.calls, v, reason: 'the calls');
            case 'reads':
              expect(service.reads, v, reason: 'the reads');
            case 'enabled' || 'disabled':
              for (final name in (v as List).cast<String>()) {
                final found = _action(name);
                expect(found, findsWidgets, reason: '$name is offered');
                for (final w in tester.widgetList(found)) {
                  expect(
                    _enabled(w),
                    kind == 'enabled',
                    reason: '$name is $kind',
                  );
                }
              }
            case 'absent':
              for (final name in (v as List).cast<String>()) {
                expect(_action(name), findsNothing, reason: '$name is absent');
              }
            case 'shows':
              for (final fact in (v as List).cast<String>()) {
                expect(
                  find.textContaining(fact, findRichText: true),
                  findsWidgets,
                  reason: 'shows $fact',
                );
              }
            case 'hides':
              for (final fact in (v as List).cast<String>()) {
                expect(
                  find.textContaining(fact, findRichText: true),
                  findsNothing,
                  reason: 'hides $fact',
                );
              }
            case 'noBar':
              expect(
                find.byWidgetPredicate(
                  (w) => w is Semantics && w.properties.label == 'Workbench',
                ),
                findsNothing,
                reason: 'no bar',
              );
            case 'oneError':
              final errors = _errors(tester);
              expect(errors, hasLength(1), reason: 'one error');
              expect(errors.single, contains(v as String));
            case 'noError':
              expect(_errors(tester), isEmpty, reason: 'no error');
            default:
              fail('no such expectation: $kind');
          }
        }
      }

      Future<void> step(Map<String, dynamic> s) async {
        if (s.length != 1) fail('not one step: $s');
        final MapEntry(key: kind, value: dynamic v) = s.entries.single;
        switch (kind) {
          case 'press':
            final found = _action(v as String);
            expect(found, findsOneWidget, reason: '$v is offered');
            expect(
              _enabled(tester.widget(found)),
              isTrue,
              reason: '$v is enabled',
            );
            await tester.tap(found);
          case 'choose':
            final select = _action(v['select'] as String);
            expect(select, findsOneWidget, reason: '${v['select']} is offered');
            await tester.tap(
              find.descendant(
                of: select,
                matching: find.byType(SolarPressable),
              ),
            );
            await settle();
            final option = find.byWidgetPredicate(
              (w) =>
                  w is SolarDropdownItem &&
                  w.label.contains(v['option'] as String),
            );
            expect(option, findsOneWidget, reason: 'one option ${v['option']}');
            await tester.tap(option);
          case 'confirm' || 'cancel':
            final dialog = find.byType(SolarConfirmationDialog);
            expect(dialog, findsOneWidget, reason: 'a dialog is open');
            final d = tester.widget<SolarConfirmationDialog>(dialog);
            await tester.tap(
              find.descendant(
                of: dialog,
                matching: find.text(
                  kind == 'confirm' ? d.confirmLabel : d.cancelLabel,
                ),
              ),
            );
            await settle();
            expect(dialog, findsNothing, reason: 'the dialog has closed');
          case 'type':
            final field = _fieldActions[v['field']];
            if (field == null) fail('no such field: ${v['field']}');
            await tester.enterText(
              find.descendant(
                of: _action(field),
                matching: find.byType(EditableText),
              ),
              v['text'] as String,
            );
          case 'event':
            service.emit((v as Map).cast());
          case 'setStatus':
            service.status = v;
          case 'release':
            service.release(v as String);
          case 'expect':
            await settle();
            await check((v as Map).cast());
          default:
            fail('no such step: $kind');
        }
        await settle();
      }

      await tester.pumpWidget(
        MaterialApp(
          theme: solarTheme(SolarTheme.light, Brightness.light),
          home: Scaffold(
            body: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  WorkbenchBar(
                    component: 'Button',
                    platform: _platform,
                    controls:
                        (service.fake['controls'] as Map?)
                            ?.cast<String, Object?>() ??
                        const {},
                    client: HttpWorkbenchClient(
                      'http://workbench.test',
                      client: MockClient(service.handle),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
      await settle();
      // A service still starting is asked again after a second, each time.
      for (var i = 0; i < starting; i++) {
        await tester.pump(const Duration(seconds: 1));
      }
      await settle();
      for (final s in (scenario['steps'] as List?) ?? const []) {
        await step((s as Map).cast());
      }
      await check(
        (scenario['expect'] as Map?)?.cast<String, dynamic>() ?? const {},
        last: true,
      );
      expect(service.problems, isEmpty);
    });
  }
}
