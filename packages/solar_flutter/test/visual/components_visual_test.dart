// Flutter visual parity: every variant of every generated component, pumped as the real widget,
// the platform state forced through a WidgetStatesController, and what is painted read back --
// the face's decoration, the border, the painted text style, the icons' theme, the laid-out
// geometry -- and compared with what Figma draws (spec/verify/<name>.json). Native widget tests,
// not Flutter web. Excused entries are reported to build/visual/<name>-gaps.json, not compared.

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'compare.dart';

final button = loadOracle('button');
final spinner = loadOracle('spinner');

/// Each case in a tree of its own (a new key), so nothing animates from the previous one.
Future<void> pump(WidgetTester tester, Widget child) async {
  await tester.pumpWidget(
    MaterialApp(
      key: UniqueKey(),
      theme: ThemeData(extensions: const [SolarTheme.light]),
      home: Scaffold(body: Center(child: child)),
    ),
  );
  await settle(tester);
}

/// Past every transition -- Material animates its text style for 200ms -- to the state's end
/// value: one frame to start the animation, one after it has ended. Not pumpAndSettle: a loading
/// button's spinner never settles.
Future<void> settle(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(seconds: 1));
}

/// A stand-in icon that paints what the button's IconTheme gives it, so the colour and size an
/// icon would take are what is measured.
class IconProbe extends StatelessWidget {
  const IconProbe({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = IconTheme.of(context);
    return SizedBox.square(
      dimension: theme.size,
      child: ColoredBox(color: theme.color!),
    );
  }
}

T enumNamed<T extends Enum>(List<T> values, String name) => values.firstWhere(
    (v) => v.name == name || (v is SolarSpinnerVariant && v.figma == name));

const _states = {
  'hover': WidgetState.hovered,
  'pressed': WidgetState.pressed,
  'focus': WidgetState.focused,
};

/// The painted text style of the paragraph showing [text].
TextStyle paintedText(WidgetTester tester, String text) =>
    tester.renderObject<RenderParagraph>(find.text(text)).text.style!;

Map<String, Object?> textValues(TextStyle s) => {
      'color': s.color,
      'fontFamily': s.fontFamily,
      'fontWeight': s.fontWeight,
      'fontSize': s.fontSize,
      'lineHeight': s.height! * s.fontSize!,
      'letterSpacing': s.letterSpacing ?? 0,
      'textDecoration':
          s.decoration == TextDecoration.underline ? 'underline' : 'none',
    };

/// Button: every oracle layer, measured from the pumped SolarButton.
Future<Map<String, Map<String, Object?>>> measureButton(
    WidgetTester tester, Map<String, dynamic> variant) async {
  final props = variant['props'] as Map<String, dynamic>;
  final states = WidgetStatesController();
  await pump(
    tester,
    SolarButton(
      onPressed: () {},
      size: enumNamed(SolarButtonSize.values, props['size'] as String),
      variant: enumNamed(SolarButtonVariant.values, props['variant'] as String),
      danger: props['danger'] as bool,
      disabled: props['disabled'] as bool,
      loading: props['loading'] as bool,
      statesController: states,
      iconLeading: const IconProbe(key: Key('lead')),
      iconTrailing: const IconProbe(key: Key('trail')),
      counter: const Text('3', key: Key('counter')),
      child: const Text('Label'),
    ),
  );
  final state = _states[variant['state']];
  if (state != null) {
    states.update(state, true);
    await settle(tester);
  }

  final inButton = find.byType(FilledButton);
  final faceFinder =
      find.descendant(of: inButton, matching: find.byType(DecoratedBox)).first;
  final face =
      tester.widget<DecoratedBox>(faceFinder).decoration as BoxDecoration;
  final shape = tester
      .widget<Material>(
          find.descendant(of: inButton, matching: find.byType(Material)).first)
      .shape! as OutlinedBorder;
  final padding = tester
      .widgetList<Padding>(
          find.descendant(of: inButton, matching: find.byType(Padding)))
      .firstWhere((p) => p.child is Align)
      .padding
      .resolve(TextDirection.ltr);
  final root = tester.getRect(faceFinder);
  final lead = tester.getRect(find.byKey(const Key('lead')));
  final label = tester.getRect(find.text('Label'));
  Map<String, Object?> icon(String key) {
    final finder = find.byKey(Key(key));
    final painted = tester.widget<ColoredBox>(
        find.descendant(of: finder, matching: find.byType(ColoredBox)));
    final size = tester.getSize(finder);
    return {'color': painted.color, 'width': size.width, 'height': size.height};
  }

  final visibility = tester.widget<Visibility>(
      find.ancestor(of: find.text('Label'), matching: find.byType(Visibility)));
  final spinners = find.byType(SolarSpinner);

  return {
    'root': {
      'background': face.color ?? Colors.transparent,
      'borderColor': shape.side.color,
      'borderWidth':
          shape.side.style == BorderStyle.none ? 0.0 : shape.side.width,
      'radius': (face.borderRadius as BorderRadius?)?.topLeft.x ?? 0.0,
      'shadow': face.boxShadow ?? const <BoxShadow>[],
      'paddingTop': padding.top,
      'paddingRight': padding.right,
      'paddingBottom': padding.bottom,
      'paddingLeft': padding.left,
      'gap': label.left - lead.right,
      'width': root.width,
      'height': root.height,
    },
    'label': {
      ...textValues(paintedText(tester, 'Label')),
      'drawn': visibility.visible,
    },
    'iconLeading': icon('lead'),
    'iconTrailing': icon('trail'),
    // The slot's box, which the recipe sizes, as the web measures .SolarButton-counter.
    'counter': {
      'height': tester
          .getSize(find
              .ancestor(
                  of: find.byKey(const Key('counter')),
                  matching: find.byType(SizedBox))
              .first)
          .height
    },
    'spinner': spinners.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, ...measureSpinnerWidget(tester, spinners)},
  };
}

/// A pumped SolarSpinner: its box and its two strokes.
Map<String, Object?> measureSpinnerWidget(WidgetTester tester, Finder at) {
  final ring = tester.widget<CircularProgressIndicator>(find.descendant(
      of: at, matching: find.byType(CircularProgressIndicator)));
  final size = tester.getSize(at);
  return {
    'width': size.width,
    'height': size.height,
    'track': ring.backgroundColor,
    'indicator': ring.color,
    'strokeWidth': ring.strokeWidth,
  };
}

/// The Spinner oracle's variant for a size and a Figma style.
Map<String, dynamic> spinnerVariant(String size, String style) =>
    (spinner['variants'] as List)
        .cast<Map<String, dynamic>>()
        .firstWhere((v) => v['figma'] == 'size=$size, style=$style');

/// Every Button variant against the oracle.
Future<(List<Difference>, List<Difference>)> checkButton(
    WidgetTester tester, Map<String, dynamic> oracle,
    {Set<String>? only}) async {
  final failures = <Difference>[];
  final gaps = <Difference>[];
  final variants = (oracle['variants'] as List).cast<Map<String, dynamic>>();
  final atRest = variants.first['layers'] as Map<String, dynamic>;
  for (final v in variants) {
    final name = v['figma'] as String;
    if (only != null && !only.contains(name)) continue;
    final painted = await measureButton(tester, v);
    final excused = (v['excused'] as List?) ?? const [];
    for (final MapEntry(key: layer, value: e)
        in (v['layers'] as Map<String, dynamic>).entries) {
      final expected = e as Map<String, dynamic>;
      final got = painted[layer]!;
      // Shown by a prop (hidden at rest in Figma): measured whenever rendered. Hidden only in this
      // variant: the state removes it, so it must not be drawn.
      final byProp = (oracle['slots'] as Map).containsKey(layer) &&
          (atRest[layer] as Map<String, dynamic>)['hidden'] == true;
      if (expected['hidden'] == true && !byProp) {
        if (got['drawn'] == true) {
          failures.add(Difference(name, layer, 'hidden', true, false));
        }
        continue;
      }
      if (layer == 'spinner') {
        if (got['drawn'] != true) {
          failures.add(Difference(name, layer, 'present', true, false));
          continue;
        }
        final variant = expected['variant'] as Map<String, dynamic>;
        final s = spinnerVariant(
            variant['size'] as String, variant['style'] as String);
        final l = s['layers'] as Map<String, dynamic>;
        final ring = l['spinnerRing'] as Map<String, dynamic>;
        for (final p in ['width', 'height']) {
          if (!agrees(p, ring[p], got[p])) {
            failures.add(Difference(name, layer, p, ring[p], got[p]));
          }
        }
        for (final part in ['track', 'indicator']) {
          final figma = (l[part] as Map<String, dynamic>)['borderColor'];
          if (figma != null && !agrees('color', figma, got[part])) {
            failures
                .add(Difference(name, layer, '$part.stroke', figma, got[part]));
          }
        }
        continue;
      }
      compareLayer(name, layer, expected, got, excused, failures, gaps);
    }
  }
  return (failures, gaps);
}

void main() {
  testWidgets('Button draws what Figma draws, in every variant',
      (tester) async {
    final (failures, gaps) = await checkButton(tester, button);
    report('button-gaps', gaps);
    report('button-failures', failures);
    expect(failures, isEmpty, reason: failures.join('\n'));
    final excused = (button['variants'] as List)
        .fold<int>(0, (n, v) => n + ((v['excused'] as List?)?.length ?? 0));
    expect(gaps, hasLength(excused));
  });

  testWidgets('Spinner draws what Figma draws, in every variant',
      (tester) async {
    final failures = <Difference>[];
    final gaps = <Difference>[];
    for (final v
        in (spinner['variants'] as List).cast<Map<String, dynamic>>()) {
      final props = v['props'] as Map<String, dynamic>;
      await pump(
        tester,
        SolarSpinner(
          size: enumNamed(SolarSpinnerSize.values, props['size'] as String),
          variant:
              enumNamed(SolarSpinnerVariant.values, props['variant'] as String),
        ),
      );
      final got = measureSpinnerWidget(tester, find.byType(SolarSpinner));
      final layers = v['layers'] as Map<String, dynamic>;
      final name = v['figma'] as String;
      final excused = (v['excused'] as List?) ?? const [];
      // SolarSpinner draws no frame of its own: the root is Figma's transparent, borderless auto
      // layout, so it is compared as exactly that rather than skipped.
      compareLayer(
          name,
          'root',
          layers['root'] as Map<String, dynamic>,
          {
            'background': Colors.transparent,
            'borderWidth': 0.0,
            'radius': 0.0,
            'shadow': const <BoxShadow>[],
            'paddingTop': 0.0,
            'paddingRight': 0.0,
            'paddingBottom': 0.0,
            'paddingLeft': 0.0,
            'gap': 0.0,
          },
          excused,
          failures,
          gaps);
      compareLayer(
          name,
          'spinnerRing',
          layers['spinnerRing'] as Map<String, dynamic>,
          {
            'background': Colors.transparent,
            'borderWidth': 0.0,
            'radius': 0.0,
            'width': got['width'],
            'height': got['height'],
          },
          excused,
          failures,
          gaps);
      compareLayer(
          name,
          'track',
          layers['track'] as Map<String, dynamic>,
          {
            'background': Colors.transparent,
            'borderColor': got['track'],
            'borderWidth': got['strokeWidth'],
          },
          excused,
          failures,
          gaps);
      compareLayer(
          name,
          'indicator',
          layers['indicator'] as Map<String, dynamic>,
          {
            'background': Colors.transparent,
            'borderColor': got['indicator'],
            'borderWidth': got['strokeWidth'],
          },
          excused,
          failures,
          gaps);
    }
    report('spinner-gaps', gaps);
    report('spinner-failures', failures);
    expect(failures, isEmpty, reason: failures.join('\n'));
    expect(gaps, hasLength(3));
  });

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
    final (failures, _) = await checkButton(tester, broken, only: {hovered});
    expect(failures.map((f) => '${f.variant} ${f.layer}.${f.property}'),
        ['$hovered root.background']);
  });
}
