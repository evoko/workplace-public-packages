/// The package SOLAR's fonts are bundled in.
///
/// Flutter finds a font declared in a package's pubspec only when a [TextStyle] names that
/// package. The generated `SolarTypography` styles already do; pass this when building a style
/// from a `SolarFont` family yourself:
///
/// ```dart
/// TextStyle(fontFamily: SolarFont.fontFamilyInter, package: solarFontPackage)
/// ```
library;

const String solarFontPackage = 'solar_flutter';
