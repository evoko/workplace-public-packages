/**
 * F6's members (milestone 4): the menus and their rows, and the lists and theirs, beyond the
 * pioneer (dropdown-item.test.mjs). Their IRs, and what their descriptors decide.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { MENU_MAX_HEIGHT } from '../src/components/shared/menu.mjs';
import { packagesDir } from '../src/util/paths.mjs';

const { built } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);
const recipe = (file) =>
  readFileSync(
    join(packagesDir, 'styles/src/generated/mui/components', `${file}.ts`),
    'utf8',
  );
const F6 = [
  'Dropdown Group Label',
  'Dropdown Menu',
  'Context Menu Item',
  'Context Menu',
  'Option Row',
  'Options List',
  'ListItem',
  'List',
];

describe('F6', () => {
  it('builds every member with each finding decided', () => {
    for (const name of F6)
      expect(
        of(name).deviations.filter((d) => !d.decision),
        name,
      ).toEqual([]);
  });

  it('caps both menus at the one flagged height, their rows scrolling', () => {
    expect(MENU_MAX_HEIGHT).toBe('300px');
    for (const file of ['dropdown-menu', 'context-menu']) {
      expect(recipe(file)).toContain("maxHeight: '300px'");
      expect(recipe(file)).toContain("overflowY: 'auto'");
    }
  });

  it('draws a destructive action’s hover, focus and disabled as the other rows’', () => {
    const { spec } = of('Context Menu Item');
    const destructive = spec.style.root.appearance['destructive=true'];
    expect(destructive.hover.background.token).toBe('color.surface.hover');
    expect(destructive.focus.background.token).toBe('color.surface.hover');
    expect(
      spec.style.label.appearance['destructive=true'].disabled.color.token,
    ).toBe('color.text.disabled');
  });

  it('gives an Option Row the control its axis names, and its controls the row’s hover', () => {
    const { spec } = of('Option Row');
    expect(spec.style.control.base.component.keyword).toBe('Checkbox');
    expect(
      spec.style.control.appearance['control=radio'].default.component.keyword,
    ).toBe('Radio');
    for (const file of ['checkbox', 'radio', 'toggle'])
      expect(recipe(file)).toContain('.SolarStatesScope:hover &');
  });

  it('derives a ListItem’s type from its avatar, and its padding from compact', () => {
    const { spec } = of('ListItem');
    expect(spec.api.type).toBeUndefined();
    expect(spec.derived.type.when[0]).toMatchObject({
      value: 'avatar',
      given: ['avatar'],
    });
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'follows', at: 'root.paddingTop' }),
    );
  });

  it('draws the List as Figma does, its in-card axis renamed inCard, its rows compact outside a card', () => {
    const { spec } = of('List');
    // Figma's default variant is the in-card list.
    expect(spec.api.inCard).toEqual({ type: 'boolean', default: true });
    expect(spec.api['in-card']).toBeUndefined();
    expect(
      spec.style.listItem.appearance['inCard=false'].default['variant.compact']
        .keyword,
    ).toBe('true');
  });
});
