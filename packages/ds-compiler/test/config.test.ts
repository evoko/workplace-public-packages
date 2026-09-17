import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig, modeSelectorFor, type DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { MINI_CONFIG, makeRoot } from './helpers.js';

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
      targets: {},
      coverageFile: 'coverage.md',
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
      targets: {},
      coverageFile: 'coverage.md',
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

  it('accepts targets and coverageFile and defaults them', () => {
    const root = makeRoot({
      'ds.config.json': JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        targets: { tailwind: { outDir: '../tw/src/generated' } },
        coverageFile: '../../docs/coverage.md',
      }),
    });
    const diag = new Diagnostics();
    const config = loadConfig(root, diag);
    expect(diag.items).toEqual([]);
    expect(config?.targets).toEqual({
      tailwind: { outDir: '../tw/src/generated' },
    });
    expect(config?.coverageFile).toBe('../../docs/coverage.md');

    const bare = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const c2 = loadConfig(bare, new Diagnostics());
    expect(c2?.targets).toEqual({});
    expect(c2?.coverageFile).toBe('coverage.md');
  });

  it('rejects unknown keys inside a target entry', () => {
    const root = makeRoot({
      'ds.config.json': JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        targets: { tailwind: { outdir: 'typo' } },
      }),
    });
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.items[0].code).toBe('DS-E001');
  });

  it('rejects an absolute outDir and a coverageFile containing a backslash', () => {
    const root = makeRoot({
      'ds.config.json': JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        targets: { tailwind: { outDir: '/abs/out' } },
      }),
    });
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.items[0].code).toBe('DS-E001');
    expect(diag.items[0].message).toContain('relative POSIX path');

    const root2 = makeRoot({
      'ds.config.json': JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        coverageFile: 'out\\tw',
      }),
    });
    const diag2 = new Diagnostics();
    expect(loadConfig(root2, diag2)).toBeNull();
    expect(diag2.items[0].code).toBe('DS-E001');
    expect(diag2.items[0].message).toContain('relative POSIX path');
  });

  describe('outDir safety', () => {
    const base = {
      name: 'Fictional',
      prefix: 'fx',
      modes: ['light'],
      defaultMode: 'light',
    };

    it.each(['.', '../..', 'src', 'src/generated'])(
      'rejects an outDir of %s',
      (outDir) => {
        const root = makeRoot({
          'ds.config.json': JSON.stringify({
            ...base,
            targets: { tailwind: { outDir } },
          }),
        });
        const diag = new Diagnostics();
        expect(loadConfig(root, diag)).toBeNull();
        expect(diag.errors[0].code).toBe('DS-E001');
        expect(diag.errors[0].message).toContain('outDir');
        expect(diag.errors[0].message).toContain(
          "outside the source root's src/",
        );
      },
    );

    it.each(['out/tailwind', '../styles-tailwind/src/generated'])(
      'accepts an outDir of %s',
      (outDir) => {
        const root = makeRoot({
          'ds.config.json': JSON.stringify({
            ...base,
            targets: { tailwind: { outDir } },
          }),
        });
        const diag = new Diagnostics();
        const config = loadConfig(root, diag);
        expect(diag.items).toEqual([]);
        expect(config?.targets.tailwind).toEqual({ outDir });
      },
    );

    it.each(['SRC', 'SRC/generated', 'Src/../.'])(
      'rejects an outDir of %s (case-insensitive filesystems alias it to src/)',
      (outDir) => {
        const root = makeRoot({
          'ds.config.json': JSON.stringify({
            ...base,
            targets: { tailwind: { outDir } },
          }),
        });
        const diag = new Diagnostics();
        expect(loadConfig(root, diag)).toBeNull();
        expect(diag.errors[0].code).toBe('DS-E001');
        expect(diag.errors[0].message).toContain('outDir');
      },
    );
  });

  describe('coverageFile safety', () => {
    const base = {
      name: 'Fictional',
      prefix: 'fx',
      modes: ['light'],
      defaultMode: 'light',
    };

    it.each(['src/index.css', 'design.ir.json', 'SRC/coverage.md'])(
      'rejects a coverageFile of %s',
      (coverageFile) => {
        const root = makeRoot({
          'ds.config.json': JSON.stringify({ ...base, coverageFile }),
        });
        const diag = new Diagnostics();
        expect(loadConfig(root, diag)).toBeNull();
        expect(diag.errors[0].code).toBe('DS-E001');
        expect(diag.errors[0].message).toContain('coverageFile');
        expect(diag.errors[0].message).toContain('.md file');
      },
    );

    it.each(['out/coverage.md', '../../docs/design-system/coverage.md'])(
      'accepts a coverageFile of %s',
      (coverageFile) => {
        const root = makeRoot({
          'ds.config.json': JSON.stringify({ ...base, coverageFile }),
        });
        const diag = new Diagnostics();
        const config = loadConfig(root, diag);
        expect(diag.items).toEqual([]);
        expect(config?.coverageFile).toBe(coverageFile);
      },
    );
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
      targets: {},
      coverageFile: 'coverage.md',
    };
    expect(modeSelectorFor(config, 'dark')).toBe(
      ':root[data-dark] .dark-theme',
    );
  });
});
