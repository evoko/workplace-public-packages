/**
 * Every generated component's descriptor, one file each beside this one (`button.mjs`,
 * `icon-button.mjs`…): what the pipeline knows about it beyond its IR. The emitters, the scaffolder
 * and the stage read them from here, so a new component is new files, and no list to edit.
 *
 *   name       the component's name in code: its Figma name, or its overlay's codeName
 *   address    how the catalog finds it, where that is not `name` (`calendar/Day Cell`)
 *   mui        slots, resets, svgLayers, states, overlaps, restates (src/emit/mui-component.mjs)
 *   flutter    style, shared (src/emit/flutter-component.mjs)
 *   templates  react and flutter: the shells `solar:scaffold` writes once (src/scaffold/)
 */

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { byCodeUnit } from '../util/sort.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const files = readdirSync(here)
  .filter((f) => f.endsWith('.mjs') && f !== 'index.mjs')
  .sort(byCodeUnit);

/** The descriptors, sorted by name. */
export const DESCRIPTORS = (
  await Promise.all(
    files.map(async (f) => {
      const d = (await import(pathToFileURL(join(here, f)).href)).default;
      if (!d?.name)
        throw new Error(
          `src/components/${f}: exports no descriptor with a name`,
        );
      return d;
    }),
  )
).sort((a, b) => byCodeUnit(a.name, b.name));

/** One per-component table, keyed by component name: `table('mui', 'slots')`. */
export const table = (part, key) =>
  Object.fromEntries(
    DESCRIPTORS.filter((d) => d[part]?.[key] !== undefined).map((d) => [
      d.name,
      d[part][key],
    ]),
  );
