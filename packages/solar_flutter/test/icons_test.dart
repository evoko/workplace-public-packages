import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// A [Canvas] that records what the painter asked for instead of rasterising it.
///
/// The transform is the thing worth asserting -- "fit, do not stretch" is a property of the
/// scale and the translate, not of any pixel -- and a recording canvas states it directly.
/// Anything the painter calls that is not listed here reaches [noSuchMethod] and throws, so a
/// new drawing call cannot slip past these tests unnoticed.
class RecordingCanvas implements Canvas {
  final List<double> scales = <double>[];
  final List<Offset> translations = <Offset>[];
  final List<Path> paths = <Path>[];
  final List<Color> colors = <Color>[];

  @override
  void save() {}

  @override
  void restore() {}

  @override
  void translate(double dx, double dy) => translations.add(Offset(dx, dy));

  @override
  void scale(double sx, [double? sy]) {
    scales.add(sx);
    if (sy != null) {
      scales.add(sy);
    }
  }

  @override
  void drawPath(Path path, Paint paint) {
    paths.add(path);
    colors.add(paint.color);
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

RecordingCanvas record(
  SolarVector vector,
  Size size, {
  Color color = const Color(0xFFFF0000),
}) {
  final RecordingCanvas canvas = RecordingCanvas();
  SolarVectorPainter(vector, color).paint(canvas, size);
  return canvas;
}

/// Every vector in the generated `icons.dart`, read back from the file.
///
/// Dart has no reflection, so there is no way to walk 680 static fields by name -- and adding a
/// `Map<String, SolarVector>` to the library to make one possible is exactly what the emitter
/// refuses to do, because a map would retain all 358 KB of path data in every build that touched
/// the class. Reading the generated source instead keeps the "every icon paints" assertion over
/// the whole set without putting anything in the shipped package that only a test wants.
Map<String, SolarVector> readGeneratedIcons() {
  final File file = File('lib/src/generated/icons.dart');
  if (!file.existsSync()) {
    fail('${file.path} is missing; run the SOLAR codegen before the tests');
  }
  final String source = file.readAsStringSync();
  final Map<String, SolarVector> icons = <String, SolarVector>{};

  final RegExp declaration = RegExp(
    r'static const SolarVector (\w+) = SolarVector\(\s*'
    r'width: ([\d.]+),\s*height: ([\d.]+),',
  );
  final List<RegExpMatch> found = declaration.allMatches(source).toList();
  for (int i = 0; i < found.length; i += 1) {
    final RegExpMatch match = found[i];
    final int end = i + 1 < found.length ? found[i + 1].start : source.length;
    final String body = source.substring(match.end, end);

    final List<SolarVectorPath> paths = <SolarVectorPath>[];
    // Split rather than match a nested expression: a fill is `Color(0x…)`, whose parentheses a
    // single regex would have to account for. Path data cannot contain a quote -- the generator
    // rejects every character outside numbers, separators and `M L C H V Z` -- so the first
    // quoted run in each piece is the `d` string and nothing else can be.
    for (final String piece in body.split('SolarVectorPath(').skip(1)) {
      final RegExpMatch? d = RegExp(r"^\s*'([^']*)'").firstMatch(piece);
      if (d == null) {
        fail('${match[1]}: could not read the path data out of $piece');
      }
      paths.add(
        SolarVectorPath(
          d[1]!,
          evenOdd: piece.contains('evenOdd: true'),
          fill: RegExp(r'fill: Color\(0x(\w{8})\)').firstMatch(piece) == null
              ? null
              : const Color(0xFF000000),
        ),
      );
    }
    icons[match[1]!] = SolarVector(
      width: double.parse(match[2]!),
      height: double.parse(match[3]!),
      paths: paths,
    );
  }
  return icons;
}

/// The one [CustomPaint] this package put in the tree, named rather than indexed: the test
/// harness has painters of its own and `.first`/`.last` would be a guess about their order.
Finder solarPaint() => find.byWidgetPredicate(
  (Widget widget) =>
      widget is CustomPaint && widget.painter is SolarVectorPainter,
);

SolarVectorPainter painterIn(WidgetTester tester) => tester
    .widgetList<CustomPaint>(find.byType(CustomPaint))
    .map((CustomPaint paint) => paint.painter)
    .whereType<SolarVectorPainter>()
    .single;

void main() {
  final Map<String, SolarVector> generated = readGeneratedIcons();

  group('the generated set', () {
    test('is all 680 variants of all 340 icons', () {
      expect(generated, hasLength(680));
      expect(
        generated.values.fold<int>(
          0,
          (int n, SolarVector v) => n + v.paths.length,
        ),
        790,
      );
      // The constants the widgets are documented with really exist and really are constants.
      expect(SolarIcons.chevronRightOutline.paths, hasLength(1));
      expect(SolarIcons.zoneOutline.height, 24.0);
      expect(SolarLogos.biampDarkSm.width, 36.0);

      // Every icon is on the 24 grid. Icon/Zone's outline was 24 x 25 until SOLAR redrew it on
      // 2026-09-22; that the painter still fits a vector that is not square is covered by
      // SolarVectorPainter's own test, which builds one.
      expect(
        generated.values.where(
          (SolarVector v) => v.width != 24 || v.height != 24,
        ),
        isEmpty,
      );
    });

    test('every one of the 680 paints without throwing', () {
      // The whole set, not a sample: a path string that the Dart parser cannot replay would be
      // an icon that throws inside an app, and there is no reason to find that out one icon at
      // a time. Painting is what proves it, because parsing happens inside the painter.
      final ui.PictureRecorder recorder = ui.PictureRecorder();
      final Canvas canvas = Canvas(recorder);
      for (final MapEntry<String, SolarVector> icon in generated.entries) {
        expect(
          () => SolarVectorPainter(
            icon.value,
            const Color(0xFF111111),
          ).paint(canvas, const Size(24, 24)),
          returnsNormally,
          reason: icon.key,
        );
      }
      expect(recorder.endRecording(), isNotNull);
    });

    test('carries 75 even-odd paths, as the source does', () {
      final int evenOdd = generated.values
          .expand((SolarVector v) => v.paths)
          .where((SolarVectorPath p) => p.evenOdd)
          .length;
      expect(evenOdd, 75);
    });

    test('names no colour: an icon inherits one', () {
      final String source = File('lib/src/generated/icons.dart')
          .readAsStringSync();
      expect(source, isNot(contains('#111111')));
      expect(source, isNot(contains('Color(')));
    });
  });

  group('SolarVectorPainter', () {
    test('applies even-odd, so a hole stays a hole', () {
      const SolarVector ring = SolarVector(
        width: 10,
        height: 10,
        paths: <SolarVectorPath>[
          SolarVectorPath('M0 0H10V10H0ZM2 2H8V8H2Z', evenOdd: true),
        ],
      );
      const SolarVector blob = SolarVector(
        width: 10,
        height: 10,
        paths: <SolarVectorPath>[SolarVectorPath('M0 0H10V10H0ZM2 2H8V8H2Z')],
      );

      final Path even = record(ring, const Size(10, 10)).paths.single;
      final Path nonZero = record(blob, const Size(10, 10)).paths.single;
      expect(even.fillType, PathFillType.evenOdd);
      expect(nonZero.fillType, PathFillType.nonZero);
      // The assertion that matters: the fill type reaches the geometry, not just the field.
      expect(even.contains(const Offset(5, 5)), isFalse);
      expect(nonZero.contains(const Offset(5, 5)), isTrue);
    });

    test(
      'fits a non-square vector into a square box rather than stretching it',
      () {
        // SolarIcons.zoneOutline was drawn on a 0 0 24 25 viewBox and was the one real asset that
        // needed this, until SOLAR redrew Icon/Zone on the grid on 2026-09-22. SVG letterboxes an
        // off-grid drawing for free through the default preserveAspectRatio, so Flutter has to as
        // well or the two platforms draw the same icon differently. The case is built here so it
        // stays covered while no generated icon exercises it.
        const SolarVector tall = SolarVector(
          width: 24,
          height: 25,
          paths: <SolarVectorPath>[SolarVectorPath('M0 0H24V25H0Z')],
        );
        final RecordingCanvas fitted = record(tall, const Size(24, 24));
        expect(fitted.scales, <double>[24 / 25]);
        expect(
          fitted.translations.single.dx,
          closeTo((24 - 24 * (24 / 25)) / 2, 1e-9),
        );
        expect(fitted.translations.single.dy, 0);

        // A square vector in a square box is scaled by 1 and not offset at all, which is every
        // generated icon today.
        final RecordingCanvas square = record(
          SolarIcons.zoneSolid,
          const Size(24, 24),
        );
        expect(square.scales, <double>[1.0]);
        expect(square.translations, <Offset>[Offset.zero]);
      },
    );

    test('scales a 36 x 12 wordmark by its height and centres it', () {
      final RecordingCanvas biamp = record(
        SolarLogos.biampDarkSm,
        const Size(72, 24),
      );
      expect(biamp.scales, <double>[2.0]);
      expect(biamp.translations, <Offset>[Offset.zero]);
    });

    test(
      'draws every logo path in its own colour and ignores the widget colour',
      () {
        final RecordingCanvas google = record(
          SolarLogos.osGoogle,
          const Size(32, 32),
          color: const Color(0xFFFF0000),
        );
        // As 32-bit ARGB: a Color compares its components as doubles, and one read back from a
        // Paint can differ from the constant in the last bits while being the same colour.
        final argb = google.colors.map((c) => c.toARGB32()).toList();
        expect(argb, <int>[0xFFFFC107, 0xFFFF3D00, 0xFF4CAF50, 0xFF1976D2]);
        expect(argb, isNot(contains(0xFFFF0000)));
      },
    );

    test('draws every icon path in the colour it was given', () {
      final RecordingCanvas icon = record(
        SolarIcons.accessibilityOutline,
        const Size(24, 24),
        color: const Color(0xFF00FF00),
      );
      expect(icon.colors, everyElement(const Color(0xFF00FF00)));
    });
  });

  group('SolarIcon', () {
    testWidgets('defaults to the lg step', (WidgetTester tester) async {
      // Centred, because pumpWidget hands its child tight screen constraints and a SizedBox
      // under those cannot be the size it asks for.
      await tester.pumpWidget(
        const Center(child: SolarIcon(SolarIcons.chevronRightOutline)),
      );
      expect(tester.getSize(solarPaint()), const Size(24, 24));
      expect(SolarIconSize.lg, 24.0);
    });

    testWidgets('takes the ambient SolarTheme icon colour', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        Theme(
          data: ThemeData(
            extensions: const <ThemeExtension<dynamic>>[SolarTheme.light],
          ),
          child: const SolarIcon(SolarIcons.chevronRightOutline),
        ),
      );
      expect(painterIn(tester).color, SolarColors.light.iconPrimary);
    });

    testWidgets('prefers an explicit colour to the theme', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        Theme(
          data: ThemeData(
            extensions: const <ThemeExtension<dynamic>>[SolarTheme.light],
          ),
          child: const SolarIcon(
            SolarIcons.chevronRightOutline,
            color: Color(0xFF00FF00),
          ),
        ),
      );
      expect(painterIn(tester).color, const Color(0xFF00FF00));
    });

    testWidgets('falls back to the IconTheme when SOLAR is not installed', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const IconTheme(
          data: IconThemeData(color: Color(0xFF0000FF)),
          child: SolarIcon(SolarIcons.chevronRightOutline),
        ),
      );
      expect(painterIn(tester).color, const Color(0xFF0000FF));
    });

    testWidgets('is an image with a name when it is given one', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        const Directionality(
          textDirection: TextDirection.ltr,
          child: Center(
            child: SolarIcon(
              SolarIcons.chevronRightOutline,
              semanticLabel: 'Next',
            ),
          ),
        ),
      );
      final SemanticsNode node = tester.getSemantics(find.byType(SolarIcon));
      expect(node.label, 'Next');
      expect(node.getSemanticsData().flagsCollection.isImage, isTrue);
      handle.dispose();
    });

    testWidgets('is invisible to assistive technology without a name', (
      WidgetTester tester,
    ) async {
      // Decoration beside a label that already says what it means, so it is taken out of the
      // tree entirely rather than announced as an unnamed image.
      final SemanticsHandle handle = tester.ensureSemantics();
      await tester.pumpWidget(
        const Center(child: SolarIcon(SolarIcons.chevronRightOutline)),
      );
      final SemanticsNode node = tester.getSemantics(find.byType(SolarIcon));
      expect(node.label, isEmpty);
      expect(node.getSemanticsData().flagsCollection.isImage, isFalse);
      handle.dispose();
    });
  });

  group('SolarLogo', () {
    testWidgets('sizes by height and keeps the wordmark ratio', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        const Center(child: SolarLogo(SolarLogos.biampDarkSm, size: 24)),
      );
      expect(tester.getSize(solarPaint()), const Size(72, 24));
    });

    test('takes no colour at all', () {
      // Not a style rule someone has to remember: a tinted brand mark is a brand violation, so
      // the argument does not exist and the compiler refuses it. There is no runtime surface to
      // assert that on, so the constructor itself is read.
      final String source = File('lib/src/solar_icon.dart').readAsStringSync();
      final int start = source.indexOf('const SolarLogo(this.logo');
      final String constructor = source.substring(
        start,
        source.indexOf('});', start),
      );
      expect(constructor, contains('semanticLabel'));
      expect(constructor, isNot(contains('color')));
    });
  });
}
