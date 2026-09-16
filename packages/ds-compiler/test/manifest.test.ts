import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import {
  loadManifest,
  manifestJsonSchema,
  parseManifest,
} from '../src/components/manifest.js';
import { stableStringify } from '../src/ir/serialize.js';

const here = dirname(fileURLToPath(import.meta.url));
const schemaFile = join(here, '..', 'schemas', 'manifest.schema.json');

const valid = {
  name: 'button',
  displayName: 'Button',
  axes: {
    variant: { values: ['solid', 'outline'], default: 'solid' },
    size: { values: ['sm', 'md'], default: 'md' },
  },
  states: ['hover', 'focus-visible', 'disabled'],
  slots: { root: { element: 'button' }, icon: { optional: true } },
  preview: { label: 'Button' },
  targets: { tailwind: {}, mui: { excluded: 'not yet' } },
};

describe('parseManifest', () => {
  it('accepts a valid manifest and applies defaults', () => {
    const diag = new Diagnostics();
    const m = parseManifest(valid, 'button.manifest.json', 'button', diag);
    expect(diag.items).toEqual([]);
    expect(m).toEqual({
      name: 'button',
      displayName: 'Button',
      axes: valid.axes,
      states: ['hover', 'focus-visible', 'disabled'],
      slots: {
        root: { element: 'button', optional: false },
        icon: { element: 'span', optional: true },
      },
      preview: { label: 'Button' },
      targets: { tailwind: {}, mui: { excluded: 'not yet' } },
    });
  });

  it('adds an implicit root slot with element div when missing', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      { name: 'card', displayName: 'Card' },
      'card.manifest.json',
      'card',
      diag,
    );
    expect(m?.slots).toEqual({ root: { element: 'div', optional: false } });
    expect(m?.axes).toEqual({});
    expect(m?.states).toEqual([]);
    expect(m?.targets).toEqual({});
  });

  it('reports DS-E020 for missing displayName, unknown keys, and non-kebab identifiers', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      { name: 'button', colour: 'x', slots: { Icon: {} } },
      'button.manifest.json',
      'button',
      diag,
    );
    expect(m).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E020');
    expect(diag.errors[0].message).toContain('displayName');
    expect(diag.errors[0].message).toContain('colour');
    expect(diag.errors[0].message).toContain('Icon');
  });

  it('reports DS-E020 for a bad axis default and duplicate states when the shape is valid', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      {
        name: 'button',
        displayName: 'B',
        axes: { size: { values: ['sm'], default: 'lg' } },
        states: ['hover', 'hover'],
      },
      'button.manifest.json',
      'button',
      diag,
    );
    expect(m).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E020');
    expect(diag.errors[0].message).toContain('default');
    expect(diag.errors[0].message).toContain('hover');
  });

  it('reports DS-E021 when the name does not match the directory', () => {
    const diag = new Diagnostics();
    expect(
      parseManifest(valid, 'x/button.manifest.json', 'btn', diag),
    ).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E021');
  });

  it('reports DS-E020 for a malformed excluded target hint', () => {
    const diag1 = new Diagnostics();
    const m1 = parseManifest(
      {
        name: 'button',
        displayName: 'Button',
        targets: { mui: { excluded: '' } },
      },
      'button.manifest.json',
      'button',
      diag1,
    );
    expect(m1).toBeNull();
    expect(diag1.errors[0].code).toBe('DS-E020');
    expect(diag1.errors[0].message).toContain('excluded');

    const diag2 = new Diagnostics();
    const m2 = parseManifest(
      {
        name: 'button',
        displayName: 'Button',
        targets: { mui: { excluded: 123 } },
      },
      'button.manifest.json',
      'button',
      diag2,
    );
    expect(m2).toBeNull();
    expect(diag2.errors[0].code).toBe('DS-E020');
    expect(diag2.errors[0].message).toContain('excluded');
  });

  it('defaults an explicitly present root slot to element div, not the generic span default', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      { name: 'card', displayName: 'Card', slots: { root: {} } },
      'card.manifest.json',
      'card',
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(m?.slots.root).toEqual({ element: 'div', optional: false });
  });

  it('reports DS-E020 when the root slot is marked optional', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      {
        name: 'card',
        displayName: 'Card',
        slots: { root: { optional: true } },
      },
      'card.manifest.json',
      'card',
      diag,
    );
    expect(m).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E020');
    expect(diag.errors[0].message).toContain('slots.root.optional');
  });

  it('accepts axis values that start with a digit', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      {
        name: 'button',
        displayName: 'Button',
        axes: { size: { values: ['sm', '2xl'], default: 'sm' } },
      },
      'button.manifest.json',
      'button',
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(m?.axes.size.values).toEqual(['sm', '2xl']);
  });

  it('reports DS-E020 for an unknown baseline property', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      { name: 'button', displayName: 'Button', baseline: ['colour'] },
      'button.manifest.json',
      'button',
      diag,
    );
    expect(m).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E020');
    expect(diag.errors[0].message).toContain('baseline');
    expect(diag.errors[0].message).toContain('colour');
  });
});

describe('loadManifest', () => {
  it('reads and validates a file, reporting DS-E020 for bad JSON', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-manifest-'));
    const good = join(dir, 'button.manifest.json');
    writeFileSync(good, JSON.stringify(valid));
    const bad = join(dir, 'bad.manifest.json');
    writeFileSync(bad, '{');
    const diag = new Diagnostics();
    expect(loadManifest(good, 'button', diag)?.name).toBe('button');
    expect(loadManifest(bad, 'bad', diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E020']);
  });
});

describe('manifestJsonSchema', () => {
  it('exports a JSON schema with the top-level properties', () => {
    const schema = manifestJsonSchema() as {
      properties: Record<string, unknown>;
      required: string[];
    };
    expect(Object.keys(schema.properties)).toEqual(
      expect.arrayContaining([
        'name',
        'displayName',
        'axes',
        'states',
        'slots',
        'targets',
      ]),
    );
    expect(schema.required.slice().sort()).toEqual(['displayName', 'name']);
  });

  it('matches the committed schemas/manifest.schema.json exactly', () => {
    const generated = `${stableStringify(manifestJsonSchema())}\n`;
    const committed = readFileSync(schemaFile, 'utf8');
    expect(generated).toBe(committed);
  });
});
