import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { canonical, entry } from './manifest.mjs';
import { shadowLayers } from './shadow.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { MOBILE_BOUNDARY_TOKEN } from './breakpoint.mjs';

const OUT_DIR = join(packagesDir, 'solar_flutter', 'lib', 'src', 'generated');

// Dart reserved words a token's tail could collide with, e.g. border.default.
const RESERVED = new Set(
  'assert break case catch class const continue default do else enum extends false final finally for if in is new null rethrow return super switch this throw true try var void while with'.split(
    ' ',
  ),
);

/**
 * A token's path tail as a camelCase Dart field. A leading digit is not a legal identifier and
 * a reserved word cannot be a field name; both are escaped with `$` so the SOLAR name survives
 * verbatim (`inset.2xs` becomes `$2xs`) rather than being respelled into something else.
 */
export function dartName(rest) {
  const name = rest
    .split(/[.-]/)
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
  return /^[0-9]/.test(name) || RESERVED.has(name) ? `$${name}` : name;
}

/** `#rrggbb` or `rgba(r, g, b, a)` to Dart `Color(0xAARRGGBB)`. */
export function dartColor(value) {
  const [, r, g, b, a] = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(
    canonical.color(value),
  );
  const argb =
    (Math.round(Number(a) * 255) << 24) | (+r << 16) | (+g << 8) | +b;
  return `Color(0x${(argb >>> 0).toString(16).toUpperCase().padStart(8, '0')})`;
}

const dbl = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));
const letterSpacingPx = (ls, fontSizePx) =>
  String(ls).endsWith('%')
    ? Math.round((parseFloat(ls) / 100) * fontSizePx * 100) / 100
    : parseFloat(ls);

// Whether a token varies by mode decides how it is emitted, not which family it sits in: the
// colour family holds both the mode-varying semantic set and the flat primitive palette, and
// the type family holds the mode-varying scale alongside mode-invariant families and weights.
const modesOf = (t) =>
  t.modes
    ? t.modes.light !== undefined
      ? ['light', 'dark']
      : ['desktop', 'mobile']
    : null;

// Exported so the parity suite can locate a token in the generated Dart without re-deriving
// the mapping, and so a class rename cannot silently make that lookup miss.
export const MODAL_CLASS = {
  color: 'SolarColors',
  type: 'SolarType',
  typography: 'SolarTypography',
  shadow: 'SolarShadows',
};
const STATIC_CLASS = {
  color: 'SolarPalette',
  type: 'SolarFont',
  inset: 'SolarInset',
  stack: 'SolarStack',
  radius: 'SolarRadius',
  border: 'SolarBorder',
  icon: 'SolarIconSize',
  layout: 'SolarLayout',
  motion: 'SolarMotion',
  viewport: 'SolarViewport',
  spatial: 'SolarSpatial',
  z: 'SolarZ',
};

export function renderFlutter(spec) {
  const tokens = flattenSpec(spec);
  const index = new Map(tokens.map((t) => [t.name, t]));
  const manifest = {};
  const statics = new Map();
  const modal = new Map();

  const addStatic = (cls, line) =>
    statics.set(cls, [...(statics.get(cls) ?? []), line]);
  const addModal = (cls, modes, dartType, field, perMode) => {
    const g = modal.get(cls) ?? {
      modes,
      names: [],
      fields: [],
      values: Object.fromEntries(modes.map((m) => [m, []])),
    };
    g.names.push(field);
    g.fields.push(`  final ${dartType} ${field};`);
    for (const m of modes) g.values[m].push(`    ${field}: ${perMode[m]},`);
    modal.set(cls, g);
  };

  const textStyle = (v) => {
    const size = canonical.dimension(v.fontSize);
    return (
      `TextStyle(fontFamily: '${v.fontFamily}', fontWeight: FontWeight.w${v.fontWeight}, ` +
      `fontSize: ${dbl(size)}, height: ${canonical.dimension(v.lineHeight) / size}, ` +
      `letterSpacing: ${dbl(letterSpacingPx(v.letterSpacing, size))})`
    );
  };
  const boxShadows = (layers) =>
    `<BoxShadow>[${layers
      .map(
        (l) =>
          `BoxShadow(color: ${dartColor(l.color)}, offset: Offset(${dbl(canonical.dimension(l.offsetX))}, ${dbl(canonical.dimension(l.offsetY))}), blurRadius: ${dbl(canonical.dimension(l.blur))}, spreadRadius: ${dbl(canonical.dimension(l.spread))})`,
      )
      .join(', ')}]`;

  for (const t of tokens) {
    const [head, ...rest] = t.name.split('.');
    const field = dartName(rest.join('.')) || dartName(head);
    const modes = modesOf(t);

    if (modes) {
      const cls = MODAL_CLASS[head];
      if (!cls)
        throw new Error(`no mode-varying Dart class for "${head}" (${t.name})`);
      if (t.type === 'color') {
        const perMode = {
          light: dartColor(t.modes.light),
          dark: dartColor(t.modes.dark),
        };
        addModal(cls, modes, 'Color', field, perMode);
        manifest[t.name] = entry(
          'color',
          perMode.light,
          perMode.light,
          perMode,
        );
      } else if (t.type === 'typography') {
        const perMode = {
          desktop: { ...t.value, ...t.ext.modes.desktop },
          mobile: { ...t.value, ...t.ext.modes.mobile },
        };
        addModal(cls, modes, 'TextStyle', field, {
          desktop: textStyle(perMode.desktop),
          mobile: textStyle(perMode.mobile),
        });
        manifest[t.name] = entry(
          'typography',
          'TextStyle',
          perMode.desktop,
          perMode,
        );
      } else if (t.type === 'shadow') {
        const perMode = {
          light: shadowLayers(index, { $value: t.value }, 'light'),
          dark: shadowLayers(index, { $value: t.value }, 'dark'),
        };
        addModal(cls, modes, 'List<BoxShadow>', field, {
          light: boxShadows(perMode.light),
          dark: boxShadows(perMode.dark),
        });
        manifest[t.name] = entry(
          'shadow',
          'BoxShadow[]',
          perMode.light,
          perMode,
        );
      } else if (t.type === 'dimension') {
        const perMode = {
          desktop: dbl(canonical.dimension(t.modes.desktop)),
          mobile: dbl(canonical.dimension(t.modes.mobile)),
        };
        addModal(cls, modes, 'double', field, perMode);
        manifest[t.name] = entry(
          'dimension',
          perMode.desktop,
          perMode.desktop,
          perMode,
        );
      } else {
        throw new Error(
          `no mode-varying Dart emitter for type ${t.type} (${t.name})`,
        );
      }
      continue;
    }

    const cls = STATIC_CLASS[head];
    if (!cls)
      throw new Error(`no Dart class for token group "${head}" (${t.name})`);
    if (t.type === 'color') {
      const lit = dartColor(t.value);
      addStatic(cls, `  static const Color ${field} = ${lit};`);
      manifest[t.name] = entry('color', lit);
    } else if (t.type === 'dimension') {
      const v = dbl(canonical.dimension(t.value));
      addStatic(cls, `  static const double ${field} = ${v};`);
      manifest[t.name] = entry('dimension', v);
    } else if (t.type === 'duration') {
      const ms = canonical.duration(t.value);
      addStatic(
        cls,
        `  static const Duration ${field} = Duration(milliseconds: ${ms});`,
      );
      manifest[t.name] = entry('duration', `Duration(milliseconds: ${ms})`, ms);
    } else if (t.type === 'cubicBezier') {
      const lit = `Cubic(${t.value.join(', ')})`;
      addStatic(cls, `  static const Cubic ${field} = ${lit};`);
      manifest[t.name] = entry('cubicBezier', lit);
    } else if (t.type === 'number') {
      addStatic(cls, `  static const int ${field} = ${t.value};`);
      manifest[t.name] = entry('number', t.value);
    } else if (t.type === 'fontFamily') {
      addStatic(cls, `  static const String ${field} = '${t.value}';`);
      manifest[t.name] = entry('fontFamily', t.value);
    } else if (t.type === 'fontWeight') {
      const lit = `FontWeight.w${t.value}`;
      addStatic(cls, `  static const FontWeight ${field} = ${lit};`);
      manifest[t.name] = entry('fontWeight', lit, t.value);
    } else {
      throw new Error(`no Dart emitter for type ${t.type} (${t.name})`);
    }
  }

  const modalClasses = [...modal.entries()]
    .sort(([a], [b]) => byCodeUnit(a, b))
    .map(([cls, g]) => {
      const params = g.names.map((n) => `    required this.${n},`).join('\n');
      const instances = g.modes
        .map(
          (mode) =>
            `  static const ${cls} ${mode} = ${cls}(\n${g.values[mode].join('\n')}\n  );`,
        )
        .join('\n\n');
      return (
        `@immutable\nclass ${cls} {\n  const ${cls}({\n${params}\n  });\n\n` +
        `${g.fields.join('\n')}\n\n${instances}\n}\n`
      );
    })
    .join('\n');

  const staticClasses = [...statics.entries()]
    .sort(([a], [b]) => byCodeUnit(a, b))
    .map(
      ([cls, lines]) =>
        `abstract final class ${cls} {\n${lines.join('\n')}\n}\n`,
    )
    .join('\n');

  // The Mobile type scale applies below the same token the web's media query is derived from,
  // so the two platforms switch at one width by construction rather than by agreement.
  const [boundaryHead, ...boundaryRest] = MOBILE_BOUNDARY_TOKEN.split('.');
  if (!index.has(MOBILE_BOUNDARY_TOKEN))
    throw new Error(
      `cannot derive the mobile breakpoint: ${MOBILE_BOUNDARY_TOKEN} is missing from the spec`,
    );
  const boundary = `${STATIC_CLASS[boundaryHead]}.${dartName(boundaryRest.join('.'))}`;

  // Bundles the mode-varying sets so a widget reads them from the ambient theme. The type field
  // is called typeScale because ThemeExtension already declares `type`, which ThemeData uses to
  // key extensions; shadowing it breaks Theme.of(context).extension<SolarTheme>(). lerp snaps at
  // the halfway point: design tokens are discrete, and interpolating a semantic colour would
  // invent a value that is not in the system.
  const theme =
    `@immutable\nclass SolarTheme extends ThemeExtension<SolarTheme> {\n` +
    `  const SolarTheme({\n    required this.colors,\n    required this.shadows,\n    required this.typeScale,\n    required this.typography,\n  });\n\n` +
    `  final SolarColors colors;\n  final SolarShadows shadows;\n  final SolarType typeScale;\n  final SolarTypography typography;\n\n` +
    `  static const SolarTheme light = SolarTheme(\n    colors: SolarColors.light,\n    shadows: SolarShadows.light,\n    typeScale: SolarType.desktop,\n    typography: SolarTypography.desktop,\n  );\n\n` +
    `  static const SolarTheme dark = SolarTheme(\n    colors: SolarColors.dark,\n    shadows: SolarShadows.dark,\n    typeScale: SolarType.desktop,\n    typography: SolarTypography.desktop,\n  );\n\n` +
    `  /// The theme for a brightness and a viewport width.\n  ///\n` +
    `  /// Below \`${boundary}\` the Mobile type scale applies, which is where the web's media query\n` +
    `  /// switches too. [light] and [dark] are the Desktop scale; pass\n` +
    `  /// \`MediaQuery.sizeOf(context).width\` here to follow the viewport the way the web does.\n` +
    `  static SolarTheme resolve({\n    required Brightness brightness,\n    required double width,\n  }) {\n` +
    `    final dark = brightness == Brightness.dark;\n    final mobile = width < ${boundary};\n` +
    `    return SolarTheme(\n      colors: dark ? SolarColors.dark : SolarColors.light,\n      shadows: dark ? SolarShadows.dark : SolarShadows.light,\n` +
    `      typeScale: mobile ? SolarType.mobile : SolarType.desktop,\n      typography: mobile ? SolarTypography.mobile : SolarTypography.desktop,\n    );\n  }\n\n` +
    `  @override\n  SolarTheme copyWith({\n    SolarColors? colors,\n    SolarShadows? shadows,\n    SolarType? typeScale,\n    SolarTypography? typography,\n  }) => SolarTheme(\n    colors: colors ?? this.colors,\n    shadows: shadows ?? this.shadows,\n    typeScale: typeScale ?? this.typeScale,\n    typography: typography ?? this.typography,\n  );\n\n` +
    `  @override\n  SolarTheme lerp(ThemeExtension<SolarTheme>? other, double t) =>\n      (other is SolarTheme && t >= 0.5) ? other : this;\n}\n`;

  const header =
    `// SOLAR design tokens for Flutter.\n` +
    `// Generated by @bwp-web/codegen from spec/tokens.json. Do not edit.\n\n` +
    `import 'dart:ui' show Brightness;\n\n` +
    `import 'package:flutter/animation.dart' show Cubic;\n` +
    `import 'package:flutter/foundation.dart' show immutable;\n` +
    `import 'package:flutter/material.dart' show ThemeExtension;\n` +
    `import 'package:flutter/painting.dart'\n    show BoxShadow, Color, FontWeight, Offset, TextStyle;\n\n`;

  return {
    dart: header + modalClasses + '\n' + staticClasses + '\n' + theme,
    manifest,
  };
}

export function emitFlutter(spec) {
  const { dart, manifest } = renderFlutter(spec);
  writeGenerated(join(OUT_DIR, 'tokens.dart'), dart);
  return Object.keys(manifest).length;
}
