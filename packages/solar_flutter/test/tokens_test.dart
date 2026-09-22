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
}
