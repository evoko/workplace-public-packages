import {
  compareValues,
  formatDifferences,
  readComputed,
  type Difference,
} from './compare';
import { applyMode, clearMode, currentMode, nextFrame } from './mode';
import type { PlayContext } from './parityPlay';
import { SAMPLES } from './samples';
import type { StoriesConfig, TokenSpec } from './spec';
import { TOKEN_TARGETS, tokenCellId } from './TokenGrid';

function sampleOf(canvas: HTMLElement, id: string): Element {
  const el = canvas
    .querySelector(`[data-parity-cell="${id}"]`)
    ?.shadowRoot?.querySelector('.sample');
  if (!el) {
    throw new Error(`parity: token cell ${id} did not mount`);
  }
  return el;
}

/**
 * Compares the category's sample property between the css cell and every
 * other cell, in every mode, restoring whatever mode was in force before.
 */
export async function tokenParityPlay(
  context: PlayContext,
  tokens: readonly TokenSpec[],
  category: string,
  config: StoriesConfig,
): Promise<void> {
  const canvas = context.canvasElement;
  const property = SAMPLES[category]?.property;
  if (!property) {
    throw new Error(`parity: no sample for category ${category}`);
  }
  const read = (id: string): string =>
    readComputed(sampleOf(canvas, id), [property])[property];
  const differences: Difference[] = [];
  const before = currentMode(config.mode);
  try {
    await nextFrame();
    for (const mode of config.modes) {
      applyMode(config.mode, mode);
      await nextFrame();
      for (const token of tokens) {
        const expected = read(tokenCellId('css', token));
        for (const target of TOKEN_TARGETS.filter((t) => t !== 'css')) {
          const actual = read(tokenCellId(target, token));
          if (!compareValues(expected, actual)) {
            differences.push({
              component: category,
              row: token.id,
              mode,
              target,
              element: 'sample',
              property,
              expected,
              actual,
            });
          }
        }
      }
    }
  } finally {
    if (before === null) {
      clearMode(config.mode, config.modes);
    } else {
      applyMode(config.mode, before);
    }
  }
  if (differences.length > 0) {
    throw new Error(formatDifferences(differences));
  }
}
