/**
 * The web's class names in two name spaces (src/util/classes.mjs): public, `Solar<Name>-<slot>`,
 * for a layer the caller fills, by its slot's name; internal, `Solar<Name>--<layer>`, for every
 * other layer, by the name Figma gives it. A designer renaming a layer changes an internal class
 * only, so no app styling a public hook breaks.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  byPrefix,
  classesOf,
  layerClass,
  prefixOf,
  publicLayers,
  withLayerClasses,
} from '../src/util/classes.mjs';
import { slotsOf } from '../src/emit/mui-component.mjs';
import { packagesDir, specDir } from '../src/util/paths.mjs';

const specs = readdirSync(join(specDir, 'components')).map((f) =>
  JSON.parse(readFileSync(join(specDir, 'components', f), 'utf8')),
);
const of = (name) => specs.find((s) => s.component === name);

describe('a layer’s class', () => {
  it('is its slot’s where the caller fills it, and internal otherwise', () => {
    const card = of('Card');
    // The slot `title` is the words, /Title/Title; the layer Figma names Title is the row around it.
    expect(publicLayers(card).titleTitle).toBe('title');
    expect(layerClass(card, 'titleTitle')).toBe('SolarCard-title');
    expect(layerClass(card, 'title')).toBe('SolarCard--title');
    expect(layerClass(card, 'root')).toBeNull();
  });

  it('is what the recipe styles and the check finds, for a drawn component', () => {
    const tag = of('Tag');
    expect(slotsOf(tag).label).toBe('& .SolarTag-label');
    expect(slotsOf(tag).iconClose).toBe('& .SolarTag--iconClose');
    expect(slotsOf(tag).root).toBe('&');
    expect(classesOf(tag).iconClose).toBe('SolarTag--iconClose');
  });

  it('is written as its own where a helper names it by the layer, a slot’s name passing', () => {
    const classes = byPrefix(specs);
    expect(
      withLayerClasses(
        '& .SolarCard-titleTitle, & .SolarCard-title, & .SolarCard-press, & .SolarGlyph-fill',
        classes,
      ),
    ).toBe(
      '& .SolarCard-title, & .SolarCard-title, & .SolarCard-press, & .SolarGlyph-fill',
    );
    expect(withLayerClasses('.SolarTag-iconClose', classes)).toBe(
      '.SolarTag--iconClose',
    );
    // Twice is once: an internal class is never read as a layer again.
    expect(withLayerClasses('.SolarTag--iconClose', classes)).toBe(
      '.SolarTag--iconClose',
    );
  });
});

describe('the generated code', () => {
  const files = [
    ...readdirSync(
      join(packagesDir, 'styles/src/generated/mui/components'),
    ).map((f) => join(packagesDir, 'styles/src/generated/mui/components', f)),
    ...readdirSync(join(packagesDir, 'components/src'))
      .filter((f) => f.endsWith('.tsx'))
      .map((f) => join(packagesDir, 'components/src', f)),
  ];
  const prefixes = byPrefix(specs);

  it('names no layer publicly but a slot’s: every other is internal', () => {
    const wrong = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const [, prefix, name] of text.matchAll(
        /\b(Solar[A-Z][A-Za-z0-9]*)-([a-z][A-Za-z0-9]*)\b/g,
      )) {
        const spec = prefixes.get(prefix);
        if (!spec) continue;
        const layer = name.replace(/Control$/, '');
        const slots = new Set(Object.values(publicLayers(spec)));
        if (layer in spec.layers && !slots.has(layer))
          wrong.push(`${file.split('/').pop()}: ${prefix}-${name}`);
      }
    }
    expect([...new Set(wrong)]).toEqual([]);
  });

  it('gives every drawn component’s slots their public class', () => {
    for (const spec of specs) {
      const table = slotsOf(spec);
      if (!table || typeof table !== 'object') continue;
      for (const [layer, slot] of Object.entries(publicLayers(spec)))
        if (table[layer]?.startsWith('& .Solar'))
          expect(table[layer], spec.component).toBe(
            `& .${prefixOf(spec.component)}-${slot}`,
          );
    }
  });
});
