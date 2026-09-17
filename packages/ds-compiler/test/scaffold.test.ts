import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseManifest } from '../src/components/manifest.js';
import type { DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { lint } from '../src/lint.js';
import {
  ScaffoldError,
  renderComponentCss,
  renderComponentManifest,
  scaffoldComponent,
} from '../src/scaffold/component.js';
import { renderTokenScaffold, scaffoldTokens } from '../src/scaffold/tokens.js';
import { MINI_CONFIG, makeRoot } from './helpers.js';

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

describe('scaffold tokens', () => {
  it('renders a :root block and one block per extra mode, each with a TODO', () => {
    const text = renderTokenScaffold('color', config);
    expect(text).toContain(':root {');
    expect(text).toContain(':root[data-fx-theme="dark"] {');
    expect(text).toContain('--fx-color-example: #1863d3');
    expect(text.match(/TODO/g)).toHaveLength(2);
  });

  it('writes the file and refuses to overwrite', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const { path } = scaffoldTokens(root, 'space', config);
    expect(path).toBe(join(root, 'src/tokens/space.css'));
    expect(existsSync(path)).toBe(true);
    expect(() => scaffoldTokens(root, 'space', config)).toThrow(ScaffoldError);
  });

  it('lints with only DS-E050 until filled, then clean', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const { path } = scaffoldTokens(root, 'space', config);
    const before = lint(root);
    expect(new Set(before.errors.map((e) => e.code))).toEqual(
      new Set(['DS-E050']),
    );
    writeFileSync(path, ':root {\n  --fx-space-1: 4px;\n}\n');
    expect(lint(root).items).toEqual([]);
  });
});

describe('scaffold component', () => {
  const opts = {
    axes: { variant: ['solid', 'outline'], size: ['sm', 'md'] },
    states: ['hover', 'focus-visible', 'disabled', 'open'],
    slots: ['icon'],
  };

  it('renders a manifest that validates, with every target excluded as TODO', () => {
    const text = renderComponentManifest('button', opts, config);
    const diag = new Diagnostics();
    const manifest = parseManifest(
      JSON.parse(text),
      'button.manifest.json',
      'button',
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(manifest).toMatchObject({
      name: 'button',
      displayName: 'Button',
      axes: {
        variant: { values: ['solid', 'outline'], default: 'solid' },
        size: { values: ['sm', 'md'], default: 'sm' },
      },
      states: ['hover', 'focus-visible', 'disabled', 'open'],
      slots: {
        root: { element: 'div', optional: false },
        icon: { element: 'span', optional: false },
      },
    });
    expect(Object.keys(manifest!.targets)).toEqual([
      'tailwind',
      'mui',
      'flutter',
    ]);
    expect(manifest!.targets.mui).toEqual({
      excluded: 'TODO: map this target or give a reason',
    });
  });

  it('renders CSS rules in cascade order with a TODO in each', () => {
    const css = renderComponentCss('button', opts, config);
    const selectors = [...css.matchAll(/^([^\n{]+) \{$/gm)].map((m) => m[1]);
    expect(selectors).toEqual([
      '.fx-button',
      '.fx-button:hover',
      '.fx-button:focus-visible',
      '.fx-button:disabled',
      '.fx-button[data-state="open"]',
      '.fx-button[data-variant="outline"]',
      '.fx-button[data-size="md"]',
      '.fx-button .fx-button__icon',
    ]);
    expect(css).toContain('TODO baseline: appearance, box-sizing');
  });

  it('writes both files and refuses to overwrite an existing component', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const out = scaffoldComponent(root, 'button', opts, config);
    expect(out.cssPath).toBe(join(root, 'src/components/button/button.css'));
    expect(out.manifestPath).toBe(
      join(root, 'src/components/button/button.manifest.json'),
    );
    expect(readFileSync(out.manifestPath, 'utf8').endsWith('\n')).toBe(true);
    expect(() => scaffoldComponent(root, 'button', opts, config)).toThrow(
      ScaffoldError,
    );
  });

  it('rejects invalid identifiers', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(() => scaffoldComponent(root, 'Button', opts, config)).toThrow(
      /kebab-case/,
    );
    expect(() =>
      scaffoldComponent(
        root,
        'button',
        { axes: { Size: ['sm'] }, states: [], slots: [] },
        config,
      ),
    ).toThrow(/Size/);
  });

  it('lints with only DS-E050 errors until filled', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-text: #111; }',
    });
    scaffoldComponent(root, 'button', opts, config);
    const result = lint(root);
    expect(new Set(result.errors.map((e) => e.code))).toEqual(
      new Set(['DS-E050']),
    );
  });

  it('rejects duplicate values within an axis', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(() =>
      scaffoldComponent(
        root,
        'button',
        { axes: { size: ['sm', 'sm'] }, states: [], slots: [] },
        config,
      ),
    ).toThrow(/duplicate/i);
  });

  it('rejects duplicate slot names', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(() =>
      scaffoldComponent(
        root,
        'button',
        { axes: {}, states: [], slots: ['icon', 'icon'] },
        config,
      ),
    ).toThrow(/duplicate/i);
  });

  it('treats "constructor" as an ordinary data-state, not an inherited Object.prototype key', () => {
    const stateOpts = { axes: {}, states: ['constructor'], slots: [] };
    const css = renderComponentCss('button', stateOpts, config);
    expect(css).toContain('.fx-button[data-state="constructor"]');

    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-text: #111; }',
    });
    scaffoldComponent(root, 'button', stateOpts, config);
    const result = lint(root);
    expect(new Set(result.errors.map((e) => e.code))).toEqual(
      new Set(['DS-E050']),
    );
  });
});
