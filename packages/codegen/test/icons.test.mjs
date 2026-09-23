import { describe, expect, it } from 'vitest';
import {
  UNSUPPORTED_VECTORS,
  buildIconSpec,
  loadIconCatalog,
  readVector,
} from '../src/normalize/icons.mjs';
import { ICON_DEVIATIONS } from '../src/normalize/deviations.mjs';

const catalog = loadIconCatalog();
const { spec, deviations } = buildIconSpec(catalog);
const icons = Object.values(spec.icons);
const tokens = deviations.map((d) => d.token);

const everyIconPath = function* () {
  for (const [stem, icon] of Object.entries(spec.icons))
    for (const [variant, { paths }] of Object.entries(icon.variants))
      for (const path of paths) yield { where: `${stem}/${variant}`, path };
};

describe('buildIconSpec: icons', () => {
  it('carries all 340 sets under distinct component names', () => {
    expect(icons).toHaveLength(340);
    expect(new Set(icons.map((i) => i.component)).size).toBe(340);
  });

  it('keeps the catalog metadata beside the geometry', () => {
    expect(spec.icons['chevron-right']).toMatchObject({
      component: 'IconChevronRight',
      name: 'ChevronRight',
      category: 'Navigation',
      description: expect.stringContaining('Related:'),
    });
  });

  it('draws all 340 outlines from their own file', () => {
    // Icon/Support shipped its solid drawing in both variant slots and no outline until SOLAR
    // drew the missing one on 2026-09-22; it was the only icon that reached the fallback, which
    // is now exercised synthetically below. Not a geometry comparison: 80 sets are drawn
    // identically in both variants -- a chevron or a plus has nothing to fill -- so only a
    // missing source file marks the fallback.
    const missing = catalog.icons.filter((i) => !i.variants.outline);
    expect(missing.map((i) => i.fileStem)).toEqual([]);
    expect(
      catalog.icons.filter((i) => i.variants.outline && i.variants.solid),
    ).toHaveLength(340);
    expect(icons.every((i) => i.variants.outline && i.variants.solid)).toBe(
      true,
    );
  });

  it('draws support in two variants of its own, no longer one cloned', () => {
    const support = spec.icons.support;
    expect(support.variants.outline).not.toEqual(support.variants.solid);
    expect(tokens).not.toContain('icon.support');
  });

  it('names every icon from its Figma name, which are unique again', () => {
    // SOLAR deleted the Audio & DSP duplicate of Icon/Phone on 2026-09-23, so no icon needs its
    // file stem to tell it apart and the collision finding is gone.
    expect(spec.icons.phone.component).toBe('IconPhone');
    expect(spec.icons).not.toHaveProperty(['phone--audio-dsp']);
    expect(tokens).not.toContain('icon.phone');
  });

  it('keeps the acronyms the catalog spells out', () => {
    expect(spec.icons.usb.component).toBe('IconUSB');
    expect(spec.icons['io-device'].component).toBe('IconIODevice');
  });

  it('draws every icon variant on the 24 grid', () => {
    // Icon/Zone's outline was 0 0 24 25 until SOLAR redrew it on 2026-09-22, and it was the one
    // icon off the grid. This says what is true of the corpus today; that a viewBox is carried
    // per variant rather than assumed is asserted synthetically below.
    const offGrid = [];
    for (const [stem, icon] of Object.entries(spec.icons))
      for (const [variant, geometry] of Object.entries(icon.variants))
        if (geometry.viewBox.join(' ') !== '0 0 24 24')
          offGrid.push(`${stem}/${variant}: ${geometry.viewBox.join(' ')}`);
    expect(offGrid).toEqual([]);
    expect(tokens).not.toContain('icon.zone');
  });

  it('gives no icon path a colour, anywhere', () => {
    for (const { where, path } of everyIconPath()) {
      expect(Object.keys(path).sort(), where).toEqual(['d', 'fillRule']);
      expect(JSON.stringify(path), where).not.toContain('#111111');
    }
  });
});

// Both defects these two cover were fixed in Figma on 2026-09-22, so nothing in
// docs/solar-icons triggers either code path any more. The catalogs are written by hand instead
// of deleting the tests: an export with no outline still has to render, and a viewBox still has
// to be read per variant rather than assumed, or the next defective export would emit a hole or
// a silently cropped drawing instead of a recorded deviation.
describe('buildIconSpec: the paths only a defective catalog reaches', () => {
  const build = (icon) => buildIconSpec({ icons: [icon], logos: [] });
  const base = {
    category: 'Status & Feedback',
    description: 'Support.',
    size: [24, 24],
  };

  it('falls back to solid when Figma ships no outline, and says so', () => {
    // How Icon/Support arrived until 2026-09-22: two solid variants, so the outline slot is
    // empty and there is no outline geometry to emit.
    const { spec: built, deviations: found } = build({
      ...base,
      name: 'Support',
      component: 'IconSupport',
      kebab: 'support',
      fileStem: 'support',
      variants: { solid: { file: 'svg/solid/support.svg' } },
    });
    const support = built.icons.support;
    expect(support.variants.outline).toEqual(support.variants.solid);
    // A clone rather than the same object, so a consumer holding one variant cannot reach the
    // other through it.
    expect(support.variants.outline).not.toBe(support.variants.solid);
    expect(found.map((d) => d.token)).toEqual(['icon.support']);
  });

  it('carries the viewBox the file declares, not the size the catalog claims', () => {
    // How Icon/Zone arrived until 2026-09-22: a viewBox that is not the set's declared size.
    // The file wins, because the geometry was drawn against its own viewBox -- cropping it to
    // the declared grid would shift the drawing -- and the disagreement is recorded.
    const { spec: built, deviations: found } = build({
      ...base,
      name: 'Zone',
      component: 'IconZone',
      kebab: 'zone',
      fileStem: 'zone',
      size: [24, 25],
      variants: {
        outline: { file: 'svg/outline/zone.svg' },
        solid: { file: 'svg/solid/zone.svg' },
      },
    });
    expect(built.icons.zone.variants.outline.viewBox).toEqual([0, 0, 24, 24]);
    expect(built.icons.zone.variants.solid.viewBox).toEqual([0, 0, 24, 24]);
    // Recorded once, however many variants trigger it.
    expect(found.map((d) => d.token)).toEqual(['icon.zone']);
  });

  it('stops rather than invent a deviation the registry does not hold', () => {
    expect(() =>
      build({
        ...base,
        name: 'Invented',
        component: 'IconInvented',
        kebab: 'invented',
        fileStem: 'invented',
        variants: { solid: { file: 'svg/solid/support.svg' } },
      }),
    ).toThrow(/has no recorded deviation for icon\.invented/);
  });
});

describe('buildIconSpec: logos', () => {
  const { 'os-logo': os, 'biamp-logo': biamp, 'app-icon': app } = spec.logos;

  it('names each set after its Figma prop', () => {
    expect(os).toMatchObject({ component: 'LogoOs', prop: 'logo' });
    // style crossed with size collapses into the one slug the files are named by.
    expect(biamp).toMatchObject({ component: 'LogoBiamp', prop: 'variant' });
    expect(app).toMatchObject({ component: 'LogoAppIcon', prop: 'app' });
  });

  it('gives every logo path its own fill', () => {
    for (const [name, logo] of Object.entries(spec.logos)) {
      if (logo.raster) continue;
      for (const [slug, variant] of Object.entries(logo.variants)) {
        if (variant.unsupported) continue;
        for (const path of variant.paths)
          expect(path.fill, `${name}/${slug}`).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('keeps the four Google brand colours', () => {
    expect(os.variants.google.paths.map((p) => p.fill)).toEqual([
      '#ffc107',
      '#ff3d00',
      '#4caf50',
      '#1976d2',
    ]);
  });

  it('resolves the named colours in both Biamp marks', () => {
    expect(biamp.variants['dark-sm'].viewBox).toEqual([0, 0, 36, 12]);
    expect(new Set(biamp.variants['dark-sm'].paths.map((p) => p.fill))).toEqual(
      new Set(['#000000', '#d22730']),
    );
    expect(
      new Set(biamp.variants['light-sm'].paths.map((p) => p.fill)),
    ).toEqual(new Set(['#ffffff', '#d22730']));
    expect(biamp.variants['dark-sm']).not.toEqual(biamp.variants['light-sm']);
  });

  it('ships the Teams mark as its raw source, with a deviation', () => {
    const teams = os.variants.teams;
    expect(teams.unsupported).toBe('gradient');
    expect(teams.source).toContain('radialGradient');
    expect(teams.paths).toBeUndefined();
    expect(tokens).toContain('logo.os-logo.teams');
  });

  it('ships the app icons as raster files, not paths', () => {
    expect(app.raster).toBe(true);
    expect(app.variants).toBeUndefined();
    expect(Object.keys(app.files)).toEqual([
      'workplace',
      'designer',
      'tools',
      'booking',
      'command',
    ]);
    for (const file of Object.values(app.files))
      expect(file).toMatch(/^logos\/app-icon\/\w+@2x\.png$/);
  });
});

describe('buildIconSpec: totals', () => {
  // The corpus is 685 SVG files: 680 icon files (340 outline, 340 solid) and 5 logo files, one
  // of which is teams.svg. Since SOLAR drew the missing Support outline on 2026-09-22 nothing
  // is cloned, so the spec holds exactly the variants and paths that were parsed: 684 files and
  // 810 paths, teams excluded from both because it has no IR.
  it('matches the measured corpus', () => {
    let variants = 0;
    let paths = 0;
    for (const icon of icons)
      for (const variant of Object.values(icon.variants)) {
        variants += 1;
        paths += variant.paths.length;
      }
    expect(variants).toBe(680);
    expect(paths).toBe(790);

    for (const logo of Object.values(spec.logos)) {
      if (logo.raster) continue;
      for (const variant of Object.values(logo.variants)) {
        if (variant.unsupported) continue;
        variants += 1;
        paths += variant.paths.length;
      }
    }
    expect(variants).toBe(684);
    expect(paths).toBe(810);
  });

  it('records one deviation per source defect and no others', () => {
    // logo.size is not a defect in one asset: SOLAR publishes no logo size scale at all, so it
    // is triggered by the first drawable logo and reported once, like the rest.
    // icon.support and icon.zone were both recorded here until SOLAR fixed the two icons on
    // 2026-09-22; they stay in ICON_DEVIATIONS as the registry entries the fallback and the
    // off-grid paths look up, and are reported only when the data triggers them again.
    expect(tokens).toEqual(['logo.size', 'logo.os-logo.teams']);
    for (const d of deviations) {
      expect(ICON_DEVIATIONS).toContainEqual(d);
      expect(d.raise.length, d.token).toBeGreaterThan(20);
    }
  });
});

describe('readVector', () => {
  const gradient = (file) =>
    readVector(
      '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 0H32V32H0Z" fill="url(#paint0_radial)"/></svg>',
      { file },
    );

  it('is an allowlist, not a catch-all', () => {
    expect(UNSUPPORTED_VECTORS).toEqual(new Set(['logos/os-logo/teams.svg']));
    expect(() => gradient('logos/os-logo/invented.svg')).toThrow(
      /gradients and patterns cannot be represented/,
    );
  });

  it('records the one allowed failure with its source', () => {
    expect(gradient('logos/os-logo/teams.svg')).toEqual({
      unsupported: 'gradient',
      source: expect.stringContaining('paint0_radial'),
    });
  });
});
