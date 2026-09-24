/**
 * Timestamp (milestone 4, F1): its IR, and the recipe each emitter makes of it. A drawn component:
 * one text, whose words are the app's; `format` says which words, and changes nothing drawn.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'Timestamp',
);

describe('the Timestamp IR', () => {
  it('takes a format, a size and an emphasis, and every finding is decided', () => {
    expect(Object.keys(spec.api)).toEqual(['format', 'size', 'emphasis']);
    expect(spec.states).toEqual([]);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});

describe('the Timestamp recipe', () => {
  it('sizes the text by size and quiets it by emphasis, whatever the format', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.sizes.md['& .SolarTimestamp-value']).toMatchObject({
      fontSize: 'var(--solar-type-size-body-md)',
    });
    for (const format of ['relative', 'absolute', 'combined'])
      expect(
        styles.appearances[`format=${format}, emphasis=subtle`][
          '& .SolarTimestamp-value'
        ],
      ).toEqual({ color: 'var(--solar-color-text-tertiary)' });
  });
});
