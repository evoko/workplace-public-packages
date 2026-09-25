/**
 * FileUpload (milestone 4, F5): its IR, a drop zone around SOLAR's buttons.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';

const { built } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'FileUpload',
);

describe('the FileUpload IR', () => {
  it('takes error and disabled, and is filled by the files it holds', () => {
    expect(Object.keys(spec.api)).toEqual(['error', 'disabled']);
    expect(spec.derived.filled.when[0].props).toEqual(['value']);
  });

  it('composes a Button and two Icon Buttons, which give way to each other once filled', () => {
    expect(spec.style.button.base.component.keyword).toBe('Button');
    expect(spec.style.button.appearance.default.filled.present.value).toBe(
      false,
    );
    expect(spec.style.iconButton.appearance.default.filled.present.value).toBe(
      true,
    );
  });

  it('rings the drop zone when focused, and leaves nothing open', () => {
    expect(spec.style.field.appearance.default.focus.shadow.token).toBe(
      'shadow.focus.default',
    );
    // One ring, the field's: Figma no longer rings the whole component (2026-09-25).
    expect(
      spec.style.root.appearance?.default?.focus?.shadow?.token,
    ).toBeUndefined();
    // Figma's 68px filled zone, open until 2026-09-25, is the other states' height since.
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});
