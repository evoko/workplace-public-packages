import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { EXT, flattenSpec, readSpec } from '../src/spec.mjs';
import { specDir } from '../src/util/paths.mjs';
import { byCodeUnit } from '../src/util/sort.mjs';

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

// spec/icons.json is the same kind of artifact and has the same blind spot: the icon emitters
// run against the spec buildIconSpec holds in memory, so a stale file on disk would fail nothing
// else in the suite. It is not DTCG, so flattenSpec does not read it; the flattener below walks
// its two sections into one comparable row per variant.
const committedIcons = join(specDir, 'icons.json');

/** One row per icon and logo variant: its geometry, or what stands in for it. */
function flattenIconSpec(spec) {
  const rows = [];
  for (const [section, entries] of Object.entries(spec)) {
    if (section.startsWith('$')) continue;
    for (const [key, entry] of Object.entries(entries)) {
      for (const [variant, art] of Object.entries(entry.variants ?? {}))
        rows.push({
          name: `${section}.${key}.${variant}`,
          component: entry.component,
          // Spelled out rather than spread, so a field the spec gains is not compared by
          // accident and a field it loses is a visible undefined on one side only.
          viewBox: art.viewBox ?? null,
          unsupported: art.unsupported ?? null,
          source: art.source ?? null,
          paths: (art.paths ?? []).map((p) => ({
            d: p.d,
            fillRule: p.fillRule ?? null,
            fill: p.fill ?? null,
          })),
        });
      // A raster set has files where a vector set has variants.
      for (const [variant, file] of Object.entries(entry.files ?? {}))
        rows.push({
          name: `${section}.${key}.${variant}`,
          component: entry.component,
          file,
          digest: entry.digests?.[variant] ?? null,
        });
    }
  }
  return rows.sort((a, b) => byCodeUnit(a.name, b.name));
}

describe('the committed icon spec', () => {
  it('exists, because it is a checked-in artifact and not a build temporary', () => {
    expect(
      existsSync(committedIcons),
      `${committedIcons} is missing; run npm run solar:codegen`,
    ).toBe(true);
  });

  it('holds exactly the icons the emitters are handed', () => {
    const inMemory = flattenIconSpec(buildIconSpec(loadIconCatalog()).spec);
    const onDisk = flattenIconSpec(
      JSON.parse(readFileSync(committedIcons, 'utf8')),
    );
    // Not just a count: every viewBox and every path string, so a regenerated icon that changed
    // shape without changing the inventory still shows up.
    expect(onDisk.map((r) => r.name)).toEqual(inMemory.map((r) => r.name));
    expect(onDisk).toEqual(inMemory);
  });

  it('records where the icons came from', () => {
    const ext = JSON.parse(readFileSync(committedIcons, 'utf8')).$extensions[
      EXT
    ];
    expect(ext.source.fileVersion).toBeTruthy();
    expect(ext.source.sourceFetchedOn).toBeTruthy();
    // The count the catalog claims is the count the spec carries, so a half-read catalog is
    // not recorded as a complete one.
    expect(ext.source.count).toBe(
      Object.keys(JSON.parse(readFileSync(committedIcons, 'utf8')).icons)
        .length,
    );
  });
});
