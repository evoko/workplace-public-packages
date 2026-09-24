/** What one stack of Figma paints draws (src/normalize/paints.mjs). */

import { describe, expect, it } from 'vitest';
import { drawnPaint } from '../src/normalize/paints.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';

const names = tokenNames(loadContract());

describe('drawnPaint', () => {
  it('is the one paint, where there is one', () => {
    expect(drawnPaint(['{Color:surface/base}'], names, 'x')).toEqual({
      paint: '{Color:surface/base}',
      covered: [],
    });
  });

  it('is the top paint, listed last, where it is opaque: it covers the rest', () => {
    // Insight Card's selected card, surface/background over surface/base.
    expect(
      drawnPaint(
        ['{Color:surface/base}', '{Color:surface/background}'],
        names,
        'x',
      ),
    ).toEqual({
      paint: '{Color:surface/background}',
      covered: ['{Color:surface/base}'],
    });
    expect(drawnPaint(['#ff0000', '#00ff00'], names, 'x').paint).toBe(
      '#00ff00',
    );
  });

  it('refuses a translucent top, which shows what is under it', () => {
    expect(names.opaque('color.surface.scrim')).toBe(false);
    expect(() =>
      drawnPaint(
        ['{Color:surface/base}', '{Color:surface/scrim}'],
        names,
        'Card /.background',
      ),
    ).toThrow(
      /Card \/.background: 2 paints, and the top one .* is not an opaque colour/,
    );
    expect(() => drawnPaint(['#ff0000', '#00ff00 a=0.50'], names, 'x')).toThrow(
      /not an opaque colour/,
    );
  });
});
