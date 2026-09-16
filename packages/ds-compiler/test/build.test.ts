import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
} from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build, buildIR, IR_FILE } from '../src/build.js';
import { FIXTURE_MINI, MINI_CONFIG, makeRoot } from './helpers.js';

describe('buildIR on the mini fixture', () => {
  it('produces a complete IR with no diagnostics', () => {
    const { ir, diagnostics } = buildIR(FIXTURE_MINI);
    expect(diagnostics.items).toEqual([]);
    expect(ir).not.toBeNull();
    expect(ir!.irVersion).toBe(1);
    expect(ir!.meta).toMatchObject({
      name: 'Fictional',
      prefix: 'fx',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      rootFontSize: 16,
    });
    expect(ir!.meta.sourceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.keys(ir!.components)).toEqual(['badge', 'button']);
    expect(Object.keys(ir!.tokens)).toContain('color.brand.default');
    expect(ir!.tokens['color.brand.default'].modeInvariant).toBe(false);
    expect(ir!.tokens['radius.md']).toMatchObject({
      alias: 'space.2',
      $type: 'dimension',
    });
    expect(ir!.tokens['shadow.focus'].$value).toMatchObject({
      layers: [{ color: { ref: 'color.focus.ring' } }],
    });
  });

  it('orders button rules deterministically', () => {
    const { ir } = buildIR(FIXTURE_MINI);
    expect(
      ir!.components.button.rules.map((r) => [r.slot, r.axes, r.states]),
    ).toEqual([
      ['root', {}, []],
      ['root', {}, ['hover']],
      ['root', {}, ['focus-visible']],
      ['root', {}, ['disabled']],
      ['root', { variant: 'outline' }, []],
      ['root', { variant: 'outline' }, ['hover']],
      ['root', { size: 'sm' }, []],
      ['icon', {}, []],
    ]);
  });

  it('is byte-for-byte reproducible and writes design.ir.json', () => {
    const root = makeRoot({});
    // Copy the fixture into a temp root so the fixture stays clean.
    cpSync(FIXTURE_MINI, root, { recursive: true });
    const first = build(root);
    expect(first.outFile).toBe(join(root, IR_FILE));
    const a = readFileSync(join(root, IR_FILE), 'utf8');
    build(root);
    const b = readFileSync(join(root, IR_FILE), 'utf8');
    expect(a).toBe(b);
    expect(a.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(a);
    expect(Object.keys(parsed)).toEqual([
      'components',
      'irVersion',
      'meta',
      'tokens',
    ]);
  });

  it('returns a null IR and does not write when there are errors', () => {
    const root = makeRoot({
      'ds.config.json':
        '{ "name": "X", "prefix": "fx", "modes": ["light"], "defaultMode": "light" }',
      'src/tokens/color.css': ':root { --fx-color-a: notacolor; }',
    });
    const result = build(root);
    expect(result.ir).toBeNull();
    expect(result.outFile).toBeUndefined();
    expect(result.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E012']);
    expect(existsSync(join(root, IR_FILE))).toBe(false);
  });

  it('reports DS-E001 and stops when the config is missing', () => {
    const root = makeRoot({});
    const result = buildIR(root);
    expect(result.ir).toBeNull();
    expect(result.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E001']);
  });
});

describe('buildIR directory walking', () => {
  it('reports a broken component symlink as DS-E060 without throwing', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #111; }',
    });
    mkdirSync(join(root, 'src/components'), { recursive: true });
    symlinkSync(
      join(root, 'src/components/does-not-exist'),
      join(root, 'src/components/broken'),
      'dir',
    );
    expect(() => buildIR(root)).not.toThrow();
    const result = buildIR(root);
    expect(result.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E060']);
    expect(result.diagnostics.errors[0].message).toContain('broken symlink');
  });

  it('ignores dot directories and node_modules under src/components', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #111; }',
    });
    mkdirSync(join(root, 'src/components/.cache'), { recursive: true });
    mkdirSync(join(root, 'src/components/node_modules'), { recursive: true });
    const result = buildIR(root);
    expect(result.diagnostics.items).toEqual([]);
    expect(result.ir).not.toBeNull();
    expect(result.ir!.components).toEqual({});
  });

  it('reports DS-E060 when the component CSS file has the wrong case', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #111; }',
      'src/components/card/Card.css': '.fx-card { display: block; }',
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
      }),
    });
    const result = buildIR(root);
    expect(result.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E060']);
  });

  it('flags a token file whose extension is not lowercase .css', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.CSS': ':root { --fx-color-a: #111; }',
    });
    const result = buildIR(root);
    expect(result.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E017']);
  });

  it('reports DS-E021 for a non-kebab-case component directory name', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #111; }',
      'src/components/MyCard/MyCard.css': '.fx-my-card { display: block; }',
      'src/components/MyCard/MyCard.manifest.json': JSON.stringify({
        name: 'MyCard',
        displayName: 'My Card',
      }),
    });
    const result = buildIR(root);
    expect(result.diagnostics.errors).toHaveLength(1);
    expect(result.diagnostics.errors[0].code).toBe('DS-E021');
    expect(result.diagnostics.errors[0].message).toBe(
      'component directory "MyCard" must be kebab-case',
    );
  });

  it('warns DS-W002 for a completely empty source root', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const result = buildIR(root);
    expect(result.diagnostics.hasErrors()).toBe(false);
    expect(result.diagnostics.warnings).toHaveLength(1);
    expect(result.diagnostics.warnings[0].code).toBe('DS-W002');
    expect(result.ir).not.toBeNull();
  });

  it('detects a symlinked component CSS file as present, not missing', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #111; }',
      'external/card.css': '.fx-card { display: block; }',
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        baseline: false,
      }),
    });
    symlinkSync(
      join(root, 'external/card.css'),
      join(root, 'src/components/card/card.css'),
    );
    const result = buildIR(root);
    expect(result.diagnostics.errors.map((e) => e.code)).not.toContain(
      'DS-E060',
    );
    expect(result.diagnostics.errors).toEqual([]);
    expect(result.ir).not.toBeNull();
    expect(result.ir!.components.card).toBeDefined();
  });

  it('does not throw when src/tokens exists as a regular file, and reports DS-W002', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens': 'this is a file, not a directory',
    });
    expect(() => buildIR(root)).not.toThrow();
    const result = buildIR(root);
    expect(result.diagnostics.hasErrors()).toBe(false);
    expect(result.diagnostics.warnings).toHaveLength(1);
    expect(result.diagnostics.warnings[0].code).toBe('DS-W002');
    expect(result.ir).not.toBeNull();
  });
});
