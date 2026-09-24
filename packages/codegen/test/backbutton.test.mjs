/**
 * BackButton (milestone 4, F2): its IR, and the recipe each emitter makes of it. On Button's
 * machinery: a tertiary button with SOLAR's ArrowLeft; states with no appearance axis.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'BackButton',
);

describe('the BackButton IR', () => {
  it('takes a size, disabled and loading, and every finding is decided', () => {
    expect(Object.keys(spec.api)).toEqual(['size', 'disabled', 'loading']);
    expect(spec.slots.label).toMatchObject({ default: 'Back', optional: true });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});

describe('the BackButton recipe', () => {
  it('keys its states under default, having no appearance axis, on both platforms', () => {
    const { styles, ts } = renderMuiComponent(spec, tokens);
    expect(styles.appearances.default['&:hover']).toMatchObject({
      backgroundColor: 'var(--solar-color-action-tertiary-bg-hover)',
    });
    expect(ts).toContain('const key = `default`;');
    const { dart } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain("const combo = 'default';");
  });
});
