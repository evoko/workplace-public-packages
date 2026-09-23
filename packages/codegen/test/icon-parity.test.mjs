/**
 * Icon parity: the generated artifacts, read back off disk, draw the same thing.
 *
 * The sibling of `parity.test.mjs`, with one lesson from milestone 1 written into its shape:
 * **a manifest is a claim about the output, not the output.** Three token emitters there
 * recorded a mode they had forgotten to emit, and every manifest-reading assertion stayed green.
 * So nothing here reads `icons.manifest.json`. It reads the generated TSX, the generated SVG
 * files and the generated Dart, extracts the geometry back out of them, and compares that to the
 * spec built in memory from `docs/solar-icons/`. A digest may cross-check; it may never be the
 * only evidence.
 *
 * Extraction is regex based, which has one specific failure mode: a pattern that captures too
 * much silently reads the solid block as the outline one and every variant looks wrong -- or,
 * worse, a pattern that captures too little drops a path and the icon looks *right*. Both are
 * guarded: every block's end is anchored, every extractor counts what it read against what the
 * text declares, and the inventory assertion pins the totals (340 modules, 680 variants) before
 * any geometry is compared.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  dartVariantName,
  renderFlutterIcons,
} from '../src/emit/flutter-icons.mjs';
import { renderReactIcons } from '../src/emit/react-icons.mjs';
import { renderSvgFiles } from '../src/emit/svg-files.mjs';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { parseSvg } from '../src/normalize/svg.mjs';
import { packagesDir, repoRoot } from '../src/util/paths.mjs';
import { byCodeUnit } from '../src/util/sort.mjs';

const ASSETS = join(packagesDir, 'assets', 'src', 'generated');
const FLUTTER = join(packagesDir, 'solar_flutter', 'lib', 'src', 'generated');

const DIRS = {
  icons: join(ASSETS, 'icons'),
  logos: join(ASSETS, 'logos'),
  svgIcons: join(ASSETS, 'svg', 'icons'),
  svgLogos: join(ASSETS, 'svg', 'logos'),
};
const DART = {
  icons: join(FLUTTER, 'icons.dart'),
  logos: join(FLUTTER, 'logos.dart'),
};

const rel = (path) => relative(repoRoot, path);

const RUN_THE_GENERATOR =
  'the icon artifacts have not been generated; run `npm run solar:codegen`';

function read(path) {
  if (!existsSync(path))
    throw new Error(`${rel(path)} does not exist: ${RUN_THE_GENERATOR}`);
  return readFileSync(path, 'utf8');
}

const listing = (dir, ext) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .sort(byCodeUnit);

/** The one shape every extractor normalises a path to, so the comparison is a string compare. */
const asPath = (d, fillRule, fill) => ({
  d,
  fillRule: fillRule ?? 'nonzero',
  fill: fill ?? null,
});

const show = (path) => JSON.stringify(path);

// Path data runs to thousands of characters; a failure message has to name the icon, not recite
// the drawing, so `d` is elided in messages and compared in full.
const brief = (path) =>
  JSON.stringify({
    ...path,
    d:
      path.d.length > 48
        ? `${path.d.slice(0, 48)}… (${path.d.length} chars)`
        : path.d,
  });

/** Symmetric difference, phrased as the two directions that are not empty. */
function differences(label, actual, expected) {
  const a = new Set(actual);
  const e = new Set(expected);
  return [
    ...[...e]
      .filter((name) => !a.has(name))
      .map((n) => `${label} is missing ${n}`),
    ...[...a]
      .filter((name) => !e.has(name))
      .map((n) => `${label} has extra ${n}`),
  ];
}

const camel = (text) =>
  text
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word[0].toLowerCase() + word.slice(1)
        : word[0].toUpperCase() + word.slice(1),
    )
    .join('');

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

// The end is anchored on a `};` in column 1, so a module's two geometries cannot bleed into one
// another. Splitting on `const outline:` instead would return the solid block too.
const TSX_GEOMETRY =
  /^const (\w+): (?:Icon|Logo)Geometry = \{\n([\s\S]*?)\n\};$/gm;
// `fill` is captured as whatever it says rather than as a colour pattern: a tinted logo has to
// arrive at the assertion that names it, not disappear into an unmatched path here.
const TSX_PATH =
  /\{\s*d: '([^']*)',?(?:\s*fillRule: '(\w+)',?)?(?:\s*fill: '([^']*)',?)?\s*\}/g;
const TSX_VARIANT = /^const (\w+): Logo(?:Geometry|Markup) = \{$/gm;

function readTsx(file) {
  const source = read(file);
  const geometries = new Map();
  for (const [, name, body] of source.matchAll(TSX_GEOMETRY)) {
    const viewBox = /viewBox: '([^']*)'/.exec(body);
    if (!viewBox) throw new Error(`${rel(file)}: ${name} has no viewBox`);
    const paths = [...body.matchAll(TSX_PATH)].map(([, d, fillRule, fill]) =>
      asPath(d, fillRule, fill),
    );
    // Checked against the one thing a loose pattern cannot get wrong: how many times the block
    // says `d:`. A dropped path would otherwise leave a wrong icon looking identical to the spec.
    const declared = [...body.matchAll(/\bd: '/g)].length;
    if (paths.length !== declared)
      throw new Error(
        `${rel(file)}: ${name} declares ${declared} paths, the extractor read ${paths.length}`,
      );
    geometries.set(name, { viewBox: viewBox[1], paths });
  }
  return { source, geometries };
}

// dart format wraps the argument list, so the terminator is a `);` at two spaces of indent --
// the only one in the file at that depth.
const DART_VECTOR =
  /static const SolarVector (\w+) = SolarVector\(([\s\S]*?)\n {2}\);/g;

function readDart(file) {
  const source = read(file);
  const vectors = new Map();
  for (const [, name, body] of source.matchAll(DART_VECTOR)) {
    const width = /width: ([\d.]+)/.exec(body);
    const height = /height: ([\d.]+)/.exec(body);
    if (!width || !height)
      throw new Error(`${rel(file)}: ${name} has no extent`);
    // Splitting rather than matching a whole call: a logo path's `fill: Color(0x…)` nests
    // parentheses, which a single balanced pattern would have to spell out.
    const paths = body.split('SolarVectorPath(').slice(1);
    vectors.set(name, {
      // SolarVector carries an extent, not a rectangle, because nothing in the corpus is offset.
      viewBox: `0 0 ${Number(width[1])} ${Number(height[1])}`,
      paths: paths.map((chunk) => {
        const d = /^\s*'([^']*)'/.exec(chunk);
        if (!d)
          throw new Error(`${rel(file)}: ${name} has a path with no data`);
        const fill = /fill: Color\(0x([0-9A-Fa-f]{8})\)/.exec(chunk);
        if (fill && !/^ff/i.test(fill[1]))
          throw new Error(
            `${rel(file)}: ${name} is filled 0x${fill[1]}, which is not opaque`,
          );
        return asPath(
          d[1],
          /evenOdd: true/.test(chunk) ? 'evenodd' : 'nonzero',
          fill ? `#${fill[1].slice(2).toLowerCase()}` : null,
        );
      }),
    });
  }
  return { source, vectors };
}

// Parsed rather than pattern-matched: the raw SVG is the one target whose own reader already
// exists, and using it makes the round trip -- serialize from the spec, parse back, compare --
// a real assertion instead of a regex agreeing with the regex that wrote the file.
function readSvg(file) {
  const source = read(file);
  const parsed = parseSvg(source, { file: rel(file) });
  return {
    source,
    viewBox: parsed.viewBox.join(' '),
    paths: parsed.paths.map((p) => asPath(p.d, p.fillRule, p.fill)),
  };
}

const fromSpec = (geometry) => ({
  viewBox: geometry.viewBox.join(' '),
  paths: geometry.paths.map((p) => asPath(p.d, p.fillRule, p.fill)),
});

// ---------------------------------------------------------------------------

let spec,
  deviations,
  missing,
  stems,
  variants,
  react,
  reactSources,
  svg,
  dart,
  logoTable,
  logoPresence,
  logoGeometry,
  logoSources;

beforeAll(() => {
  ({ spec, deviations } = buildIconSpec(loadIconCatalog()));
  stems = Object.keys(spec.icons).sort(byCodeUnit);
  variants = stems.flatMap((stem) => [
    [stem, 'outline'],
    [stem, 'solid'],
  ]);

  missing = [...Object.values(DIRS), ...Object.values(DART)]
    .filter((path) => !existsSync(path))
    .map(rel);
  // Nothing below can read a file that is not there. The first assertion reports the whole list
  // with the command to fix it, which is more use than 680 ENOENTs from a fresh clone.
  if (missing.length) return;

  react = new Map();
  reactSources = new Map();
  for (const file of listing(DIRS.icons, '.tsx')) {
    const stem = file.slice(0, -'.tsx'.length);
    const { source, geometries } = readTsx(join(DIRS.icons, file));
    react.set(stem, geometries);
    reactSources.set(`icons/${file}`, source);
  }

  svg = new Map();
  for (const file of listing(DIRS.svgIcons, '.svg'))
    svg.set(file, readSvg(join(DIRS.svgIcons, file)));

  dart = readDart(DART.icons);

  // Logos: one table of every vector variant the spec describes, and which targets carry it.
  logoTable = [];
  for (const set of Object.keys(spec.logos).sort(byCodeUnit)) {
    const logo = spec.logos[set];
    if (logo.raster) continue; // the app icons are PNGs and are not components anywhere
    const prefix = camel(logo.component.replace(/^Logo/, ''));
    for (const slug of Object.keys(logo.variants).sort(byCodeUnit)) {
      logoTable.push({
        key: `${set}.${slug}`,
        set,
        slug,
        drawable: !logo.variants[slug].unsupported,
        reactConst: camel(slug),
        dartConst: dartVariantName(prefix, slug),
        svgFile: `${set}-${slug}.svg`,
        module: `${set.replace(/-logo$/, '')}.tsx`,
      });
    }
  }

  logoSources = new Map();
  const reactLogos = new Map();
  for (const file of readdirSync(DIRS.logos).sort(byCodeUnit)) {
    logoSources.set(`logos/${file}`, read(join(DIRS.logos, file)));
    if (file.endsWith('.tsx'))
      reactLogos.set(file, readTsx(join(DIRS.logos, file)));
  }
  for (const file of listing(DIRS.svgLogos, '.svg'))
    logoSources.set(`svg/logos/${file}`, read(join(DIRS.svgLogos, file)));
  const dartLogos = readDart(DART.logos);
  logoSources.set('logos.dart', dartLogos.source);

  // A variant is "in React" when its module declares it, whether as geometry or, for the Teams
  // mark, as the raw markup the vector IR cannot hold; only the drawable ones have a geometry.
  const declared = new Map(
    [...reactLogos].map(([file, { source }]) => [
      file,
      new Set([...source.matchAll(TSX_VARIANT)].map((m) => m[1])),
    ]),
  );
  const svgLogoFiles = new Set(listing(DIRS.svgLogos, '.svg'));

  const has = {
    react: (v) => declared.get(v.module)?.has(v.reactConst) ?? false,
    svg: (v) => svgLogoFiles.has(v.svgFile),
    flutter: (v) => dartLogos.vectors.has(v.dartConst),
  };
  logoPresence = Object.fromEntries(
    Object.entries(has).map(([target, present]) => [
      target,
      new Set(logoTable.filter(present).map((v) => v.key)),
    ]),
  );

  logoGeometry = { react: new Map(), svg: new Map(), flutter: new Map() };
  for (const variant of logoTable) {
    if (!variant.drawable) continue;
    const fromModule = reactLogos
      .get(variant.module)
      ?.geometries.get(variant.reactConst);
    if (fromModule) logoGeometry.react.set(variant.key, fromModule);
    if (svgLogoFiles.has(variant.svgFile))
      logoGeometry.svg.set(
        variant.key,
        readSvg(join(DIRS.svgLogos, variant.svgFile)),
      );
    const vector = dartLogos.vectors.get(variant.dartConst);
    if (vector) logoGeometry.flutter.set(variant.key, vector);
  }
});

describe('icon parity', () => {
  it('every generated artifact this suite reads is on disk', () => {
    expect(
      missing,
      `${RUN_THE_GENERATOR}; it writes ${missing?.join(', ')}`,
    ).toEqual([]);
  });

  it('the inventory is total and one-to-one across the three targets', () => {
    expect(stems.length).toBe(340);
    expect(variants.length).toBe(680);

    expect(differences('react', [...react.keys()], stems)).toEqual([]);
    const illFormed = [...react]
      .filter(([, g]) => g.size !== 2 || !g.has('outline') || !g.has('solid'))
      .map(
        ([stem, g]) =>
          `${stem}.tsx yields ${[...g.keys()].join(', ') || 'nothing'}`,
      );
    expect(illFormed).toEqual([]);

    expect(
      differences(
        'svg',
        [...svg.keys()],
        variants.map(([stem, variant]) => `${stem}-${variant}.svg`),
      ),
    ).toEqual([]);
    expect(
      differences(
        'flutter',
        [...dart.vectors.keys()],
        variants.map(([stem, variant]) => dartVariantName(stem, variant)),
      ),
    ).toEqual([]);

    // The counts the extraction itself is sanity-checked against: 340 modules each yielding two
    // geometries, 680 files, 680 constants.
    expect(react.size).toBe(340);
    expect(svg.size).toBe(680);
    expect(dart.vectors.size).toBe(680);
  });

  it('React, the raw SVG, Dart and the spec draw the same geometry for every icon variant', () => {
    const mismatches = [];
    for (const [stem, variant] of variants) {
      const want = fromSpec(spec.icons[stem].variants[variant]);
      const emitted = {
        react: react.get(stem)?.get(variant),
        svg: svg.get(`${stem}-${variant}.svg`),
        flutter: dart.vectors.get(dartVariantName(stem, variant)),
      };
      for (const [target, got] of Object.entries(emitted)) {
        const where = `${target} ${stem}/${variant}`;
        if (!got) {
          mismatches.push(`${where}: nothing emitted`);
          continue;
        }
        if (got.viewBox !== want.viewBox)
          mismatches.push(
            `${where}: viewBox "${got.viewBox}", spec says "${want.viewBox}"`,
          );
        if (got.paths.length !== want.paths.length) {
          mismatches.push(
            `${where}: ${got.paths.length} paths, spec has ${want.paths.length}`,
          );
          continue;
        }
        got.paths.forEach((path, i) => {
          if (show(path) !== show(want.paths[i]))
            mismatches.push(
              `${where} path ${i}: ${brief(path)} vs spec ${brief(want.paths[i])}`,
            );
        });
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('the evenodd fill rule survives into all three targets, on the same 75 paths', () => {
    // Its own assertion because dropping it is invisible to a viewBox or path-count check and
    // very visible on screen: an evenodd icon rendered nonzero is a filled blob.
    const evenodd = (label, paths) =>
      paths.flatMap((p, i) =>
        p.fillRule === 'evenodd' ? [`${label}#${i}`] : [],
      );
    const want = variants.flatMap(([stem, variant]) =>
      evenodd(
        `${stem}/${variant}`,
        fromSpec(spec.icons[stem].variants[variant]).paths,
      ),
    );
    expect(want.length).toBe(75);

    const wrong = [];
    for (const [target, of] of Object.entries({
      react: ([stem, variant]) => react.get(stem)?.get(variant),
      svg: ([stem, variant]) => svg.get(`${stem}-${variant}.svg`),
      flutter: ([stem, variant]) =>
        dart.vectors.get(dartVariantName(stem, variant)),
    })) {
      const got = variants.flatMap(([stem, variant]) =>
        evenodd(`${stem}/${variant}`, of([stem, variant])?.paths ?? []),
      );
      wrong.push(...differences(`${target} evenodd`, got, want));
    }
    expect(wrong).toEqual([]);

    // And the literal spelling each target uses, counted in the bytes on disk.
    const count = (text, pattern) => (text.match(pattern) ?? []).length;
    const tsx = [...reactSources.values()].reduce(
      (n, source) => n + count(source, /fillRule: 'evenodd'/g),
      0,
    );
    const files = [...svg.values()].reduce(
      (n, g) => n + count(g.source, /fill-rule="evenodd"/g),
      0,
    );
    expect({
      react: tsx,
      svg: files,
      flutter: count(dart.source, /evenOdd: true/g),
    }).toEqual({ react: 75, svg: 75, flutter: 75 });
  });

  it('no icon carries a colour, in any target', () => {
    // The `currentColor` contract, asserted as the absence it actually is. This is what makes an
    // icon different from a token: a token's whole content is its value, an icon must have none.
    const offenders = [];
    const scan = (label, source) => {
      for (const m of source.matchAll(
        /#[0-9a-fA-F]{3,8}\b|\bColor\(|\brgba?\(/g,
      ))
        offenders.push(`${label} names a colour: ${m[0]}`);
    };
    for (const [label, source] of reactSources) scan(label, source);
    for (const [file, geometry] of svg)
      scan(`svg/icons/${file}`, geometry.source);
    scan('icons.dart', dart.source);
    expect(offenders).toEqual([]);

    const tinted = [];
    for (const [stem, variant] of variants) {
      const emitted = {
        react: react.get(stem)?.get(variant),
        svg: svg.get(`${stem}-${variant}.svg`),
        flutter: dart.vectors.get(dartVariantName(stem, variant)),
      };
      for (const [target, got] of Object.entries(emitted))
        for (const [i, path] of (got?.paths ?? []).entries())
          if (path.fill !== null)
            tinted.push(
              `${target} ${stem}/${variant} path ${i} is filled ${path.fill}`,
            );
    }
    expect(tinted).toEqual([]);

    // The positive half, in the one target where the inherited fill is written out rather than
    // being an absence: every path in every icon file says currentColor.
    const notInherited = [...svg]
      .filter(
        ([, g]) =>
          (g.source.match(/fill="currentColor"/g) ?? []).length !==
          g.paths.length,
      )
      .map(
        ([file]) => `svg/icons/${file} does not say currentColor on every path`,
      );
    expect(notInherited).toEqual([]);
  });

  it('logos are the inverse: every path names a colour and none inherits one', () => {
    const inherited = [...logoSources]
      .filter(([, source]) => source.includes('currentColor'))
      .map(([label]) => `${label} inherits a colour`);
    expect(inherited).toEqual([]);

    const uncoloured = [];
    for (const variant of logoTable) {
      if (!variant.drawable) continue;
      const emitted = {
        react: logoGeometry.react.get(variant.key),
        svg: logoGeometry.svg.get(variant.key),
        flutter: logoGeometry.flutter.get(variant.key),
      };
      for (const [target, got] of Object.entries(emitted)) {
        if (!got) {
          uncoloured.push(`${target} ${variant.key}: nothing emitted`);
          continue;
        }
        for (const [i, path] of got.paths.entries())
          if (!/^#[0-9a-f]{6}$/.test(path.fill ?? ''))
            uncoloured.push(
              `${target} ${variant.key} path ${i} is filled ${path.fill ?? 'by inheritance'}`,
            );
      }
    }
    expect(uncoloured).toEqual([]);

    // os-logo/teams has no vector IR, so it has no path list to check. It still has to name its
    // colours, which it does in gradient stops, in both targets that carry it.
    expect(logoSources.get('logos/os.tsx')).toMatch(
      /stopColor="#[0-9a-fA-F]{6}"/,
    );
    expect(logoSources.get('svg/logos/os-logo-teams.svg')).toMatch(
      /stop-color="#[0-9a-fA-F]{6}"/,
    );
  });

  it('every logo a target does carry is the same drawing in the spec', () => {
    const mismatches = [];
    for (const variant of logoTable) {
      if (!variant.drawable) continue;
      const want = fromSpec(spec.logos[variant.set].variants[variant.slug]);
      const emitted = {
        react: logoGeometry.react.get(variant.key),
        svg: logoGeometry.svg.get(variant.key),
        flutter: logoGeometry.flutter.get(variant.key),
      };
      for (const [target, got] of Object.entries(emitted)) {
        if (!got) continue; // absence is the previous test's and the divergence test's business
        const where = `${target} ${variant.key}`;
        if (got.viewBox !== want.viewBox)
          mismatches.push(
            `${where}: viewBox "${got.viewBox}", spec says "${want.viewBox}"`,
          );
        if (got.paths.length !== want.paths.length) {
          mismatches.push(
            `${where}: ${got.paths.length} paths, spec has ${want.paths.length}`,
          );
          continue;
        }
        got.paths.forEach((path, i) => {
          if (show(path) !== show(want.paths[i]))
            mismatches.push(
              `${where} path ${i}: ${brief(path)} vs spec ${brief(want.paths[i])}`,
            );
        });
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('the targets differ by exactly one asset, and a deviation says why', () => {
    // React and the raw SVG render the Teams mark's gradients; the Flutter painter cannot, and
    // approximating it would invent a brand colour. That is the one permitted divergence, so it
    // is asserted as a closed set: a second one has to fail here rather than pass as "expected".
    const PERMITTED = new Set(['react+svg+flutter', 'react+svg']);
    const carriedBy = logoTable.map((variant) => [
      variant.key,
      ['react', 'svg', 'flutter']
        .filter((target) => logoPresence[target].has(variant.key))
        .join('+'),
    ]);

    // Named individually, so a second divergence says which asset it is rather than only that
    // the shape of the answer changed.
    const undocumented = carriedBy
      .filter(([, signature]) => !PERMITTED.has(signature))
      .map(
        ([key, signature]) =>
          `${key} is carried by ${signature || 'no target'}`,
      );
    expect(undocumented).toEqual([]);

    const flutterHasNot = carriedBy
      .filter(([, signature]) => signature === 'react+svg')
      .map(([key]) => key);
    expect(flutterHasNot).toEqual(['os-logo.teams']);

    const deviation = deviations.find((d) => d.token === 'logo.os-logo.teams');
    expect(
      deviation,
      'the one divergence between the targets has no recorded deviation',
    ).toBeDefined();
    expect(deviation.reason).toMatch(/Flutter/);
  });

  it('every icon variant is on the 24 grid in all three targets', () => {
    // Icon/Zone's outline was drawn 0 0 24 25 -- the one asset a target could plausibly
    // normalise to a square -- until SOLAR redrew it on the grid on 2026-09-22. Nothing on disk
    // is off grid now, so this is the assertion that would notice a new one arriving, and the
    // synthetic test below is what keeps the per-variant handling covered.
    const offGrid = [];
    for (const [stem, variant] of variants) {
      const got = {
        spec: fromSpec(spec.icons[stem].variants[variant]).viewBox,
        react: react.get(stem).get(variant).viewBox,
        svg: svg.get(`${stem}-${variant}.svg`).viewBox,
        flutter: dart.vectors.get(dartVariantName(stem, variant)).viewBox,
      };
      for (const [target, viewBox] of Object.entries(got))
        if (viewBox !== '0 0 24 24')
          offGrid.push(`${target} ${stem}/${variant}: ${viewBox}`);
    }
    expect(offGrid).toEqual([]);

    // The SVG files also carry an intrinsic size, which is where a square would creep back in.
    const mis = [...svg]
      .filter(([, file]) => !file.source.includes('width="24" height="24"'))
      .map(([name]) => name);
    expect(mis).toEqual([]);
  });

  it('carries a viewBox per variant into all three targets', () => {
    // The one assertion in this file that runs the emitters in memory rather than reading the
    // generated tree: since zone was redrawn there is no off-grid asset on disk to read, and
    // cropping an off-grid variant to 24 would still fail no count and still shift the drawing.
    const sample = {
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
    };
    // The real logos travel with it: the Flutter emitter asserts which variants it skipped.
    const synthetic = { icons: { sample }, logos: spec.logos };
    const [module] = renderReactIcons(synthetic).modules;
    const files = renderSvgFiles(synthetic);
    const dartSource = renderFlutterIcons(synthetic).icons;

    for (const variant of ['outline', 'solid']) {
      const want = fromSpec(sample.variants[variant]).viewBox;
      const tsx = new RegExp(
        `const ${variant}: IconGeometry = \\{\\n  viewBox: '([^']*)'`,
      ).exec(module.tsx);
      const vector = new RegExp(
        `${dartVariantName('sample', variant)} = SolarVector\\(\\n` +
          `    width: ([\\d.]+),\\n    height: ([\\d.]+),`,
      ).exec(dartSource);
      const file = `icons/sample-${variant}.svg`;
      expect({
        react: tsx?.[1],
        svg: parseSvg(files.get(file), { file }).viewBox.join(' '),
        flutter: vector && `0 0 ${Number(vector[1])} ${Number(vector[2])}`,
      }).toEqual({ react: want, svg: want, flutter: want });
    }
    expect(files.get('icons/sample-outline.svg')).toContain(
      'width="24" height="25"',
    );
  });
});
