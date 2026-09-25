/**
 * The per-component descriptors (src/components/): one file per component, found by the index, and
 * the only place a component's tables live; its shells are files of their own.
 */

import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DESCRIPTORS, table } from '../src/components/index.mjs';
import { MUI_SLOTS, STATE_SELECTORS } from '../src/emit/mui-component.mjs';
import { FLUTTER_STYLE } from '../src/emit/flutter-component.mjs';
import { COMPONENTS } from '../src/stages/components.mjs';
import { packagesDir } from '../src/util/paths.mjs';

describe('the component descriptors', () => {
  it('are one file each, every one found, sorted by name', () => {
    const dir = join(packagesDir, 'codegen', 'src', 'components');
    const files = readdirSync(dir).filter(
      (f) => f.endsWith('.mjs') && f !== 'index.mjs',
    );
    expect(DESCRIPTORS).toHaveLength(files.length);
    const names = DESCRIPTORS.map((d) => d.name);
    expect(names).toEqual([...names].sort());
    expect(COMPONENTS).toEqual(DESCRIPTORS.map((d) => d.address ?? d.name));
  });

  it('are what the emitters’ tables read, by name', () => {
    expect(Object.keys(MUI_SLOTS).sort()).toEqual(
      DESCRIPTORS.map((d) => d.name).sort(),
    );
    expect(STATE_SELECTORS['Icon Button']).toBe(
      DESCRIPTORS.find((d) => d.name === 'Icon Button').mui.states,
    );
    expect(Object.keys(FLUTTER_STYLE).sort()).toEqual(
      DESCRIPTORS.filter((d) => d.flutter?.style)
        .map((d) => d.name)
        .sort(),
    );
    expect(table('mui', 'svgLayers')).toEqual({
      Spinner: ['track', 'indicator'],
    });
  });

  it('refuses a descriptor still holding templates, or owned, since every shell is a file', () => {
    for (const d of DESCRIPTORS) {
      expect(d, d.name).not.toHaveProperty('templates');
      expect(d, d.name).not.toHaveProperty('owned');
    }
  });
});
