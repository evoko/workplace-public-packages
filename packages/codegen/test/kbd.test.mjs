/**
 * Kbd (milestone 4, F1): its IR, and the recipe each emitter makes of it. A drawn component: a key
 * cap, one label on a box, drawn by the shared layer helpers.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find((b) => b.spec.component === 'Kbd');

describe('the Kbd IR', () => {
  it('takes a type, has no states, and names its text the label', () => {
    expect(spec.api).toEqual({
      type: { values: ['top-search', 'default'], default: 'default' },
    });
    expect(spec.states).toEqual([]);
    expect(spec.layers.label).toMatchObject({ path: '/⌘K', type: 'TEXT' });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});

describe('the Kbd recipe', () => {
  it('styles the cap and the label, and the top-search cap its own fill', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root).toMatchObject({
      backgroundColor: 'var(--solar-color-surface-feedback-neutral-strong)',
      borderRadius: 'var(--solar-radius-control)',
      '& .SolarKbd-label': { color: 'var(--solar-color-text-inverse)' },
    });
    expect(styles.appearances['type=top-search']).toEqual({
      backgroundColor: 'var(--solar-color-surface-feedback-neutral-medium)',
    });
    // <kbd>'s monospace, from the browser's own style sheet, is undone.
    expect(styles.reset.fontFamily).toBe('inherit');
  });

  it('respells top-search as a Dart enum value, keeping Figma’s spelling for the recipe', () => {
    const { dart, cells } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain("topSearch('top-search')");
    expect(cells['root.background|appearance|type=top-search|default']).toBe(
      't:color.surface.feedback.neutral.medium',
    );
  });
});
