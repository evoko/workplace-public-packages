import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { EXT, flattenSpec, readSpec } from '../src/spec.mjs';
import { specDir } from '../src/util/paths.mjs';

// spec/tokens.json is the contract every target is generated from, and it is committed so that
// later milestones and outside consumers can read it without rebuilding. The emitters, though,
// run against the spec held in memory, so nothing else in the suite would notice if the file on
// disk drifted from it. These tests compare the two.
const committed = join(specDir, 'tokens.json');

describe('the committed token spec', () => {
  it('exists, because it is a checked-in artifact and not a build temporary', () => {
    expect(
      existsSync(committed),
      `${committed} is missing; run npm run solar:codegen`,
    ).toBe(true);
  });

  it('holds exactly the tokens the emitters are handed', () => {
    const inMemory = flattenSpec(buildTokenSpec(loadContract()).spec);
    const onDisk = flattenSpec(readSpec());
    const key = (t) => JSON.stringify([t.name, t.type, t.value, t.modes]);
    expect(onDisk.map(key).sort()).toEqual(inMemory.map(key).sort());
  });

  it('records where both Figma files came from', () => {
    const ext = readSpec().$extensions[EXT];
    expect(ext.source.fileKey).toBeTruthy();
    expect(ext.source.exportedOn).toBeTruthy();
    // The Layout collection comes from SOLAR Web, a different file captured on its own date.
    expect(ext.layout.collection).toBe('Layout');
    expect(ext.layout.fileKey).not.toBe(ext.source.fileKey);
  });

  it('keeps a name that is both a value and a group, rather than renaming it', () => {
    // color.border.inverse is used in Figma as a value and as a namespace; the flattener has to
    // walk into it instead of stopping at the leaf, or its children vanish silently.
    const names = new Set(flattenSpec(readSpec()).map((t) => t.name));
    expect(names).toContain('color.border.inverse');
    expect([...names].some((n) => n.startsWith('color.border.inverse.'))).toBe(
      true,
    );
  });
});
