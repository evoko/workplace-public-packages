import type { TargetPlugin } from './plugin.js';
import { tailwindPlugin } from './tailwind/index.js';

/** Implemented target plugins by id, in the order they are run. */
export const TARGETS: Readonly<Record<string, TargetPlugin>> = {
  tailwind: tailwindPlugin,
};

export function getTarget(id: string): TargetPlugin | null {
  return Object.hasOwn(TARGETS, id) ? TARGETS[id] : null;
}

export function targetIds(): string[] {
  return Object.keys(TARGETS).sort();
}
