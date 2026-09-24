/**
 * The 44 × 44 target (SOLAR: "the 44×44px WCAG hit area is padded in code"): the helpers, and the
 * recipes of every control, which carry one.
 */

import { describe, expect, it } from 'vitest';
import { TARGET, targetArea, targetInput } from '../src/shells/target.mjs';
import { MUI_RESETS } from '../src/emit/mui-component.mjs';

describe('the target', () => {
  it('is WCAG’s 44, around the element, taking no room', () => {
    expect(TARGET).toBe('44px');
    expect(targetArea('& button')).toEqual({
      '& button': { position: 'relative' },
      '& button::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 'max(100%, 44px)',
        height: 'max(100%, 44px)',
        transform: 'translate(-50%, -50%)',
      },
    });
    expect(targetInput('& input')['& input'].width).toBe('max(100%, 44px)');
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
