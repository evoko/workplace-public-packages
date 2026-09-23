import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { docsDir } from '../src/util/paths.mjs';
import {
  SUPPORTED_COMMANDS,
  checkPathData,
  parseSvg,
} from '../src/normalize/svg.mjs';

const iconsDir = join(docsDir, 'solar-icons');

const read = (rel) => ({
  source: readFileSync(join(iconsDir, rel), 'utf8'),
  file: rel,
});
const parse = (rel) => {
  const { source, file } = read(rel);
  return parseSvg(source, { file });
};

// A minimal well-formed document the rejection cases mutate one attribute at a time, so each
// test fails for exactly the reason it names.
const svg = (body, root = 'viewBox="0 0 24 24" fill="none"') =>
  `<svg width="24" height="24" ${root} xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>`;
const path = (attrs) => `<path d="M0 0H24V24H0Z" ${attrs}/>`;

describe('parseSvg', () => {
  it('reads a single-path icon', () => {
    expect(parse('svg/outline/chevron-right.svg')).toEqual({
      viewBox: [0, 0, 24, 24],
      paths: [
        {
          d: expect.stringMatching(/^M13\.1717 12\.0007/),
          fillRule: 'nonzero',
          fill: '#111111',
        },
      ],
    });
  });

  it('keeps an evenodd fill rule and drops the redundant clip-rule', () => {
    const evenodd = parse('svg/outline/zone.svg').paths.filter(
      (p) => p.fillRule === 'evenodd',
    );
    expect(evenodd).toHaveLength(1);
    expect(Object.keys(evenodd[0])).toEqual(['d', 'fillRule', 'fill']);
  });

  it('reads a multi-path logo with one colour per path', () => {
    const { paths } = parse('logos/os-logo/google.svg');
    expect(paths).toHaveLength(4);
    expect(paths.map((p) => p.fill)).toEqual([
      '#ffc107',
      '#ff3d00',
      '#4caf50',
      '#1976d2',
    ]);
  });

  it('resolves the named colours the logos use', () => {
    expect(
      parse('logos/biamp-logo/light-sm.svg').paths.map((p) => p.fill),
    ).toEqual([
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#d22730',
    ]);
    expect(parse('logos/biamp-logo/dark-sm.svg').paths[0].fill).toBe('#000000');
  });

  it('keeps a viewBox that is not 0 0 24 24', () => {
    // svg/outline/zone.svg was the real example -- its outline was drawn 0 0 24 25 -- until
    // SOLAR redrew it on the 24 grid on 2026-09-22. No icon is off grid today, so the off-grid
    // case is made here rather than read from the corpus: the parser must never assume 24, or a
    // future off-grid export would be cropped and the drawing would shift.
    expect(
      parseSvg(svg(path('fill="#111111"'), 'viewBox="0 0 24 25" fill="none"'), {
        file: 'x.svg',
      }).viewBox,
    ).toEqual([0, 0, 24, 25]);
    expect(parse('logos/biamp-logo/light-sm.svg').viewBox).toEqual([
      0, 0, 36, 12,
    ]);
  });

  it('passes scientific-notation path data through verbatim', () => {
    const { source, file } = read('svg/outline/meeting-room.svg');
    const { paths } = parseSvg(source, { file });
    const scientific = paths.filter((p) => p.d.includes('e-'));
    expect(scientific.length).toBeGreaterThan(0);
    for (const p of paths) expect(source).toContain(`d="${p.d}"`);
  });

  it('expands #rgb shorthand and lowercases hex', () => {
    expect(
      parseSvg(svg(path('fill="#ABC"')), { file: 'x.svg' }).paths[0].fill,
    ).toBe('#aabbcc');
    expect(
      parseSvg(svg(path('fill="#AABBCC"')), { file: 'x.svg' }).paths[0].fill,
    ).toBe('#aabbcc');
  });

  it('treats currentColor and an absent fill as inherited', () => {
    expect(
      parseSvg(svg(path('fill="currentColor"')), { file: 'x.svg' }).paths[0]
        .fill,
    ).toBeNull();
    expect(
      parseSvg(svg('<path d="M0 0H24V24H0Z"/>'), { file: 'x.svg' }).paths[0]
        .fill,
    ).toBeNull();
  });

  it('never inherits the root fill="none" into a path', () => {
    expect(
      parseSvg(svg(path('fill="#111111"')), { file: 'x.svg' }).paths[0].fill,
    ).toBe('#111111');
  });
});

describe('parseSvg rejections', () => {
  const rejects = (source, pattern) =>
    expect(() => parseSvg(source, { file: 'bad.svg' })).toThrow(pattern);

  it('rejects an arc command', () => {
    rejects(
      svg('<path d="M0 0A5 5 0 0 1 10 10Z" fill="#111111"/>'),
      /bad\.svg: unsupported path command "A" in path data; only M L C H V Z are supported/,
    );
  });

  it('rejects a relative command', () => {
    rejects(
      svg('<path d="M0 0c1 1 2 2 3 3Z" fill="#111111"/>'),
      /bad\.svg: relative path command "c"/,
    );
  });

  it('rejects an element it cannot represent', () => {
    rejects(
      svg(`<g>${path('fill="#111111"')}</g>`),
      /bad\.svg: unsupported element <g>; only <svg> and <path> can be represented/,
    );
    rejects(
      svg(
        `${path('fill="#111111"')}<defs><linearGradient id="a"><stop/></linearGradient></defs>`,
      ),
      /bad\.svg: unsupported element <defs>/,
    );
  });

  it('rejects a stroke', () => {
    rejects(
      svg(path('fill="#111111" stroke="#000000"')),
      /bad\.svg: path carries stroke="#000000"; the IR fills paths, it never strokes them/,
    );
    rejects(
      svg(path('fill="#111111" stroke-width="2"')),
      /bad\.svg: path carries stroke-width="2"/,
    );
  });

  it('rejects a gradient fill', () => {
    rejects(
      svg(path('fill="url(#paint0_radial)"')),
      /bad\.svg: path is filled by a reference \(url\(#paint0_radial\)\); gradients and patterns cannot be represented/,
    );
  });

  it('rejects fill-opacity', () => {
    rejects(
      svg(path('fill="#111111" fill-opacity="0.5"')),
      /bad\.svg: path carries fill-opacity="0\.5"; the IR has no opacity channel/,
    );
  });

  it('rejects a missing or malformed viewBox', () => {
    rejects(
      `<svg width="24" height="24" fill="none">${path('fill="#111111"')}</svg>`,
      /bad\.svg: <svg> has no viewBox/,
    );
    rejects(
      svg(path('fill="#111111"'), 'viewBox="0 0 24"'),
      /bad\.svg: malformed viewBox "0 0 24"; expected four numbers/,
    );
    rejects(
      svg(path('fill="#111111"'), 'viewBox="0 0 24 0"'),
      /bad\.svg: malformed viewBox "0 0 24 0"; width and height must be positive/,
    );
  });

  it('rejects an unknown colour keyword', () => {
    rejects(
      svg(path('fill="rebeccapurple"')),
      /bad\.svg: unsupported fill "rebeccapurple"; expected #rgb, #rrggbb, currentColor, or a known colour keyword/,
    );
    rejects(svg(path('fill="none"')), /bad\.svg: path has fill="none"/);
  });

  it('rejects an unsupported fill-rule and an empty document', () => {
    rejects(
      svg(path('fill="#111111" fill-rule="inherit"')),
      /bad\.svg: unsupported fill-rule "inherit"/,
    );
    rejects(svg(''), /bad\.svg: no <path> elements/);
  });
});

describe('checkPathData', () => {
  it('exposes exactly the absolute commands the IR can replay', () => {
    expect([...SUPPORTED_COMMANDS].sort()).toEqual([
      'C',
      'H',
      'L',
      'M',
      'V',
      'Z',
    ]);
  });

  it('accepts exponents, signs and leading-dot numbers', () => {
    expect(() =>
      checkPathData('M1e-05 .5L-1.5 2C1 1 2 2 3 3H4V5Z', { file: 'x.svg' }),
    ).not.toThrow();
  });

  it('rejects data that does not start with a moveto', () => {
    expect(() => checkPathData('L1 1', { file: 'x.svg' })).toThrow(
      /path data starts with "L", not a moveto/,
    );
    expect(() => checkPathData('1 1', { file: 'x.svg' })).toThrow(
      /path data starts with "1", not a moveto/,
    );
  });

  it('rejects a command given too few arguments', () => {
    // The gap this closes: a command-letter-only scan waves these through, and the geometry is
    // then wrong rather than absent, which is the one failure mode no later test would catch.
    expect(() => checkPathData('M5', { file: 'x.svg' })).toThrow(
      /"M" takes 2 arguments but was given 1/,
    );
    expect(() => checkPathData('M0 0C1 2 3', { file: 'x.svg' })).toThrow(
      /"C" takes 6 arguments but was given 3/,
    );
    expect(() => checkPathData('M0 0L1 1Z 5', { file: 'x.svg' })).toThrow(
      /"Z" takes 0 arguments but was given 1/,
    );
  });

  it('accepts a command that legally repeats its arguments', () => {
    // H takes one number, so `H1 2` is two horizontal linetos, and `M` followed by four numbers
    // is a moveto plus an implicit lineto. Neither occurs in the corpus today, but both are
    // valid SVG and rejecting them would fail on a future Figma export that is not wrong.
    expect(() => checkPathData('M0 0H1 2', { file: 'x.svg' })).not.toThrow();
    expect(() => checkPathData('M0 0 5 5', { file: 'x.svg' })).not.toThrow();
    expect(() =>
      checkPathData('M0 0C1 2 3 4 5 6 7 8 9 10 11 12', { file: 'x.svg' }),
    ).not.toThrow();
  });

  it('rejects an unreadable character', () => {
    expect(() => checkPathData('M0 0 #', { file: 'x.svg' })).toThrow(
      /unreadable character "#" in path data at offset 5/,
    );
  });
});

// The corpus test is the one that proves the parser matches the files rather than the
// description of them: every count below is measured from docs/solar-icons/.
describe('the whole icon corpus', () => {
  const files = [
    ...readdirSync(join(iconsDir, 'svg'), {
      recursive: true,
      withFileTypes: true,
    }),
    ...readdirSync(join(iconsDir, 'logos'), {
      recursive: true,
      withFileTypes: true,
    }),
  ]
    .filter((e) => e.isFile() && e.name.endsWith('.svg'))
    .map((e) => relative(iconsDir, join(e.parentPath, e.name)))
    .sort();

  const parsed = new Map();
  const failed = new Map();
  let rawPaths = 0;
  for (const file of files) {
    const source = readFileSync(join(iconsDir, file), 'utf8');
    rawPaths += source.match(/<path\b/g).length;
    try {
      parsed.set(file, parseSvg(source, { file }));
    } catch (error) {
      failed.set(file, error.message);
    }
  }

  it('holds 685 SVG files carrying 823 <path> elements', () => {
    expect(files).toHaveLength(685);
    expect(rawPaths).toBe(823);
  });

  it('parses every file except teams.svg', () => {
    expect([...failed.keys()]).toEqual(['logos/os-logo/teams.svg']);
    expect(failed.get('logos/os-logo/teams.svg')).toMatch(
      /path is filled by a reference \(url\(#paint0_radial_6196_626\)\)/,
    );
    expect(parsed.size).toBe(684);
  });

  it('yields 810 paths, 75 of them evenodd', () => {
    const paths = [...parsed.values()].flatMap((icon) => icon.paths);
    // 823 in the files minus the 13 in teams.svg, which is the one file the IR cannot hold.
    expect(paths).toHaveLength(810);
    expect(paths.filter((p) => p.fillRule === 'evenodd')).toHaveLength(75);
  });

  it('draws every icon on the 24 grid', () => {
    // True of the corpus as it stands on 2026-09-22, not of the parser: svg/outline/zone.svg was
    // 0 0 24 25 until SOLAR redrew it. The parser keeps whatever a file declares -- asserted
    // synthetically above -- and this is the assertion that would notice a new off-grid export.
    const offGrid = [...parsed]
      .filter(([file]) => file.startsWith('svg/'))
      .filter(([, icon]) => icon.viewBox.join(' ') !== '0 0 24 24')
      .map(([file]) => file);
    expect(offGrid).toEqual([]);
    expect([...parsed.keys()].filter((f) => f.startsWith('svg/'))).toHaveLength(
      680,
    );
  });

  it('gives every path a valid fill and every file a viewBox with a positive extent', () => {
    for (const [file, icon] of parsed) {
      expect(icon.viewBox, file).toHaveLength(4);
      expect(icon.viewBox[2] > 0 && icon.viewBox[3] > 0, file).toBe(true);
      for (const p of icon.paths)
        expect(p.fill === null || /^#[0-9a-f]{6}$/.test(p.fill), file).toBe(
          true,
        );
    }
  });
});
