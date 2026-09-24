/**
 * Tree Indent (milestone 4, F1; Figma's `.Tree Indent`): its IR, and the recipe each emitter makes
 * of it. A spacer: each depth a row of that many 16px units.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { overlayFileOf } from '../src/normalize/overlay.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'Tree Indent',
);

describe('the Tree Indent IR', () => {
  it('is built from .Tree Indent under its name in code, its overlay tree-indent.yaml', () => {
    expect(stage.COMPONENTS).toContain('.Tree Indent');
    expect(stage.NAMES).toContain('Tree Indent');
    expect(overlayFileOf('.Tree Indent')).toBe('tree-indent.yaml');
  });

  it('names its units, each an icon.sm wide, and every finding is decided', () => {
    expect(spec.layers.unit1).toMatchObject({ path: '/1' });
    expect(spec.layers.unit10).toMatchObject({ path: '/10' });
    expect(spec.style.unit3.appearance['depth=03'].default.width).toMatchObject(
      { token: 'icon.sm' },
    );
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});

describe('the Tree Indent recipe', () => {
  it('is 0px wide at depth 00, and hugs its units at every other depth', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root.width).toBe('0px');
    expect(styles.appearances['depth=02'].width).toBe('auto');
  });
});
