/**
 * The class a component's layer carries, for the tests that look for a layer in rendered HTML:
 * read from the component's IR by the codegen's own rule (`util/classes.mjs`), public for a slot's
 * layer (`SolarTag-label`) and internal for any other (`SolarTag--iconNone`), so a test never
 * spells one by hand.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { layerClass } from '../../codegen/src/util/classes.mjs';

const specs = new Map();
const specOf = (component) => {
  if (!specs.has(component))
    specs.set(
      component,
      JSON.parse(
        readFileSync(
          fileURLToPath(
            new URL(
              `../../../spec/components/${component.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`,
              import.meta.url,
            ),
          ),
          'utf8',
        ),
      ),
    );
  return specs.get(component);
};

/** The class of `layer` in `component`, as the recipe styles it. */
export const cls = (component, layer) => {
  const spec = specOf(component);
  if (!(layer in spec.layers))
    throw new Error(`${component} has no layer ${layer}`);
  return layerClass(spec, layer);
};
