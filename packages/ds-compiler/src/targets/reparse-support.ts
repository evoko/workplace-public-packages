import type { Manifest } from '../components/manifest.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { ComponentIR } from '../ir/types.js';

/**
 * A manifest equivalent to a component IR, for re-parsing generated output.
 * Baseline warnings are irrelevant here. `axes` and `slots` are rebuilt in
 * `axisOrder`/`slotOrder` rather than passed through as-is, because a
 * component IR read back from `design.ir.json` has those records
 * alphabetized by `serializeIR`; without this, a generator that trusts key
 * order (e.g. MUI's variant/prop order) would produce different output for
 * the same design system depending on whether it started from the in-memory
 * IR or the serialized one.
 */
export function manifestFromComponent(c: ComponentIR): Manifest {
  return {
    name: c.name,
    displayName: c.displayName,
    description: c.description,
    axes: Object.fromEntries(c.axisOrder.map((a) => [a, c.axes[a]])),
    states: c.states,
    slots: Object.fromEntries(c.slotOrder.map((s) => [s, c.slots[s]])),
    preview: c.preview,
    baseline: false,
    targets: c.targets,
  };
}

export interface OriginalSelector {
  selector: string;
  location: SourceLocation;
}

/**
 * `originals` (the order rules appeared in the generated output) must equal
 * `rendered` (the canonical cascade order `parseComponentCss` recomputes)
 * element for element. A literal duplicate is `duplicate rule`; a count
 * mismatch is `expected <n> rules, found <m>`; a per-index mismatch names the
 * original and the canonical form at that position.
 */
export function verifySelectorOrder(
  originals: readonly OriginalSelector[],
  rendered: readonly string[],
  fallback: SourceLocation,
  diag: Diagnostics,
): void {
  const seen = new Set<string>();
  for (const o of originals) {
    if (seen.has(o.selector)) {
      diag.add('DS-E030', `duplicate rule "${o.selector}"`, o.location);
      return;
    }
    seen.add(o.selector);
  }
  if (originals.length !== rendered.length) {
    diag.add(
      'DS-E030',
      `expected ${rendered.length} rules, found ${originals.length}`,
      originals[0]?.location ?? fallback,
    );
    return;
  }
  for (let i = 0; i < originals.length; i += 1) {
    if (originals[i].selector !== rendered[i]) {
      diag.add(
        'DS-E030',
        `selector "${originals[i].selector}" is not the canonical form "${rendered[i]}"`,
        originals[i].location,
      );
      return;
    }
  }
}
