import { muiPlugin } from './mui/index.js';
import type { TargetPlugin } from './plugin.js';
import { storiesPlugin } from './stories/index.js';
import { tailwindPlugin } from './tailwind/index.js';

/** Implemented target plugins by id; `targetIds()` sorts them, which is the order they run in. */
export const TARGETS: Readonly<Record<string, TargetPlugin>> = {
  mui: muiPlugin,
  stories: storiesPlugin,
  tailwind: tailwindPlugin,
};

export function getTarget(id: string): TargetPlugin | null {
  return Object.hasOwn(TARGETS, id) ? TARGETS[id] : null;
}

export function targetIds(): string[] {
  return Object.keys(TARGETS).sort();
}
