import { describe, expect, it } from 'vitest';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import {
  OMITTED_VARIANTS,
  renderFlutterIcons,
} from '../src/emit/flutter-icons.mjs';
import { renderReactIcons } from '../src/emit/react-icons.mjs';

const { spec } = buildIconSpec(loadIconCatalog());
const { icons, logos, manifest } = renderFlutterIcons(spec);

// Reads the emitter's output back the way a Dart compiler would read the constants: one block
// per `static const SolarVector`, and inside it the path data, in order.
function constants(source) {
  const found = new Map();
  const declaration =
    /static const SolarVector (\w+) = SolarVector\(\n {4}width: ([\d.]+),\n {4}height: ([\d.]+),\n/g;
  const blocks = [...source.matchAll(declaration)];
  blocks.forEach((match, i) => {
    const end = i + 1 < blocks.length ? blocks[i + 1].index : source.length;
    const body = source.slice(match.index + match[0].length, end);
    found.set(match[1], {
      width: Number(match[2]),
      height: Number(match[3]),
      paths: body
        .split('SolarVectorPath(')
        .slice(1)
        .map((piece) => ({
          d: /^'([^']*)'/.exec(piece)[1],
          evenOdd: piece.includes('evenOdd: true'),
          fill: /fill: (Color\(0x[0-9A-F]{8}\))/.exec(piece)?.[1] ?? null,
        })),
    });
  });
  return found;
}

const iconConstants = constants(icons);
const logoConstants = constants(logos);

describe('renderFlutterIcons: icons.dart', () => {
  it('emits one static const per variant, 682 of them, all named apart', () => {
    expect(iconConstants.size).toBe(682);
    expect(iconConstants.has('chevronRightOutline')).toBe(true);
    expect(iconConstants.has('chevronRightSolid')).toBe(true);
    // Every name is a plain Dart field: no `$` escaping is needed, unlike the token emitter,
    // because a stem is always followed by Outline or Solid.
    for (const name of iconConstants.keys())
      expect(name).toMatch(/^[a-z][A-Za-z0-9]*(Outline|Solid)$/);
  });

  it('builds no map, so taking one icon does not retain the other 681', () => {
    // The doc comment says why there is no map, so the check is over the code, not the prose.
    const code = icons
      .split('\n')
      .filter((l) => !l.trim().startsWith('//'))
      .join('\n');
    expect(code).not.toContain('Map<');
    expect(code).toContain('abstract final class SolarIcons {');
  });

  it('carries every d string byte for byte, in order', () => {
    const drift = [];
    for (const [stem, icon] of Object.entries(spec.icons))
      for (const [variant, geometry] of Object.entries(icon.variants)) {
        const name =
          stem.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) +
          (variant === 'outline' ? 'Outline' : 'Solid');
        const emitted = iconConstants.get(name);
        if (!emitted) {
          drift.push(`${name} is missing`);
          continue;
        }
        const want = geometry.paths.map((p) => p.d);
        const got = emitted.paths.map((p) => p.d);
        if (JSON.stringify(want) !== JSON.stringify(got))
          drift.push(`${name} path data differs`);
        if (emitted.width !== geometry.viewBox[2])
          drift.push(`${name} width differs`);
        if (emitted.height !== geometry.viewBox[3])
          drift.push(`${name} height differs`);
      }
    expect(drift).toEqual([]);
  });

  it('takes each extent from its own variant, not from a constant 24', () => {
    // zoneOutline was 25 tall beside a 24 solid until SOLAR redrew Icon/Zone on the grid on
    // 2026-09-22. It was the only asset that could tell a per-variant extent apart from a
    // hard-coded one, so the mixed case is built here; the logos come from the real spec
    // because the emitter asserts which variants it skipped.
    const synthetic = constants(
      renderFlutterIcons({
        icons: {
          sample: {
            component: 'IconSample',
            name: 'Sample',
            category: 'Test',
            description: 'A hand-built icon, one variant off the 24 grid.',
            variants: {
              outline: {
                viewBox: [0, 0, 24, 25],
                paths: [{ d: 'M0 0H24V25H0Z', fillRule: 'nonzero' }],
              },
              solid: {
                viewBox: [0, 0, 24, 24],
                paths: [{ d: 'M0 0H24V24H0Z', fillRule: 'nonzero' }],
              },
            },
          },
        },
        logos: spec.logos,
      }).icons,
    );
    expect(synthetic.get('sampleOutline')).toMatchObject({
      width: 24,
      height: 25,
    });
    expect(synthetic.get('sampleSolid')).toMatchObject({
      width: 24,
      height: 24,
    });

    // The corpus as it stands: every icon constant is 24 x 24.
    const offGrid = [...iconConstants]
      .filter(([, v]) => v.width !== 24 || v.height !== 24)
      .map(([name, v]) => `${name}: ${v.width} x ${v.height}`);
    expect(offGrid).toEqual([]);
  });

  it('marks evenOdd exactly where the spec says evenodd, 75 times', () => {
    const emitted = [...iconConstants.values()]
      .flatMap((v) => v.paths)
      .filter((p) => p.evenOdd).length;
    const expected = Object.values(spec.icons)
      .flatMap((icon) => Object.values(icon.variants))
      .flatMap((geometry) => geometry.paths)
      .filter((p) => p.fillRule === 'evenodd').length;
    expect(emitted).toBe(75);
    expect(emitted).toBe(expected);
  });

  it('names no colour anywhere: an icon inherits one', () => {
    // The contract that makes the widget's colour chain safe. #111111 is what the SOLAR source
    // draws every icon in, and none of it survives.
    expect(icons).not.toMatch(/#111111/i);
    expect(icons).not.toContain('Color(');
    expect([...iconConstants.values()].flatMap((v) => v.paths)).toSatisfy(
      (paths) => paths.every((p) => p.fill === null),
    );
  });

  it('draws the same geometry React does', () => {
    const react = renderReactIcons(spec).icons;
    for (const [stem, entry] of Object.entries(manifest.icons))
      for (const variant of ['outline', 'solid'])
        expect(entry.variants[variant].digest).toBe(
          react[stem].variants[variant].digest,
        );
  });
});

describe('renderFlutterIcons: logos.dart', () => {
  it('emits the four representable marks with their own colours', () => {
    expect([...logoConstants.keys()]).toEqual([
      'biampDarkSm',
      'biampLightSm',
      'osGoogle',
      'osMicrosoft',
    ]);
    expect(logoConstants.get('osGoogle').paths.map((p) => p.fill)).toEqual([
      'Color(0xFFFFC107)',
      'Color(0xFFFF3D00)',
      'Color(0xFF4CAF50)',
      'Color(0xFF1976D2)',
    ]);
    // Every logo path owns a colour; none inherits. The exact inverse of the icon contract.
    for (const logo of logoConstants.values())
      for (const path of logo.paths) expect(path.fill).not.toBeNull();
  });

  it('keeps the two Biamp wordmarks apart, which only the fill does', () => {
    const dark = logoConstants.get('biampDarkSm').paths.map((p) => p.fill);
    const light = logoConstants.get('biampLightSm').paths.map((p) => p.fill);
    expect(dark).toContain('Color(0xFF000000)');
    expect(light).toContain('Color(0xFFFFFFFF)');
    expect(dark).toContain('Color(0xFFD22730)');
    expect(dark).not.toEqual(light);
  });

  it('carries no Teams mark at all', () => {
    // 11 radial gradients, one linear gradient and every fill-opacity in the corpus: there is
    // nothing to draw it with here, and a flat-colour approximation would invent a brand colour.
    expect(logos).not.toMatch(/teams/i);
    expect(logos).not.toContain('radialGradient');
    expect(manifest.logos['os-logo'].variants.teams).toBeUndefined();
  });

  it('skips the app icons without calling them an omission', () => {
    // They are PNGs, not a mark the vector IR failed on: React ships them as data URLs and a
    // Flutter app loads them as image assets.
    expect(manifest.logos['app-icon']).toBeUndefined();
    expect(manifest.omitted).not.toContain('app-icon.workplace');
  });
});

describe('renderFlutterIcons: what it refuses', () => {
  it('reports Teams as its one and only omission', () => {
    expect(manifest.omitted).toEqual(['os-logo.teams']);
    expect(OMITTED_VARIANTS).toEqual(['os-logo.teams']);
  });

  it('stops the build when a second asset cannot be represented', () => {
    // The point of the assertion: a new gradient mark must fail loudly rather than vanish from
    // one target while React and the raw SVG still carry it.
    const second = structuredClone(spec);
    second.logos['os-logo'].variants.microsoft = {
      unsupported: 'gradient',
      source: '<svg />',
    };
    expect(() => renderFlutterIcons(second)).toThrow(
      /os-logo\.microsoft, os-logo\.teams/,
    );
  });

  it('refuses a viewBox the type cannot represent', () => {
    // SolarVector carries an extent, not a rectangle. Nothing in the corpus is offset, and
    // dropping an offset silently would draw the mark in the wrong place.
    const offset = structuredClone(spec);
    offset.icons['chevron-right'].variants.solid.viewBox = [2, 0, 24, 24];
    expect(() => renderFlutterIcons(offset)).toThrow(
      /does not start at the origin/,
    );
  });
});
