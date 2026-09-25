// The component stage: spec/components/<name>.json and spec/verify/<name>.json from docs/solar-web,
// then each component's recipes, its stories (its shells are files, checked here) and the registries.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../normalize/components.mjs';
import { DESCRIPTORS } from '../components/index.mjs';
import {
  loadDefaults,
  loadExcluded,
  loadOverlay,
} from '../normalize/overlay.mjs';
import { tokenNames } from '../normalize/recipe.mjs';
import { buildTokenSpec, loadContract } from '../normalize/tokens.mjs';
import { emitMuiComponents } from '../emit/mui-component.mjs';
import { emitFlutterComponents } from '../emit/flutter-component.mjs';
import { emitRegistries } from '../emit/registries.mjs';
import { emitMuiThemeComponents } from '../emit/mui-theme-components.mjs';
import { pascal } from '../util/naming.mjs';
import { componentsSrc, renderShells, shellFileOf } from '../shells/index.mjs';
import { buildOracle, hideInComposed, withDark } from '../verify/oracle.mjs';
import { specDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';

export const name = 'components';

/**
 * The components generated so far, by their addresses: the Figma name, or `<section>/<name>` where
 * two components share it (see findEntry). Milestone 4 adds the rest.
 */
export const COMPONENTS = DESCRIPTORS.map((d) => d.address ?? d.name);

/**
 * The same components by their names in code: what their files, tables, cases and stories are
 * named after (`Calendar Day Cell`, where `COMPONENTS` has `calendar/Day Cell`).
 */
export const NAMES = DESCRIPTORS.map((d) => d.name);

/**
 * Whether a component has shells, and so is exported: not one checked as another's state
 * (Autocomplete Open, an open Autocomplete), which has a case and a story alone.
 */
export const shelled = (name) =>
  !DESCRIPTORS.find((d) => d.name === name)?.checkedAs;

export const componentsDir = join(specDir, 'components');
export const verifyDir = join(specDir, 'verify');

/** `Button` to `button.json`, `Icon Button` to `icon-button.json`. */
export const fileOf = (component) =>
  `${component.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;

export function build() {
  // A component left out of the flow by decision is never generated.
  const excluded = loadExcluded();
  for (const address of COMPONENTS)
    if (excluded[address])
      throw new Error(
        `src/components: ${address} is left out of the flow (spec/overlay/excluded.yaml): ${excluded[address]}`,
      );
  const catalog = loadWebCatalog();
  const contract = loadContract();
  const names = tokenNames(contract);
  // The recipe emitters resolve a text style into its parts and check every custom property they
  // name exists, so they need the token spec as well as the component IR.
  const tokens = buildTokenSpec(contract).spec;
  const defaults = loadDefaults();
  const built = COMPONENTS.map((component) => {
    const loaded = loadComponent(catalog, component);
    const overlay = loadOverlay(component);
    const { spec, deviations } = buildComponentSpec(loaded, {
      names,
      fileVersion: catalog.fileVersion,
      overlay,
      defaults,
    });
    // Beside the IR, never from it: the oracle reads the Figma set, and the IR only for names.
    const at = (mode) =>
      buildOracle(loaded.set, spec, deviations, {
        tokens,
        names,
        overlay,
        fileVersion: catalog.fileVersion,
        mode,
      });
    // Light, with what Dark draws otherwise beside it: the checks measure both.
    const oracle = withDark(at('light'), at('dark'));
    return { spec, deviations, oracle, set: loaded.set, overlay };
  });
  // What an instance of another component hides of it, once every IR is built (a child may come
  // after its parent in the list).
  const specs = Object.fromEntries(
    built.map((b) => [b.spec.component, b.spec]),
  );
  for (const b of built)
    hideInComposed(b.oracle, b.spec, b.set, specs, b.overlay);
  for (const b of built) {
    delete b.set;
    delete b.overlay;
  }
  // Every file and class is named after the component, so two by one name would overwrite each
  // other: a Figma name two components share needs an overlay codeName for each.
  assertDistinct(built.map((b) => b.spec.component));
  // A descriptor's tables are looked up by the name the component is built under.
  DESCRIPTORS.forEach((d, i) => {
    if (built[i].spec.component !== d.name)
      throw new Error(
        `src/components: the descriptor ${d.name} builds as ${built[i].spec.component}; its name must be the component's name in code`,
      );
  });
  // The stories, with each component's shells checked here with the rest of the build: a shell
  // missing, or still under the generated header, stops the run before any write.
  const stories = renderShells(built.map((b) => b.spec));
  return { built, tokens, stories };
}

/** Refuses two components generated under one name, naming it. */
export function assertDistinct(names) {
  const seen = new Set();
  for (const name of names) {
    if (seen.has(name))
      throw new Error(
        `two components are generated as ${name}; give each an overlay codeName`,
      );
    seen.add(name);
  }
}

export function emit({ built, tokens, stories }) {
  for (const { spec } of built)
    writeGenerated(
      join(componentsDir, fileOf(spec.component)),
      JSON.stringify(
        {
          $description: `SOLAR ${spec.component}: public API, platform states, slots and style recipe in token names. Generated by @bwp-web/codegen from docs/solar-web. Do not edit; decisions go in spec/overlay/, and the ones applied are listed under overlay.`,
          ...spec,
        },
        null,
        2,
      ) + '\n',
    );
  for (const { spec, oracle } of built)
    writeGenerated(
      join(verifyDir, fileOf(spec.component)),
      JSON.stringify(oracle, null, 2) + '\n',
    );
  const specs = built.map((b) => b.spec);
  for (const { path, text } of stories) writeGenerated(path, text);
  return {
    counts: {
      specs: built.length,
      oracles: built.length,
      mui: emitMuiComponents(specs, tokens),
      muiTheme: emitMuiThemeComponents(specs),
      flutter: emitFlutterComponents(specs, tokens),
      stories: stories.length,
      registries: emitRegistries(
        specs.map((s) => s.component),
        {
          shelled,
          // Whose props type takes a type argument (Autocomplete's value, `<T>`).
          generic: (n) => {
            const file = join(componentsSrc, shellFileOf(n));
            return (
              existsSync(file) &&
              new RegExp(`export interface ${pascal(n)}Props<`).test(
                readFileSync(file, 'utf8'),
              )
            );
          },
        },
      ),
    },
    deviations: built.flatMap((b) => b.deviations),
  };
}
