import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig, modeSelectorFor, type DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';

function tmpRoot(): string {
  return mkdtempSync(join(tmpdir(), 'ds-config-'));
}

describe('loadConfig', () => {
  it('loads a valid config and fills defaults', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light', 'dark'],
        defaultMode: 'light',
      }),
    );
    const diag = new Diagnostics();
    const config = loadConfig(root, diag);
    expect(diag.hasErrors()).toBe(false);
    expect(config).toEqual({
      name: 'Fictional',
      prefix: 'fx',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      rootFontSize: 16,
      modeSelector: ':root[data-fx-theme="{mode}"]',
    });
  });

  it('keeps explicit rootFontSize and modeSelector instead of the defaults', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light', 'dark'],
        defaultMode: 'light',
        rootFontSize: 18,
        modeSelector: '[data-theme="{mode}"]',
      }),
    );
    const diag = new Diagnostics();
    const config = loadConfig(root, diag);
    expect(diag.hasErrors()).toBe(false);
    expect(config).toEqual({
      name: 'Fictional',
      prefix: 'fx',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      rootFontSize: 18,
      modeSelector: '[data-theme="{mode}"]',
    });
  });

  it('reports DS-E001 when the file is missing', () => {
    const root = tmpRoot();
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('ds.config.json');
  });

  it('reports DS-E001 when defaultMode is not in modes', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'X',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'dark',
      }),
    );
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('defaultMode');
  });

  it('reports DS-E001 for duplicate modes', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'X',
        prefix: 'fx',
        modes: ['light', 'light'],
        defaultMode: 'light',
      }),
    );
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('unique');
  });

  it('reports DS-E001 for an invalid prefix', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'X',
        prefix: 'Bad Prefix',
        modes: ['light'],
        defaultMode: 'light',
      }),
    );
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('prefix');
  });

  it('reports DS-E001 for a modeSelector without {mode}', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'X',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        modeSelector: ':root.dark',
      }),
    );
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('modeSelector');
  });

  it('reports DS-E001 for an unknown key, naming it', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'X',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        bogus: true,
      }),
    );
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('bogus');
  });

  it('reports DS-E001 for malformed JSON', () => {
    const root = tmpRoot();
    writeFileSync(join(root, 'ds.config.json'), '{ not json');
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
  });
});

describe('modeSelectorFor', () => {
  it('replaces every occurrence of {mode}', () => {
    const config: DsConfig = {
      name: 'X',
      prefix: 'fx',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      rootFontSize: 16,
      modeSelector: ':root[data-{mode}] .{mode}-theme',
    };
    expect(modeSelectorFor(config, 'dark')).toBe(
      ':root[data-dark] .dark-theme',
    );
  });
});
