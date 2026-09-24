/**
 * Inline Input (milestone 4, F5): its IR, and the overlay's `same`, which reads the layers Figma
 * draws anew in some variants as the one they are.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { loadOverlay, parseOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';

const { built } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Inline Input',
);

describe('the Inline Input IR', () => {
  it('takes error and disabled; filled is its edit mode with the focus on its buttons', () => {
    expect(Object.keys(spec.api)).toEqual(['error', 'disabled']);
    expect(spec.derived.filled.when[0]).toMatchObject({
      value: true,
      props: ['defaultEditing'],
    });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws one pair of Confirm and Cancel, in every edit state', () => {
    expect(Object.keys(spec.layers)).toEqual([
      'root',
      'value',
      'iconButton',
      'frame1',
      'confirm',
      'cancel',
    ]);
    for (const state of ['focus', 'filled', 'error'])
      expect(spec.style.confirm.appearance.default[state].present.value).toBe(
        true,
      );
    const filled = oracle.variants.find((v) => v.figma === 'state=filled');
    expect(filled.layers).toHaveProperty('confirm');
    expect(filled.layers).not.toHaveProperty('frame2Confirm');
  });

  it('is laid out by its mode: bare read, boxed when hovered or editing', () => {
    expect(spec.style.root.appearance.default.hover.radius.token).toBe(
      'radius.container',
    );
    expect(spec.style.root.appearance.default.focus.borderWidth.token).toBe(
      'border.default',
    );
  });
});

describe('same', () => {
  const catalog = loadWebCatalog();
  const names = tokenNames(loadContract());
  const own = loadOverlay('Inline Input');
  const on = (text) =>
    buildComponentSpec(loadComponent(catalog, 'Inline Input'), {
      names,
      fileVersion: catalog.fileVersion,
      overlay: parseOverlay(`component: Inline Input\n${text}`, 'test.yaml'),
    });

  it('keeps every copy apart without it', () => {
    expect(own.same).toBeDefined();
    const { spec: apart } = on('');
    expect(apart.layers).toHaveProperty('frame2Confirm');
  });

  it('refuses a layer no variant has, and one that is no sibling', () => {
    expect(() =>
      on('same:\n  /Frame 9:\n    as: /Frame 1\n    reason: r\n'),
    ).toThrow(/same \/Frame 9: no variant has the layer/);
    expect(() =>
      on('same:\n  /Frame 2/Confirm:\n    as: /Frame 1\n    reason: r\n'),
    ).toThrow(/is not a sibling of it/);
  });
});
