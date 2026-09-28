// The workbench bar's shared scenarios (packages/codegen/src/workbench/bar-scenarios.json), which
// Storybook's bar runs too (packages/components/test/visual/workbench-scenarios.spec.mjs): one test
// each, against Widgetbook's bar (lib/workbench/bar.dart) with its real HTTP client, its requests
// answered by package:http's MockClient as the scenario's fake service. Fixtures and platforms are
// resolved as the web's driver resolves them (codegen/src/workbench/bar-scenarios.mjs). A step, an
// expectation or a fake's key this driver does not know fails the scenario, as does a control the
// vocabulary does not name: the Inspect dialog's while it is open (found by vocabulary.dialog's
// names), else the bar's. What is Flutter's own (the focus, the spacing) is workbench_bar_test.dart.

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

/// The oracles of the components the scenarios draw (vocabulary.about: Button, and Option Card for
/// outlining and pointing), from which the dialog's preview draws the variant in view, as the
/// Variants use case does.
const _oracles = {
  'Button': '../../../spec/verify/button.json',
  'Option Card': '../../../spec/verify/option-card.json',
};

Map<String, dynamic>? _oracleOf(String component) =>
    switch (_oracles[component]) {
      final path? =>
        jsonDecode(File(path).readAsStringSync()) as Map<String, dynamic>,
      null => null,
    };
const _platform = 'flutter';

/// The room the bar and its dialog are drawn in, as the web's suite has it.
const _viewport = Size(1280, 720);

/// The component the scenario's bar is for (fake.component).
var _component = 'Button';

/// The actions the dialog's strip holds while an edit is pending.
const _strip = {
  'Reason',
  'Save',
  'Discard',
  'Undo',
  'Keep again',
  'Agent note',
  'Send to agent',
};

/// The text fields, by action, and the start of each one's label: the pending edit's reason,
/// Report's note, and Send to agent's.
const _fields = {'Reason': 'Why', 'Note': 'Note', 'Agent note': 'Agent note'};
const _fieldActions = {
  'reason': 'Reason',
  'note': 'Note',
  'agentNote': 'Agent note',
  'filter': 'Filter tokens',
};

/// The file's vocabulary: its actions, the controls this bar may draw beyond them, the routes the
/// service runs one at a time, and the fake's keys.
late final Map<String, dynamic> _vocabulary;
List<String> get _actions => (_vocabulary['actions'] as List).cast<String>();
List<String> get _own =>
    ((_vocabulary['platformActions'] as Map)[_platform] as List).cast<String>();

/// The words of vocabulary.named: such an action is the word, a space and a name.
List<String> get _named => [
  for (final k in (_vocabulary['named'] as Map).keys.cast<String>())
    if (k != 'about') k,
];
String? _namedOf(String name) =>
    _named.where((w) => name.startsWith('$w ')).firstOrNull;

/// The controls `choose` opens: the editor's Selects and each axis.
bool _isSelect(String name) =>
    name == 'Change to' || name == 'Apply to' || _namedOf(name) == 'Axis';
Set<String> get _serial =>
    ((_vocabulary['serial'] as Map)['routes'] as List).cast<String>().toSet();
Set<String> get _fakeKeys =>
    (_vocabulary['fake'] as Map).keys.cast<String>().toSet();
const _answerKeys = {
  'answer',
  'status',
  'refuse',
  'events',
  'hold',
  'reload',
  'regenerated',
};

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

  /// How many times the service told the viewers to reload: Widgetbook, it hot-restarts.
  var reloads = 0;

  void release(String route) {
    final held = _held.remove(route);
    if (held == null) fail('no answer held at $route');
    held.complete();
  }

  void emit(Map<String, dynamic> event) {
    if (event['type'] == 'reload') reloads++;
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
          return _json({...now, 'busy': _busy ?? now['busy'], 'seq': _seq});
        case 'component':
          final asked = {
            'name': r.url.queryParameters['name'],
            'variant': int.parse(r.url.queryParameters['variant']!),
          };
          reads.add(['component', asked]);
          final a = _answer('component');
          if (a?['refuse'] != null) return _refusal(a!);
          final over = (fake['inspectionFor'] as Map?)?['${asked['variant']}'];
          return _json({
            ...(fake['inspection'] as Map).cast<String, Object?>(),
            ...?(over as Map?)?.cast<String, Object?>(),
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
      // The regeneration is done, the rest of the job not yet: Widgetbook restarts now.
      if (a['reload'] == true) {
        if (a.containsKey('regenerated')) status = a['regenerated'];
        emit({'type': 'reload'});
      }
      if (a['hold'] == true) {
        final held = _held[route] = Completer<void>();
        await held.future;
      }
      if (a.containsKey('status')) status = a['status'];
      // A regeneration has finished: the service restarts Widgetbook (the driver does, here).
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

/// A Semantics widget with exactly this label: how the Inspect dialog's parts are found
/// (vocabulary.dialog).
Finder _labelled(String label) => find.byWidgetPredicate(
  (w) => w is Semantics && w.properties.label == label,
  description: 'Semantics "$label"',
);

/// The Inspect dialog, where it is open.
Finder get _dialog => _labelled('Inspect $_component');
bool get _dialogOpen => _dialog.evaluate().isNotEmpty;

/// The layer on top: the dialog where it is open, else the bar.
Finder get _top => _dialogOpen ? _dialog : _bar;

/// What [f] finds inside [scope], never in the component the dialog's preview draws.
Finder _within(Finder scope, Finder f) {
  final drawn = find
      .descendant(
        of: find.descendant(of: scope, matching: _labelled('Preview')),
        matching: f,
      )
      .evaluate()
      .toSet();
  final found = find
      .descendant(of: scope, matching: f)
      .evaluate()
      .where((e) => !drawn.contains(e))
      .toSet();
  return find.byElementPredicate(
    found.contains,
    description: '$f, outside the preview',
  );
}

/// A name at the start of a label, alone or followed by more words.
bool _leads(String? label, String name) =>
    label == name || (label?.startsWith('$name ') ?? false);

/// The control of an action in the layer on top: a button, a Select, a text field, an axis, a
/// tree item or a property row; the dialog's strip holds the pending edit's.
Finder _action(String name) {
  final open = _dialogOpen;
  final scope = open ? _dialog : _bar;
  final word = _namedOf(name);
  final rest = word == null ? '' : name.substring(word.length + 1);
  switch (word) {
    case 'Axis':
      return _within(
        scope,
        find.byWidgetPredicate((w) => w is SolarSelect && w.label == rest),
      );
    case 'Layer':
      return _within(
        find.descendant(of: scope, matching: _labelled('Layers')),
        find.byWidgetPredicate(
          (w) => w is SolarTreeItem && _leads(w.label, rest),
        ),
      );
    case 'Cell':
      return _notInEditor(
        find.descendant(of: scope, matching: _labelled('Properties')),
        find.byWidgetPredicate(
          (w) =>
              w is Semantics &&
              w.properties.button == true &&
              _leads(w.properties.label, rest),
        ),
      );
  }
  final at = open && _strip.contains(name)
      ? find.descendant(of: scope, matching: _labelled('Edit'))
      : scope;
  if (_isSelect(name)) {
    return _within(
      at,
      find.byWidgetPredicate((w) => w is SolarSelect && w.label == name),
    );
  }
  if (name == 'Filter tokens') {
    return _within(
      at,
      find.byWidgetPredicate(
        (w) => w is SolarSearchField && w.semanticLabel == name,
      ),
    );
  }
  if (_fields[name] case final start?) {
    return _within(
      at,
      find.byWidgetPredicate(
        (w) => w is SolarTextArea && (w.label?.startsWith(start) ?? false),
      ),
    );
  }
  return _within(
    at,
    find.byWidgetPredicate(
      (w) =>
          (w is SolarButton &&
              w.child is Text &&
              (w.child! as Text).data == name) ||
          (w is SolarIconButton && w.semanticLabel == name),
    ),
  );
}

/// Every control the layer on top holds: what [_offered] counts.
Finder _controls(Finder scope) => _within(
  scope,
  find.byWidgetPredicate(
    (w) =>
        w is SolarButton ||
        w is SolarIconButton ||
        w is SolarSelect ||
        w is SolarTextArea ||
        w is SolarSearchField ||
        w is SolarTreeItem,
  ),
);

/// The chosen cell's editor, titled `<layer> · <cell>` (vocabulary.dialog.Editor).
Finder get _editor => find.descendant(
  of: _dialog,
  matching: find.byWidgetPredicate(
    (w) =>
        w is Semantics && RegExp(r' · \S+$').hasMatch(w.properties.label ?? ''),
  ),
);

/// What [f] finds inside [scope], outside the preview and outside the editor.
Finder _notInEditor(Finder scope, Finder f) {
  final inEditor = find.descendant(of: _editor, matching: f).evaluate().toSet();
  final found = _within(
    scope,
    f,
  ).evaluate().where((e) => !inEditor.contains(e)).toSet();
  return find.byElementPredicate(
    found.contains,
    description: '$f, outside the editor',
  );
}

/// The property rows, which are controls too.
Finder _rows(Finder scope) => _notInEditor(
  find.descendant(of: scope, matching: _labelled('Properties')),
  find.byWidgetPredicate(
    (w) =>
        w is Semantics &&
        w.properties.button == true &&
        w.properties.label != null,
  ),
);

bool _enabled(Element e) => switch (e.widget) {
  final SolarButton b => b.onPressed != null && !b.loading,
  final SolarIconButton b => b.onPressed != null && !b.loading,
  // Read dynamically: a SolarSelect<String>'s onChanged is no ValueChanged<Object?>.
  final SolarSelect<Object?> s => s.enabled && (s as dynamic).onChanged != null,
  final SolarTextArea t => t.enabled,
  final SolarSearchField f => f.enabled,
  final SolarTreeItem t => t.onSelect != null,
  final Semantics s => s.properties.enabled ?? true,
  final w => throw StateError('no action: $w'),
};

/// The options of a Select: `(words, enabled, chosen)` each, an option's words its label and
/// helper.
List<({String words, bool enabled, bool chosen})> _optionsOf(Element e) {
  final w = e.widget;
  if (w is SolarSelect<Object?>) {
    return [
      for (final o in w.options)
        (
          words: [o.label, ?o.helper].join(' '),
          enabled: o.enabled,
          chosen: w.value != null && o.value == w.value,
        ),
    ];
  }
  throw StateError('no Select: $w');
}

/// The index of the one of [words] a fact names (its words contain it, or all of a list of facts;
/// of several, the one whose words are the fact), or why there is none.
Object _choice(List<String> words, Object? fact) {
  final facts = fact is List ? fact.cast<String>() : [fact! as String];
  var hits = [
    for (var i = 0; i < words.length; i++)
      if (facts.every(words[i].contains)) i,
  ];
  if (hits.length > 1 && facts.length == 1) {
    hits = hits.where((i) => words[i] == facts.single).toList();
  }
  return hits.length == 1
      ? hits.single
      : '${jsonEncode(fact)} names ${hits.length} of ${jsonEncode(words)}';
}

/// What differs between the options a control offers and [want] (vocabulary.expect.options).
List<String> _optionProblems(
  List<({String words, bool enabled, bool chosen})> got,
  Map<String, dynamic> want,
) {
  final out = <String>[];
  final words = [for (final g in got) g.words];
  final entries = [
    for (final f in (want['enabled'] as List?) ?? const []) (f, true),
    for (final f in (want['disabled'] as List?) ?? const []) (f, false),
  ];
  final seen = <int>{};
  for (final (fact, on) in entries) {
    final i = _choice(words, fact);
    if (i is String) {
      out.add(i);
      continue;
    }
    i as int;
    if (!seen.add(i)) out.add('${words[i]} is named twice');
    if (got[i].enabled != on) {
      out.add('${words[i]} is ${got[i].enabled ? 'enabled' : 'disabled'}');
    }
  }
  if ((want.containsKey('enabled') || want.containsKey('disabled')) &&
      got.length != entries.length) {
    out.add('offered: ${jsonEncode(words)}');
  }
  if (want['chosen'] case final String chosen) {
    final found = [
      for (final g in got)
        if (g.chosen) g.words,
    ];
    if (found.length != 1 || !found.single.contains(chosen)) {
      out.add('chosen: ${jsonEncode(found)}');
    }
  }
  return out;
}

/// Whether the layer [name] sits inside [ancestor], by the inspection's parents.
bool _inside(List<Map<String, dynamic>> layers, String name, String ancestor) {
  final parent = {for (final l in layers) l['name']: l['parent']};
  for (var p = parent[name]; p != null; p = parent[p]) {
    if (p == ancestor) return true;
  }
  return false;
}

/// A point of [box] none of the rects [inside] covers, the centre first; or null.
Offset? _pointIn(Rect box, List<Rect> inside) {
  const at = [0.5, 0.25, 0.75, 0.1, 0.9, 0.05, 0.95];
  for (final fy in at) {
    for (final fx in at) {
      final p = Offset(box.left + box.width * fx, box.top + box.height * fy);
      if (!inside.any((r) => r.contains(p))) return p;
    }
  }
  return null;
}

/// A layer of the component the preview draws: the widget keyed `<prefix>.<layer>`
/// (solar_layers.dart), the outermost where several are.
Finder _layerIn(String layer) => find
    .descendant(
      of: find.descendant(of: _dialog, matching: _labelled('Preview')),
      matching: find.byWidgetPredicate(
        (w) =>
            w.key is ValueKey<String> &&
            (w.key! as ValueKey<String>).value.endsWith('.$layer'),
      ),
    )
    .first;

/// The errors shown, found by their key: the dialog's where it is open, else the bar's.
List<String> _errors(WidgetTester tester) => [
  for (final t in tester.widgetList<Text>(
    find.descendant(of: _top, matching: find.byKey(WorkbenchBar.errorKey)),
  ))
    t.data ?? '',
];

/// The actions the layer on top offers, by the vocabulary's names (the named ones by the
/// inspection's); where the controls it holds are more than those names find, the rest are listed
/// as `unknown: <each>`.
List<String> _offered(WidgetTester tester, Map<String, dynamic>? inspection) {
  final layers = ((inspection?['layers'] as List?) ?? const [])
      .cast<Map<String, dynamic>>();
  final names = {
    ..._actions,
    ..._own,
    for (final a in (inspection?['axes'] as List?) ?? const [])
      'Axis ${a['name']}',
    for (final l in layers) 'Layer ${l['name']}',
    for (final l in layers)
      for (final c in l['cells'] as List) 'Cell ${c['cell']}',
  };
  final found = <String>[];
  var known = 0;
  for (final name in names) {
    final n = _action(name).evaluate().length;
    known += n;
    if (n > 0 && !_own.contains(name)) found.add(name);
  }
  final controls = [..._controls(_top).evaluate(), ..._rows(_top).evaluate()];
  if (controls.length != known) {
    found.add(
      'unknown: ${[for (final c in controls) c.widget.toStringShort()]}',
    );
  }
  return found..sort();
}

void main() {
  // SOLAR's own font, so a Confirmation Dialog's buttons fit as they do in the app.
  setUpAll(loadBundledFonts);

  for (final scenario in _scenarios()) {
    testWidgets(scenario['name'] as String, (tester) async {
      // The web's suite runs in Playwright's default viewport, 1280 × 720: the full-screen
      // dialog, and the menus its Selects open, are laid out in the same room here.
      tester.view
        ..physicalSize = _viewport
        ..devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      final service = _FakeService(
        (scenario['fake'] as Map).cast<String, dynamic>(),
      );
      _component = (service.fake['component'] as String?) ?? 'Button';
      final starting = service.starting;
      final inspection = (service.fake['inspection'] as Map?)
          ?.cast<String, dynamic>();
      final layers = ((inspection?['layers'] as List?) ?? const [])
          .cast<Map<String, dynamic>>();

      // The app, keyed: a new key is a restart, the bar's state and its polling started afresh.
      Widget app(Key key) => MaterialApp(
        key: key,
        theme: solarTheme(SolarTheme.light, Brightness.light),
        home: Scaffold(
          body: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                WorkbenchBar(
                  component: _component,
                  platform: _platform,
                  controls:
                      (service.fake['controls'] as Map?)
                          ?.cast<String, Object?>() ??
                      const {},
                  client: HttpWorkbenchClient(
                    'http://workbench.test',
                    client: MockClient(service.handle),
                  ),
                  oracle: _oracleOf(_component),
                ),
              ],
            ),
          ),
        ),
      );
      var restarts = 0;

      Future<void> settle() => tester.pumpAndSettle();

      /// One expectation; [last] (or naming an action) also checks every action offered is named.
      Future<void> check(Map<String, dynamic> e, {bool last = false}) async {
        if (last || ['enabled', 'disabled', 'absent'].any(e.containsKey)) {
          expect(
            _offered(tester, inspection),
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
                final found = _action(name).evaluate();
                expect(found, isNotEmpty, reason: '$name is offered');
                for (final w in found) {
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
            case 'options':
              for (final MapEntry(key: name, value: want)
                  in (v as Map).cast<String, dynamic>().entries) {
                final found = _action(name);
                expect(found, findsOneWidget, reason: '$name is offered');
                expect(
                  _optionProblems(
                    _optionsOf(found.evaluate().single),
                    (want as Map).cast(),
                  ),
                  isEmpty,
                  reason: "$name's options",
                );
              }
            case 'filter':
              final field = find.descendant(
                of: _action('Filter tokens'),
                matching: find.byType(EditableText),
              );
              expect(field, findsOneWidget, reason: 'Filter tokens');
              expect(
                tester.widget<EditableText>(field).controller.text,
                v,
                reason: 'the filter',
              );
            case 'editorUnder':
              final editor = _editor;
              expect(editor, findsOneWidget, reason: 'the editor');
              final row = _action('Cell $v');
              expect(row, findsOneWidget, reason: 'the row of $v');
              final at = tester.getRect(editor);
              final mine = tester.getRect(row);
              final next = [
                for (final e in _rows(_dialog).evaluate())
                  tester.getRect(find.byElementPredicate((x) => x == e)).top,
              ].where((top) => top > mine.top + 1).toList()..sort();
              expect(
                at.top >= mine.bottom - 1 &&
                    (next.isEmpty || at.bottom <= next.first + 1),
                isTrue,
                reason: 'the editor $at sits under $v, $mine',
              );
            case 'outlined':
              final outline = find.descendant(
                of: _dialog,
                matching: _labelled('Selected layer outline'),
              );
              expect(outline, findsOneWidget, reason: 'the outline');
              final layer = _layerIn(v as String);
              expect(layer, findsOneWidget, reason: '$v in the preview');
              final a = tester.getRect(outline);
              final b = tester.getRect(layer);
              expect(
                [
                  (a.left - b.left).abs(),
                  (a.top - b.top).abs(),
                  (a.width - b.width).abs(),
                  (a.height - b.height).abs(),
                ].every((d) => d <= 1),
                isTrue,
                reason: 'the outline $a sits on $v, $b',
              );
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
            case 'reloads':
              expect(restarts, v, reason: 'Widgetbook restarted');
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
              _enabled(found.evaluate().single),
              isTrue,
              reason: '$v is enabled',
            );
            await tester.tap(found);
          case 'choose':
            final select = _action(v['select'] as String);
            final option = v['option'] as String;
            expect(select, findsOneWidget, reason: '${v['select']} is offered');
            await tester.tap(
              find.descendant(
                of: select,
                matching: find.byType(SolarPressable),
              ),
            );
            await settle();
            final items = find.byType(SolarDropdownItem);
            final i = _choice([
              for (final w in tester.widgetList<SolarDropdownItem>(items))
                [w.label, ?w.helper].join(' '),
            ], option);
            if (i is String) fail(i);
            await tester.tap(items.at(i as int));
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
            expect(_action(field), findsOneWidget, reason: '$field is offered');
            await tester.enterText(
              find.descendant(
                of: _action(field),
                matching: find.byType(EditableText),
              ),
              v['text'] as String,
            );
          case 'escape':
            final field = _fieldActions[v];
            if (field == null) fail('no such field: $v');
            expect(_action(field), findsOneWidget, reason: '$field is offered');
            await tester.showKeyboard(
              find.descendant(
                of: _action(field),
                matching: find.byType(EditableText),
              ),
            );
            await tester.sendKeyEvent(LogicalKeyboardKey.escape);
          case 'point':
            final layer = v as String;
            final here = _layerIn(layer);
            expect(here, findsOneWidget, reason: '$layer in the preview');
            final inside = [
              for (final l in layers)
                if (_inside(layers, l['name'] as String, layer))
                  if (_layerIn(l['name'] as String).evaluate().isNotEmpty)
                    tester.getRect(_layerIn(l['name'] as String)),
            ];
            final at = _pointIn(tester.getRect(here), inside);
            if (at == null) fail('no point of $layer is its own');
            await tester.tapAt(at);
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
        // Told to reload, the service hot-restarts Widgetbook: the app starts again, afresh.
        if (restarts < service.reloads) {
          restarts = service.reloads;
          await tester.pumpWidget(app(UniqueKey()));
          await settle();
        }
      }

      await tester.pumpWidget(app(UniqueKey()));
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
