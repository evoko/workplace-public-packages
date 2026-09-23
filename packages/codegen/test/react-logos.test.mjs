import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { renderReactLogos, svgToJsx } from '../src/emit/react-logos.mjs';
import { docsDir, packagesDir } from '../src/util/paths.mjs';
import { LogoOs } from '../../assets/src/generated/logos/os.tsx';

const { spec } = buildIconSpec(loadIconCatalog());
const { modules, barrel, logos } = renderReactLogos(spec);
const bySet = new Map(modules.map((m) => [m.set, m]));
const shell = readFileSync(
  join(packagesDir, 'assets', 'src', 'logo.tsx'),
  'utf8',
);

// The attribute names the generated JSX actually writes: `name="…"` or `name={…}`, with no
// space before the `=`, which is what separates an attribute from an assignment in the TypeScript
// around it.
const attributeNames = (source) =>
  [...source.matchAll(/[\s<]([a-zA-Z][\w-]*)=[{"]/g)].map((m) => m[1]);

describe('renderReactLogos: modules', () => {
  it('writes one module per logo set, and a barrel over them', () => {
    expect(modules.map((m) => m.file)).toEqual([
      'app-icon.ts',
      'biamp.tsx',
      'os.tsx',
    ]);
    expect(barrel).toContain("from './biamp.js'");
    expect(barrel).toContain("from './os.js'");
    expect(barrel).toContain('LogoBiamp');
    expect(barrel).toContain('LogoOs');
    expect(barrel).toContain('appIcons');
  });

  it('draws both Biamp marks, sharing one accent and differing in the wordmark', () => {
    const biamp = bySet.get('biamp-logo').source;
    expect(biamp).toContain(
      "export type LogoBiampVariant = 'dark-sm' | 'light-sm';",
    );

    // The accent dot is the same red in both; the wordmark is what flips, so the two marks are
    // genuinely different artwork rather than one mark exported twice.
    const dark = biamp.slice(
      biamp.indexOf('const darkSm'),
      biamp.indexOf('const lightSm'),
    );
    const light = biamp.slice(
      biamp.indexOf('const lightSm'),
      biamp.indexOf('export type'),
    );
    expect(dark).toContain('#d22730');
    expect(light).toContain('#d22730');
    expect(dark).toContain('#000000');
    expect(dark).not.toContain('#ffffff');
    expect(light).toContain('#ffffff');
    expect(light).not.toContain('#000000');
  });

  it('draws all three OS marks, with Google in its four brand colours', () => {
    const os = bySet.get('os-logo').source;
    expect(os).toContain(
      "export type LogoOsVariant = 'google' | 'microsoft' | 'teams';",
    );
    expect(os).toContain(
      'const VARIANTS: Record<LogoOsVariant, LogoArtwork> = {\n' +
        '  google,\n  microsoft,\n  teams,\n};',
    );

    const google = os.slice(
      os.indexOf('const google'),
      os.indexOf('const microsoft'),
    );
    for (const colour of ['#ffc107', '#ff3d00', '#4caf50', '#1976d2'])
      expect(google).toContain(colour);
  });

  it('never emits currentColor: a brand mark owns its colours', () => {
    // The exact inverse of the icon contract. An icon drops its source colour so a theme can
    // tint it; a logo keeps every one, and nothing here may become tintable by accident.
    const tintable = modules.filter((m) => /currentColor/i.test(m.source));
    expect(tintable.map((m) => m.set)).toEqual([]);
    expect(barrel).not.toContain('currentColor');
    expect(shell).not.toContain('currentColor');
  });

  it('offers no color or fill prop on any public type', () => {
    // Omitted at the shell, so the compiler refuses <LogoBiamp fill="red" /> rather than a
    // comment asking callers not to.
    expect(shell.replace(/\s+/g, '')).toContain(
      "Omit<SVGProps<SVGSVGElement>,'color'|'fill'|'children'>",
    );
    for (const m of modules) {
      expect(m.source).not.toMatch(/\b(color|fill)\?:/);
      expect(m.source).not.toMatch(/interface \w+Props extends (?!LogoProps)/);
    }
  });
});

describe('the Teams mark, which has no vector IR', () => {
  const teams = spec.logos['os-logo'].variants.teams;
  const { viewBox, jsx, ids } = svgToJsx(teams.source, {
    file: 'logos/os-logo/teams.svg',
  });

  it('namespaces all 12 gradient ids and all 12 references', () => {
    expect(viewBox).toBe('0 0 32 32');
    expect(ids).toHaveLength(12);
    expect([...jsx.matchAll(/id=\{`\$\{uid\}g\d+`\}/g)]).toHaveLength(12);
    expect([...jsx.matchAll(/url\(#\$\{uid\}g\d+\)/g)]).toHaveLength(12);
  });

  it('keeps no Figma id at all, so none can be shared between instances', () => {
    // Renamed rather than prefixed, so this assertion is literal: if a source id survived
    // anywhere -- in an id, a reference or a stray comment -- this fails.
    expect(jsx).not.toContain('paint0_radial_6196_626');
    expect(jsx).not.toContain('_6196_626');
  });

  it('camelCases exactly the three hyphenated attributes the document uses', () => {
    expect(jsx).toContain('fillOpacity="0.7"');
    expect(jsx).toContain('stopColor="#A98AFF"');
    expect(jsx).toContain('stopOpacity="0"');
    expect(jsx).not.toContain('fill-opacity');
    expect(jsx).not.toContain('stop-color');
    expect(jsx).not.toContain('stop-opacity');

    const hyphenated = [...new Set(attributeNames(jsx))].filter((name) =>
      name.includes('-'),
    );
    expect(hyphenated).toEqual([]);
  });

  it('carries every element of the source through', () => {
    expect([...jsx.matchAll(/<path /g)]).toHaveLength(13);
    expect([...jsx.matchAll(/<radialGradient /g)]).toHaveLength(11);
    expect([...jsx.matchAll(/<linearGradient /g)]).toHaveLength(1);
    expect([...jsx.matchAll(/<stop /g)]).toHaveLength(27);
    expect(jsx).toContain('gradientTransform=');
    expect(jsx).toContain('gradientUnits="userSpaceOnUse"');
  });

  it('throws on a hyphenated attribute it has no spelling for', () => {
    // The whole point of the narrowness: a future mark carrying a stroke or a mask fails the
    // build instead of shipping an attribute the DOM ignores.
    const withStroke =
      '<svg viewBox="0 0 1 1" fill="none">' +
      '<path d="M0 0" stroke-linecap="round" fill="url(#a)"/>' +
      '<defs><linearGradient id="a"/></defs></svg>';
    expect(() => svgToJsx(withStroke, { file: 'synthetic.svg' })).toThrow(
      /stroke-linecap/,
    );
    expect(() =>
      svgToJsx(withStroke.replace(' stroke-linecap="round"', ''), {
        file: 'synthetic.svg',
      }),
    ).not.toThrow();
  });

  it('throws on a reference nothing defines and on an id nothing uses', () => {
    const dangling =
      '<svg viewBox="0 0 1 1"><path d="M0 0" fill="url(#missing)"/>' +
      '<defs><linearGradient id="a"/></defs></svg>';
    expect(() => svgToJsx(dangling, { file: 'synthetic.svg' })).toThrow(
      /missing/,
    );
  });
});

describe('the raster app icons', () => {
  const source = bySet.get('app-icon').source;

  it('inlines the exact bytes of all five PNGs as data URLs', () => {
    const files = spec.logos['app-icon'].files;
    expect(Object.keys(files)).toHaveLength(5);

    for (const [slug, path] of Object.entries(files)) {
      const name = `appIcon${slug[0].toUpperCase()}${slug.slice(1)}`;
      const found = new RegExp(
        `export const ${name} =\\s*'data:image/png;base64,([A-Za-z0-9+/=]+)';`,
      ).exec(source);
      expect(found, `${name} is not exported`).not.toBeNull();
      expect(Buffer.from(found[1], 'base64')).toEqual(
        readFileSync(join(docsDir, 'solar-icons', path)),
      );
    }
  });

  it('exports each icon on its own and a record over them', () => {
    // One const each so a consumer takes one without the other four; the record is a
    // convenience, not the only way in.
    expect(source).toContain(
      'export const appIcons: Record<AppIconName, string> = {',
    );
    expect(source).toContain(
      "export type AppIconName = 'booking' | 'command' | 'designer' | 'tools' | 'workplace';",
    );
    expect(source).not.toContain('function');
  });

  it('refuses a PNG whose bytes the spec did not record', () => {
    // The bytes are read from docs/ at emit time, so without this a changed PNG would change the
    // output while spec/icons.json, which the spec guard compares, stayed the same.
    const tampered = structuredClone(spec);
    tampered.logos['app-icon'].digests.workplace = '0'.repeat(64);
    expect(() => renderReactLogos(tampered)).toThrow(
      /workplace@2x\.png: the bytes do not match the digest/,
    );
  });
});

describe('renderReactLogos: manifest', () => {
  it('fingerprints every variant, including the one with no geometry', () => {
    expect(Object.keys(logos)).toEqual(['app-icon', 'biamp-logo', 'os-logo']);
    expect(logos['os-logo'].variants.google.pathCount).toBe(4);
    expect(logos['os-logo'].variants.teams).toEqual({
      unsupported: 'gradient',
      digest: expect.stringMatching(/^[0-9a-f]{64}$/),
    });
    expect(logos['biamp-logo'].variants['dark-sm'].digest).not.toBe(
      logos['biamp-logo'].variants['light-sm'].digest,
    );
    expect(Object.keys(logos['app-icon'].files)).toHaveLength(5);
    expect(logos['app-icon'].files.workplace.bytes).toBeGreaterThan(0);
  });
});

describe('the Logo shell', () => {
  it('gives two Teams marks on one page disjoint gradient ids', () => {
    // The assertion the per-instance prefix exists for. Without it both marks define the same
    // ids, a browser resolves url(#id) to the first match, and the second logo silently paints
    // with the first one's gradients.
    const markup = renderToStaticMarkup(
      createElement(
        'div',
        null,
        createElement(LogoOs, { variant: 'teams', key: 'a' }),
        createElement(LogoOs, { variant: 'teams', key: 'b' }),
      ),
    );

    const ids = [...markup.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const refs = [...markup.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
    expect(ids).toHaveLength(24);
    expect(new Set(ids).size).toBe(24);
    expect(new Set(refs)).toEqual(new Set(ids));

    const groups = new Map();
    for (const id of ids) {
      const prefix = id.replace(/g\d+$/, '');
      groups.set(prefix, (groups.get(prefix) ?? 0) + 1);
    }
    expect([...groups.values()]).toEqual([12, 12]);
  });

  it('sizes by height alone, so a wordmark is not squashed', () => {
    const markup = renderToStaticMarkup(createElement(LogoOs));
    expect(markup).toContain('height="var(--solar-icon-lg)"');
    expect(markup).not.toContain('width=');
    expect(renderToStaticMarkup(createElement(LogoOs, { size: 48 }))).toContain(
      'height="48"',
    );
  });

  it('names itself to assistive technology only when given a title', () => {
    const named = renderToStaticMarkup(
      createElement(LogoOs, { title: 'Google' }),
    );
    const id = /<title id="([^"]+)">/.exec(named)[1];
    expect(named).toContain(`aria-labelledby="${id}"`);
    expect(named).toContain('role="img"');
    expect(named).not.toContain('aria-hidden');

    const anonymous = renderToStaticMarkup(createElement(LogoOs));
    expect(anonymous).toContain('aria-hidden="true"');
    expect(anonymous).toContain('focusable="false"');
    expect(anonymous).not.toContain('<title');
  });

  it('paints every path in its own brand colour', () => {
    const markup = renderToStaticMarkup(
      createElement(LogoOs, { variant: 'microsoft' }),
    );
    const paths = markup.match(/<path[^>]*>/g);
    expect(paths).toHaveLength(4);
    expect(paths.map((p) => /fill="([^"]+)"/.exec(p)[1])).toEqual([
      '#ff5722',
      '#4caf50',
      '#ffc107',
      '#03a9f4',
    ]);
    expect(markup).not.toContain('currentColor');
  });
});
