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

// A web app and a Flutter app each take one side of the design system, never both: the npm
// packages must not carry or need anything Flutter, and solar_flutter must not need npm. The
// generator is the only place the two meet, and it is private.
describe('the web and Flutter packages are independent', () => {
  it('no npm package publishes a Dart, pubspec or bundled font file', async () => {
    const { execSync } = await import('node:child_process');
    for (const pkg of PUBLISHED) {
      const [{ files }] = JSON.parse(
        execSync('npm pack --dry-run --json --ignore-scripts', {
          cwd: join(packagesDir, pkg),
          stdio: ['ignore', 'pipe', 'ignore'],
        }).toString(),
      );
      const flutter = files
        .map((f) => f.path)
        .filter((p) => /\.dart$|pubspec|\.ttf$/i.test(p));
      expect(flutter, pkg).toEqual([]);
    }
  }, 60_000);

  it('no npm package depends on anything Flutter', () => {
    for (const pkg of PUBLISHED) {
      const p = read(pkg);
      const deps = Object.keys({ ...p.dependencies, ...p.peerDependencies });
      expect(
        deps.filter((d) => /flutter|dart/i.test(d)),
        pkg,
      ).toEqual([]);
    }
  });

  it('solar_flutter depends on Flutter alone, and is not an npm workspace', async () => {
    const { existsSync } = await import('node:fs');
    const { parse } = await import('yaml');
    const doc = parse(
      readFileSync(join(packagesDir, 'solar_flutter', 'pubspec.yaml'), 'utf8'),
    );
    expect(Object.keys(doc.dependencies)).toEqual(['flutter']);
    expect(existsSync(join(packagesDir, 'solar_flutter', 'package.json'))).toBe(
      false,
    );
  });
});

// Tailwind, plain-CSS, MUI and Flutter users each take one part. An entry that pulled in another
// audience's code would make every consumer pay for all four.
describe('each audience has its own entry', () => {
  it('styles exposes one entry per audience', () => {
    expect(Object.keys(read('styles').exports).sort()).toEqual(
      ['.', './fonts.css', './mui', './tailwind.css', './tokens.css'].sort(),
    );
  });

  it('the root entry is framework agnostic: no MUI theme and no component recipes', () => {
    // The code, not the doc comment, which names the MUI entry to point readers at it.
    const root = readFileSync(
      join(packagesDir, 'styles', 'src', 'index.ts'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(root).not.toMatch(/mui|Mui|components/);
    const data = readFileSync(
      join(packagesDir, 'styles', 'src', 'generated', 'tokens.ts'),
      'utf8',
    );
    expect(data).not.toMatch(/^import /m);
    expect(data).not.toMatch(/solarMui|createSolarThemeOptions/);
  });

  it('the MUI entry carries the theme and the recipes, and imports nothing from MUI', () => {
    const mui = readFileSync(
      join(packagesDir, 'styles', 'src', 'mui.ts'),
      'utf8',
    );
    expect(mui).toContain('createSolarThemeOptions');
    expect(mui).toContain('./generated/mui/components/index.js');
    expect(mui).not.toMatch(/from '@mui/);
  });

  it('the Tailwind entry is CSS alone, and brings the tokens with it', () => {
    const tw = readFileSync(
      join(packagesDir, 'styles', 'src', 'generated', 'tailwind', 'theme.css'),
      'utf8',
    );
    expect(tw).toContain("@import './tokens.css';");
    expect(tw).toContain('@theme inline');
    const { build } = read('styles').scripts;
    expect(build).toContain(
      'cp src/generated/tailwind/theme.css dist/tailwind.css',
    );
    expect(build).toContain('cp src/generated/css/tokens.css dist/tokens.css');
  });

  it('styles depends on nothing any audience would not want, beyond the fonts', () => {
    const p = read('styles');
    expect(p.peerDependencies ?? {}).toEqual({});
    expect(
      Object.keys(p.dependencies).every((d) => d.startsWith('@fontsource/')),
    ).toBe(true);
  });
});
