import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { tokensCss, tokenValues } from '../src/approvals/fingerprint.mjs';
import {
  flutterClosures,
  nodesOf,
  rel,
  usesOf,
  webClosures,
} from '../src/approvals/graph.mjs';
import {
  check,
  circlesFor,
  colour,
  pasteFor,
  readApprovals,
  render,
  scan,
} from '../src/approvals/status.mjs';
import { flutterComponents } from '../src/shells/index.mjs';
import { repoRoot } from '../src/util/paths.mjs';
import { byCodeUnit } from '../src/util/sort.mjs';

const read = (path) => readFileSync(join(repoRoot, path), 'utf8');

describe('the graph', () => {
  let web;
  let flutter;
  beforeAll(async () => {
    const webNodes = nodesOf('web');
    const flutterNodes = nodesOf('flutter');
    const webFiles = await webClosures(webNodes);
    const flutterFiles = flutterClosures(flutterNodes);
    web = {
      nodes: webNodes,
      files: webFiles,
      uses: usesOf(webNodes, webFiles),
    };
    flutter = {
      nodes: flutterNodes,
      files: flutterFiles,
      uses: usesOf(flutterNodes, flutterFiles),
    };
  }, 120_000);

  it('has exactly the components the barrels export, and the chart wrappers', () => {
    const barrel = (path, re) =>
      [...read(path).matchAll(re)].map(([, f]) => f).sort();
    const webShells = barrel(
      'packages/components/src/components.generated.ts',
      /export \* from '\.\/([A-Za-z0-9]+)\.js'/g,
    );
    const webEntries = web.nodes
      .map((n) => rel(n.entry).split('/').pop().replace('.tsx', ''))
      .sort();
    expect(webEntries).toEqual(
      [...webShells, 'BarChart', 'DonutChart', 'LineChart'].sort(),
    );
    const flutterShells = barrel(
      'packages/solar_flutter/lib/src/components/components.dart',
      /export '(solar_[a-z0-9_]+\.dart)'/g,
    );
    const flutterEntries = flutter.nodes
      .map((n) => rel(n.entry))
      .filter((p) => p.includes('/components/'))
      .map((p) => p.split('/').pop())
      .sort();
    expect(flutterEntries).toEqual(flutterShells);
    for (const g of [web, flutter]) {
      const names = g.nodes.map((n) => n.name);
      expect(names).toEqual(
        expect.arrayContaining(['Bar Chart', 'Line Chart', 'Donut Chart']),
      );
      expect(names).not.toContain('Chart Axis');
      expect(names).not.toContain('Autocomplete Open');
    }
  });

  it('knows what each component uses, on each platform', () => {
    expect(web.uses.get('Button')).toEqual(['Spinner']);
    expect(flutter.uses.get('Button')).toEqual(['Spinner']);
    expect(web.uses.get('Dialog')).toContain('Icon Button');
    expect(flutter.uses.get('Dialog')).toEqual(
      expect.arrayContaining(['Icon Button', 'Scrim']),
    );
    // The three Flutter charts share one file, and do not use one another for it.
    expect(flutter.uses.get('Bar Chart')).not.toContain('Line Chart');
  });

  it("ships a component's own recipe, not the barrel's every recipe, and no test or story", () => {
    const button = web.files.get('Button');
    expect(button).toContain('packages/components/src/Button.tsx');
    expect(button).toContain(
      'packages/styles/src/generated/mui/components/button.ts',
    );
    expect(button).not.toContain(
      'packages/styles/src/generated/mui/components/tag.ts',
    );
    for (const g of [web, flutter])
      for (const files of g.files.values())
        for (const f of files)
          expect(f).not.toMatch(/\/(test|stories|variants|widgetbook)\//);
    expect(flutter.files.get('Button')).toContain(
      'packages/solar_flutter/lib/src/generated/components/button.dart',
    );
  });

  it('follows no Dart import a block comment holds', () => {
    const entry = join(flutterComponents, 'solar_button.dart');
    const closures = flutterClosures([{ name: 'Button', entry }], (p) =>
      p === entry
        ? "/*\nimport 'solar_spinner.dart';\n*/\nclass SolarButton {}\n"
        : read(rel(p)),
    );
    expect(closures.get('Button')).toEqual([rel(entry)]);
  });

  it('refuses a workspace import WORKSPACE_SOURCES does not map', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'solar-status-'));
    try {
      const entry = join(dir, 'Probe.tsx');
      writeFileSync(
        entry,
        "import { x } from '@bwp-web/canvas';\nexport const Probe = () => x;\n",
      );
      await expect(webClosures([{ name: 'Probe', entry }])).rejects.toThrow(
        /imports @bwp-web\/canvas, which WORKSPACE_SOURCES does not map/,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ships, with every web component, the MUI theme SolarProvider installs', () => {
    for (const files of web.files.values()) {
      expect(files).toContain('packages/components/src/SolarProvider.tsx');
      expect(files).toContain('packages/styles/src/generated/mui/theme.ts');
      expect(files).toEqual([...new Set(files)].sort(byCodeUnit));
    }
    expect(web.nodes.map((n) => n.name)).not.toContain('Solar Provider');
    expect(web.nodes.map((n) => n.name)).not.toContain('SolarProvider');
  });
});

describe('the viewers', () => {
  it.each(['web', 'flutter'])(
    'give %s a circle for every component on it',
    async (platform) => {
      const circles = await circlesFor(platform);
      expect(Object.keys(circles).sort()).toEqual(
        nodesOf(platform)
          .map((n) => n.name)
          .sort(),
      );
      for (const circle of Object.values(circles))
        expect(['🟢', '🟡', '🔴']).toContain(circle);
    },
    120_000,
  );
});

const scanOf = (list) => ({
  web: list.map(([name, uses, fingerprint]) => ({
    name,
    uses,
    files: [],
    fingerprint,
  })),
});
const base = scanOf([
  ['Spinner', [], 'sha256:s'],
  ['Button', ['Spinner'], 'sha256:b'],
  ['Dialog', ['Button', 'Spinner'], 'sha256:d'],
]);
const colours = (coloured) =>
  Object.fromEntries(coloured.web.map((c) => [c.name, c.colour]));
const approved = (fingerprints) =>
  Object.fromEntries(
    Object.entries(fingerprints).map(([n, f]) => [
      n,
      { web: { fingerprint: f, by: 'Joon', on: '2026-09-27' } },
    ]),
  );

describe('colours', () => {
  it('is yellow using nothing unapproved, red using something unapproved', () => {
    expect(colours(colour(base, {}))).toEqual({
      Spinner: 'yellow',
      Button: 'red',
      Dialog: 'red',
    });
  });

  it('is green approved with only green children', () => {
    const a = approved({ Spinner: 'sha256:s', Button: 'sha256:b' });
    expect(colours(colour(base, a))).toEqual({
      Spinner: 'green',
      Button: 'green',
      Dialog: 'yellow',
    });
  });

  it('cancels a child and every parent above it when the child changes; a revert restores them', () => {
    const a = approved({
      Spinner: 'sha256:s',
      Button: 'sha256:b',
      Dialog: 'sha256:d',
    });
    // A child's change changes every parent's fingerprint too (the fingerprint tests prove it).
    const changed = scanOf([
      ['Spinner', [], 'sha256:s2'],
      ['Button', ['Spinner'], 'sha256:b2'],
      ['Dialog', ['Button', 'Spinner'], 'sha256:d2'],
    ]);
    expect(colours(colour(changed, a))).toEqual({
      Spinner: 'yellow',
      Button: 'red',
      Dialog: 'red',
    });
    expect(check(colour(changed, a), a)).toHaveLength(3);
    expect(colours(colour(base, a))).toEqual({
      Spinner: 'green',
      Button: 'green',
      Dialog: 'green',
    });
    expect(check(colour(base, a), a)).toEqual([]);
  });
});

describe('the check', () => {
  it('names an approval that no longer matches', () => {
    const a = approved({ Spinner: 'sha256:old' });
    const [problem] = check(colour(base, a), a);
    expect(problem).toContain('Spinner (web)');
    expect(problem).toContain('sha256:s');
  });

  it('names an approval recorded before its children were approved', () => {
    const a = approved({ Button: 'sha256:b' });
    const [problem] = check(colour(base, a), a);
    expect(problem).toContain('Button (web)');
    expect(problem).toContain('Spinner');
  });

  it('names a component or a platform that has no shell', () => {
    expect(
      check(colour(base, {}), approved({ Nope: 'sha256:x' }))[0],
    ).toContain('Nope');
    const ios = { Button: { ios: { fingerprint: 'sha256:b' } } };
    expect(check(colour(base, {}), ios)[0]).toContain('ios');
  });

  it('names a cycle', () => {
    const cyclic = scanOf([
      ['A', ['B'], 'sha256:a'],
      ['B', ['A'], 'sha256:b'],
    ]);
    const problems = check(colour(cyclic, {}), {});
    expect(problems).toHaveLength(1);
    const [problem] = problems;
    expect(problem).toContain('A');
    expect(problem).toContain('B');
    expect(colours(colour(cyclic, {}))).toEqual({ A: 'red', B: 'red' });
  });

  it('prints the lines to paste for each yellow component', () => {
    expect(pasteFor(colour(base, {}), { by: 'Joon', on: '2026-09-27' })).toBe(
      "Spinner:\n  web: { fingerprint: 'sha256:s', by: 'Joon', on: 2026-09-27 }",
    );
  });

  it('names a record that is not a mapping of component to platforms', () => {
    for (const text of ['42', '- Button\n- Spinner\n']) {
      const a = readApprovals(text);
      expect(check(colour(base, a), a)).toEqual([
        'spec/approvals.yaml: expected a mapping of component to platforms.',
      ]);
    }
  });

  it('names a component that is not a mapping of platform to approval', () => {
    const a = readApprovals('Button: true\n');
    expect(check(colour(base, a), a)).toEqual([
      'Button: expected a mapping of platform to approval.',
    ]);
    const empty = readApprovals('Button:\n');
    expect(check(colour(base, empty), empty)).toEqual([]);
  });

  it('names an approval that is not { fingerprint, by, on }', () => {
    const a = readApprovals('Button:\n  web: sha256:b\n');
    expect(check(colour(base, a), a)).toEqual([
      'Button (web): expected { fingerprint, by, on }.',
    ]);
  });

  it('quotes a pasted component name YAML would misread', () => {
    const odd = scanOf([
      ['A: B', [], 'sha256:a'],
      ['True', [], 'sha256:t'],
      ['Icon Button', [], 'sha256:i'],
    ]);
    const paste = pasteFor(colour(odd, {}), { by: 'Joon', on: '2026-09-27' });
    expect(paste).toContain("'A: B':\n");
    expect(paste).toContain("'True':\n");
    expect(paste).toContain('\nIcon Button:\n');
    expect(Object.keys(readApprovals(paste)).sort()).toEqual(
      ['A: B', 'Icon Button', 'True'].sort(),
    );
  });
});

describe('render', () => {
  it('names, on a red component, only the yellow components among what it waits on', () => {
    const lines = render(colour(base, {}), {
      by: 'Joon',
      on: '2026-09-27',
    }).split('\n');
    // Dialog waits on Button (red) and Spinner (yellow); only Spinner can be acted on now.
    expect(lines).toContain('  🔴 Button (approve first: Spinner)');
    expect(lines).toContain('  🔴 Dialog (approve first: Spinner)');
  });

  it('names a cycle where no waited-on component is yellow', () => {
    const cyclic = scanOf([
      ['A', ['B'], 'sha256:a'],
      ['B', ['A'], 'sha256:b'],
    ]);
    const lines = render(colour(cyclic, {}), {
      by: 'Joon',
      on: '2026-09-27',
    }).split('\n');
    expect(lines).toContain('  🔴 A (in a cycle)');
    expect(lines).toContain('  🔴 B (in a cycle)');
  });
});

describe('tokenValues', () => {
  it('reads each token per block, and every other declaration under *', () => {
    const css = [
      '/* --solar-ghost: 9px; */',
      ':root {',
      '  --solar-x: 2px;',
      '  --solar-shadow:',
      '    0px 1px 2px 0px rgba(0, 0, 0, 0.1),',
      '    0px 0px 0px 2px rgba( 0, 0, 0, 0.2 );',
      '}',
      '@media (max-width: 767.98px) {',
      '  :root {',
      '    --solar-x: 1px;',
      '  }',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  * {',
      '    transition-duration:  0ms !important;',
      '  }',
      '}',
    ].join('\n');
    const values = tokenValues(css);
    expect(values.has('--solar-ghost')).toBe(false);
    expect(values.get('--solar-x')).toEqual([
      ':root=2px',
      '@media (max-width: 767.98px) :root=1px',
    ]);
    expect(values.get('--solar-shadow')).toEqual([
      ':root=0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 0px 2px rgba(0, 0, 0, 0.2)',
    ]);
    expect(values.get('*')).toEqual([
      '@media (prefers-reduced-motion: reduce) *=transition-duration: 0ms !important',
    ]);
  });
});

describe('fingerprints', () => {
  let base;
  const fp = (scanned, platform, name) =>
    scanned[platform].find((c) => c.name === name).fingerprint;
  // A reader that gives one file, edited, in memory: nothing is written to disk. An edit that
  // changes nothing would prove nothing, so it throws.
  const edited = (file, edit) => (path) => {
    const text = read(path);
    if (path !== file) return text;
    const changed = edit(text);
    if (changed === text) throw new Error(`the edit left ${file} unchanged`);
    return changed;
  };
  beforeAll(async () => {
    base = await scan();
  }, 120_000);

  it('are the same twice', async () => {
    expect(await scan()).toEqual(base);
  }, 120_000);

  it("change with a child's code, and only for its parents", async () => {
    const s = await scan(['web'], {
      read: edited(
        'packages/components/src/Spinner.tsx',
        (t) => `${t}\nexport const probe = 1;\n`,
      ),
    });
    expect(fp(s, 'web', 'Button')).not.toBe(fp(base, 'web', 'Button'));
    expect(fp(s, 'web', 'Spinner')).not.toBe(fp(base, 'web', 'Spinner'));
    expect(fp(s, 'web', 'Tag')).toBe(fp(base, 'web', 'Tag'));
    const f = await scan(['flutter'], {
      read: edited(
        'packages/solar_flutter/lib/src/components/solar_spinner.dart',
        (t) => `${t}\nconst probe = 1;\n`,
      ),
    });
    expect(fp(f, 'flutter', 'Button')).not.toBe(fp(base, 'flutter', 'Button'));
    expect(fp(f, 'flutter', 'Tag')).toBe(fp(base, 'flutter', 'Tag'));
  }, 120_000);

  it('do not change with a comment or the layout', async () => {
    const s = await scan(['web'], {
      read: edited(
        'packages/components/src/Button.tsx',
        (t) =>
          `// A note.\n${t.replace('export const Button', '\n\nexport   const Button')}`,
      ),
    });
    expect(fp(s, 'web', 'Button')).toBe(fp(base, 'web', 'Button'));
    const f = await scan(['flutter'], {
      read: edited(
        'packages/solar_flutter/lib/src/components/solar_button.dart',
        (t) =>
          `// A note.\n${t.replace('class SolarButton', '\n\nclass   SolarButton')}`,
      ),
    });
    expect(fp(f, 'flutter', 'Button')).toBe(fp(base, 'flutter', 'Button'));
  }, 120_000);

  it("change on the web with a token's value", async () => {
    const name = '--solar-color-action-primary-bg-default';
    const edit = (t) =>
      t.replace(new RegExp(`(${name}:\\s*)[^;]+`), '$1#000000');
    // The first declaration is :root's; the edit must reach it, however the value is wrapped.
    const original = tokenValues(read(tokensCss)).get(name);
    const changed = tokenValues(edit(read(tokensCss))).get(name);
    expect(original[0]).toMatch(/^:root=/);
    expect(changed[0]).toBe(':root=#000000');
    expect(changed[0]).not.toBe(original[0]);
    const s = await scan(['web'], { read: edited(tokensCss, edit) });
    expect(fp(s, 'web', 'Button')).not.toBe(fp(base, 'web', 'Button'));
  }, 120_000);

  it('never change with a test or a story', async () => {
    const story = 'packages/components/stories/Button.stories.tsx';
    expect(existsSync(join(repoRoot, story))).toBe(true);
    const s = await scan(['web'], {
      read: edited(story, (t) => `${t}\nexport const x = 1;\n`),
    });
    expect(s.web).toEqual(base.web);
  }, 120_000);

  it('leave no cycle', () => {
    expect(check(colour(base, {}), {})).toEqual([]);
  });

  it('hold every approval the committed record makes', () => {
    const a = readApprovals();
    expect(check(colour(base, a), a)).toEqual([]);
  });

  it('name repository paths alone, the same on every machine', () => {
    for (const platform of ['web', 'flutter'])
      for (const c of base[platform])
        for (const f of c.files) expect(f).toMatch(/^packages\/[^\\]+$/);
  });

  it('change on the web, every one, with the MUI theme SolarProvider installs', async () => {
    const theme = 'packages/styles/src/generated/mui/theme.ts';
    const s = await scan(undefined, {
      read: edited(theme, (t) => `${t}\nexport const probe = 1;\n`),
    });
    for (const c of s.web)
      expect(c.fingerprint).not.toBe(fp(base, 'web', c.name));
    expect(s.flutter).toEqual(base.flutter);
  }, 120_000);

  it("change on the web with tokens.css's other rules", async () => {
    const rule = /transition-duration: 0ms !important/;
    expect(read(tokensCss)).toMatch(rule);
    const s = await scan(undefined, {
      read: edited(tokensCss, (t) =>
        t.replace(rule, 'transition-duration: 1ms !important'),
      ),
    });
    expect(fp(s, 'web', 'Button')).not.toBe(fp(base, 'web', 'Button'));
    expect(s.flutter).toEqual(base.flutter);
  }, 120_000);

  it('never change with a visual case or a Flutter test', async () => {
    for (const file of [
      'packages/components/test/visual/cases/button.tsx',
      'packages/solar_flutter/test/solar_button_test.dart',
    ]) {
      expect(existsSync(join(repoRoot, file))).toBe(true);
      const s = await scan(undefined, {
        read: edited(file, (t) => `${t}\nconst probe = 1;\n`),
      });
      expect(s).toEqual(base);
    }
  }, 120_000);
});
