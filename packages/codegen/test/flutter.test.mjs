import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { flattenSpec } from '../src/spec.mjs';
import { dartColor, dartName, renderFlutter } from '../src/emit/flutter.mjs';

const { spec } = buildTokenSpec(loadContract());
const { dart, manifest } = renderFlutter(spec);

describe('dartColor', () => {
  it('converts hex and rgba to ARGB', () => {
    expect(dartColor('#f5f5f5')).toBe('Color(0xFFF5F5F5)');
    expect(dartColor('rgba(0, 0, 0, 0.05)')).toBe('Color(0x0D000000)');
  });
});

describe('dartName', () => {
  it('camel-cases the remaining segments', () => {
    expect(dartName('surface.background')).toBe('surfaceBackground');
    expect(dartName('font-size.14')).toBe('fontSize14');
    expect(dartName('category.01.strong')).toBe('category01Strong');
  });

  it('escapes what Dart would reject, keeping the SOLAR spelling', () => {
    // A leading digit is not a legal identifier and `default` is a reserved word.
    expect(dartName('2xs')).toBe('$2xs');
    expect(dartName('default')).toBe('$default');
  });
});

describe('renderFlutter', () => {
  // SOLAR in app code: an app reaches the theme as it reaches Material's, SolarTheme.of(context), with
  // the widgets' fallback where it installed none (context.solar is lib/src/solar_theme_context.dart).
  it('gives SolarTheme an of(context), falling back by brightness', () => {
    expect(dart).toContain('static SolarTheme of(BuildContext context) {');
    expect(dart).toContain('theme.extension<SolarTheme>() ??');
    expect(dart).toMatch(/show BuildContext, Theme, ThemeExtension;/);
  });

  it('splits each family by whether it varies with a mode', () => {
    // Colour holds both a mode-varying semantic set and a flat primitive palette; they cannot
    // share a class, because one needs instances per mode and the other is static.
    expect(dart).toContain('class SolarColors {');
    expect(dart).toContain('  final Color surfaceBackground;');
    expect(dart).toMatch(/static const SolarColors light = SolarColors\(/);
    expect(dart).toMatch(/static const SolarColors dark = SolarColors\(/);
    expect(dart).toContain('abstract final class SolarPalette');
    expect(dart).toContain('static const Color brandRed = Color(0xFFD22730);');
  });

  it('separates the mode-varying type scale from the mode-invariant fonts', () => {
    expect(dart).toContain('class SolarType {');
    expect(dart).toMatch(/static const SolarType desktop = SolarType\(/);
    expect(dart).toContain('abstract final class SolarFont');
    expect(dart).toContain("static const String fontFamilyInter = 'Inter';");
    expect(dart).toContain(
      'static const FontWeight fontWeight600 = FontWeight.w600;',
    );
  });

  it('emits mode-invariant groups as static holders', () => {
    expect(dart).toContain('abstract final class SolarInset');
    expect(dart).toContain('static const double md = 16.0;');
    expect(dart).toContain(
      'static const Duration durationFast = Duration(milliseconds: 100);',
    );
  });

  it('emits easings as Cubic, which is why the keywords had to go', () => {
    expect(dart).toContain(
      'static const Cubic easeBoth = Cubic(0.42, 0, 0.58, 1);',
    );
  });

  it('names the theme extension field typeScale, not type', () => {
    // ThemeExtension already declares `type`, and ThemeData keys extensions by it.
    expect(dart).toContain(
      'class SolarTheme extends ThemeExtension<SolarTheme>',
    );
    expect(dart).toContain('final SolarType typeScale;');
    expect(dart).not.toMatch(/final SolarType type;/);
  });

  it('covers every token in the spec', () => {
    expect(Object.keys(manifest)).toHaveLength(flattenSpec(spec).length);
  });

  it('records canonical values so parity can compare targets', () => {
    expect(manifest['color.surface.background'].normalized).toBe(
      'rgba(245, 245, 245, 1)',
    );
    expect(manifest['inset.md'].normalized).toBe(16);
    expect(manifest['motion.ease.both'].normalized).toEqual([0.42, 0, 0.58, 1]);
  });
});
