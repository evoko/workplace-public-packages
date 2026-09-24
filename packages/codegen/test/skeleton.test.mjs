/**
 * Skeleton (milestone 4, F1): its IR, and the recipe each emitter makes of it. MUI's Skeleton on the
 * web; a placeholder the size of the content it stands in for.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find((b) => b.spec.component === 'Skeleton');

describe('the Skeleton IR', () => {
  it('wraps MUI’s Skeleton, sized by type and size, and every finding is decided', () => {
    expect(spec.base.mui).toBe('Skeleton');
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('is round as a circle, and the control radius otherwise', () => {
    expect(spec.style.root.base.radius).toMatchObject({
      token: 'radius.control',
    });
    expect(
      spec.style.root.appearance['type=circle'].default.radius,
    ).toMatchObject({ token: 'radius.pill' });
  });
});

describe('the Skeleton recipe', () => {
  it('fills with surface.muted, and removes the pulse where motion is reduced', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root.backgroundColor).toBe(
      'var(--solar-color-surface-muted)',
    );
    expect(styles.reset['@media (prefers-reduced-motion: reduce)']).toEqual({
      animation: 'none',
    });
  });
});
