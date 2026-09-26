/**
 * Every generated component's descriptor, one file each beside this one (`button.mjs`,
 * `icon-button.mjs`…): what the pipeline knows about it beyond its IR. The emitters, the parity
 * test and the stage read them from here, so a new component is new files, and no list to edit.
 * Its shells, the React component and the Flutter widget, are files of their own, written by hand
 * (src/shells/index.mjs). What several descriptors share is in `shared/`.
 *
 *   name       the component's name in code: its Figma name, or its overlay's codeName
 *   address    how the catalog finds it, where that is not `name` (`calendar/Day Cell`)
 *   mui        slots (or 'drawn': every layer the shell draws, from the IR), resets, svgLayers,
 *              states, overlaps, restates (src/emit/mui-component.mjs)
 *   flutter    style, shared, states (src/emit/flutter-component.mjs: a platform state's own
 *              test, the Flutter side of mui.states)
 *   api        how each platform reaches what the IR names, where not by its own name or its
 *              platform's convention: `{ react: {…}, flutter: {…} }`, each IR prop or slot to the
 *              member that reaches it (`label: 'title'`; `value: 'controller'`, a Flutter field's),
 *              `{ group: 'RadioGroup' }` where a platform group decides it, or null where the shell
 *              fills it itself (src/shells/api.mjs, which the component-parity test checks)
 *   checkedAs  the component a Figma component is the state of, where it is no component of its
 *              own (Autocomplete Open, an open Autocomplete): it has a recipe, a case on each
 *              platform and a story, but no shells, and nothing is exported for it
 *   library    the chart library that draws it (`'charts'`: Bar Chart's, MUI X Charts and
 *              fl_chart): its IR and oracle are built and its cells feed the chart theme
 *              (src/emit/chart-theme.mjs), but it has no recipe, shell, case or story of its own
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
    // A component's shells are hand-written files (src/shells/index.mjs), never descriptor keys.
    for (const key of ['templates', 'owned'])
      if (key in d)
        throw new Error(
          `src/components/${f}: ${key} is not a descriptor key: a component's shells are files of their own, written by hand`,
        );
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
