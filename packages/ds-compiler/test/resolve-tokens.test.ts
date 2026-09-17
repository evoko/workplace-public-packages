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

function resolve(files: Record<string, string>) {
  const diag = new Diagnostics();
  const raws = Object.entries(files).flatMap(([file, css]) =>
    parseTokenFile(`src/tokens/${file}`, css, config, diag),
  );
  const tokens = resolveTokens(raws, config, diag);
  return { tokens, diag };
}

describe('resolveTokens', () => {
  it('produces invariant and per-mode tokens with resolved aliases', () => {
    const { tokens, diag } = resolve({
      'color.css': `
:root {
  --fx-color-neutral-900: #111111;
  --fx-color-text-default: var(--fx-color-neutral-900);
  --fx-color-bg-default: #ffffff;
}
:root[data-fx-theme="dark"] {
  --fx-color-bg-default: #111111;
}`,
    });
    expect(diag.items).toEqual([]);
    expect(Object.keys(tokens)).toEqual([
      'color.bg.default',
      'color.neutral.900',
      'color.text.default',
    ]);
    expect(tokens['color.neutral.900']).toMatchObject({
      $type: 'color',
      $value: { hex: '#111111ff' },
      modeInvariant: true,
      category: 'color',
      path: ['neutral', '900'],
      cssName: '--fx-color-neutral-900',
    });
    expect(tokens['color.text.default']).toMatchObject({
      $value: { hex: '#111111ff' },
      modeInvariant: true,
      alias: 'color.neutral.900',
    });
    expect(tokens['color.bg.default']).toMatchObject({
      $value: { light: { hex: '#ffffffff' }, dark: { hex: '#111111ff' } },
      modeInvariant: false,
    });
    expect(tokens['color.bg.default'].alias).toBeUndefined();
  });

  it('makes a :root-only alias per-mode when its target varies by mode', () => {
    const { tokens } = resolve({
      'color.css': `
:root {
  --fx-color-bg-default: #ffffff;
  --fx-color-surface-default: var(--fx-color-bg-default);
}
:root[data-fx-theme="dark"] {
  --fx-color-bg-default: #111111;
}`,
    });
    expect(tokens['color.surface.default']).toMatchObject({
      modeInvariant: false,
      $value: { light: { hex: '#ffffffff' }, dark: { hex: '#111111ff' } },
      alias: { light: 'color.bg.default' },
    });
  });

  it('accepts cross-category aliases when the value type matches', () => {
    const { tokens, diag } = resolve({
      'space.css': ':root { --fx-space-4: 16px; }',
      'radius.css': ':root { --fx-radius-md: var(--fx-space-4); }',
    });
    expect(diag.items).toEqual([]);
    expect(tokens['radius.md']).toMatchObject({
      $type: 'dimension',
      $value: { value: 16, unit: 'px' },
      alias: 'space.4',
    });
  });

  it('reports DS-E014 for an alias whose type does not fit the category', () => {
    const { diag } = resolve({
      'color.css': ':root { --fx-color-x: #fff; }',
      'space.css': ':root { --fx-space-1: var(--fx-color-x); }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E014']);
  });

  it('reports DS-E013 for unknown alias targets and cycles', () => {
    const { diag } = resolve({
      'color.css': `
:root {
  --fx-color-a: var(--fx-color-missing);
  --fx-color-b: var(--fx-color-c);
  --fx-color-c: var(--fx-color-b);
}`,
    });
    const codes = diag.errors.map((e) => e.code);
    expect(codes).toContain('DS-E013');
    expect(diag.errors.some((e) => e.message.includes('missing'))).toBe(true);
    expect(diag.errors.some((e) => e.message.includes('cycle'))).toBe(true);
  });

  it('reports DS-E012 for a value that fits no type of the category', () => {
    const { diag } = resolve({
      'space.css':
        ':root { --fx-space-1: red; --fx-space-2: calc(1px + 2px); }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E012', 'DS-E012']);
  });

  it('reports DS-E015 for partial mode coverage', () => {
    const { diag, tokens } = resolve({
      'color.css': `
:root { --fx-color-a: #000; }
:root[data-fx-theme="dark"] { --fx-color-b: #fff; }`,
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E015']);
    expect(diag.errors[0].message).toContain('color.b');
    expect(tokens['color.a']).toBeDefined();
    expect(tokens['color.b']).toBeUndefined();
  });

  it('reports DS-E016 for duplicates within one mode', () => {
    const { diag } = resolve({
      'color.css': ':root { --fx-color-a: #000; --fx-color-a: #111; }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E016']);
    expect(diag.errors[0].location?.line).toBe(1);
  });

  it('parses line-height as number first, then dimension', () => {
    const { tokens } = resolve({
      'line-height.css':
        ':root { --fx-line-height-body: 1.5; --fx-line-height-fixed: 24px; }',
    });
    expect(tokens['line-height.body']).toMatchObject({
      $type: 'number',
      $value: { value: 1.5 },
    });
    expect(tokens['line-height.fixed']).toMatchObject({
      $type: 'dimension',
      $value: { value: 24, unit: 'px' },
    });
  });

  it('prefers the default-mode declaration for source location, even when the mode block comes first', () => {
    const { tokens } = resolve({
      'color.css': `
:root[data-fx-theme="dark"] {
  --fx-color-a: #111111;
}
:root {
  --fx-color-a: #ffffff;
}`,
    });
    expect(tokens['color.a'].source.line).toBe(6);
  });

  it('does not cascade a DS-E013 when aliasing a token that already failed DS-E012', () => {
    const { diag, tokens } = resolve({
      'color.css': `
:root {
  --fx-color-broken: not-a-color;
  --fx-color-ok: var(--fx-color-broken);
}`,
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E012']);
    expect(tokens['color.ok']).toBeUndefined();
  });

  it('reports exactly one DS-E013 for a three-token alias cycle', () => {
    const { diag } = resolve({
      'color.css': `
:root {
  --fx-color-x: var(--fx-color-y);
  --fx-color-y: var(--fx-color-z);
  --fx-color-z: var(--fx-color-x);
}`,
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E013']);
  });

  it('reports one DS-E013 for a token that aliases itself', () => {
    const { diag } = resolve({
      'color.css': ':root { --fx-color-a: var(--fx-color-a); }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E013']);
    expect(diag.errors[0].message).toBe('Alias cycle: color.a -> color.a');
  });

  it('does not share value objects between an alias and its target', () => {
    const { tokens } = resolve({
      'color.css': `
:root {
  --fx-color-a: #111111;
  --fx-color-b: var(--fx-color-a);
}`,
    });
    expect(tokens['color.b'].$value).toEqual(tokens['color.a'].$value);
    expect(tokens['color.b'].$value).not.toBe(tokens['color.a'].$value);
  });

  it('reports DS-E012 when a token resolves to different types across modes', () => {
    const { diag, tokens } = resolve({
      'line-height.css': `
:root { --fx-line-height-mixed: 1.5; }
:root[data-fx-theme="dark"] { --fx-line-height-mixed: 24px; }`,
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E012']);
    expect(diag.errors[0].message).toContain('number');
    expect(diag.errors[0].message).toContain('dimension');
    expect(tokens['line-height.mixed']).toBeUndefined();
  });

  it('makes a mixed literal/alias declaration mode-variant even when the resolved values are equal', () => {
    const { tokens } = resolve({
      'color.css': `
:root {
  --fx-color-base: #ffffff;
  --fx-color-a: #ffffff;
}
:root[data-fx-theme="dark"] {
  --fx-color-a: var(--fx-color-base);
}`,
    });
    expect(tokens['color.a']).toMatchObject({
      modeInvariant: false,
      $value: { light: { hex: '#ffffffff' }, dark: { hex: '#ffffffff' } },
      alias: { dark: 'color.base' },
    });
  });

  it('reports DS-E015 naming the missing default mode when declared only in dark', () => {
    const { diag, tokens } = resolve({
      'color.css':
        ':root[data-fx-theme="dark"] { --fx-color-only-dark: #000; }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E015']);
    expect(diag.errors[0].message).toContain('light');
    expect(tokens['color.only.dark']).toBeUndefined();
  });

  it('resolves a per-mode alias to a :root-only target in both modes', () => {
    const { diag, tokens } = resolve({
      'color.css': `
:root {
  --fx-color-base: #ffffff;
  --fx-color-a: var(--fx-color-base);
}
:root[data-fx-theme="dark"] {
  --fx-color-a: var(--fx-color-base);
}`,
    });
    expect(diag.items).toEqual([]);
    expect(tokens['color.a']).toBeDefined();
    expect(tokens['color.a'].$value).toEqual(tokens['color.base'].$value);
  });
});
