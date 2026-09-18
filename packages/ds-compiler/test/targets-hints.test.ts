import { describe, expect, it } from 'vitest';
import { parseManifest } from '../src/components/manifest.js';
import { Diagnostics } from '../src/errors.js';
import {
  TARGET_HINT_SCHEMAS,
  TARGET_IDS,
  tailwindHintsSchema,
  targetsSchema,
} from '../src/targets/hints.js';
import { TARGETS, getTarget } from '../src/targets/index.js';
import { outDirFor } from '../src/targets/plugin.js';
import type { DsConfig } from '../src/config.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
  targets: {},
  coverageFile: 'coverage.md',
};

describe('target hints', () => {
  it('lists the three known target ids', () => {
    expect([...TARGET_IDS]).toEqual(['tailwind', 'mui', 'flutter']);
    expect(Object.keys(TARGET_HINT_SCHEMAS)).toEqual([
      'tailwind',
      'mui',
      'flutter',
    ]);
    expect(Object.keys(targetsSchema.shape)).toEqual([...TARGET_IDS]);
  });

  it('tailwind hints accept an ignore list of known properties only', () => {
    expect(tailwindHintsSchema.safeParse({}).success).toBe(true);
    expect(tailwindHintsSchema.safeParse({ ignore: ['opacity'] }).success).toBe(
      true,
    );
    expect(
      tailwindHintsSchema.safeParse({ ignore: ['not-a-property'] }).success,
    ).toBe(false);
    expect(tailwindHintsSchema.safeParse({ other: 1 }).success).toBe(false);
  });

  it('rejects a repeated property in the ignore list', () => {
    const result = tailwindHintsSchema.safeParse({
      ignore: ['opacity', 'opacity'],
    });
    expect(result.success).toBe(false);
    expect(result.success ? '' : result.error.issues[0].message).toContain(
      'must not repeat a property',
    );
  });

  it('mui hints are strict: {} or { ignore } or excluded', () => {
    expect(targetsSchema.safeParse({ mui: {} }).success).toBe(true);
    expect(
      targetsSchema.safeParse({ mui: { ignore: ['opacity'] } }).success,
    ).toBe(true);
    expect(
      targetsSchema.safeParse({ mui: { excluded: 'later' } }).success,
    ).toBe(true);
    expect(
      targetsSchema.safeParse({ mui: { component: 'Button' } }).success,
    ).toBe(false);
    expect(
      targetsSchema.safeParse({ mui: { ignore: ['colour'] } }).success,
    ).toBe(false);
    expect(targetsSchema.safeParse({ mui: { ignore: [] } }).success).toBe(
      false,
    );
    // flutter stays permissive until its plugin lands
    expect(
      targetsSchema.safeParse({ flutter: { variantWidgets: {} } }).success,
    ).toBe(true);
  });

  it('reports DS-E020 for a non-kebab-case target id, naming the offending key', () => {
    const badKey = new Diagnostics();
    parseManifest(
      { name: 'chip', displayName: 'Chip', targets: { 'Not An Id': {} } },
      'chip.manifest.json',
      'chip',
      badKey,
    );
    expect(badKey.items.map((d) => d.code)).toEqual(['DS-E020']);
    expect(badKey.items[0].message).toContain('Not An Id');

    const badKey2 = new Diagnostics();
    parseManifest(
      { name: 'chip', displayName: 'Chip', targets: { tail_wind: {} } },
      'chip.manifest.json',
      'chip',
      badKey2,
    );
    expect(badKey2.items.map((d) => d.code)).toEqual(['DS-E020']);
    expect(badKey2.items[0].message).toContain('tail_wind');
  });

  it('the manifest validates tailwind and mui hints and keeps flutter permissive', () => {
    const base = { name: 'chip', displayName: 'Chip' };
    const ok = new Diagnostics();
    parseManifest(
      {
        ...base,
        targets: {
          tailwind: { ignore: ['opacity'] },
          mui: { ignore: ['opacity'] },
          flutter: { component: 'Chip', anything: true },
          other: { whatever: 1 },
        },
      },
      'chip.manifest.json',
      'chip',
      ok,
    );
    expect(ok.items).toEqual([]);

    const bad = new Diagnostics();
    parseManifest(
      { ...base, targets: { tailwind: { ignore: ['nope'] } } },
      'chip.manifest.json',
      'chip',
      bad,
    );
    expect(bad.items.map((d) => d.code)).toEqual(['DS-E020']);
    expect(bad.items[0].message).toContain('targets.tailwind.ignore');

    for (const target of ['tailwind', 'mui', 'other']) {
      const malformed = new Diagnostics();
      parseManifest(
        { ...base, targets: { [target]: { excluded: '' } } },
        'chip.manifest.json',
        'chip',
        malformed,
      );
      expect(malformed.items.map((d) => d.code)).toEqual(['DS-E020']);
    }
  });
});

describe('target registry', () => {
  it('registers the tailwind and mui plugins', () => {
    expect(Object.keys(TARGETS).sort()).toEqual(['mui', 'tailwind']);
    expect(getTarget('tailwind')?.id).toBe('tailwind');
    expect(getTarget('mui')?.id).toBe('mui');
    expect(getTarget('flutter')).toBeNull();
  });
});

describe('outDirFor', () => {
  it('defaults to a sibling styles-<id> package and honours config overrides', () => {
    expect(outDirFor('/repo/packages/styles-css', config, 'tailwind')).toBe(
      '/repo/packages/styles-tailwind/src/generated',
    );
    const custom: DsConfig = {
      ...config,
      targets: { tailwind: { outDir: 'out/tw' } },
    };
    expect(outDirFor('/repo/packages/styles-css', custom, 'tailwind')).toBe(
      '/repo/packages/styles-css/out/tw',
    );
  });
});
