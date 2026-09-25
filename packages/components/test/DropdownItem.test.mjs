import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import MenuList from '@mui/material/MenuList';
import { DropdownItem } from '../src/DropdownItem.tsx';

/** A row in a menu, as MUI's MenuItem needs. */
const row = (props = {}, words = 'Label') =>
  renderToString(h(MenuList, null, h(DropdownItem, props, words)));
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (html, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(html);

describe('the SOLAR Dropdown Item shell', () => {
  it('is a menu item, drawing only the slots it is given', () => {
    const html = row();
    expect(html).toContain('role="menuitem"');
    expect(html).toContain('Label');
    expect(drawn(html, 'SolarDropdownItem--label')).toBe(true);
    for (const slot of ['checkbox', 'icon', 'helper'])
      expect(drawn(html, `SolarDropdownItem-${slot}`)).toBe(false);
    const full = row({ helper: 'Second line', icon: h('svg'), checkbox: true });
    for (const slot of ['checkbox', 'icon', 'helper'])
      expect(drawn(full, `SolarDropdownItem-${slot}`)).toBe(true);
  });

  it('with a checkbox, is a checkable menu item whose inert box follows selected', () => {
    const html = row({ checkbox: true, selected: true });
    expect(html).toContain('role="menuitemcheckbox"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toMatch(/<span[^>]*inert=""/);
    expect(drawn(html, 'SolarDropdownItem-selected')).toBe(true);
    // Its box takes the row's hover (Checkbox's recipe reads the scope).
    expect(drawn(html, 'SolarStatesScope')).toBe(true);
  });

  it('announces its choice as the role the menu gives it asks', () => {
    expect(row({ role: 'menuitemradio', selected: true })).toContain(
      'aria-checked="true"',
    );
    const option = row({ role: 'option', selected: true });
    expect(option).toContain('aria-selected="true"');
    expect(option).not.toContain('aria-checked');
  });

  it('disabled, is announced so', () => {
    expect(row({ disabled: true })).toContain('aria-disabled="true"');
  });
});
