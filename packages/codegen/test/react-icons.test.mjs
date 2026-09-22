import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { renderReactIcons } from '../src/emit/react-icons.mjs';
import { Icon } from '../../assets/src/icon.tsx';
import { IconChevronRight } from '../../assets/src/generated/icons/chevron-right.tsx';

const { spec } = buildIconSpec(loadIconCatalog());
const { modules, barrel, icons } = renderReactIcons(spec);
const byStem = new Map(modules.map((m) => [m.stem, m]));
const exported = [...barrel.matchAll(/export \{ (\w+) \}/g)].map((m) => m[1]);

// A spec written here rather than read from docs/: svg/outline/zone.svg was drawn 0 0 24 25
// beside a square solid until SOLAR redrew it on 2026-09-22, and it was the only asset whose two
// variants had different extents. The emitter must keep carrying a viewBox per variant, or the
// next off-grid export would be drawn into the wrong box.
const offGrid = {
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
  logos: {},
};

const geometry = {
  viewBox: '0 0 24 24',
  paths: [{ d: 'M0 0H24V24H0Z' }, { d: 'M4 4H8V8H4Z', fillRule: 'evenodd' }],
};
const render = (props) =>
  renderToStaticMarkup(
    createElement(Icon, { outline: geometry, solid: geometry, ...props }),
  );

describe('renderReactIcons: modules', () => {
  it('writes one module per icon and a barrel exporting all 341', () => {
    expect(modules).toHaveLength(341);
    expect(new Set(exported).size).toBe(341);
    expect(exported).toContain('IconUSB');
    expect(exported).toContain('IconPhoneAudioDsp');
  });

  it('drops the source colour from every module', () => {
    // The contract that makes currentColor safe: the corpus is drawn in #111111, and none of it
    // survives into the output, so nothing can ship a colour the theme cannot tint.
    const coloured = modules.filter((m) => /#111111/i.test(m.tsx));
    expect(coloured.map((m) => m.stem)).toEqual([]);
  });

  it('carries a viewBox per variant, not one per module', () => {
    // svg/outline/zone.svg was 0 0 24 25 while its solid was square, and it was the asset that
    // proved the two slots are emitted independently; SOLAR redrew it on the grid on
    // 2026-09-22, so the mixed case is built here instead.
    const [module] = renderReactIcons(offGrid).modules;
    expect(module.tsx).toContain(
      "const outline: IconGeometry = {\n  viewBox: '0 0 24 25'",
    );
    expect(module.tsx).toContain(
      "const solid: IconGeometry = {\n  viewBox: '0 0 24 24'",
    );

    // What the corpus says today: every module declares two square viewBoxes and nothing else.
    const odd = modules.filter(
      (m) =>
        [...m.tsx.matchAll(/viewBox: '([^']*)'/g)]
          .map((v) => v[1])
          .join('|') !== '0 0 24 24|0 0 24 24',
    );
    expect(odd.map((m) => m.stem)).toEqual([]);
  });

  it('emits fillRule only where the source says evenodd', () => {
    expect(byStem.get('align-object-bottom').tsx).toContain(
      "fillRule: 'evenodd'",
    );
    expect(byStem.get('chevron-right').tsx).not.toContain('fillRule');
  });

  it('hard codes no size anywhere', () => {
    // A module is geometry and a name. Every rendered length comes from the shell, which maps a
    // SOLAR step to var(--solar-icon-*), so a px literal here would be a size that no token
    // change can reach.
    const sized = modules.filter((m) =>
      /\bpx\b|width=|height=|font-size/.test(m.tsx),
    );
    expect(sized.map((m) => m.stem)).toEqual([]);
  });
});

describe('renderReactIcons: manifest', () => {
  it('fingerprints both variants of all 341 icons', () => {
    const entries = Object.values(icons);
    expect(entries).toHaveLength(341);
    expect(entries.flatMap((i) => Object.values(i.variants))).toHaveLength(682);
  });

  it('gives different geometry different digests', () => {
    const chevron = icons['chevron-right'].variants;
    expect(chevron.outline.digest).not.toBe(chevron.solid.digest);
    expect(chevron.outline.digest).not.toBe(
      icons['chevron-left'].variants.outline.digest,
    );
    expect(chevron.outline.digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('records the geometry the module draws', () => {
    // The manifest reports the variant's own extent, which zone outline used to be the one
    // asset to distinguish from a hard-coded 24 (fixed in Figma on 2026-09-22).
    const synthetic = renderReactIcons(offGrid).icons.sample.variants;
    expect(synthetic.outline).toMatchObject({ viewBox: '0 0 24 25' });
    expect(synthetic.solid).toMatchObject({ viewBox: '0 0 24 24' });

    const wrong = [];
    for (const [stem, entry] of Object.entries(icons))
      for (const [variant, recorded] of Object.entries(entry.variants)) {
        const geometry = spec.icons[stem].variants[variant];
        if (
          recorded.viewBox !== '0 0 24 24' ||
          recorded.pathCount !== geometry.paths.length
        )
          wrong.push(
            `${stem}/${variant}: ${recorded.viewBox}, ${recorded.pathCount} paths`,
          );
      }
    expect(wrong).toEqual([]);
  });
});

describe('the Icon shell', () => {
  it('tints every path through currentColor', () => {
    const paths = render({}).match(/<path[^>]*>/g);
    expect(paths).toHaveLength(2);
    expect(paths.every((p) => p.includes('fill="currentColor"'))).toBe(true);
    expect(paths[1]).toContain('fill-rule="evenodd"');
    expect(paths[0]).not.toContain('fill-rule');
  });

  it('resolves a SOLAR step to its token, and anything else verbatim', () => {
    expect(render({})).toContain('width="var(--solar-icon-lg)"');
    expect(render({ size: '2xl' })).toContain('width="var(--solar-icon-2xl)"');
    expect(render({ size: 40 })).toContain('width="40"');
    expect(render({ size: '1em' })).toContain('width="1em"');
  });

  it('names itself to assistive technology when given a title', () => {
    const markup = render({ title: 'Next page' });
    const id = /<title id="([^"]+)">/.exec(markup)[1];
    expect(markup).toContain(`aria-labelledby="${id}"`);
    expect(markup).toContain('role="img"');
    expect(markup).toContain('<title id="' + id + '">Next page</title>');
    expect(markup).not.toContain('aria-hidden');
  });

  it('hides itself when it has no title', () => {
    const markup = render({});
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('focusable="false"');
    expect(markup).not.toContain('<title');
    expect(markup).not.toContain('role=');
  });

  it('draws the variant asked for', () => {
    const solid = renderToStaticMarkup(
      createElement(IconChevronRight, { variant: 'solid' }),
    );
    expect(solid).toContain('d="M16 12L10 18V6L16 12Z"');
    expect(renderToStaticMarkup(createElement(IconChevronRight))).toContain(
      'd="M13.1717 12.0007',
    );
  });
});
