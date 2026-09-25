// The generic half of the Flutter visual checks: pumping one oracle variant of any component,
// forcing its platform state, and comparing every layer with the oracle -- a composed child against
// its own oracle. What is particular to a component is its case, under cases/.

import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'package:solar_flutter_variants/solar_flutter_variants.dart';

import 'compare.dart';

export 'package:solar_flutter_variants/solar_flutter_variants.dart';

/// What a case measures: each oracle layer's painted values.
typedef Layers = Map<String, Map<String, Object?>>;

/// How the checks render and measure one component.
class VisualCase {
  const VisualCase({
    required this.build,
    required this.measure,
    this.layersAt,
    this.surface,
  });

  /// The widget in one oracle variant (`builders/`, shared with the Widgetbook app).
  final VariantBuilder build;

  /// Every oracle layer, measured from the pumped widget.
  final Layers Function(WidgetTester tester) measure;

  /// This component's layers where another draws it (Button's spinner), found at [at].
  final Layers Function(WidgetTester tester, Finder at)? layersAt;

  /// The logical size of the screen it is pumped on, where the test's 800 × 600 is too small for
  /// what Figma draws in it (a TableHeader's controls, each at its own size); null for that.
  final Size? surface;
}

/// Every oracle the codegen generated, by component: one per component it generates.
Map<String, Map<String, dynamic>> loadOracles() {
  final out = <String, Map<String, dynamic>>{};
  for (final f in Directory('../../spec/verify').listSync().whereType<File>()) {
    if (!f.path.endsWith('.json')) continue;
    final o = loadOracle(f.uri.pathSegments.last.replaceAll('.json', ''));
    out[o['component'] as String] = o;
  }
  return out;
}

/// Every font the package bundles, from the font manifest, under the name a style asks for it by
/// (`packages/solar_flutter/Inter`). Without them a test lays text out in its own font, whose
/// every glyph is a square, so a fixed-width Button with every probe in it would overflow where the
/// real font fits, as it does on the web.
Future<void> loadBundledFonts() async {
  final manifest =
      jsonDecode(await rootBundle.loadString('FontManifest.json')) as List;
  for (final family in manifest.cast<Map<String, dynamic>>()) {
    // Tested as the app itself, the package's fonts are listed under their bare names; a style
    // names them as a package's fonts.
    final name = family['family'] as String;
    final loader = FontLoader(
      name.startsWith('packages/') ? name : 'packages/solar_flutter/$name',
    );
    for (final font in (family['fonts'] as List).cast<Map<String, dynamic>>()) {
      loader.addFont(rootBundle.load(font['asset'] as String));
    }
    await loader.load();
  }
}

/// The mode a check measures in, set by [check]: in Dark, the case is pumped under
/// [SolarTheme.dark], and each variant read as [inMode] gives it.
bool _dark = false;

/// A variant as the mode draws it: in Dark, its Light entry with its `dark` over it, the layers'
/// values Dark draws otherwise (a token's Dark value) and its excuses where they differ.
Map<String, dynamic> inMode(Map<String, dynamic> v) {
  final dark = v['dark'] as Map<String, dynamic>?;
  if (!_dark || dark == null) return v;
  final over = (dark['layers'] as Map<String, dynamic>?) ?? const {};
  return {
    ...v,
    'layers': {
      for (final MapEntry(:key, :value)
          in (v['layers'] as Map<String, dynamic>).entries)
        key: {
          ...value as Map<String, dynamic>,
          ...?(over[key] as Map<String, dynamic>?),
        },
    },
    'excused': dark['excused'] ?? v['excused'],
  };
}

/// Each case in a tree of its own (a new key), so nothing animates from the previous one.
Future<void> pump(WidgetTester tester, Widget child) async {
  await tester.pumpWidget(
    MaterialApp(
      key: UniqueKey(),
      theme: ThemeData(
        extensions: [_dark ? SolarTheme.dark : SolarTheme.light],
      ),
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
  'textDecoration': s.decoration == TextDecoration.underline
      ? 'underline'
      : 'none',
};

/// A paragraph's painted style, and whether it paints any words: a text in the right style with
/// none in it draws nothing, and would pass on its style alone.
Map<String, Object?> paragraphValues(RenderParagraph p) => {
  ...textValues(p.text.style!),
  'words': p.text.toPlainText().trim().isNotEmpty,
};

/// Whether anything under [at] shows words: a paragraph (a field's hint among them), or the text
/// in a field.
bool wordsIn(WidgetTester tester, Finder at) =>
    tester
        .renderObjectList<RenderParagraph>(
          find.descendant(of: at, matching: find.byType(RichText)),
        )
        .any((p) => p.text.toPlainText().trim().isNotEmpty) ||
    tester
        .widgetList<EditableText>(
          find.descendant(of: at, matching: find.byType(EditableText)),
        )
        .any((e) => e.controller.text.trim().isNotEmpty);

/// The child oracle's variant a parent's layer names: every axis it gives, by Figma's spelling.
Map<String, dynamic> childVariant(
  Map<String, dynamic> oracle,
  Map<String, dynamic> wanted,
) {
  for (final v in (oracle['variants'] as List).cast<Map<String, dynamic>>().map(
    inMode,
  )) {
    final axes = {
      // A standalone's one variant is named '': no axes.
      for (final part in (v['figma'] as String).split(', '))
        if (part.contains('=')) part.split('=')[0]: part.split('=')[1],
    };
    if (wanted.entries.every((e) => axes[e.key] == e.value)) return v;
  }
  throw StateError('${oracle['component']} has no variant $wanted');
}

/// The excused entries a check reaches: those on layers the variant draws, or a prop shows.
int reachableExcuses(Map<String, dynamic> oracle) {
  final variants = (oracle['variants'] as List)
      .cast<Map<String, dynamic>>()
      .map(inMode)
      .toList();
  final rest = variants.first['layers'] as Map<String, dynamic>;
  final slots = oracle['slots'] as Map;
  var n = 0;
  for (final v in variants) {
    final layers = v['layers'] as Map<String, dynamic>;
    for (final e in ((v['excused'] as List?) ?? const []).cast<Map>()) {
      final layer = e['layer'] as String;
      final hidden = (layers[layer] as Map?)?['hidden'] == true;
      final byProp =
          slots.containsKey(layer) && hiddenAtRest(rest[layer] as Map?);
      if (!hidden || byProp) n++;
    }
  }
  return n;
}

/// Every variant of [component] against its oracle, as failures and excused gaps. [oracles] is every
/// component's oracle, the one checked and those of its composed children; [only] limits the check
/// to some variants, for the self-checks.
Future<(List<Difference>, List<Difference>)> check(
  WidgetTester tester,
  String component,
  Map<String, VisualCase> cases,
  Map<String, Map<String, dynamic>> oracles, {
  Set<String>? only,
  bool dark = false,
}) async {
  _dark = dark;
  final oracle = oracles[component]!;
  final kase = cases[component]!;
  final failures = <Difference>[];
  final gaps = <Difference>[];
  final variants = (oracle['variants'] as List)
      .cast<Map<String, dynamic>>()
      .map(inMode)
      .toList();
  final atRest = variants.first['layers'] as Map<String, dynamic>;
  if (kase.surface case final size?) {
    tester.view.physicalSize = size * tester.view.devicePixelRatio;
    addTearDown(tester.view.resetPhysicalSize);
  }
  for (final v in variants) {
    final name = v['figma'] as String;
    if (only != null && !only.contains(name)) continue;
    final states = WidgetStatesController();
    await pump(tester, kase.build(v, states, oracle));
    // As a user reaches it: a pressed control is hovered too, as the web check presses it.
    final forced = statesFor(v['state'] as String?);
    if (forced.isNotEmpty) {
      for (final state in forced) {
        states.update(state, true);
      }
      await settle(tester);
    }
    final painted = kase.measure(tester);
    final excused = (v['excused'] as List?) ?? const [];
    for (final MapEntry(key: layer, value: e)
        in (v['layers'] as Map<String, dynamic>).entries) {
      final expected = e as Map<String, dynamic>;
      final got = painted[layer];
      // Shown by a prop (hidden at rest in Figma): measured whenever rendered. Hidden only in this
      // variant: the state removes it, so it must not be drawn, and a layer not built at all is
      // not drawn (Number Input's leading icon), as the web check reads it.
      final byProp =
          (oracle['slots'] as Map).containsKey(layer) &&
          hiddenAtRest(atRest[layer] as Map?);
      if (expected['hidden'] == true && !byProp) {
        if (got?['drawn'] == true) {
          failures.add(Difference(name, layer, 'hidden', true, false));
        }
        continue;
      }
      if (got == null) {
        failures.add(Difference(name, layer, 'present', true, false));
        continue;
      }
      final child = oracles[expected['component']];
      if (child != null) {
        // Shown by a prop and hidden at rest (Button Group's tertiary): checked when rendered.
        if (expected['hidden'] != true || got['drawn'] == true) {
          checkChild(
            name,
            layer,
            expected,
            got,
            child,
            excused,
            failures,
            gaps,
          );
        }
        continue;
      }
      // Detached in this variant (Card's loading Tag, a plain placeholder where the Tag is): Figma
      // draws a box there, no variant of the child, and the child's root is that box.
      final detached = got['layers'];
      if (detached is Layers) {
        compareLayer(
          name,
          layer,
          expected,
          detached['root'] ?? const {},
          excused,
          failures,
          gaps,
        );
        continue;
      }
      compareLayer(name, layer, expected, got, excused, failures, gaps);
    }
  }
  return (failures, gaps);
}

/// A composed child (Button's spinner, Button Group's buttons) is the child component in the variant
/// Figma picks; what that variant looks like is the child's oracle, so the two are checked
/// together, layer by layer. What the child's oracle excuses is not compared here: the child's own
/// check reports it. What the parent's entry holds of the child's root is the parent's to decide
/// (a Button fills a group, whatever width it has alone; Toast restyles its Tag), so the root is
/// measured against the parent's entry for those, with the parent's excuses.
void checkChild(
  String variant,
  String layer,
  Map<String, dynamic> expected,
  Map<String, Object?> got,
  Map<String, dynamic> oracle,
  List<dynamic> excusedHere,
  List<Difference> failures,
  List<Difference> gaps,
) {
  if (got['drawn'] != true) {
    failures.add(Difference(variant, layer, 'present', true, false));
    return;
  }
  // A standalone child (Pagination's ellipsis) has no variant to name: its one is the one.
  final want = childVariant(
    oracle,
    (expected['variant'] as Map<String, dynamic>?) ?? const {},
  );
  // What the parent's entry holds of the child's root is the parent's to decide: its box, and its
  // fill and edge where the parent restyles it (Toast's Tag).
  final parentDecides = {
    for (final MapEntry(:key, :value) in expected.entries)
      if (!const {
        'component',
        'variant',
        'figmaVariant',
        'hidden',
        'hides',
      }.contains(key))
        key: value,
  };
  final layers = got['layers']! as Layers;
  compareLayer(
    variant,
    layer,
    parentDecides,
    layers['root'] ?? const {},
    excusedHere,
    failures,
    gaps,
  );
  final excused = (want['excused'] as List?) ?? const [];
  for (final MapEntry(key: part, value: e)
      in (want['layers'] as Map<String, dynamic>).entries) {
    final spec = {...e as Map<String, dynamic>};
    if (spec['hidden'] == true) continue;
    // What the instance hides of the child (a Select's rows, their checkbox), it must not draw.
    if (((expected['hides'] as List?) ?? const []).contains(part)) {
      if (layers[part]?['drawn'] == true) {
        failures.add(Difference(variant, layer, '$part.hidden', true, false));
      }
      continue;
    }
    if (part == 'root') {
      spec.removeWhere(
        (k, _) => k == 'width' || k == 'height' || parentDecides.containsKey(k),
      );
    }
    final measured = layers[part];
    if (measured == null) {
      failures.add(Difference(variant, layer, '$part.present', true, false));
      continue;
    }
    // A part that is itself a composed child (a PropertyList row's Select): what the child decides
    // of it, its box, against that child's root; the grandchild's own look is its own check's.
    final nested = measured['layers'];
    final own = <Difference>[];
    compareLayer(
      variant,
      part,
      nested is Layers
          ? {
              for (final MapEntry(:key, :value) in spec.entries)
                if (!const {
                  'component',
                  'variant',
                  'figmaVariant',
                  'hidden',
                  'hides',
                }.contains(key))
                  key: value,
            }
          : spec,
      nested is Layers ? (nested['root'] ?? const {}) : measured,
      excused,
      own,
      <Difference>[],
    );
    for (final d in own) {
      failures.add(
        Difference(variant, layer, '$part.${d.property}', d.figma, d.painted),
      );
    }
  }
}

/// Whether Figma hides a layer at rest (its entry in the first variant), a prop showing it; not
/// where only a choice the oracle makes hides it there (Interactive Card's controls, one drawn at a
/// time).
bool hiddenAtRest(Map? rest) =>
    rest?['hidden'] == true && rest?['unchosen'] != true;
