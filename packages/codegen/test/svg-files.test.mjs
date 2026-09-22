import { describe, expect, it } from 'vitest';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { parseSvg } from '../src/normalize/svg.mjs';
import { renderSvgFiles } from '../src/emit/svg-files.mjs';

const { spec } = buildIconSpec(loadIconCatalog());
const files = renderSvgFiles(spec);
const under = (dir) => [...files.keys()].filter((f) => f.startsWith(`${dir}/`));
const pathsIn = (file) =>
  [...files.get(file).matchAll(/ d="([^"]*)"/g)].map((m) => m[1]);

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

  it('sizes the file from its own viewBox, so zone outline is a pixel taller', () => {
    expect(files.get('icons/zone-outline.svg')).toContain(
      'viewBox="0 0 24 25" width="24" height="25"',
    );
    expect(files.get('icons/zone-solid.svg')).toContain(
      'viewBox="0 0 24 24" width="24" height="24"',
    );
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

  it('gives support an outline drawn like its solid', () => {
    // Figma ships two solid variants and no outline, so the fallback clone reaches the files
    // too; the icon renders in both variants rather than 404ing in one.
    expect(files.has('icons/support-outline.svg')).toBe(true);
    expect(pathsIn('icons/support-outline.svg')).toEqual(
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
