import type { Diagnostics, SourceLocation } from '../errors.js';
import { stableStringify } from '../ir/serialize.js';
import type { IRValue, Rule } from '../ir/types.js';
import type { Manifest } from './manifest.js';
import { compareStates } from './states.js';

/** Identity of a rule: slot, selected axes (in manifest order), and sorted states. */
export function ruleKey(
  slot: string,
  axes: Record<string, string>,
  states: readonly string[],
  axisOrder: readonly string[],
): string {
  const axisPart = axisOrder
    .filter((a) => a in axes)
    .map((a) => `${a}=${axes[a]}`)
    .join(',');
  return `${slot}|${axisPart}|${states.join(',')}`;
}

/** Adds declarations to a rule; a different value for an existing property is DS-E046. */
export function mergeDeclarations(
  rule: Rule,
  incoming: Record<string, IRValue>,
  location: SourceLocation,
  diag: Diagnostics,
): void {
  for (const [prop, value] of Object.entries(incoming)) {
    const existing = rule.declarations[prop];
    if (existing && stableStringify(existing) !== stableStringify(value)) {
      diag.add(
        'DS-E046',
        `"${prop}" is already set to a different value for this slot, axes, and states (first at ${rule.source.file}:${rule.source.line})`,
        location,
      );
      continue;
    }
    rule.declarations[prop] = value;
  }
}

/**
 * Cascade order: slot (manifest order, root first), then fewer axes first,
 * then axis values in manifest order, then fewer states first, then state order.
 */
export function compareRules(a: Rule, b: Rule, manifest: Manifest): number {
  const slots = Object.keys(manifest.slots);
  const bySlot = slots.indexOf(a.slot) - slots.indexOf(b.slot);
  if (bySlot !== 0) {
    return bySlot;
  }
  const aCount = Object.keys(a.axes).length;
  const bCount = Object.keys(b.axes).length;
  if (aCount !== bCount) {
    return aCount - bCount;
  }
  for (const axis of Object.keys(manifest.axes)) {
    const av = a.axes[axis];
    const bv = b.axes[axis];
    if (av === undefined && bv === undefined) {
      continue;
    }
    if (av === undefined) {
      return 1;
    }
    if (bv === undefined) {
      return -1;
    }
    const values = manifest.axes[axis].values;
    const d = values.indexOf(av) - values.indexOf(bv);
    if (d !== 0) {
      return d;
    }
  }
  if (a.states.length !== b.states.length) {
    return a.states.length - b.states.length;
  }
  for (let i = 0; i < a.states.length; i += 1) {
    const d = compareStates(a.states[i], b.states[i]);
    if (d !== 0) {
      return d;
    }
  }
  return 0;
}

export function sortRules(rules: readonly Rule[], manifest: Manifest): Rule[] {
  return [...rules].sort((a, b) => compareRules(a, b, manifest));
}
