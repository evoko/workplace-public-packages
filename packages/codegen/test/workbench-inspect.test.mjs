import { beforeAll, describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { inspect } from '../src/workbench/inspect.mjs';

let build;
beforeAll(() => {
  build = stage.build();
});

describe('a component’s inspection', () => {
  it('lists its variants and, for the one asked, each layer’s cells', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    expect(i.component).toBe('Button');
    expect(i.variants[0]).toEqual({
      index: 0,
      name: build.built.find((b) => b.spec.component === 'Button').oracle
        .variants[0].figma,
    });
    const root = i.layers.find((l) => l.name === 'root');
    expect(root.className).toBeNull();
    const bg = root.cells.find((c) => c.cell === 'background');
    expect(bg.entry).toMatch(/^color\./);
    expect(bg.at).toBeTruthy();
    expect(bg.scopes[0].key).toBe('root.base.background');
    expect(bg.choices.length).toBeGreaterThan(10);
    expect(bg.keywords).toEqual([]);
  });

  it('reads a text style as one cell, not six properties', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const label = i.layers.find((l) => l.name === 'label');
    expect(label.cells.filter((c) => c.cell === 'typography')).toHaveLength(1);
    expect(label.className).toBe('SolarButton-label');
  });

  it('offers FILL and HUG on a width', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const w = i.layers.flatMap((l) => l.cells).find((c) => c.cell === 'width');
    expect(w).toBeDefined();
    expect(w.keywords).toEqual(['FILL', 'HUG']);
  });

  it('offers nothing on a raw value the overlay allows, and says to Report it', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const counter = i.layers.find((l) => l.name === 'counter');
    const height = counter.cells.find((c) => c.cell === 'height');
    expect(height.entry).toMatch(/literal/);
    expect(height).toMatchObject({
      choices: [],
      keywords: [],
      none: false,
      note: 'a raw value the overlay allows (allowLiteral): use Report',
    });
    const bg = i.layers
      .find((l) => l.name === 'root')
      .cells.find((c) => c.cell === 'background');
    expect(bg.none).toBe(true);
    expect(bg.note).toBeUndefined();
  });

  it('carries the overlay file’s revision, for refusing a stale write', () => {
    const a = inspect(build, 'Button', 0, { overlayText: 'a' });
    const b = inspect(build, 'Button', 0, { overlayText: 'b' });
    expect(a.revision).not.toBe(b.revision);
  });

  it('fails for a component that does not exist', () => {
    expect(() => inspect(build, 'Nope', 0, { overlayText: '' })).toThrow(
      /no component Nope/,
    );
  });
});
