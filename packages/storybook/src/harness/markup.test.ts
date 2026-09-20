import { describe, expect, it } from 'vitest';

import { cssMarkup } from './markup';
import { SPEC } from './spec.test';

describe('cssMarkup', () => {
  it('renders the root with axis attributes, slots in order, and the label as text', () => {
    expect(
      cssMarkup(SPEC, 'fx', {
        axes: { tone: 'loud', size: 'sm' },
        state: null,
      }),
    ).toBe(
      '<button class="fx-chip" data-tone="loud" data-size="sm"><span class="fx-chip__icon">plus</span>Chip</button>',
    );
  });

  it('sets attribute-state attributes on the root and escapes text', () => {
    const spec = { ...SPEC, label: 'A <b> & "c"', slots: [] };
    expect(
      cssMarkup(spec, 'fx', {
        axes: { tone: 'quiet', size: 'md' },
        state: 'disabled',
      }),
    ).toBe(
      '<button class="fx-chip" data-tone="quiet" data-size="md" disabled="">A &lt;b&gt; &amp; &quot;c&quot;</button>',
    );
    expect(
      cssMarkup(spec, 'fx', {
        axes: { tone: 'quiet', size: 'md' },
        state: 'hover',
      }),
    ).not.toContain('hover');
  });

  it('puts the label inside the label slot when there is one', () => {
    const spec = { ...SPEC, labelSlot: 'label', labelElement: 'em' };
    expect(
      cssMarkup(spec, 'fx', {
        axes: { tone: 'quiet', size: 'md' },
        state: null,
      }),
    ).toBe(
      '<button class="fx-chip" data-tone="quiet" data-size="md"><span class="fx-chip__icon">plus</span><em class="fx-chip__label">Chip</em></button>',
    );
  });

  it('uses aria attributes verbatim', () => {
    const spec = {
      ...SPEC,
      rootElement: 'div',
      states: [
        {
          name: 'disabled',
          kind: 'attribute' as const,
          attributes: { 'aria-disabled': 'true' },
          muiProp: 'disabled',
        },
      ],
    };
    expect(
      cssMarkup(spec, 'fx', {
        axes: { tone: 'quiet', size: 'md' },
        state: 'disabled',
      }),
    ).toContain(
      '<div class="fx-chip" data-tone="quiet" data-size="md" aria-disabled="true">',
    );
  });
});
