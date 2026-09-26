/**
 * The 44 × 44 target (SOLAR: "the 44×44px WCAG hit area is padded in code"): the helpers, and the
 * recipes of every control, which carry one.
 */

import { describe, expect, it } from 'vitest';
import {
  TARGET,
  targetArea,
  targetInput,
} from '../src/components/shared/target.mjs';
import { MUI_RESETS } from '../src/emit/mui-component.mjs';

describe('the target', () => {
  it('is WCAG’s 44, around the element, taking no room', () => {
    expect(TARGET).toBe('var(--solar-size-target-min)');
    expect(targetArea('& button')).toEqual({
      '& button': { position: 'relative' },
      '& button::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 'max(100%, var(--solar-size-target-min))',
        height: 'max(100%, var(--solar-size-target-min))',
        transform: 'translate(-50%, -50%)',
      },
    });
    expect(targetInput('& input')['& input'].width).toBe(
      'max(100%, var(--solar-size-target-min))',
    );
  });

  it('is in the recipe of every control', () => {
    const controls = [
      'Button',
      'Icon Button',
      'FAB',
      'BackButton',
      'SplitButton',
      'Link',
      'Counter',
      'Checkbox',
      'Radio',
      'Toggle',
      'Slider',
      'Slider Range',
      'DragHandle',
      'Segmented Control Item',
      'Tag',
      'Alert',
      'Alert Small',
      'Banner',
      'Toast',
      'Text Input',
      'Text Area',
      'SearchField',
      'GlobalSearch',
      'Password Input',
      'Number Input',
    ];
    for (const name of controls)
      expect(JSON.stringify(MUI_RESETS[name]), name).toContain(TARGET);
  });
});

/**
 * Every rule object in a reset, at any depth, with the keys beside it: a target's element rule and
 * its `::after` are siblings in one object.
 */
function ruleObjects(value, out = []) {
  if (value && typeof value === 'object') {
    out.push(value);
    for (const v of Object.values(value)) ruleObjects(v, out);
  }
  return out;
}

describe('a target beside the element’s own rules', () => {
  // A target spread under the key of a rule already written replaces that rule (an object literal
  // keeps the last value of a key): Alert's, Toast's, Counter's and Step's buttons lost their reset
  // this way and drew as grey native buttons, and Coachmark's and Tag's close buttons lost the
  // target's `position: relative`, so their targets were placed around the root instead.
  const targets = [];
  for (const [name, resets] of Object.entries(MUI_RESETS))
    for (const rules of ruleObjects(resets))
      for (const [key, value] of Object.entries(rules))
        // targetArea's pseudo-element, not MUI's own touch area resized (Slider's thumb).
        if (
          key.endsWith('::after') &&
          value?.content === '""' &&
          value?.width?.includes?.(TARGET)
        )
          targets.push({
            name,
            rules,
            element: key.slice(0, -'::after'.length),
          });

  it('finds the targets', () => {
    expect(targets.map((t) => t.name)).toEqual(
      expect.arrayContaining([
        'Alert',
        'Alert Small',
        'Toast',
        'Coachmark',
        'Tag',
      ]),
    );
  });

  it('keeps the target’s element positioned', () => {
    for (const { name, rules, element } of targets)
      expect(rules[element]?.position, `${name} ${element}`).toBe('relative');
  });

  // A target over one kind of element; one over several (Breadcrumb Item's `&:is(a, button)`)
  // resets each kind under its own key.
  it('keeps a native button’s reset beside its target', () => {
    for (const { name, rules, element } of targets.filter(
      (t) => /\bbutton\b/.test(t.element) && !t.element.includes(','),
    )) {
      const own = Object.entries(rules)
        .filter(([key]) =>
          key
            .split(',')
            .map((s) => s.trim())
            .includes(element),
        )
        .map(([, v]) => v);
      expect(
        own.some((v) => v.appearance === 'none'),
        `${name} ${element}`,
      ).toBe(true);
    }
  });
});
