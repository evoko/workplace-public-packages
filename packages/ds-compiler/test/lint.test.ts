import { describe, expect, it } from 'vitest';
import { lint } from '../src/lint.js';
import { BASELINE_CSS, MINI_CONFIG, makeRoot } from './helpers.js';

const tokens = {
  'src/tokens/color.css': ':root { --fx-color-text-default: #111; }',
  'src/tokens/font-family.css':
    ":root { --fx-font-family-body: 'Open Sans', sans-serif; }",
  'src/tokens/font-size.css': ':root { --fx-font-size-md: 1rem; }',
  'src/tokens/line-height.css': ':root { --fx-line-height-tight: 1.25; }',
};

describe('lint', () => {
  it('passes a complete component with no diagnostics', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        targets: { tailwind: {} },
      }),
      'src/components/card/card.css': `.fx-card {${BASELINE_CSS}}`,
    });
    expect(lint(root).items).toEqual([]);
  });

  it('reports DS-E050 for TODO markers in token files, CSS, and manifests with line numbers', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root {\n  /* TODO: add colors */\n}',
      'src/components/card/card.manifest.json': JSON.stringify(
        {
          name: 'card',
          displayName: 'Card',
          targets: { mui: { excluded: 'TODO' } },
        },
        null,
        2,
      ),
      'src/components/card/card.css':
        '.fx-card {\n  /* TODO */\n  display: block;\n}',
    });
    const errors = lint(root).errors.filter((e) => e.code === 'DS-E050');
    expect(errors).toHaveLength(3);
    expect(errors[0].location).toMatchObject({
      file: 'src/tokens/color.css',
      line: 2,
    });
    expect(errors[1].location?.file).toBe(
      'src/components/card/card.manifest.json',
    );
    expect(errors[2].location).toMatchObject({
      file: 'src/components/card/card.css',
      line: 2,
    });
  });

  it('reports DS-E060 for a component directory missing a file', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    expect(lint(root).errors.map((e) => e.code)).toEqual(['DS-E060']);
  });

  it('warns DS-W001 when the base root rule misses baseline properties', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
      }),
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    const result = lint(root);
    expect(result.hasErrors()).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe('DS-W001');
    expect(result.warnings[0].message).toContain('appearance');
  });

  it('respects baseline: false and a custom baseline list', () => {
    const off = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        baseline: false,
      }),
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    expect(lint(off).items).toEqual([]);
    const custom = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        baseline: ['display', 'color'],
      }),
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    const w = lint(custom).warnings;
    expect(w).toHaveLength(1);
    expect(w[0].message).toContain('color');
    expect(w[0].message).not.toContain('appearance');
  });
});
