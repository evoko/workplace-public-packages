import { afterEach, describe, expect, it } from 'vitest';
import {
  allowPlaceholders,
  parseOverlay,
  PLACEHOLDER,
} from '../src/normalize/overlay.mjs';

const text = `component: Button\nset:\n  root.base.width:\n    keyword: FILL\n    reason: ${PLACEHOLDER}\n`;

describe('a pending reason', () => {
  afterEach(() => allowPlaceholders(false));

  it('is refused by default, as the proposer’s placeholder', () => {
    expect(() => parseOverlay(text, 'spec/overlay/x.yaml')).toThrow(
      /still the proposer's placeholder/,
    );
  });

  it('is let through while the workbench’s pending edit is being previewed', () => {
    allowPlaceholders(true);
    expect(() => parseOverlay(text, 'spec/overlay/x.yaml')).not.toThrow();
  });
});
