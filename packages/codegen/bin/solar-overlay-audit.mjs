#!/usr/bin/env node
// Audits the overlays: what they decide more than once, and what they decide that no longer needs
// deciding (src/report/overlay-audit.mjs). Prints markdown, or JSON.
//
//   npm run solar:overlay:audit
//   npm run solar:overlay:audit -- --json
//
// Read-only: it writes nothing, and is never part of solar:codegen. It reads the IRs the last
// solar:codegen wrote.
// First, before anything else loads: the Node this needs (.nvmrc).
import '../src/util/require-node.mjs';
import { loadOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { auditOverlays, renderAudit } from '../src/report/overlay-audit.mjs';
import { COMPONENTS, NAMES, fileOf } from '../src/stages/components.mjs';

const audit = auditOverlays({
  components: COMPONENTS,
  overlayOf: loadOverlay,
  names: tokenNames(loadContract()),
  // An overlay is found by the component's address, its IR by its name in code.
  fileOf: (address) => fileOf(NAMES[COMPONENTS.indexOf(address)]),
});
process.stdout.write(
  process.argv.includes('--json')
    ? JSON.stringify(audit, null, 2) + '\n'
    : renderAudit(audit),
);
