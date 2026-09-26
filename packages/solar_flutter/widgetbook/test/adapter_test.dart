// The Playground's core (lib/playground/core.dart) and Widgetbook adapter (adapter.dart): a
// control's value written the way its knob's own field writes it, read back by the real knob; the
// typed accessors and what `set` accepts; a component's change reaching the knob and the panel;
// Reset; the event log; every icon name resolving.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/playground/adapter.dart';
import 'package:solar_widgetbook/playground/controls.dart';
import 'package:solar_widgetbook/playground/core.dart';
import 'package:solar_widgetbook/playground/icons.dart';
import 'package:solar_widgetbook/playground/playground.dart';
import 'package:widgetbook/widgetbook.dart';

import 'helpers.dart';

/// A builder that hands its Playground to [onBuild] and draws a probe box.
SolarPlaygroundBuilder probe(void Function(SolarPlayground p) onBuild) =>
    SolarPlaygroundBuilder(
      build: (p) {
        onBuild(p);
        return const SizedBox(
          key: ValueKey('component'),
          width: double.infinity,
          height: 1,
        );
      },
    );

/// A recording Playground over [component]'s controls at their defaults, with [values] over them.
({ControlledPlayground p, List<(String, Object?)> sets}) recording(
  String component, [
  Map<String, Object?> values = const {},
]) {
  final controls = controlsOf(component);
  final current = {for (final c in controls) c.name: c.initial, ...values};
  final sets = <(String, Object?)>[];
  final p = ControlledPlayground(
    controls: controls,
    read: (name) => current[name],
    write: (c, v) {
      sets.add((c.name, v));
      current[c.name] = v;
    },
    onLog: (_, _) {},
  );
  return (p: p, sets: sets);
}

void main() {
  group('encode', () {
    // Each kind's value, decoded by the Widgetbook field its knob draws.
    PlaygroundControl control(
      String kind,
      Object? initial, {
      num? min,
      num? max,
    }) => PlaygroundControl(
      name: 'a knob',
      kind: kind,
      initial: initial,
      options: const ['md', 'sm', 'lg'],
      min: min,
      max: max,
    );

    test('boolean, child and content decode through BooleanField', () {
      for (final kind in ['boolean', 'child', 'content']) {
        for (final v in [true, false]) {
          final param = control(kind, false).encode(v);
          expect(BooleanField(name: 'a knob').valueFrom({'a knob': param}), v);
        }
      }
    });

    test('text and childText decode through StringField', () {
      for (final kind in ['text', 'childText']) {
        for (final v in ['', 'Label', 'a, b: {c} [d] é']) {
          final param = control(kind, '').encode(v);
          expect(StringField(name: 'a knob').valueFrom({'a knob': param}), v);
        }
        expect(control(kind, '').encode(null), '');
      }
    });

    test(
      'number decodes through DoubleInputField, or a slider with bounds',
      () {
        for (final v in [0, 3, 2.5, -1]) {
          final param = control('number', 0).encode(v);
          expect(
            DoubleInputField(name: 'a knob').valueFrom({'a knob': param}),
            v.toDouble(),
          );
        }
        final slider = DoubleSliderField(
          name: 'a knob',
          min: 0,
          max: 1,
          precision: null,
        );
        for (final v in [0, 0.25, 1]) {
          final param = control('number', 0, min: 0, max: 1).encode(v);
          expect(slider.valueFrom({'a knob': param}), v.toDouble());
        }
      },
    );

    test('integer decodes through IntInputField, or a slider with bounds', () {
      for (final v in [0, 3, -1, 120]) {
        final param = control('integer', 0).encode(v);
        expect(IntInputField(name: 'a knob').valueFrom({'a knob': param}), v);
      }
      final slider = IntSliderField(
        name: 'a knob',
        initialValue: 1,
        min: 1,
        max: 6,
      );
      for (final v in [1, 4, 6]) {
        final param = control('integer', 1, min: 1, max: 6).encode(v);
        expect(slider.valueFrom({'a knob': param}), v);
      }
      expect(() => control('integer', 0).encode(2.5), throwsArgumentError);
    });

    test('color decodes through ColorField, null as a cleared box', () {
      final field = ColorField(name: 'a knob');
      const red = Color(0xffe53935);
      expect(
        field.valueFrom({'a knob': control('color', null).encode(red)}),
        red,
      );
      expect(
        field.valueFrom({'a knob': control('color', null).encode('#e53935')}),
        red,
      );
      final cleared = control('color', red).encode(null);
      expect(field.isNull({'a knob': cleared}), isTrue);
      expect(field.valueFrom({'a knob': cleared}), isNull);
    });

    test('select, icon and width decode through ObjectDropdownField', () {
      final cases = {
        control('select', 'md'): 'lg',
        control('icon', playgroundIconNone): 'chevron-right solid',
        control('width', 'auto'): '320',
      };
      for (final MapEntry(key: c, value: v) in cases.entries) {
        final field = ObjectDropdownField<String>(
          name: 'a knob',
          values: c.choices,
          initialValue: c.initial! as String,
        );
        expect(field.valueFrom({'a knob': c.encode(v)}), v);
      }
      expect(() => control('select', 'md').encode('xl'), throwsArgumentError);
      expect(() => control('boolean', false).encode(null), throwsArgumentError);
    });

    test('the icon options are the web core\'s', () {
      expect(iconOptions.take(4), [
        playgroundIconNone,
        playgroundIconSample,
        playgroundIcons.first,
        '${playgroundIcons.first}$playgroundIconSolid',
      ]);
      expect(iconOptions, hasLength(2 + 2 * playgroundIcons.length));
    });
  });

  group('icons', () {
    test('none, the sample, and every stem in both styles', () {
      expect(playgroundIcon(playgroundIconNone), isNull);
      expect(
        (playgroundIcon(playgroundIconSample)! as SolarIcon).icon,
        SolarIcons.plusOutline,
      );
      expect(playgroundIcon('no-such-icon'), isNull);
      expect(playgroundIcon(null), isNull);
      for (final s in playgroundIcons) {
        expect(playgroundIcon(s), isA<SolarIcon>(), reason: s);
        expect(
          playgroundIcon('$s$playgroundIconSolid'),
          isA<SolarIcon>(),
          reason: s,
        );
      }
      expect(
        (playgroundIcon('phantom48-v solid')! as SolarIcon).icon,
        SolarIcons.phantom48VSolid,
      );
      expect(
        (playgroundIcon('chevron-right')! as SolarIcon).icon,
        SolarIcons.chevronRightOutline,
      );
      expect(solarIconsByName, hasLength(2 * playgroundIcons.length));
    });
  });

  group('the core', () {
    test('the log\'s lines are the web\'s logLine', () {
      expect(logLine('onPressed'), 'onPressed');
      expect(logLine('onClose', null), 'onClose');
      expect(logLine('onChanged', true), 'onChanged: true');
      expect(logLine('onChanged', 'abc'), 'onChanged: "abc"');
      expect(logLine('onChanged', 3), 'onChanged: 3');
      var lines = <String>[];
      for (var i = 0; i < playgroundLogLength + 2; i++) {
        lines = withLine(lines, '$i');
      }
      expect(lines, hasLength(playgroundLogLength));
      expect(lines.first, '${playgroundLogLength + 1}');
    });

    test('every member throws for an unknown name', () {
      final (:p, :sets) = recording('Button');
      for (final read in <void Function()>[
        () => p.value('nope'),
        () => p.flag('nope'),
        () => p.text('nope'),
        () => p.words('nope'),
        () => p.whole('nope'),
        () => p.choice('nope', SolarButtonSize.values),
        () => p.icon('nope'),
        () => p.child('nope'),
        () => p.set('nope', true),
        () => p.setChoice('nope', SolarButtonSize.sm),
      ]) {
        expect(read, throwsArgumentError);
      }
      expect(sets, isEmpty);
    });

    test('the accessors throw for a control of another kind', () {
      final (:p, sets: _) = recording('Button');
      expect(() => p.flag('label'), throwsArgumentError);
      expect(() => p.text('disabled'), throwsArgumentError);
      expect(() => p.words('size'), throwsArgumentError);
      expect(() => p.whole('label'), throwsArgumentError);
      expect(
        () => p.choice('label', SolarButtonSize.values),
        throwsArgumentError,
      );
      expect(() => p.icon('label'), throwsArgumentError);
      expect(() => p.child('iconLeading'), throwsArgumentError);
      expect(
        () => p.setChoice('label', SolarButtonSize.sm),
        throwsArgumentError,
      );
      // `value` reads any kind.
      expect(p.value('label'), 'Label');
      expect(p.value('size'), 'md');
    });

    test('text, words, flag, whole and child', () {
      final (:p, sets: _) = recording('Button', {
        'label': '',
        'counter': true,
        'counter count': 2.6,
      });
      expect(p.text('label'), '');
      expect(p.words('label'), isNull);
      expect(p.flag('counter'), isTrue);
      expect(p.flag('disabled'), isFalse);
      expect(p.whole('counter count'), 3);
      expect(p.child('counter'), (shown: true, text: null));
      // Below its minimum, clamped; cleared, its default.
      expect(
        recording('Button', {'counter count': -4}).p.whole('counter count'),
        0,
      );
      expect(
        recording('Button', {'counter count': null}).p.whole('counter count'),
        3,
      );
      expect(recording('Pagination', {'page': 0}).p.whole('page'), 1);
      final banner = recording('Banner').p;
      expect(banner.child('primaryButton').text, 'Label');
      expect(recording('Button', {'label': null}).p.text('label'), '');
    });

    test('choice and setChoice go through dartOptions', () {
      // Action Card's `default` is the enum's `$default`; Button Group's `full-width` its
      // `fullWidth`.
      final card = playgroundControls['Action Card']!.firstWhere(
        (c) => c['name'] == 'status',
      );
      expect(card['options'], contains('default'));
      expect(card['dartOptions'], contains(r'$default'));
      var (:p, :sets) = recording('Action Card');
      expect(
        p.choice('status', SolarActionCardStatus.values),
        SolarActionCardStatus.$default,
      );
      p.setChoice('status', SolarActionCardStatus.danger);
      expect(sets.last, ('status', 'danger'));
      expect(
        p.choice('status', SolarActionCardStatus.values),
        SolarActionCardStatus.danger,
      );
      p.setChoice('status', SolarActionCardStatus.$default);
      expect(sets.last, ('status', 'default'));

      (:p, :sets) = recording('Button Group');
      expect(
        p.choice('type', SolarButtonGroupType.values),
        SolarButtonGroupType.regular,
      );
      p.setChoice('type', SolarButtonGroupType.fullWidth);
      expect(sets.last, ('type', 'full-width'));
      expect(
        p.choice('type', SolarButtonGroupType.values),
        SolarButtonGroupType.fullWidth,
      );
      // An option the select does not offer.
      expect(
        () => p.setChoice('type', SolarButtonSize.lg),
        throwsArgumentError,
      );
    });

    test('set checks the value against the control', () {
      final (:p, :sets) = recording('Button');
      final wrong = <String, Object?>{
        'disabled': 'true', // a toggle takes a bool
        'counter': null,
        'label': 3, // words take a String
        'size': 'xl', // one of a select's options
        'iconLeading': 'no-such-icon',
        'width': '100',
        'counter count': 2.5, // an int
        'counter count ': 2,
      };
      for (final MapEntry(key: name, value: v) in wrong.entries) {
        expect(() => p.set(name, v), throwsArgumentError, reason: name);
      }
      expect(() => p.set('counter count', -1), throwsArgumentError);
      expect(() => p.set('counter count', '5'), throwsArgumentError);
      expect(sets, isEmpty);
      final right = <String, Object?>{
        'disabled': true,
        'counter': true,
        'label': '',
        'size': 'lg',
        'iconLeading': 'chevron-right solid',
        'width': '320',
        'counter count': 0,
      };
      for (final MapEntry(key: name, value: v) in right.entries) {
        p.set(name, v);
      }
      expect(sets, [for (final e in right.entries) (e.key, e.value)]);
      final avatar = recording('Avatar');
      avatar.p.set('color', const Color(0xff1e88e5));
      avatar.p.set('color', '#1e88e5');
      avatar.p.set('color', null);
      expect(() => avatar.p.set('color', 'blue'), throwsArgumentError);
      expect(() => avatar.p.set('color', 3), throwsArgumentError);
    });
  });

  group('the adapter', () {
    testWidgets('set reaches every kind of knob', (tester) async {
      late SolarPlayground p;
      final builder = probe((playground) => p = playground);

      // Action Card has a select, an icon, a content slot, component slots with words, and width.
      await pumpPlayground(tester, 'Action Card', builder);
      final changes = <String, Object?>{
        'status': 'danger',
        'icon': 'chevron-right solid',
        'content': false,
        'primaryCTA': false,
        'primaryCTA label': 'Go on',
        'width': '200',
      };
      for (final MapEntry(key: name, value: v) in changes.entries) {
        p.set(name, v);
        await tester.pump();
        expect(p.value(name), v, reason: name);
      }
      expect(p.child('primaryCTA'), (shown: false, text: 'Go on'));
      expect((p.icon('icon')! as SolarIcon).icon, SolarIcons.chevronRightSolid);
      expect(
        tester.getSize(find.byKey(const ValueKey('component'))).width,
        200,
      );

      // A text extra, a boolean extra.
      await pumpPlayground(tester, 'Text Input', builder);
      p.set('value', 'typed');
      await tester.pump();
      expect(p.text('value'), 'typed');
      await pumpPlayground(tester, 'Dialog', builder);
      p.set('open', true);
      await tester.pump();
      expect(p.flag('open'), isTrue);

      // Avatar's colour, which starts cleared.
      await pumpPlayground(tester, 'Avatar', builder);
      expect(p.value('color'), isNull);
      p.set('color', const Color(0xff1e88e5));
      await tester.pump();
      expect(p.value('color'), const Color(0xff1e88e5));
      p.set('color', null);
      await tester.pump();
      expect(p.value('color'), isNull);
    });

    testWidgets(
      'the width box: a filling component takes its width, a hugging one keeps its own',
      (tester) async {
        const filler = ValueKey('filler');
        const hugger = ValueKey('hugger');
        late SolarPlayground p;
        final builder = SolarPlaygroundBuilder(
          build: (playground) {
            p = playground;
            return const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(key: filler, width: double.infinity, height: 1),
                SizedBox(key: hugger, width: 10, height: 1),
              ],
            );
          },
        );
        await pumpPlayground(tester, 'Checkbox', builder);
        // At `auto`, the column's whole width: the test surface's, less the Playground's inset.
        final column =
            tester.view.physicalSize.width / tester.view.devicePixelRatio -
            2 * SolarInset.md;
        expect(tester.getSize(find.byKey(filler)).width, column);
        expect(tester.getSize(find.byKey(hugger)).width, 10);
        // A width picked: the filler takes it, the hugger still hugs, at the box's start.
        p.set('width', '200');
        await tester.pump();
        expect(tester.getSize(find.byKey(filler)).width, 200);
        expect(tester.getSize(find.byKey(hugger)).width, 10);
        expect(
          tester.getTopLeft(find.byKey(hugger)).dx,
          tester.getTopLeft(find.byKey(filler)).dx,
        );
      },
    );

    testWidgets('an integer extra is an int knob', (tester) async {
      late SolarPlayground p;
      final state = await pumpPlayground(
        tester,
        'Button',
        probe((playground) => p = playground),
      );
      expect(state.knobs['counter count']!.fields.single, isA<IntInputField>());
      expect(p.value('counter count'), 3);
      expect(p.whole('counter count'), 3);
      p.set('counter count', 5);
      await tester.pump();
      expect(knobsOf(state)['counter count'], '5');
      expect(p.value('counter count'), 5);
      expect(p.whole('counter count'), 5);
      expect(() => p.set('counter count', -1), throwsArgumentError);
      expect(() => p.set('counter count', 5.5), throwsArgumentError);
    });

    testWidgets('typing keeps the field focused across the rebuild', (
      tester,
    ) async {
      late SolarPlayground p;
      final builder = SolarPlaygroundBuilder(
        build: (playground) {
          p = playground;
          return TextField(onChanged: (v) => p.set('value', v));
        },
      );
      await pumpPlayground(tester, 'Text Input', builder);
      // The first field is the component's; the panel's text knobs come after it.
      await tester.enterText(find.byType(TextField).first, 'ab');
      await tester.pump();
      expect(p.text('value'), 'ab');
      final field = tester.state<EditableTextState>(
        find.byType(EditableText).first,
      );
      expect(field.widget.focusNode.hasFocus, isTrue);
      expect(field.widget.controller.text, 'ab');
    });

    testWidgets('a tap reaches the knob and the panel; the log; Reset', (
      tester,
    ) async {
      late SolarPlayground p;
      final builder = SolarPlaygroundBuilder(
        build: (playground) {
          p = playground;
          return SolarCheckbox(
            checked: p.flag('checked'),
            mixed: p.flag('mixed'),
            onChanged: p.flag('disabled')
                ? null
                : (v) {
                    p.set('checked', v);
                    p.log('onChanged', v);
                  },
            semanticLabel: 'Option',
          );
        },
      );
      final state = await pumpPlayground(tester, 'Checkbox', builder);
      // The panel's first switch is `checked`'s, the knobs in the controls' order.
      bool panelChecked() =>
          tester.widget<Switch>(find.byType(Switch).first).value;

      expect(p.flag('checked'), false);
      expect(panelChecked(), isFalse);

      await tester.tap(find.byType(SolarCheckbox));
      await tester.pump();
      expect(p.flag('checked'), true);
      expect(knobsOf(state)['checked'], 'true');
      expect(
        tester.widget<SolarCheckbox>(find.byType(SolarCheckbox)).checked,
        isTrue,
      );
      expect(panelChecked(), isTrue);
      expect(find.text('1. onChanged: true'), findsOneWidget);

      await tester.tap(find.byType(SolarCheckbox));
      await tester.pump();
      expect(p.flag('checked'), false);
      expect(find.text('1. onChanged: false'), findsOneWidget);
      expect(find.text('2. onChanged: true'), findsOneWidget);

      // The log keeps five, newest first.
      for (var i = 0; i < 5; i++) {
        await tester.tap(find.byType(SolarCheckbox));
        await tester.pump();
      }
      expect(find.textContaining('6. '), findsNothing);
      expect(find.text('5. onChanged: true'), findsOneWidget);

      p.set('mixed', true);
      await tester.pump();
      expect(p.flag('checked'), true);
      // Reset writes only what differs from its default: `checked` and `mixed`, not `disabled` or
      // the width.
      var writes = 0;
      void count() => writes++;
      state.addListener(count);
      await tester.tap(find.text('Reset'));
      await tester.pump();
      state.removeListener(count);
      expect(writes, 2);
      expect(p.flag('checked'), false);
      expect(p.flag('mixed'), false);
      expect(p.value('width'), 'auto');
      expect(panelChecked(), isFalse);
      expect(find.textContaining('onChanged'), findsNothing);
      // At its defaults, Reset writes nothing.
      state.addListener(count);
      await tester.tap(find.text('Reset'));
      await tester.pump();
      state.removeListener(count);
      expect(writes, 2);
    });

    testWidgets('set and log do nothing once the Playground is gone', (
      tester,
    ) async {
      late SolarPlayground p;
      final shown = ValueNotifier(true);
      final state = await pumpPlayground(
        tester,
        'Checkbox',
        probe((playground) => p = playground),
        shown: shown,
      );
      shown.value = false;
      await tester.pump();
      final before = state.uri;
      p.set('checked', true);
      p.log('onChanged', true);
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(state.uri, before);
    });
  });
}
