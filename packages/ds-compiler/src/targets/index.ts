import type { TargetPlugin } from './plugin.js';

/** Implemented target plugins by id. Task 4 registers the Tailwind plugin. */
export const TARGETS: Readonly<Record<string, TargetPlugin>> = {};

export function getTarget(id: string): TargetPlugin | null {
  return Object.hasOwn(TARGETS, id) ? TARGETS[id] : null;
}

export function targetIds(): string[] {
  return Object.keys(TARGETS).sort();
}
