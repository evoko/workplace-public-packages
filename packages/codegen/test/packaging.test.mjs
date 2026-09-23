import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packagesDir } from '../src/util/paths.mjs';

// `import '@bwp-web/styles/tokens.css'` exists only for its side effect. A package that declares
// `"sideEffects": false` tells the bundler every import of it can be dropped when nothing is used
// from it, and webpack in production mode does exactly that, silently: the stylesheet vanishes
// from the build and every --solar-* variable is undefined. esbuild keeps CSS regardless, which is
// why nothing noticed. So every stylesheet a package exports must be named in its sideEffects.
const PUBLISHED = ['styles', 'assets', 'components', 'canvas'];

const read = (pkg) =>
  JSON.parse(readFileSync(join(packagesDir, pkg, 'package.json'), 'utf8'));

/** sideEffects globs as used by bundlers: a pattern without a slash matches the basename. */
const matches = (glob, path) => {
  const re = new RegExp(
    `^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '[^/]*')}$`,
  );
  return re.test(glob.includes('/') ? path : path.split('/').pop());
};

const exportTargets = (exports) =>
  typeof exports === 'string'
    ? [exports]
    : Object.values(exports ?? {}).flatMap(exportTargets);

describe('published packages', () => {
  for (const pkg of PUBLISHED) {
    it(`${pkg}: every exported stylesheet survives tree shaking`, () => {
      const { exports, sideEffects } = read(pkg);
      for (const target of exportTargets(exports).filter((t) =>
        t.endsWith('.css'),
      )) {
        const kept =
          sideEffects === true ||
          (Array.isArray(sideEffects) &&
            sideEffects.some((g) => matches(g, target)));
        expect(kept, `${target} is not listed in sideEffects`).toBe(true);
      }
    });
  }

  it('the check applies: styles does export a stylesheet', () => {
    expect(exportTargets(read('styles').exports)).toContain(
      './dist/tokens.css',
    );
  });
});

describe('fonts', () => {
  it('styles exports fonts.css, and it survives tree shaking like tokens.css', () => {
    const { exports } = read('styles');
    expect(exports['./fonts.css']).toBe('./dist/fonts.css');
  });

  it('fonts.css loads every family and weight a text style uses', async () => {
    const { buildTokenSpec, loadContract } =
      await import('../src/normalize/tokens.mjs');
    const { flattenSpec } = await import('../src/spec.mjs');
    const css = readFileSync(
      join(packagesDir, 'styles', 'src', 'fonts.css'),
      'utf8',
    );
    const used = new Set(
      flattenSpec(buildTokenSpec(loadContract()).spec)
        .filter((t) => t.type === 'typography')
        .map((t) => `${t.value.fontFamily}|${t.value.fontWeight}`),
    );
    const pkg = {
      Inter: 'inter',
      Montserrat: 'montserrat',
      'IBM Plex Mono': 'ibm-plex-mono',
    };
    for (const key of used) {
      const [family, weight] = key.split('|');
      expect(pkg[family], `${family} has no Fontsource package`).toBeDefined();
      expect(css, key).toContain(
        `@import '@fontsource/${pkg[family]}/${weight}.css';`,
      );
    }
  });

  it('solar_flutter bundles a file for every family and weight a text style uses', async () => {
    const { buildTokenSpec, loadContract } =
      await import('../src/normalize/tokens.mjs');
    const { flattenSpec } = await import('../src/spec.mjs');
    const { flutterFonts } = await import('../src/emit/fonts.mjs');
    const { existsSync } = await import('node:fs');
    const bundled = flutterFonts();
    for (const t of flattenSpec(buildTokenSpec(loadContract()).spec).filter(
      (x) => x.type === 'typography',
    ))
      expect(
        bundled.get(t.value.fontFamily)?.has(t.value.fontWeight),
        t.name,
      ).toBe(true);
    // Every declared asset is a file that exists, so a typo in the pubspec cannot pass.
    const { parse } = await import('yaml');
    const doc = parse(
      readFileSync(join(packagesDir, 'solar_flutter', 'pubspec.yaml'), 'utf8'),
    );
    for (const f of doc.flutter.fonts)
      for (const { asset } of f.fonts)
        expect(
          existsSync(join(packagesDir, 'solar_flutter', asset)),
          asset,
        ).toBe(true);
  });

  it('does not ship Gotham, which is commercially licensed', () => {
    const fonts = readFileSync(
      join(packagesDir, 'solar_flutter', 'pubspec.yaml'),
      'utf8',
    );
    expect(fonts).not.toMatch(/gotham/i);
  });
});
