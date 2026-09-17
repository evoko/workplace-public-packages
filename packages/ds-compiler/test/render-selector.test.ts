import { describe, expect, it } from 'vitest';
import {
  FORM_CONTROL_ELEMENTS,
  renderRuleSelector,
  stateSelector,
} from '../src/components/render-selector.js';

describe('stateSelector', () => {
  it('renders pseudo, aria, custom, and element-dependent disabled states', () => {
    expect(stateSelector('hover', 'div')).toBe(':hover');
    expect(stateSelector('focus-visible', 'div')).toBe(':focus-visible');
    expect(stateSelector('pressed', 'div')).toBe('[aria-pressed="true"]');
    expect(stateSelector('open', 'div')).toBe('[data-state="open"]');
    expect(stateSelector('disabled', 'button')).toBe(':disabled');
    expect(stateSelector('disabled', 'input')).toBe(':disabled');
    expect(stateSelector('disabled', 'div')).toBe('[aria-disabled="true"]');
    expect(stateSelector('disabled', 'a')).toBe('[aria-disabled="true"]');
    expect(stateSelector('constructor', 'div')).toBe(
      '[data-state="constructor"]',
    );
    expect(FORM_CONTROL_ELEMENTS.has('textarea')).toBe(true);
  });
});

describe('renderRuleSelector', () => {
  const target = { name: 'button', rootElement: 'button' };

  it('renders root, axes in alphabetical order, states in rule order, and slots', () => {
    expect(
      renderRuleSelector('fx', target, { slot: 'root', axes: {}, states: [] }),
    ).toBe('.fx-button');
    expect(
      renderRuleSelector('fx', target, {
        slot: 'root',
        axes: { variant: 'outline', size: 'sm' },
        states: ['hover', 'disabled'],
      }),
    ).toBe('.fx-button[data-size="sm"][data-variant="outline"]:hover:disabled');
    expect(
      renderRuleSelector('fx', target, {
        slot: 'icon',
        axes: { size: 'sm' },
        states: [],
      }),
    ).toBe('.fx-button[data-size="sm"] .fx-button__icon');
    expect(
      renderRuleSelector(
        'fx',
        { name: 'card', rootElement: 'div' },
        {
          slot: 'root',
          axes: {},
          states: ['disabled'],
        },
      ),
    ).toBe('.fx-card[aria-disabled="true"]');
  });
});
