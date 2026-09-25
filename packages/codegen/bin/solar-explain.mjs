#!/usr/bin/env node
// Explains why a component draws what it draws: for each layer and property of a variant, Figma's
// value, the recipe entry that wins and its token, where the entry came from and why, what excuses
// a difference, and what each platform drew in its last visual check. Writes nothing.
//
//   npm run solar:explain -- "Text Input"                       the variants, every excused
//                                                               difference, the last failures
//   npm run solar:explain -- "Text Input" --variant 5           one variant, by its number
//   npm run solar:explain -- "Text Input" --variant "state=hover"
//                                                               every variant with those parts
//   npm run solar:explain -- "Text Input" --variant 5 --layer field --property paddingLeft
//   ... --full                                                  every row in full, not only those
//                                                               that differ
//
// Built from the current sources in memory, so it explains what the next rebuild writes; the
// platforms' columns are the reports of the last `npm run test:visual` and `flutter test`.
// First, before anything else loads: the Node this needs (.nvmrc).
import '../src/util/require-node.mjs';
import * as stage from '../src/stages/components.mjs';
import {
  explainVariant,
  formatSummary,
  formatVariant,
  loadReports,
  pickVariants,
} from '../src/explain/index.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const value = args[i + 1];
  if (value === undefined || value.startsWith('--')) {
    console.error(`--${name} needs a value`);
    process.exit(2);
  }
  args.splice(i, 2);
  return value;
};
const variantQuery = flag('variant');
const layer = flag('layer');
const property = flag('property');
const full = args.includes('--full');
const names = args.filter((a) => !a.startsWith('--'));
if (names.length !== 1) {
  console.error(
    'usage: npm run solar:explain -- "<Component>" [--variant <number | name | axis=value, …>] [--layer <name>] [--property <name>] [--full]',
  );
  process.exit(2);
}

const { built, tokens } = stage.build();
const wanted = names[0].toLowerCase();
const found = built.find(
  (b, i) =>
    b.spec.component.toLowerCase() === wanted ||
    stage.COMPONENTS[i].toLowerCase() === wanted,
);
if (!found) {
  console.error(
    `no component ${names[0]}; generated: ${built.map((b) => b.spec.component).join(', ')}`,
  );
  process.exit(1);
}
const ctx = {
  spec: found.spec,
  oracle: found.oracle,
  tokens,
  reports: loadReports(found.spec.component),
};
if (layer && !(layer in found.spec.layers)) {
  console.error(
    `${found.spec.component} has no layer ${layer}; its layers: ${Object.keys(found.spec.layers).join(', ')}`,
  );
  process.exit(1);
}

if (variantQuery === undefined && !layer && !property) {
  console.log(formatSummary(ctx));
} else {
  const variants =
    variantQuery === undefined
      ? found.oracle.variants
      : pickVariants(found.oracle, variantQuery);
  if (!variants.length) {
    console.error(
      `no variant of ${found.spec.component} matches ${variantQuery}; run without --variant to list them`,
    );
    process.exit(1);
  }
  const blocks = variants.map((v) =>
    formatVariant(ctx, v, explainVariant(ctx, v, { layer, property }), {
      full: full || Boolean(property),
    }),
  );
  console.log(blocks.join('\n\n'));
}
