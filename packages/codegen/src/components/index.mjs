/**
 * Every generated component's descriptor, one file each beside this one (`button.mjs`,
 * `icon-button.mjs`…): what the pipeline knows about it beyond its IR. The emitters, the shells
 * and the stage read them from here, so a new component is new files, and no list to edit.
 *
 *   name       the component's name in code: its Figma name, or its overlay's codeName
 *   address    how the catalog finds it, where that is not `name` (`calendar/Day Cell`)
 *   mui        slots (or 'drawn': every layer the shell draws, from the IR), resets, svgLayers,
 *              states, overlaps, restates (src/emit/mui-component.mjs)
 *   flutter    style, shared (src/emit/flutter-component.mjs), and groupDecides: the props a
 *              group decides in Flutter, not the widget (Radio's checked, its RadioGroup's)
 *   shells     how the shells name what the IR names otherwise, where they do: `label: 'label'`, a
 *              label that is a prop, not the children (a field's), and `flutter`, the props
 *              Flutter takes by another name (a field's `value` is its `controller`'s)
 *   templates  react and flutter: functions of the IR that solar:codegen renders into the shells
 *              on every run (src/shells/); the shells are never edited, the templates are
 *   owned      true for a component whose shells are hand-edited files instead: it has no
 *              templates, and solar:codegen leaves its shells alone (src/shells/index.mjs)
 */

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { byCodeUnit } from '../util/sort.mjs';

const here = dirname(fileURLToPath(import.meta.url));

const files = readdirSync(here)
  .filter((f) => f.endsWith('.mjs') && f !== 'index.mjs')
  .sort(byCodeUnit);

const loaded = await Promise.all(
  files.map(async (f) => {
    const d = (await import(pathToFileURL(join(here, f)).href)).default;
    if (!d?.name)
      throw new Error(`src/components/${f}: exports no descriptor with a name`);
    return { d, f };
  }),
);

/** The descriptors, sorted by name. */
export const DESCRIPTORS = loaded
  .map(({ d }) => d)
  .sort((a, b) => byCodeUnit(a.name, b.name));

const FILES = new Map(loaded.map(({ d, f }) => [d.name, f]));

/** A component's descriptor file, by its name in code: `Icon Button` to `icon-button.mjs`. */
export const fileOfDescriptor = (name) => {
  const f = FILES.get(name);
  if (!f) throw new Error(`no descriptor for ${name}`);
  return f;
};

/** One per-component table, keyed by component name: `table('mui', 'slots')`. */
export const table = (part, key) =>
  Object.fromEntries(
    DESCRIPTORS.filter((d) => d[part]?.[key] !== undefined).map((d) => [
      d.name,
      d[part][key],
    ]),
  );
