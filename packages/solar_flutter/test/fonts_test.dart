import 'package:flutter/painting.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// The width [style] lays [text] out at, which differs between a real font and the test font.
double widthOf(String text, TextStyle style) {
  final painter = TextPainter(
    text: TextSpan(text: text, style: style),
    textDirection: TextDirection.ltr,
  )..layout();
  return painter.width;
}

Future<void> load(String family, List<String> assets) async {
  final loader = FontLoader(family);
  for (final asset in assets) {
    loader.addFont(rootBundle.load(asset));
  }
  await loader.load();
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('the generated styles name the fonts this package bundles', () {
    // A TextStyle naming a package resolves its family to packages/<package>/<family>, which is
    // the key Flutter registers a package's pubspec fonts under.
    expect(SolarTypography.desktop.labelMd.fontFamily,
        'packages/solar_flutter/Inter');
    expect(SolarTypography.desktop.displayLg.fontFamily,
        'packages/solar_flutter/Montserrat');
    expect(SolarTypography.desktop.codeMd.fontFamily,
        'packages/solar_flutter/IBM Plex Mono');
  });

  test('each bundled font loads under that key and changes how text lays out',
      () async {
    const sample = 'Save changes 0123';
    final cases = {
      'packages/solar_flutter/Inter': (
        SolarTypography.desktop.labelMd,
        ['fonts/inter/Inter-Medium.ttf'],
      ),
      'packages/solar_flutter/Montserrat': (
        SolarTypography.desktop.displaySm,
        ['fonts/montserrat/Montserrat-Medium.ttf'],
      ),
      'packages/solar_flutter/IBM Plex Mono': (
        SolarTypography.desktop.codeMd,
        ['fonts/ibm-plex-mono/IBMPlexMono-Medium.ttf'],
      ),
    };
    for (final MapEntry(key: family, value: (style, assets)) in cases.entries) {
      // Before loading, the family is unknown and Flutter falls back to the test font.
      final fallback = widthOf(sample, style);
      await load(family, assets);
      expect(widthOf(sample, style), isNot(fallback), reason: family);
    }
  });
}
