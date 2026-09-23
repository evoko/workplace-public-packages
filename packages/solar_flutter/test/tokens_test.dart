import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

void main() {
  test('light and dark are different sets, not the same one twice', () {
    expect(
      SolarColors.light.surfaceBackground,
      isNot(SolarColors.dark.surfaceBackground),
    );
  });

  test('spacing and radius are logical pixels', () {
    expect(SolarInset.md, 16.0);
    expect(SolarRadius.control, 6.0);
  });

  test('easings are curves, which is why the CSS keywords could not be kept',
      () {
    expect(SolarMotion.easeBoth.transform(0.5), closeTo(0.5, 0.01));
  });

  test('escaped names keep the SOLAR spelling behind a dollar', () {
    expect(SolarInset.$2xs, 4.0);
    expect(SolarBorder.$default, 1.0);
  });

  test('the primitive palette is separate from the semantic set', () {
    expect(SolarPalette.brandRed, const Color(0xFFD22730));
  });

  test('the theme extension carries a full set per mode', () {
    expect(
      SolarTheme.light.colors.surfaceBackground,
      SolarColors.light.surfaceBackground,
    );
    expect(
      SolarTheme.dark.colors.surfaceBackground,
      SolarColors.dark.surfaceBackground,
    );
  });

  test('the theme extension does not shadow ThemeExtension.type', () {
    // ThemeData keys extensions by `type`; a field of that name would break lookup.
    expect(SolarTheme.light.type, SolarTheme);
    final theme = ThemeData(extensions: const [SolarTheme.light]);
    expect(theme.extension<SolarTheme>(), isNotNull);
  });

  test('type and typography switch with the viewport, not the brightness', () {
    expect(SolarType.mobile.sizeDisplayLg,
        lessThan(SolarType.desktop.sizeDisplayLg));
    expect(
      SolarTypography.mobile.displayLg.fontSize,
      lessThan(SolarTypography.desktop.displayLg.fontSize!),
    );
  });

  group('SolarTheme.resolve', () {
    test('switches to the Mobile scale below the sm boundary, as the web does',
        () {
      final narrow = SolarTheme.resolve(
          brightness: Brightness.light, width: SolarViewport.sm - 1);
      final wide = SolarTheme.resolve(
          brightness: Brightness.light, width: SolarViewport.sm);
      expect(narrow.typography.displayLg, SolarTypography.mobile.displayLg);
      expect(narrow.typeScale.sizeDisplayLg, SolarType.mobile.sizeDisplayLg);
      // The web query is max-width: 767.98px, so exactly 768 is already Desktop.
      expect(wide.typography.displayLg, SolarTypography.desktop.displayLg);
    });

    test('takes its colours and shadows from the brightness alone', () {
      final dark = SolarTheme.resolve(brightness: Brightness.dark, width: 320);
      expect(dark.colors.surfaceBackground, SolarColors.dark.surfaceBackground);
      expect(dark.shadows, SolarShadows.dark);
      expect(dark.typography.displayLg, SolarTypography.mobile.displayLg);
    });

    test('at Desktop width matches the constant themes', () {
      final light =
          SolarTheme.resolve(brightness: Brightness.light, width: 1440);
      expect(light.colors, SolarTheme.light.colors);
      expect(light.typography, SolarTheme.light.typography);
    });
  });
}
