import { describe, expect, it } from 'vitest';
import type { DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { parseTokenFile } from '../src/tokens/parse-tokens.js';
import { resolveTokens } from '../src/tokens/resolve-tokens.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
  targets: {},
  coverageFile: 'coverage.md',
};

describe('parseTokenFile', () => {
  it('parses :root and mode blocks into raw tokens with locations', () => {
    const css = `
:root {
  --fx-color-primary-default: #1863d3;
  --fx-color-primary-hover: var(--fx-color-primary-default);
}

:root[data-fx-theme="dark"] {
  --fx-color-primary-default: #3f8cff;
}
`;
    const diag = new Diagnostics();
    const raws = parseTokenFile('src/tokens/color.css', css, config, diag);
    expect(diag.items).toEqual([]);
    expect(raws).toEqual([
      {
        id: 'color.primary.default',
        category: 'color',
        path: ['primary', 'default'],
        cssName: '--fx-color-primary-default',
        mode: 'light',
        raw: '#1863d3',
        location: { file: 'src/tokens/color.css', line: 3, column: 3 },
      },
      {
        id: 'color.primary.hover',
        category: 'color',
        path: ['primary', 'hover'],
        cssName: '--fx-color-primary-hover',
        mode: 'light',
        raw: 'var(--fx-color-primary-default)',
        location: { file: 'src/tokens/color.css', line: 4, column: 3 },
      },
      {
        id: 'color.primary.default',
        category: 'color',
        path: ['primary', 'default'],
        cssName: '--fx-color-primary-default',
        mode: 'dark',
        raw: '#3f8cff',
        location: { file: 'src/tokens/color.css', line: 8, column: 3 },
      },
    ]);
  });

  it('accepts single-quoted mode selectors (Prettier output)', () => {
    const diag = new Diagnostics();
    const raws = parseTokenFile(
      'src/tokens/space.css',
      ":root[data-fx-theme='dark'] { --fx-space-1: 4px; }",
      config,
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(raws[0].mode).toBe('dark');
  });

  it('reports DS-E017 for a file not named after a category', () => {
    const diag = new Diagnostics();
    const raws = parseTokenFile(
      'src/tokens/colours.css',
      ':root {}',
      config,
      diag,
    );
    expect(raws).toEqual([]);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E017']);
  });

  it('reports DS-E010 for at-rules, unknown selectors, and nested rules', () => {
    const css = `
@media (min-width: 600px) { :root { --fx-space-1: 4px; } }
.theme-dark { --fx-space-1: 4px; }
:root { --fx-space-1: 4px; .nested { --fx-space-2: 8px; } }
`;
    const diag = new Diagnostics();
    parseTokenFile('src/tokens/space.css', css, config, diag);
    expect(diag.errors.map((e) => e.code)).toEqual([
      'DS-E010',
      'DS-E010',
      'DS-E010',
    ]);
    expect(diag.errors[1].message).toContain('.theme-dark');
  });

  it('reports DS-E011 for non-custom properties, wrong prefix, wrong category, and bad casing', () => {
    const css = `
:root {
  color: red;
  --other-space-1: 4px;
  --fx-color-primary: #000;
  --fx-space-Large: 4px;
}
`;
    const diag = new Diagnostics();
    const raws = parseTokenFile('src/tokens/space.css', css, config, diag);
    expect(raws).toEqual([]);
    expect(diag.errors.map((e) => e.code)).toEqual([
      'DS-E011',
      'DS-E011',
      'DS-E011',
      'DS-E011',
    ]);
    expect(diag.errors[2].message).toContain('category "color"');
  });

  it('reports DS-E061 with the error line for a CSS syntax error', () => {
    const diag = new Diagnostics();
    parseTokenFile(
      'src/tokens/space.css',
      ':root {\n  --fx-space-1: 4px;\n',
      config,
      diag,
    );
    expect(diag.errors[0].code).toBe('DS-E061');
    expect(diag.errors[0].message).toContain('syntax');
  });

  it('reports DS-E012 but still keeps a declaration using !important', () => {
    const diag = new Diagnostics();
    const raws = parseTokenFile(
      'src/tokens/color.css',
      ':root { --fx-color-a: #fff !important; }',
      config,
      diag,
    );
    expect(raws).toHaveLength(1);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E012']);
    expect(diag.errors[0].message).toContain('!important');
  });

  it('does not report a phantom DS-E015 for a token declared with !important in one mode', () => {
    const diag = new Diagnostics();
    const raws = parseTokenFile(
      'src/tokens/color.css',
      `
:root { --fx-color-a: #fff !important; }
:root[data-fx-theme="dark"] { --fx-color-a: #111; }
`,
      config,
      diag,
    );
    expect(raws).toHaveLength(2);
    // Feed the raws into resolveTokens: DS-E015 (partial mode coverage) is
    // only emitted there, so this proves the !important decl still counts
    // toward mode coverage instead of silently dropping its mode.
    resolveTokens(raws, config, diag);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E012']);
  });

  it('reports DS-E010 when the default mode is written as an explicit selector', () => {
    const diag = new Diagnostics();
    const raws = parseTokenFile(
      'src/tokens/space.css',
      ':root[data-fx-theme="light"] { --fx-space-1: 4px; }',
      config,
      diag,
    );
    expect(raws).toEqual([]);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E010']);
    expect(diag.errors[0].message).toContain('default mode "light"');
  });
});
