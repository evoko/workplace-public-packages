import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import MenuList from '@mui/material/MenuList';
import { ContextMenu } from '../src/ContextMenu.tsx';
import { ContextMenuItem } from '../src/ContextMenuItem.tsx';
import { Divider } from '../src/Divider.tsx';
import { DropdownGroupLabel } from '../src/DropdownGroupLabel.tsx';
import { DropdownItem } from '../src/DropdownItem.tsx';
import { DropdownMenu, useDropdownMenuSize } from '../src/DropdownMenu.tsx';
import { SplitButton } from '../src/SplitButton.tsx';

const html = (el) => renderToString(el);
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

/** A row that says the size its menu gives it. */
function SizeProbe() {
  return h('li', { 'data-size': useDropdownMenuSize() ?? 'none' });
}

describe('the SOLAR Dropdown Menu shell', () => {
  it('draws in place, a menu around its rows, which take its size', () => {
    const menu = html(
      h(
        DropdownMenu,
        { size: 'sm', 'aria-label': 'Sort' },
        h(DropdownGroupLabel, null, 'Recent'),
        h(DropdownItem, null, 'Name'),
        h(SizeProbe),
      ),
    );
    expect(menu).toContain('role="menu"');
    expect(drawn(menu, 'SolarDropdownMenu-content')).toBe(true);
    expect(menu).toContain('data-size="sm"');
    // The heading is passed over by the menu's keyboard: presentational, no tabindex.
    expect(menu).toMatch(/<li[^>]*role="presentation"[^>]*>/);
    expect(html(h(SizeProbe))).toContain('data-size="none"');
  });

  it('floats only where anchored, and draws nothing while closed', () => {
    const closed = html(
      h(
        DropdownMenu,
        { anchorEl: null, open: false },
        h(DropdownItem, null, 'Name'),
      ),
    );
    expect(closed).not.toContain('Name');
  });
});

describe('the SOLAR Context Menu shells', () => {
  it('is a menu of actions, a row drawing only the slots it is given', () => {
    const menu = html(
      h(
        ContextMenu,
        null,
        h(ContextMenuItem, { shortcut: '⌘C' }, 'Copy'),
        h(Divider, { component: 'li' }),
        h(ContextMenuItem, { destructive: true }, 'Delete'),
      ),
    );
    expect(menu).toContain('role="menu"');
    expect(menu).toContain('⌘C');
    expect(drawn(menu, 'SolarContextMenuItem-shortcut')).toBe(true);
    expect(drawn(menu, 'SolarContextMenuItem-leadingIcon')).toBe(false);
    expect(menu).toMatch(/<li[^>]*role="separator"/);
  });

  it('disabled, is announced so', () => {
    const row = html(
      h(MenuList, null, h(ContextMenuItem, { disabled: true }, 'Paste')),
    );
    expect(row).toContain('aria-disabled="true"');
  });
});

describe('SplitButton’s menu', () => {
  it('with items, says the chevron opens a menu, closed until it does', () => {
    const control = html(
      h(
        SplitButton,
        { items: [{ label: 'Save as', onSelect: () => {} }] },
        'Save',
      ),
    );
    expect(control).toContain('aria-haspopup="menu"');
    expect(control).toContain('aria-expanded="false"');
    expect(control).not.toContain('Save as');
  });
});
