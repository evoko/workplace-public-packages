import { describe, expect, it } from 'vitest';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { parseSvg } from '../src/normalize/svg.mjs';
import { renderSvgFiles } from '../src/emit/svg-files.mjs';

const { spec } = buildIconSpec(loadIconCatalog());
const files = renderSvgFiles(spec);
const under = (dir) => [...files.keys()].filter((f) => f.startsWith(`${dir}/`));
const pathsIn = (file) =>
  [...files.get(file).matchAll(/ d="([^"]*)"/g)].map((m) => m[1]);

// Two shapes the corpus no longer holds: a variant off the 24 grid (svg/outline/zone.svg was
// 0 0 24 25) and an outline that is a clone of its solid (Icon/Support shipped no outline of its
// own). SOLAR fixed both on 2026-09-22, so the emitter's handling of them is asserted against a
// spec written here rather than against the files.
const square = {
  viewBox: [0, 0, 24, 24],
  paths: [{ d: 'M0 0H24V24H0Z', fillRule: 'nonzero' }],
};
const tall = {
  viewBox: [0, 0, 24, 25],
  paths: [{ d: 'M0 0H24V25H0Z', fillRule: 'nonzero' }],
};
const synthetic = (variants) => ({
  icons: {
    sample: {
      component: 'IconSample',
      name: 'Sample',
      category: 'Test',
      description: 'A hand-built icon.',
      variants,
    },
  },
  logos: {},
});

describe('renderSvgFiles: the files', () => {
  it('writes one file per icon variant and per vector logo', () => {
    expect(files.size).toBe(687);
    expect(under('icons')).toHaveLength(682);
    expect(under('logos')).toHaveLength(5);
    // The app icons are raster and ship as PNGs, so no logo file is written for them.
    expect(under('logos').sort()).toEqual([
      'logos/biamp-logo-dark-sm.svg',
      'logos/biamp-logo-light-sm.svg',
      'logos/os-logo-google.svg',
      'logos/os-logo-microsoft.svg',
      'logos/os-logo-teams.svg',
    ]);
  });

  it('drops the source colour from every icon and tints through currentColor', () => {
    // The same tinting contract the React modules keep, asserted at the file level: a consumer
    // that drops one of these into an <img> or a CSS mask gets colour from color.icon.*.
    const coloured = under('icons').filter((f) =>
      /#111111/i.test(files.get(f)),
    );
    expect(coloured).toEqual([]);
    const untinted = under('icons').filter((f) =>
      [...files.get(f).matchAll(/<path[^>]*>/g)].some(
        (m) => !m[0].includes('fill="currentColor"'),
      ),
    );
    expect(untinted).toEqual([]);
  });

  it('keeps a logo in its own colours', () => {
    const google = files.get('logos/os-logo-google.svg');
    for (const colour of ['#ffc107', '#ff3d00', '#4caf50', '#1976d2'])
      expect(google).toContain(`fill="${colour}"`);
    expect(google).not.toContain('currentColor');
  });

  it('sizes each file from its own viewBox, not from a constant', () => {
    // The intrinsic width/height an <img> or a CSS mask reads have to follow the variant: zone
    // outline was the asset that proved it until it was redrawn on the grid.
    const made = renderSvgFiles(synthetic({ outline: tall, solid: square }));
    expect(made.get('icons/sample-outline.svg')).toContain(
      'viewBox="0 0 24 25" width="24" height="25"',
    );
    expect(made.get('icons/sample-solid.svg')).toContain(
      'viewBox="0 0 24 24" width="24" height="24"',
    );

    // And what the real corpus says today: every icon file is square on the 24 grid.
    const offGrid = under('icons').filter(
      (f) =>
        !files.get(f).includes('viewBox="0 0 24 24" width="24" height="24"'),
    );
    expect(offGrid).toEqual([]);
  });

  it('writes fill-rule only where the source says evenodd', () => {
    const evenodd = under('icons').filter((f) =>
      files.get(f).includes('fill-rule="evenodd"'),
    );
    expect(evenodd).toHaveLength(75);
    expect(evenodd).toContain('icons/align-object-bottom-outline.svg');
    const spelled = [...files.keys()].filter((f) =>
      files.get(f).includes('fill-rule="nonzero"'),
    );
    expect(spelled).toEqual([]);
  });

  it('writes a file per variant even when both are the same drawing', () => {
    // Icon/Support reached this as a real case until 2026-09-22: Figma shipped two solid
    // variants, buildIconSpec cloned the solid into the empty outline slot, and the clone still
    // had to become a file of its own so the icon renders in both variants rather than 404ing
    // in one. Nothing here may collapse two identical geometries into one file.
    const made = renderSvgFiles(
      synthetic({ outline: structuredClone(square), solid: square }),
    );
    expect([...made.keys()]).toEqual([
      'icons/sample-outline.svg',
      'icons/sample-solid.svg',
    ]);
    expect(made.get('icons/sample-outline.svg')).toBe(
      made.get('icons/sample-solid.svg'),
    );

    // Support now draws its own outline, so on the real data the two files differ.
    expect(files.has('icons/support-outline.svg')).toBe(true);
    expect(pathsIn('icons/support-outline.svg')).not.toEqual(
      pathsIn('icons/support-solid.svg'),
    );
  });

  it('carries the Teams mark verbatim, gradients and all', () => {
    const teams = files.get('logos/os-logo-teams.svg');
    expect(teams).toBe(spec.logos['os-logo'].variants.teams.source);
    expect(teams).toContain('radialGradient');
    expect(teams).toContain('fill-opacity');
  });
});

describe('renderSvgFiles: the round trip', () => {
  // The point of serializing rather than copying: every file parses back to the geometry it was
  // built from, so the raw SVG is provably the same drawing React and Flutter get rather than
  // plausible-looking markup that happens to render.
  const geometryOf = (file) => {
    const [dir, rest] = file.replace(/\.svg$/, '').split('/');
    if (dir === 'icons') {
      const variant = rest.endsWith('-solid') ? 'solid' : 'outline';
      const stem = rest.slice(0, -(variant.length + 1));
      return spec.icons[stem].variants[variant];
    }
    const set = Object.keys(spec.logos).find((s) => rest.startsWith(`${s}-`));
    return spec.logos[set].variants[rest.slice(set.length + 1)];
  };

  // A spec icon path carries no fill key at all, while parseSvg reports currentColor as null.
  const comparable = (geometry) => ({
    viewBox: geometry.viewBox,
    paths: geometry.paths.map((p) => ({
      d: p.d,
      fillRule: p.fillRule,
      fill: p.fill ?? null,
    })),
  });

  it('re-parses every generated file to the spec geometry it came from', () => {
    const mismatched = [];
    let checked = 0;
    for (const [file, contents] of files) {
      // teams is excluded by definition: it has no IR, which is why it is copied verbatim.
      if (file === 'logos/os-logo-teams.svg') continue;
      const parsed = parseSvg(contents, { file });
      const expected = comparable(geometryOf(file));
      if (JSON.stringify(comparable(parsed)) !== JSON.stringify(expected))
        mismatched.push(file);
      checked += 1;
    }
    expect(mismatched).toEqual([]);
    expect(checked).toBe(686);
  });
});
