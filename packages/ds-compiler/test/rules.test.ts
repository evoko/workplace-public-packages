import { describe, expect, it } from 'vitest';
import type { Manifest } from '../src/components/manifest.js';
import { ruleKey, sortRules } from '../src/components/rules.js';
import type { Rule } from '../src/ir/types.js';

const manifest: Manifest = {
  name: 'widget',
  displayName: 'Widget',
  axes: {
    tone: { values: ['neutral', 'accent'], default: 'neutral' },
    size: { values: ['sm', 'md', 'lg'], default: 'md' },
  },
  // 'loading' and 'zesty' are not in the canonical STATE_ORDER, so they fall
  // back to alphabetical order after every recognized state.
  states: ['hover', 'active', 'pressed', 'loading', 'zesty'],
  slots: {
    root: { element: 'div', optional: false },
    icon: { element: 'span', optional: true },
    label: { element: 'span', optional: true },
  },
  preview: {},
  targets: {},
};

function rule(
  slot: string,
  axes: Record<string, string>,
  states: string[],
): Rule {
  return {
    slot,
    axes,
    states,
    declarations: {},
    source: { file: 'widget.css', line: 1, column: 1 },
  };
}

describe('sortRules / compareRules', () => {
  it('orders a mixed table: multi-axis rules, states beyond hover/disabled, and non-root slots', () => {
    const expectedOrder: Array<[string, Record<string, string>, string[]]> = [
      ['root', {}, []],
      ['root', {}, ['hover']],
      ['root', {}, ['active']],
      ['root', {}, ['pressed']],
      ['root', {}, ['loading']],
      ['root', {}, ['zesty']],
      ['root', { tone: 'neutral' }, []],
      ['root', { tone: 'accent' }, []],
      ['root', { tone: 'accent' }, ['hover']],
      ['root', { size: 'sm' }, []],
      ['root', { tone: 'accent', size: 'sm' }, []],
      ['icon', {}, []],
      ['label', {}, []],
    ];

    // Deliberately shuffled input; sortRules must recover expectedOrder.
    const shuffled: Rule[] = [
      rule('label', {}, []),
      rule('root', { tone: 'accent', size: 'sm' }, []),
      rule('root', {}, ['zesty']),
      rule('icon', {}, []),
      rule('root', { size: 'sm' }, []),
      rule('root', {}, []),
      rule('root', { tone: 'accent' }, ['hover']),
      rule('root', {}, ['pressed']),
      rule('root', { tone: 'neutral' }, []),
      rule('root', {}, ['loading']),
      rule('root', {}, ['hover']),
      rule('root', { tone: 'accent' }, []),
      rule('root', {}, ['active']),
    ];

    const sorted = sortRules(shuffled, manifest);
    expect(sorted.map((r) => [r.slot, r.axes, r.states])).toEqual(
      expectedOrder,
    );
  });

  it('ruleKey is insensitive to the order axes are supplied in', () => {
    const axisOrder = Object.keys(manifest.axes);
    const a = ruleKey('root', { size: 'sm', tone: 'accent' }, [], axisOrder);
    const b = ruleKey('root', { tone: 'accent', size: 'sm' }, [], axisOrder);
    expect(a).toBe(b);
  });

  it('ruleKey still distinguishes different axis value combinations', () => {
    const axisOrder = Object.keys(manifest.axes);
    const a = ruleKey('root', { tone: 'accent' }, [], axisOrder);
    const b = ruleKey('root', { tone: 'neutral' }, [], axisOrder);
    expect(a).not.toBe(b);
  });
});
