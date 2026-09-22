import 'dart:ui' show Offset, Path, Rect;

import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/src/svg_path.dart';

/// `zone`'s outline, path 7 of 9, as SOLAR drew it until 2026-09-22, pasted verbatim from
/// `spec/icons.json` at the time.
///
/// It was the most demanding real string in the corpus: two subpaths wound against each other,
/// eight cubics, an explicit `Z` on each, and negative coordinates. `zone` was also the one icon
/// drawn on a `0 0 24 25` viewBox, so nothing about it can be checked against an assumed 24-unit
/// box. Negatives are not unique to it -- twelve of the 682 icon variants carry one -- but they
/// are rare enough that a parser could drop a sign and pass every other test. SOLAR redrew the
/// icon on the 24 grid on 2026-09-22; the string is kept because what it proves about the parser
/// is a property of the string, not of which icon it came from.
const String zoneOutlinePin =
    'M17.2246 1.1495C18.7574 -0.38319 21.2426 -0.383143 22.7754 1.1495C24.3076 '
    '2.68219 24.3076 5.16656 22.7754 6.6993L20 9.47567L17.2246 6.6993C15.6924 '
    '5.16654 15.6923 2.68217 17.2246 1.1495ZM21.624 2.29989C20.727 1.40337 '
    '19.273 1.40334 18.376 2.29989C17.4791 3.197 17.4791 4.65189 18.376 '
    '5.54891L20 7.17294L21.624 5.54891C22.521 4.65193 22.5209 3.19703 21.624 '
    '2.29989Z';

Matcher throwsFormatExceptionSaying(String fragment) => throwsA(
      isA<FormatException>().having(
          (FormatException e) => e.message, 'message', contains(fragment)),
    );

void main() {
  group('geometry', () {
    test('M and L draw a line', () {
      final Path path = parseSvgPath('M2 3L8 11');
      expect(path.getBounds(), const Rect.fromLTRB(2, 3, 8, 11));
    });

    test('C draws a cubic, and its control points reach into the bounds', () {
      final Path path = parseSvgPath('M0 0C0 10 10 10 10 0');
      final Rect bounds = path.getBounds();
      expect(bounds.left, 0);
      expect(bounds.right, 10);
      expect(bounds.top, 0);
      // Bounds are taken over the control points, so the curve's own apex (y = 7.5) is not what
      // is measured here; what matters is that both control points reached the path.
      expect(bounds.bottom, 10);
      // The curve sags below the chord, so a point just under it is inside the filled shape.
      expect(path.contains(const Offset(5, 6)), isTrue);
      expect(path.contains(const Offset(5, 9)), isFalse);
    });

    test('H and V move along one axis from the current point', () {
      final Path path = parseSvgPath('M2 3H8V11');
      expect(path.getBounds(), const Rect.fromLTRB(2, 3, 8, 11));
      // V continued from x = 8, the point H left behind, rather than from M's x = 2.
      expect(parseSvgPath('M2 3H8V11').getBounds().right, 8);
    });

    test('Z closes the subpath and returns the current point to its start', () {
      // Triangle (0,0) (10,0) (10,10), closed. Then H and V build a second, larger triangle
      // that can only be (0,0) (20,0) (20,20) if Z put the current point back at (0,0):
      // had it stayed at (10,10), H20 would have drawn at y = 10 and the shape would miss
      // the point below the diagonal.
      final Path path = parseSvgPath('M0 0L10 0L10 10ZH20V20Z');
      expect(path.getBounds(), const Rect.fromLTRB(0, 0, 20, 20));
      expect(path.contains(const Offset(15, 5)), isTrue);
      expect(path.contains(const Offset(5, 15)), isFalse);
    });

    test('negative coordinates are read as numbers, not as separators only',
        () {
      final Path path = parseSvgPath('M-5 -4L6 7');
      expect(path.getBounds(), const Rect.fromLTRB(-5, -4, 6, 7));
    });

    test('scientific notation is read, as five corpus paths need', () {
      // 9.87904e-05 is a real value from the corpus; 1e1 is the exponent's positive form.
      final Path path = parseSvgPath('M0 9.87904e-05L1e1 0');
      // Bounds are float32, so the tolerance is the format's, not the parser's.
      expect(path.getBounds().bottom, closeTo(0.0000987904, 1e-9));
      expect(path.getBounds().right, 10);
    });

    test('an implicit repeat is the argument count, not a new command', () {
      // M's extra pair is a lineto, so this is the same triangle as "M0 0L10 0L10 10Z".
      // Two movetos would leave a degenerate contour that contains nothing.
      final Path path = parseSvgPath('M0 0 10 0L10 10Z');
      expect(path.contains(const Offset(9, 5)), isTrue);

      // H twice and C twice, from one command letter each.
      expect(parseSvgPath('M0 0H10 20').getBounds().right, 20);
      expect(
        parseSvgPath('M0 0C0 5 5 10 10 10 15 10 20 5 20 0').getBounds(),
        const Rect.fromLTRB(0, 0, 20, 10),
      );
    });

    test('separators may be commas, repeated, or absent before a sign', () {
      // None of these three forms occurs in the corpus today; they are here because the
      // generator's validator accepts them and this parser must accept exactly as much.
      expect(parseSvgPath('M0,0L10,10').getBounds(),
          parseSvgPath('M0 0L10 10').getBounds());
      expect(parseSvgPath('M0 0 L 10  10').getBounds(),
          parseSvgPath('M0 0L10 10').getBounds());
      expect(parseSvgPath('M0 0L10-10').getBounds(),
          const Rect.fromLTRB(0, -10, 10, 0));
      expect(parseSvgPath('M0 0L.5.5').getBounds(),
          const Rect.fromLTRB(0, 0, 0.5, 0.5));
      expect(parseSvgPath('M0 0L+10 +10').getBounds(),
          const Rect.fromLTRB(0, 0, 10, 10));
    });
  });

  group('rejections', () {
    test('an arc is unsupported, and says so', () {
      expect(
        () => parseSvgPath('M0 0A5 5 0 0 1 10 10'),
        throwsFormatExceptionSaying('unsupported path command "A"'),
      );
    });

    test('a lowercase command is relative, which is a different problem', () {
      expect(
        () => parseSvgPath('M0 0l10 10'),
        throwsFormatExceptionSaying('relative path command "l"'),
      );
      // "relative" is only said of a command whose absolute form is supported. A lowercase arc
      // is still just unsupported, because `A` is too -- the same split the generator makes.
      expect(
        () => parseSvgPath('M0 0a5 5 0 0 1 10 10'),
        throwsFormatExceptionSaying('unsupported path command "a"'),
      );
    });

    test('path data must begin with a moveto', () {
      expect(
        () => parseSvgPath('L10 10'),
        throwsFormatExceptionSaying('starts with "L", not a moveto'),
      );
      expect(
        () => parseSvgPath('10 10L20 20'),
        throwsFormatExceptionSaying('starts with "10", not a moveto'),
      );
    });

    test('a truncated command is not a repeat', () {
      expect(
        () => parseSvgPath('M0 0C1 2 3'),
        throwsFormatExceptionSaying('"C" takes 6 arguments but was given 3'),
      );
      expect(
        () => parseSvgPath('M0 0L1'),
        throwsFormatExceptionSaying('"L" takes 2 arguments but was given 1'),
      );
      expect(
        () => parseSvgPath('M0 0Z5'),
        throwsFormatExceptionSaying('"Z" takes 0 arguments but was given 1'),
      );
    });

    test('empty and unreadable data are named, not skipped', () {
      expect(() => parseSvgPath('   '), throwsFormatExceptionSaying('empty'));
      expect(
        () => parseSvgPath('M0 0L10 #10'),
        throwsFormatExceptionSaying('unreadable character "#"'),
      );
    });
  });

  test('a real corpus path parses to the artwork it describes', () {
    final Path path = parseSvgPath(zoneOutlinePin);
    final Rect bounds = path.getBounds();

    // The first cubic's two control points sit just above the origin at y = -0.383. The curve
    // itself only grazes y = 0, so this shows up nowhere but in the bounds, which Skia takes
    // over the control points -- and it is exactly what a parser that dropped a sign would lose.
    expect(bounds.top, closeTo(-0.38319, 1e-5));
    expect(bounds.left, closeTo(15.6923, 1e-4));
    expect(bounds.right, closeTo(24.3076, 1e-4));
    expect(bounds.bottom, closeTo(9.47567, 1e-5));

    // Two subpaths, wound in opposite directions: the outer pin and the hole inside it. Both
    // have to be present for the tip below the hole and the cap above it to be solid while the
    // middle is not.
    expect(path.contains(const Offset(20, 8)), isTrue);
    expect(path.contains(const Offset(20, 0.5)), isTrue);
    expect(path.contains(const Offset(20, 4)), isFalse);
    expect(path.contains(const Offset(16, 2)), isFalse);
  });
}
