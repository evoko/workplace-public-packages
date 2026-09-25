import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { cls } from './classes.mjs';
import { BreadcrumbItem } from '../src/BreadcrumbItem.tsx';
import { Breadcrumbs } from '../src/Breadcrumbs.tsx';
import { NavItem } from '../src/NavItem.tsx';
import { SectionNavGroupHeader } from '../src/SectionNavGroupHeader.tsx';
import { SectionNavItem } from '../src/SectionNavItem.tsx';
import { TabItem } from '../src/TabItem.tsx';
import { Tabs } from '../src/Tabs.tsx';
import { TreeItem } from '../src/TreeItem.tsx';

/** The markup, the recipe's CSS left out. */
const html = (el) =>
  renderToString(el).replace(/<style[^>]*>.*?<\/style>/g, '');
const count = (text, re) => (text.match(re) ?? []).length;
/** Whether an element carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

describe('the SOLAR Tabs and Tab Item shells', () => {
  const strip = (props = {}) =>
    html(
      h(
        Tabs,
        { value: 'b', 'aria-label': 'Views', ...props },
        h(TabItem, { value: 'a', label: 'Alpha' }),
        h(TabItem, { value: 'b', label: 'Beta', count: 3 }),
        h(TabItem, { value: 'c', label: 'Gamma', disabled: true }),
      ),
    );

  it('is a tablist of tabs, the one of its value selected, and one stop for Tab', () => {
    const text = strip();
    expect(text).toContain('role="tablist"');
    expect(count(text, /role="tab"/g)).toBe(3);
    expect(text).toMatch(/aria-selected="true"[^>]*>(?:(?!<\/button>).)*Beta/);
    expect(count(text, /aria-selected="true"/g)).toBe(1);
    expect(count(text, /tabindex="0"/g)).toBe(1);
  });

  it('hides MUI’s moving indicator: each tab draws its own underline', () => {
    const css = renderToString(
      h(Tabs, { value: 'a' }, h(TabItem, { value: 'a', label: 'Alpha' })),
    );
    expect(css).toMatch(/\.MuiTabs-indicator\{display:none;?\}/);
  });

  it('gives its tabs its size, and a tab its words, icons and Counter', () => {
    expect(drawn(strip(), 'SolarTabs-tabs')).toBe(true);
    const text = strip();
    expect(text).toContain('>Alpha<');
    // The Counter shows where a count is given, and not at 0.
    expect(count(text, /SolarCounter--value/g)).toBe(1);
    expect(text).toContain('Mui-disabled');
  });
});

describe('the SOLAR Nav Item shell', () => {
  it('is a link where it has an href, the current page where selected', () => {
    const text = html(
      h(NavItem, {
        href: '/home',
        label: 'Home',
        iconOutline: h('i', { id: 'outline' }),
        iconSolid: h('i', { id: 'solid' }),
        selected: true,
        expanded: true,
      }),
    );
    expect(text).toMatch(/<a[^>]*href="\/home"/);
    expect(text).toContain('aria-current="page"');
    expect(text).toContain('id="solid"');
    expect(text).not.toContain('id="outline"');
    expect(text).toContain('>Home<');
  });

  it('collapsed, is its icon alone, named by its label; unselected, outlined', () => {
    const text = html(
      h(NavItem, {
        label: 'Home',
        iconOutline: h('i', { id: 'outline' }),
        iconSolid: h('i', { id: 'solid' }),
      }),
    );
    expect(text).toMatch(/<button[^>]*aria-label="Home"/);
    expect(text).not.toContain('>Home<');
    expect(text).toContain('id="outline"');
    expect(text).not.toContain('aria-current');
  });
});

describe('the SOLAR Section Nav shells', () => {
  it('an item is a link, the current page where selected, and disabled with its prop', () => {
    const text = html(
      h(SectionNavItem, {
        href: '/users',
        label: 'Users',
        icon: h('i'),
        selected: true,
      }),
    );
    expect(text).toMatch(/<a[^>]*href="\/users"/);
    expect(text).toContain('aria-current="page"');
    expect(drawn(text, 'SolarSectionNavItem-selected')).toBe(true);
    const off = html(
      h(SectionNavItem, { label: 'Users', icon: h('i'), disabled: true }),
    );
    expect(off).toContain('disabled=""');
  });

  it('a group header is a heading, of level 3 unless told', () => {
    expect(html(h(SectionNavGroupHeader, null, 'Admin'))).toMatch(
      /role="heading"[^>]*aria-level="3"/,
    );
    expect(html(h(SectionNavGroupHeader, { level: 2 }, 'Admin'))).toContain(
      'aria-level="2"',
    );
  });
});

describe('the SOLAR Breadcrumbs shells', () => {
  const trail = (n) =>
    html(
      h(
        Breadcrumbs,
        null,
        ...Array.from({ length: n }, (_, i) =>
          h(BreadcrumbItem, { key: i, href: `/p${i}` }, `Page ${i}`),
        ),
      ),
    );

  it('is a nav named Breadcrumb and an ordered list, the last the current page', () => {
    const text = trail(3);
    expect(text).toMatch(/<nav[^>]*aria-label="Breadcrumb"/);
    expect(text).toContain('<ol');
    expect(count(text, /<a[^>]*href="\/p/g)).toBe(2);
    expect(text).toMatch(
      /<span[^>]*aria-current="page"[^>]*>(?:(?!<\/span>).)*Page 2/,
    );
    // A chevron between each two, hidden from a screen reader.
    expect(count(text, /<li aria-hidden="true">/g)).toBe(2);
  });

  it('draws each item and chevron in the layer Figma draws at its place', () => {
    const text = trail(4);
    for (const layer of [
      'item1',
      'item2',
      'item3',
      'current',
      'iconChevronRight',
      'iconChevronRight3',
    ])
      expect(drawn(text, cls('Breadcrumbs', layer)), layer).toBe(true);
    expect(drawn(text, 'SolarBreadcrumbs--item4')).toBe(false);
  });

  it('past five, collapses its middle to an ellipsis that opens a menu', () => {
    const text = trail(7);
    expect(text).toContain('Page 0');
    expect(text).toContain('Page 6');
    for (const hidden of [1, 2, 3, 4, 5])
      expect(text).not.toContain(`Page ${hidden}`);
    expect(text).toMatch(
      /<button[^>]*aria-label="Show the hidden pages"[^>]*aria-haspopup="menu"/,
    );
  });

  it('a disabled item, or the current page, is no link', () => {
    expect(
      html(h(BreadcrumbItem, { href: '/x', disabled: true }, 'X')),
    ).toMatch(/<span[^>]*aria-disabled="true"/);
    expect(
      html(h(BreadcrumbItem, { href: '/x', type: 'current' }, 'X')),
    ).not.toContain('href');
    expect(html(h(BreadcrumbItem, { onClick() {} }, 'X'))).toMatch(
      /<button[^>]*type="button"/,
    );
  });
});

describe('the SOLAR Tree Item shell', () => {
  const row = (props = {}) => html(h(TreeItem, { label: 'Docs', ...props }));

  it('is a tree item at its level, selected and expanded as it says', () => {
    const text = row({ depth: 2, selected: true, expanded: true });
    expect(text).toMatch(/role="treeitem"/);
    expect(text).toContain('aria-selected="true"');
    expect(text).toContain('aria-expanded="true"');
    expect(text).toContain('aria-level="3"');
    expect(text).toMatch(/<button[^>]*aria-label="Collapse"/);
  });

  it('a leaf keeps its chevron’s room, and is not announced expandable', () => {
    const text = row({ expandable: false });
    expect(text).not.toContain('aria-expanded');
    expect(text).toMatch(
      /SolarTreeItem--chevron[^"]*"[^>]*style="[^"]*visibility:hidden/,
    );
  });

  it('draws the parts it is given, and none it is not', () => {
    const bare = row();
    for (const part of [
      'checkbox',
      'status',
      'tag',
      'counter',
      'leadingIcon',
      'iconMore',
    ])
      expect(drawn(bare, cls('Tree Item', part)), part).toBe(false);
    const full = row({
      checked: true,
      status: 'warning',
      tag: h('b', null, 'New'),
      count: 4,
      leadingIcon: h('i'),
      selected: true,
      onMore() {},
      onAdd() {},
    });
    for (const part of [
      'checkbox',
      'status',
      'tag',
      'counter',
      'leadingIcon',
      'iconMore',
      'iconPlus',
    ])
      expect(drawn(full, cls('Tree Item', part)), part).toBe(true);
    expect(full).toMatch(/<button[^>]*aria-label="More actions"/);
  });

  it('shows its actions while selected, not at rest', () => {
    expect(drawn(row({ onMore() {} }), 'SolarTreeItem--iconMore')).toBe(false);
    expect(
      drawn(row({ onMore() {}, selected: true }), 'SolarTreeItem--iconMore'),
    ).toBe(true);
  });

  it('editing, draws its words as a named text field, holding them', () => {
    const text = row({ edit: true });
    expect(text).toMatch(/<input[^>]*aria-label="Name"[^>]*value="Docs"/);
    expect(drawn(text, 'SolarTreeItem-edit')).toBe(true);
    expect(drawn(text, 'SolarTreeItem--label')).toBe(false);
  });
});
