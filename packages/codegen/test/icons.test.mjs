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
  it('carries all 341 sets under distinct component names', () => {
    expect(icons).toHaveLength(341);
    expect(new Set(icons.map((i) => i.component)).size).toBe(341);
  });

  it('keeps the catalog metadata beside the geometry', () => {
    expect(spec.icons['chevron-right']).toMatchObject({
      component: 'IconChevronRight',
      name: 'ChevronRight',
      category: 'Navigation',
      description: expect.stringContaining('Related:'),
    });
  });

  it('draws 340 of the 341 outlines from their own file', () => {
    // Not a geometry comparison: 80 sets are drawn identically in both variants -- a chevron or
    // a plus has nothing to fill -- so only the missing source file marks the fallback.
    const missing = catalog.icons.filter((i) => !i.variants.outline);
    expect(missing.map((i) => i.fileStem)).toEqual(['support']);
    expect(icons.every((i) => i.variants.outline && i.variants.solid)).toBe(
      true,
    );
  });

  it('falls back to solid for the missing Support outline, and says so', () => {
    const support = spec.icons.support;
    expect(support.variants.outline).toEqual(support.variants.solid);
    expect(support.variants.outline).not.toBe(support.variants.solid);
    expect(tokens).toContain('icon.support');
  });

  it('separates the two Icon/Phone components by file stem', () => {
    expect(spec.icons.phone.component).toBe('IconPhone');
    expect(spec.icons['phone--audio-dsp'].component).toBe('IconPhoneAudioDsp');
    expect(tokens).toContain('icon.phone');
  });

  it('keeps the acronyms the catalog spells out', () => {
    expect(spec.icons.usb.component).toBe('IconUSB');
    expect(spec.icons['io-device'].component).toBe('IconIODevice');
  });

  it('carries the Zone outline viewBox verbatim, off grid as it is', () => {
    expect(spec.icons.zone.variants.outline.viewBox).toEqual([0, 0, 24, 25]);
    expect(spec.icons.zone.variants.solid.viewBox).toEqual([0, 0, 24, 24]);
    expect(tokens).toContain('icon.zone');
  });

  it('gives no icon path a colour, anywhere', () => {
    for (const { where, path } of everyIconPath()) {
      expect(Object.keys(path).sort(), where).toEqual(['d', 'fillRule']);
      expect(JSON.stringify(path), where).not.toContain('#111111');
    }
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
  // The corpus is 686 SVG files: 681 icon files (340 outline, 341 solid) and 5 logo files, one
  // of which is teams.svg. The spec holds one more variant and one more path than were parsed,
  // and that difference is exactly the Support outline standing in for its solid.
  it('matches the measured corpus', () => {
    let variants = 0;
    let paths = 0;
    for (const icon of icons)
      for (const variant of Object.values(icon.variants)) {
        variants += 1;
        paths += variant.paths.length;
      }
    expect(variants).toBe(682);
    expect(paths).toBe(792);

    for (const logo of Object.values(spec.logos)) {
      if (logo.raster) continue;
      for (const variant of Object.values(logo.variants)) {
        if (variant.unsupported) continue;
        variants += 1;
        paths += variant.paths.length;
      }
    }
    expect(variants - 1).toBe(685);
    expect(paths - 1).toBe(811);
  });

  it('records one deviation per source defect and no others', () => {
    // logo.size is not a defect in one asset: SOLAR publishes no logo size scale at all, so it
    // is triggered by the first drawable logo and reported once, like the rest.
    expect(tokens).toEqual([
      'icon.phone',
      'icon.support',
      'icon.zone',
      'logo.size',
      'logo.os-logo.teams',
    ]);
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
