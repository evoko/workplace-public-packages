// The workbench bar (lib/workbench/bar.dart) against a fake service: what it offers by the
// component's circle on Flutter, the set a chosen token sends, Approve and Undo approval through
// their Confirmation Dialogs, the pending edit's Keep and Undo (failing checks included), one action
// at a time, a refusal shown once, a service still starting, and no bar where no service answers.
// As the web's (packages/components/test/visual/workbench.spec.mjs).

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/main.dart' show solarTheme;
import 'package:solar_widgetbook/workbench/bar.dart';
import 'package:solar_widgetbook/workbench/client.dart';
import 'package:solar_widgetbook/workbench/models.dart';

import 'helpers.dart';

Map<String, Object?> _pendingOn(
  String component, {
  bool deletes = false,
  String? previousReason,
  List<Map<String, Object?>>? failing,
  List<String> borrowers = const [],
}) => {
  'component': component,
  'key': 'root.base.radius',
  'value': {'token': deletes ? 'radius.control' : 'radius.pill'},
  'deletes': deletes,
  'previousReason': previousReason,
  'failing': failing,
  'borrowers': borrowers,
};

class FakeClient implements WorkbenchClient {
  FakeClient(
    this.colour, {
    this.alive = true,
    this.pending,
    this.approveRefusal,
    this.webGreen = false,
    this.starting = 0,
    this.statusError,
    this.keepGate,
    this.counterColour = 'yellow',
  });

  /// Button's circle on Flutter; Approve makes it 🟢, Undo approval 🟡.
  String colour;

  /// Counter's circle on Flutter, which a 🔴 Button waits on.
  final String counterColour;
  bool alive;

  /// The pending edit, on Button or another component, as the service answers it.
  Map<String, Object?>? pending;

  /// Approve's refusal, where the service refuses it.
  final String? approveRefusal;

  /// Whether Button is approved on the web, which locks Inspect here.
  bool webGreen;

  /// How many times `status` answers 503 (the service still starting) before it answers.
  int starting;

  /// A failure `status` answers with, other than 503.
  String? statusError;

  /// A failure `inspect` answers with.
  String? inspectError;

  /// Holds Keep's answer until it completes: an action in flight.
  final Completer<void>? keepGate;

  final calls = <List<Object?>>[];
  var statusCalls = 0;
  var inspectCalls = 0;
  var closed = false;

  Map<String, dynamic> get _status => {
    'busy': null,
    'pending': pending,
    'components': {
      'Button': {
        'web': webGreen ? 'green' : 'yellow',
        'flutter': colour,
        'waitsOn': {
          'web': <String>[],
          'flutter': colour == 'red' ? ['Counter'] : <String>[],
        },
        'editable': colour == 'yellow' && !webGreen,
        'locked': colour == 'green'
            ? 'approved on Flutter: undo its approval in Widgetbook to change it'
            : webGreen
            ? 'approved on web: undo its approval in Storybook to change it'
            : null,
      },
      'Counter': {
        'web': 'yellow',
        'flutter': counterColour,
        'waitsOn': {
          'web': <String>[],
          'flutter': counterColour == 'red' ? ['Button'] : <String>[],
        },
        'editable': counterColour == 'yellow',
        'locked': null,
      },
    },
  };

  @override
  Future<bool> health() async => alive;
  @override
  Future<WorkbenchStatus> status() async {
    statusCalls++;
    if (statusError != null) {
      throw WorkbenchException(statusError!, status: 500);
    }
    if (starting > 0) {
      starting--;
      throw WorkbenchException('the workbench is still starting', status: 503);
    }
    return WorkbenchStatus.fromJson(_status);
  }

  @override
  Future<WorkbenchInspection> inspect(String component, int variant) async {
    inspectCalls++;
    if (inspectError != null) {
      throw WorkbenchException(inspectError!, status: 500);
    }
    return WorkbenchInspection.fromJson({
      'component': 'Button',
      'revision': 'r1',
      'variant': variant,
      'variants': [
        {
          'index': 0,
          'name': 'size=md, prio=primary, state=default, danger=false',
        },
        {
          'index': 1,
          'name': 'size=sm, prio=primary, state=default, danger=false',
        },
      ],
      'layers': [
        {
          'name': 'root',
          'className': 'SolarButton-root',
          'hidden': false,
          'cells': [
            {
              'cell': 'radius',
              'entry': 'radius.control',
              'at': 'base',
              'scopes': [
                {'label': 'every variant', 'key': 'root.base.radius'},
                {'label': 'prio=primary', 'key': 'root.prio.primary.radius'},
              ],
              'choices': [
                {'name': 'radius.pill', 'value': '9999px'},
              ],
              'keywords': <String>[],
              'none': true,
            },
            {
              'cell': 'width',
              'entry': '120',
              'at': 'base',
              'scopes': <Object>[],
              'choices': <Object>[],
              'keywords': <String>[],
              'none': false,
              'note': 'a raw value the overlay allows',
            },
            {
              'cell': 'opacity',
              'entry': '1',
              'at': 'size.md',
              'scopes': <Object>[],
              'choices': <Object>[],
              'keywords': <String>[],
              'none': false,
            },
            {
              'cell': 'gap',
              'entry': '0',
              'at': null,
              'scopes': <Object>[],
              'choices': <Object>[],
              'keywords': <String>[],
              'none': false,
            },
          ],
        },
        {
          'name': 'label',
          'className': 'SolarButton-label',
          'hidden': false,
          'cells': [
            {
              'cell': 'radius',
              'entry': 'radius.control',
              'at': 'base',
              'scopes': [
                {'label': 'every variant', 'key': 'label.base.radius'},
                {'label': 'prio=primary', 'key': 'label.prio.primary.radius'},
              ],
              'choices': [
                {'name': 'radius.pill', 'value': '9999px'},
              ],
              'keywords': <String>[],
              'none': true,
            },
          ],
        },
      ],
    });
  }

  @override
  Future<WorkbenchStatus> set({
    required String component,
    required int variant,
    required String layer,
    required String cell,
    required String scope,
    required Map<String, Object?> value,
    required String revision,
  }) async {
    calls.add(['set', component, variant, layer, cell, scope, value, revision]);
    pending = {..._pendingOn('Button'), 'key': scope, 'value': value};
    return status();
  }

  @override
  Future<WorkbenchOutcome> keep(String component, String reason) async {
    calls.add(['keep', component, reason]);
    await keepGate?.future;
    pending = null;
    return WorkbenchOutcome.fromJson({'ok': true});
  }

  @override
  Future<WorkbenchStatus> undo(String component) async {
    calls.add(['undo', component]);
    pending = null;
    return status();
  }

  @override
  Future<WorkbenchOutcome> approve(String component, String platform) async {
    calls.add(['approve', component, platform]);
    if (approveRefusal != null) throw WorkbenchException(approveRefusal!);
    colour = 'green';
    return WorkbenchOutcome.fromJson({'ok': true});
  }

  @override
  Future<List<String>> unapprovePreview(String c, String p) async {
    calls.add(['unapprovePreview', c, p]);
    return ['Button', 'Dialog'];
  }

  @override
  Future<List<String>> unapprove(String component, String platform) async {
    calls.add(['unapprove', component, platform]);
    colour = 'yellow';
    return ['Button', 'Dialog'];
  }

  @override
  Future<String> report({
    required String component,
    required String platform,
    required Map<String, Object?> controls,
    String? layer,
    String? variant,
    required String note,
  }) async {
    calls.add(['report', component, platform, controls, layer, variant, note]);
    return 'spec/feedback/button-1.yaml';
  }

  final _polls = <Completer<({int seq, List<String> types})>>[];
  var _seq = 0;

  @override
  Future<({int seq, List<String> types})> events(int after) {
    final poll = Completer<({int seq, List<String> types})>();
    _polls.add(poll);
    return poll.future;
  }

  /// Answers the poll waiting with one event of [type].
  void fire(String type) {
    _seq++;
    for (final poll in _polls) {
      poll.complete((seq: _seq, types: [type]));
    }
    _polls.clear();
  }

  @override
  void close() => closed = true;
}

/// A button whose words are [label], found by its SolarButton (a dialog's title may hold the words).
Finder _button(String label) =>
    find.ancestor(of: find.text(label), matching: find.byType(SolarButton));

VoidCallback? _onPressed(WidgetTester tester, String label) =>
    tester.widget<SolarButton>(_button(label)).onPressed;

void main() {
  // SOLAR's own font, so a Confirmation Dialog's buttons fit as they do in the app.
  setUpAll(loadBundledFonts);

  Future<FakeClient> pump(WidgetTester tester, FakeClient client) async {
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
                  platform: 'flutter',
                  client: client,
                ),
              ],
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    return client;
  }

  testWidgets(
    'a 🟡 component offers Inspect and Approve; choosing a token sends the set',
    (tester) async {
      final client = await pump(tester, FakeClient('yellow'));
      expect(find.text('🟡 Workbench'), findsOneWidget);
      expect(find.bySemanticsLabel(RegExp('^Workbench')), findsOneWidget);
      expect(_button('Approve'), findsOneWidget);
      // The inspection is read while Inspect is open alone.
      expect(client.inspectCalls, 0);
      await tester.tap(find.text('Inspect'));
      await tester.pumpAndSettle();
      expect(client.inspectCalls, 1);
      // A cell with a note says why it offers nothing; one with nothing offered says so.
      expect(
        find.text('width: 120 (a raw value the overlay allows)'),
        findsOneWidget,
      );
      expect(
        find.text('opacity: 1 [size.md] (not editable here: use Report)'),
        findsOneWidget,
      );
      expect(
        find.text('gap: 0 (not editable here: use Report)'),
        findsOneWidget,
      );
      expect(find.text('radius: radius.control [base]'), findsOneWidget);
      await tester.tap(find.text('Choose'));
      await tester.pumpAndSettle();
      await tester.tap(find.textContaining('radius.pill').last);
      await tester.pumpAndSettle();
      // The narrowest scope, until another is chosen; the inspection's own variant.
      expect(client.calls.single, [
        'set',
        'Button',
        0,
        'root',
        'radius',
        'root.prio.primary.radius',
        {'token': 'radius.pill'},
        'r1',
      ]);
      // The pending edit: the panel gives way to it, and Approve waits for it.
      expect(
        find.text('Pending: root.prio.primary.radius → radius.pill'),
        findsOneWidget,
      );
      expect(find.text('Choose'), findsNothing);
      expect(_onPressed(tester, 'Approve'), isNull);
      await tester.enterText(find.byType(EditableText), 'Figma draws a pill');
      await tester.tap(find.text('Keep'));
      await tester.pumpAndSettle();
      expect(client.calls.last, ['keep', 'Button', 'Figma draws a pill']);
      expect(find.textContaining('Pending:'), findsNothing);
      expect(find.text('Choose'), findsOneWidget);
    },
  );

  testWidgets(
    'a chosen scope holds until the variant or layer changes, an edit is pending, or Inspect closes',
    (tester) async {
      final client = await pump(tester, FakeClient('yellow'));
      await tester.tap(find.text('Inspect'));
      await tester.pumpAndSettle();

      /// Chooses `every variant` for the radius in view.
      Future<void> widest() async {
        await tester.tap(find.text('prio=primary'));
        await tester.pumpAndSettle();
        await tester.tap(find.text('every variant').last);
        await tester.pumpAndSettle();
        expect(find.text('every variant'), findsOneWidget);
      }

      Future<void> choose(String select, String option) async {
        await tester.tap(find.text(select));
        await tester.pumpAndSettle();
        await tester.tap(find.text(option).last);
        await tester.pumpAndSettle();
      }

      void narrowest() => expect(find.text('prio=primary'), findsOneWidget);

      // Inspect closed and opened again.
      await widest();
      await tester.tap(find.text('Inspect'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Inspect'));
      await tester.pumpAndSettle();
      narrowest();
      // Another variant.
      await widest();
      await choose(
        'size=md, prio=primary, state=default, danger=false',
        'size=sm, prio=primary, state=default, danger=false',
      );
      narrowest();
      // Another layer, and back.
      await widest();
      await choose('root', 'label');
      narrowest();
      await choose('label', 'root');
      narrowest();
      // Kept while nothing changes: the set is keyed on it.
      await widest();
      await choose('Choose', 'radius.pill · 9999px');
      expect(client.calls.last[5], 'root.base.radius');
      // A pending edit appeared: undone, the row is at the narrowest again.
      await tester.tap(find.text('Undo'));
      await tester.pumpAndSettle();
      narrowest();
    },
  );

  testWidgets('another variant is inspected, and set, as chosen', (
    tester,
  ) async {
    final client = await pump(tester, FakeClient('yellow'));
    await tester.tap(find.text('Inspect'));
    await tester.pumpAndSettle();
    await tester.tap(
      find.text('size=md, prio=primary, state=default, danger=false'),
    );
    await tester.pumpAndSettle();
    await tester.tap(
      find.text('size=sm, prio=primary, state=default, danger=false').last,
    );
    await tester.pumpAndSettle();
    expect(client.inspectCalls, 2);
    await tester.tap(find.text('Choose'));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('radius.pill').last);
    await tester.pumpAndSettle();
    expect(client.calls.single[2], 1);
  });

  testWidgets(
    'a pending edit shows the reason it replaces and the rules sharing it',
    (tester) async {
      final client = await pump(
        tester,
        FakeClient(
          'yellow',
          pending: _pendingOn(
            'Button',
            previousReason: 'Figma rounds it',
            borrowers: ['root.hover.radius', 'label.base.radius'],
          ),
        ),
      );
      expect(
        find.text('Why (a reviewer must be able to check it)'),
        findsOneWidget,
      );
      expect(find.text('Was: Figma rounds it'), findsOneWidget);
      expect(
        find.text('Also the reason of: root.hover.radius, label.base.radius'),
        findsOneWidget,
      );
      await tester.tap(find.text('Undo'));
      await tester.pumpAndSettle();
      expect(client.calls, [
        ['undo', 'Button'],
      ]);
      expect(find.textContaining('Pending:'), findsNothing);
    },
  );

  testWidgets(
    'a pending edit whose checks failed keeps its block, and lists them',
    (tester) async {
      final client = await pump(
        tester,
        FakeClient(
          'yellow',
          pending: _pendingOn(
            'Button',
            failing: [
              {
                'platform': 'flutter',
                'variant': 'size=md',
                'layer': 'label',
                'property': 'x',
                'figma': 12,
                'drawn': 14,
              },
            ],
          ),
        ),
      );
      expect(
        find.text('Pending: root.base.radius → radius.pill'),
        findsOneWidget,
      );
      expect(find.byType(SolarTextArea), findsOneWidget);
      expect(find.bySemanticsLabel(RegExp('^Failing checks')), findsOneWidget);
      expect(
        find.text('• flutter: size=md label.x: Figma 12, drawn 14'),
        findsOneWidget,
      );
      expect(_button('Keep'), findsOneWidget);
      await tester.tap(find.text('Undo'));
      await tester.pumpAndSettle();
      expect(client.calls, [
        ['undo', 'Button'],
      ]);
      expect(find.textContaining('flutter: size=md'), findsNothing);
    },
  );

  testWidgets("a deleting edit names Figma's value and asks no reason", (
    tester,
  ) async {
    await pump(
      tester,
      FakeClient(
        'yellow',
        pending: _pendingOn(
          'Button',
          deletes: true,
          previousReason: 'Figma rounds it',
        ),
      ),
    );
    expect(
      find.text(
        "Pending: root.base.radius → Figma's value (the rule is removed)",
      ),
      findsOneWidget,
    );
    expect(find.byType(SolarTextArea), findsNothing);
  });

  testWidgets(
    'one action at a time: a second tap while one runs sends nothing',
    (tester) async {
      final gate = Completer<void>();
      final client = await pump(
        tester,
        FakeClient('yellow', pending: _pendingOn('Button'), keepGate: gate),
      );
      await tester.enterText(find.byType(EditableText), 'Figma draws a pill');
      await tester.tap(find.text('Keep'));
      await tester.pump();
      expect(_onPressed(tester, 'Keep'), isNull);
      expect(_onPressed(tester, 'Undo'), isNull);
      await tester.tap(find.text('Keep'));
      await tester.tap(find.text('Undo'));
      await tester.pump();
      gate.complete();
      await tester.pumpAndSettle();
      expect(client.calls, [
        ['keep', 'Button', 'Figma draws a pill'],
      ]);
    },
  );

  testWidgets('Approve asks first, and approves on confirming', (tester) async {
    final client = await pump(tester, FakeClient('yellow'));
    await tester.tap(find.text('Approve'));
    await tester.pumpAndSettle();
    expect(find.text('Approve Button on Flutter?'), findsOneWidget);
    expect(
      find.text(
        'You have checked that it looks and behaves as intended. Its checks run first.',
      ),
      findsOneWidget,
    );
    await tester.tap(find.text('Approve').last);
    await tester.pumpAndSettle();
    expect(client.calls, [
      ['approve', 'Button', 'flutter'],
    ]);
    expect(find.text('Approve Button on Flutter?'), findsNothing);
  });

  testWidgets('Approve cancelled sends nothing', (tester) async {
    final client = await pump(tester, FakeClient('yellow'));
    await tester.tap(find.text('Approve'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();
    expect(client.calls, isEmpty);
    expect(_onPressed(tester, 'Approve'), isNotNull);
  });

  testWidgets('a refused Approve shows the refusal once', (tester) async {
    await pump(
      tester,
      FakeClient(
        'yellow',
        approveRefusal: 'set your name with `git config user.name` first: an approval records who gave it',
      ),
    );
    await tester.tap(find.text('Approve'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Approve').last);
    await tester.pumpAndSettle();
    expect(
      find.text(
        'set your name with `git config user.name` first: an approval records who gave it',
      ),
      findsOneWidget,
    );
  });

  testWidgets(
    "another component's pending edit hides Inspect's panel and holds Approve",
    (tester) async {
      await pump(tester, FakeClient('yellow', pending: _pendingOn('Tag')));
      expect(_onPressed(tester, 'Approve'), isNull);
      expect(
        find.text(
          'Tag has a pending edit: keep or undo it in its Playground first.',
        ),
        findsOneWidget,
      );
      await tester.tap(find.text('Inspect'));
      await tester.pumpAndSettle();
      expect(find.text('Variant'), findsNothing);
      expect(find.text('Choose'), findsNothing);
      expect(find.textContaining('Pending:'), findsNothing);
    },
  );

  testWidgets(
    'a 🟢 component offers Undo approval alone, naming what it withdraws',
    (tester) async {
      final client = await pump(tester, FakeClient('green'));
      expect(find.text('Inspect'), findsNothing);
      expect(find.text('Approve'), findsNothing);
      await tester.tap(find.text('Undo approval'));
      await tester.pumpAndSettle();
      expect(find.text("Undo Button's approval?"), findsOneWidget);
      expect(
        find.text('This withdraws the approval of Button, Dialog on Flutter.'),
        findsOneWidget,
      );
      await tester.tap(find.text('Undo approval').last);
      await tester.pumpAndSettle();
      expect(client.calls, [
        ['unapprovePreview', 'Button', 'flutter'],
        ['unapprove', 'Button', 'flutter'],
      ]);
    },
  );

  testWidgets('Undo approval waits while any component has a pending edit', (
    tester,
  ) async {
    await pump(tester, FakeClient('green', pending: _pendingOn('Tag')));
    expect(_onPressed(tester, 'Undo approval'), isNull);
    expect(
      find.text(
        'Tag has a pending edit: keep or undo it in its Playground first.',
      ),
      findsOneWidget,
    );
  });

  testWidgets(
    'a 🟡 component approved on the web says Inspect and Report are locked',
    (tester) async {
      await pump(tester, FakeClient('yellow', webGreen: true));
      expect(find.text('Inspect'), findsNothing);
      expect(find.text('Report'), findsNothing);
      expect(_button('Approve'), findsOneWidget);
      expect(
        find.text(
          'Inspect and Report are locked: approved on web: undo its approval in Storybook to change it.',
        ),
        findsOneWidget,
      );
    },
  );

  testWidgets('a 🔴 component says what it waits on', (tester) async {
    await pump(tester, FakeClient('red', pending: _pendingOn('Tag')));
    expect(find.text('Approve first: Counter.'), findsOneWidget);
    expect(find.text('Inspect'), findsNothing);
    expect(find.text('Approve'), findsNothing);
    expect(find.textContaining('has a pending edit'), findsNothing);
  });

  testWidgets('a 🔴 component in a cycle says so', (tester) async {
    await pump(tester, FakeClient('red', counterColour: 'red'));
    expect(find.text('It is in a cycle with: Counter.'), findsOneWidget);
  });

  testWidgets(
    'Inspect closes when the component is locked meanwhile, until asked again',
    (tester) async {
      final client = await pump(tester, FakeClient('yellow'));
      await tester.tap(find.text('Inspect'));
      await tester.pumpAndSettle();
      expect(find.text('Variant'), findsOneWidget);
      client
        ..webGreen = true
        ..fire('changed');
      await tester.pumpAndSettle();
      expect(find.text('Inspect'), findsNothing);
      expect(find.text('Variant'), findsNothing);
      expect(
        find.textContaining('Inspect and Report are locked'),
        findsOneWidget,
      );
      client
        ..webGreen = false
        ..fire('changed');
      await tester.pumpAndSettle();
      expect(find.text('Inspect'), findsOneWidget);
      expect(find.text('Variant'), findsNothing);
      expect(
        tester.widget<SolarButton>(_button('Inspect')).prio,
        SolarButtonPrio.tertiary,
      );
    },
  );

  testWidgets(
    'the header is announced, and takes the focus after Approve and Undo approval',
    (tester) async {
      await pump(tester, FakeClient('yellow'));
      final header = find.ancestor(
        of: find.text('🟡 Workbench'),
        matching: find.byWidgetPredicate(
          (w) => w is Semantics && (w.properties.liveRegion ?? false),
        ),
      );
      expect(header, findsOneWidget);
      await tester.tap(find.text('Approve'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Approve').last);
      await tester.pumpAndSettle();
      expect(find.text('🟢 Workbench'), findsOneWidget);
      expect(
        FocusManager.instance.primaryFocus?.debugLabel,
        'Workbench header',
      );
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pump();
      await tester.tap(find.text('Undo approval'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Undo approval').last);
      await tester.pumpAndSettle();
      expect(find.text('🟡 Workbench'), findsOneWidget);
      expect(
        FocusManager.instance.primaryFocus?.debugLabel,
        'Workbench header',
      );
    },
  );

  testWidgets(
    'Variant and Layer wait while an action runs; Undo clears the reason',
    (tester) async {
      final gate = Completer<void>();
      final client = await pump(tester, FakeClient('yellow', keepGate: gate));
      await tester.tap(find.text('Inspect'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Choose'));
      await tester.pumpAndSettle();
      await tester.tap(find.textContaining('radius.pill').last);
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(EditableText), 'Figma draws a pill');
      await tester.tap(find.text('Undo'));
      await tester.pumpAndSettle();
      expect(client.calls.last, ['undo', 'Button']);
      // Chosen again: the reason field starts empty.
      await tester.tap(find.text('Choose'));
      await tester.pumpAndSettle();
      await tester.tap(find.textContaining('radius.pill').last);
      await tester.pumpAndSettle();
      expect(
        tester.widget<EditableText>(find.byType(EditableText)).controller.text,
        '',
      );
      // Keep in flight: the panel comes back only after it; meanwhile nothing starts another.
      await tester.enterText(find.byType(EditableText), 'Figma draws a pill');
      await tester.tap(find.text('Keep'));
      await tester.pump();
      client.pending = null;
      client.fire('changed');
      await tester.pump();
      await tester.pump();
      for (final label in ['Variant', 'Layer']) {
        final select = find.ancestor(
          of: find.text(label),
          matching: find.byWidgetPredicate((w) => w is SolarSelect),
        );
        expect(tester.widget<SolarSelect<Object?>>(select).enabled, isFalse);
      }
      gate.complete();
      await tester.pumpAndSettle();
      final variant = find.ancestor(
        of: find.text('Variant'),
        matching: find.byWidgetPredicate((w) => w is SolarSelect),
      );
      expect(tester.widget<SolarSelect<Object?>>(variant).enabled, isTrue);
    },
  );

  testWidgets('errors while the bar is up are shown bare', (tester) async {
    final client = await pump(
      tester,
      FakeClient('yellow', pending: _pendingOn('Button')),
    );
    // A re-read after an action that failed: its own message.
    client.statusError = 'the scan failed';
    await tester.enterText(find.byType(EditableText), 'Figma draws a pill');
    await tester.tap(find.text('Keep'));
    await tester.pumpAndSettle();
    expect(find.text('the scan failed'), findsOneWidget);
    expect(find.textContaining('Workbench:'), findsNothing);
    // An inspection that fails.
    client
      ..statusError = null
      ..inspectError = 'Button has no variant 0';
    await tester.tap(find.text('Undo'), warnIfMissed: false);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Inspect'));
    await tester.pumpAndSettle();
    expect(find.text('Button has no variant 0'), findsOneWidget);
    expect(find.textContaining('Workbench:'), findsNothing);
  });

  testWidgets(
    'a re-read the poll asks for that fails is silent, and asked again',
    (tester) async {
      final client = await pump(tester, FakeClient('yellow'));
      client
        ..statusError = 'the scan failed'
        ..fire('changed');
      await tester.pumpAndSettle();
      expect(find.textContaining('the scan failed'), findsNothing);
      // After a second the poll asks again; the next change is read.
      await tester.pump(const Duration(seconds: 1));
      client
        ..statusError = null
        ..pending = _pendingOn('Tag')
        ..fire('changed');
      await tester.pumpAndSettle();
      expect(find.textContaining('Tag has a pending edit'), findsOneWidget);
    },
  );

  testWidgets(
    'Undo approval: the preview, then the dialog; Cancel reads and sends nothing',
    (tester) async {
      final client = await pump(tester, FakeClient('green'));
      await tester.tap(find.text('Undo approval'));
      await tester.pumpAndSettle();
      expect(client.calls, [
        ['unapprovePreview', 'Button', 'flutter'],
      ]);
      final reads = client.statusCalls;
      // Not working while the dialog is open.
      expect(
        tester.widget<SolarButton>(_button('Undo approval').first).onPressed,
        isNotNull,
      );
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(client.statusCalls, reads);
      expect(client.calls, [
        ['unapprovePreview', 'Button', 'flutter'],
      ]);
    },
  );

  testWidgets('a service gone while it starts leaves no bar and no error', (
    tester,
  ) async {
    final client = await pump(tester, FakeClient('yellow', starting: 5));
    client.alive = false;
    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();
    expect(client.statusCalls, 1);
    expect(find.textContaining('Workbench'), findsNothing);
    expect(find.textContaining('starting'), findsNothing);
  });

  testWidgets('the bar is spaced as the web: inset-xs in its rows', (
    tester,
  ) async {
    await pump(tester, FakeClient('yellow', pending: _pendingOn('Button')));
    final wraps = tester.widgetList<Wrap>(
      find.descendant(
        of: find.byType(WorkbenchBar),
        matching: find.byType(Wrap),
      ),
    );
    expect(wraps, isNotEmpty);
    for (final w in wraps) {
      expect((w.spacing, w.runSpacing), (SolarInset.xs, SolarInset.xs));
    }
  });

  testWidgets('a service still starting is asked again, then the bar shows', (
    tester,
  ) async {
    final client = await pump(tester, FakeClient('yellow', starting: 2));
    expect(find.textContaining('Workbench'), findsNothing);
    await tester.pump(const Duration(seconds: 1));
    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();
    expect(client.statusCalls, 3);
    expect(find.text('🟡 Workbench'), findsOneWidget);
  });

  testWidgets('a service that fails otherwise says so, and draws no bar', (
    tester,
  ) async {
    await pump(tester, FakeClient('yellow', statusError: 'the scan failed'));
    expect(find.text('Workbench: the scan failed'), findsOneWidget);
    expect(find.text('Inspect'), findsNothing);
  });

  testWidgets('with no service there is no bar', (tester) async {
    await pump(tester, FakeClient('yellow', alive: false));
    expect(find.text('Inspect'), findsNothing);
    expect(find.textContaining('Workbench'), findsNothing);
    expect(find.bySemanticsLabel(RegExp('^Workbench')), findsNothing);
  });
}
