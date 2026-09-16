import { describe, expect, it } from 'vitest';
import type { Manifest } from '../src/components/manifest.js';
import { parseSelector } from '../src/components/selector.js';
import { sortStates, stateForAttribute } from '../src/components/states.js';
import { Diagnostics } from '../src/errors.js';

const manifest: Manifest = {
  name: 'button',
  displayName: 'Button',
  axes: {
    variant: { values: ['solid', 'outline'], default: 'solid' },
    size: { values: ['sm', 'md'], default: 'md' },
  },
  states: ['hover', 'focus-visible', 'active', 'disabled', 'pressed', 'open'],
  slots: {
    root: { element: 'button', optional: false },
    icon: { element: 'span', optional: true },
  },
  preview: {},
  targets: {},
};

const loc = { file: 'button.css', line: 1, column: 1 };

function parse(selector: string) {
  const diag = new Diagnostics();
  const result = parseSelector(selector, manifest, 'fx', loc, diag);
  return { result, codes: diag.errors.map((e) => e.code), diag };
}

describe('sortStates', () => {
  it('orders known states canonically and unknown ones alphabetically after', () => {
    expect(
      sortStates(['disabled', 'zeta', 'hover', 'alpha', 'active']),
    ).toEqual(['hover', 'active', 'disabled', 'alpha', 'zeta']);
  });
});

describe('stateForAttribute', () => {
  it('maps known attributes to states and rejects everything else', () => {
    expect(stateForAttribute('disabled', undefined)).toBe('disabled');
    expect(stateForAttribute('disabled', 'x')).toBeNull();
    expect(stateForAttribute('aria-disabled', 'false')).toBeNull();
    expect(stateForAttribute('data-state', '')).toBeNull();
    expect(stateForAttribute('aria-pressed', 'true')).toBe('pressed');
  });
});

describe('parseSelector', () => {
  it('parses the bare root', () => {
    expect(parse('.fx-button').result).toEqual({
      slot: 'root',
      axes: {},
      states: [],
    });
  });

  it('parses axes, states, and a slot', () => {
    expect(
      parse(
        '.fx-button[data-variant="outline"][data-size="sm"]:hover .fx-button__icon',
      ).result,
    ).toEqual({
      slot: 'icon',
      axes: { variant: 'outline', size: 'sm' },
      states: ['hover'],
    });
  });

  it('maps attribute states and sorts them canonically', () => {
    expect(
      parse('.fx-button[aria-pressed="true"]:disabled:hover').result,
    ).toEqual({
      slot: 'root',
      axes: {},
      states: ['hover', 'pressed', 'disabled'],
    });
    expect(parse('.fx-button[disabled]').result?.states).toEqual(['disabled']);
    expect(parse('.fx-button[aria-disabled="true"]').result?.states).toEqual([
      'disabled',
    ]);
    expect(parse('.fx-button[data-state="open"]').result?.states).toEqual([
      'open',
    ]);
  });

  it('dedupes a state expressed twice', () => {
    expect(parse('.fx-button:disabled[disabled]').result?.states).toEqual([
      'disabled',
    ]);
  });

  it('reports DS-E030 for a wrong root class, extra classes, and unknown pseudo-classes', () => {
    expect(parse('.fx-btn').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button.primary').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button:visited').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button[title="x"]').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button .fx-button__icon.extra').codes).toEqual([
      'DS-E030',
    ]);
    expect(parse('.fx-button .fx-other__icon').codes).toEqual(['DS-E030']);
  });

  it('reports DS-E031 for unknown axes and values', () => {
    expect(parse('.fx-button[data-tone="loud"]').codes).toEqual(['DS-E031']);
    expect(parse('.fx-button[data-variant="ghost"]').codes).toEqual([
      'DS-E031',
    ]);
    expect(parse('.fx-button[data-variant]').codes).toEqual(['DS-E031']);
  });

  it('reports DS-E032 for an unknown slot and for targeting root as a slot', () => {
    expect(parse('.fx-button .fx-button__label').codes).toEqual(['DS-E032']);
    expect(parse('.fx-button .fx-button__root').codes).toEqual(['DS-E032']);
  });

  it('reports DS-E033 for a state not declared in the manifest', () => {
    expect(parse('.fx-button[aria-selected="true"]').codes).toEqual([
      'DS-E033',
    ]);
    expect(parse('.fx-button[data-state="closed"]').codes).toEqual(['DS-E033']);
  });

  it('reports DS-E034 for forbidden features', () => {
    expect(parse('button.fx-button').codes).toEqual(['DS-E034']);
    expect(parse('#id.fx-button').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button > .fx-button__icon').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button + .fx-button').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button::before').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button .fx-button__icon:hover').codes).toEqual([
      'DS-E034',
    ]);
    expect(parse('.fx-button .fx-button__icon .fx-button__icon').codes).toEqual(
      ['DS-E034'],
    );
    expect(parse('*').codes).toEqual(['DS-E034']);
  });

  it('reports DS-E030 for attribute operators other than exact match, and for the case-insensitive flag', () => {
    expect(parse('.fx-button[data-size^="sm"]').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button[data-size*="sm"]').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button[data-size$="sm"]').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button[data-size|="sm"]').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button[data-size~="sm"]').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button[data-size="sm" i]').codes).toEqual(['DS-E030']);
  });

  it('reports DS-E030 when the root class appears twice', () => {
    expect(parse('.fx-button.fx-button').codes).toEqual(['DS-E030']);
  });

  it('reports DS-E034 for a tag, id, or state on the slot compound', () => {
    expect(parse('.fx-button button').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button #x').codes).toEqual(['DS-E034']);
  });

  it('treats a trailing space as no slot, and a tab or newline as an ordinary descendant combinator', () => {
    expect(parse('.fx-button ').result).toEqual({
      slot: 'root',
      axes: {},
      states: [],
    });
    expect(parse('.fx-button\t.fx-button__icon').result).toEqual({
      slot: 'icon',
      axes: {},
      states: [],
    });
    expect(parse('.fx-button\n.fx-button__icon').result).toEqual({
      slot: 'icon',
      axes: {},
      states: [],
    });
  });

  it('unescapes an escaped root class the same as the plain form', () => {
    expect(parse('.fx\\-button').result).toEqual({
      slot: 'root',
      axes: {},
      states: [],
    });
  });

  it('reports DS-E030 for a slot class standing alone with no root', () => {
    expect(parse('.fx-button__icon').codes).toEqual(['DS-E030']);
  });
});
