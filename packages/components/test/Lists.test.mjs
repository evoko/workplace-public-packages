import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import RadioGroup from '@mui/material/RadioGroup';
import { List, useListCompact } from '../src/List.tsx';
import { ListItem } from '../src/ListItem.tsx';
import { OptionRow } from '../src/OptionRow.tsx';
import { OptionsList } from '../src/OptionsList.tsx';

const html = (el) => renderToString(el);
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

/** A row that says whether its list makes it compact. */
function CompactProbe() {
  return h('span', { 'data-compact': String(useListCompact()) });
}

describe('the SOLAR List shell', () => {
  it('is a list of its rows, a Divider between each two unless told not', () => {
    const rows = [
      h(ListItem, { key: 1 }, 'One'),
      h(ListItem, { key: 2 }, 'Two'),
      h(ListItem, { key: 3 }, 'Three'),
    ];
    const list = html(h(List, null, rows));
    expect(list.match(/<li/g)).toHaveLength(3);
    expect(list.match(/role="separator"/g)).toHaveLength(2);
    expect(html(h(List, { dividers: false }, rows))).not.toContain(
      'role="separator"',
    );
  });

  it('makes its rows compact outside a card, as Figma draws them', () => {
    expect(html(h(List, { inCard: false }, h(CompactProbe)))).toContain(
      'data-compact="true"',
    );
    expect(html(h(List, { inCard: true }, h(CompactProbe)))).toContain(
      'data-compact="false"',
    );
  });
});

describe('the SOLAR ListItem shell', () => {
  it('is a button, drawing an avatar in place of the icon where it is given one', () => {
    const icon = html(h(ListItem, { icon: h('svg'), helper: 'More' }, 'Row'));
    expect(icon).toContain('role="button"');
    expect(drawn(icon, 'SolarListItem-icon')).toBe(true);
    const avatar = html(
      h(ListItem, { icon: h('svg'), avatar: h('span', null, 'AB') }, 'Row'),
    );
    expect(drawn(avatar, 'SolarListItem-avatar')).toBe(true);
    expect(drawn(avatar, 'SolarListItem-icon')).toBe(false);
  });

  it('announces a selected row as the current one, or as selected in a listbox', () => {
    expect(html(h(ListItem, { selected: true }, 'Row'))).toContain(
      'aria-current="true"',
    );
    const option = html(h(ListItem, { selected: true, role: 'option' }, 'Row'));
    expect(option).toContain('aria-selected="true"');
    expect(option).not.toContain('aria-current');
  });
});

describe('the SOLAR Option Row and Options List shells', () => {
  it('names its control with its words, and describes it with the second line', () => {
    const row = html(
      h(OptionRow, { supportingText: 'Sent weekly' }, 'Email me'),
    );
    expect(row).toMatch(/<label[^>]*class="[^"]*SolarStatesScope/);
    const id = /aria-describedby="([^"]+)"/.exec(row)?.[1];
    expect(id).toBeTruthy();
    expect(row).toContain(`id="${id}"`);
    expect(row).toContain('type="checkbox"');
  });

  it('holds the control its axis names', () => {
    const radio = html(
      h(
        RadioGroup,
        { value: 'a' },
        h(OptionRow, { control: 'radio', value: 'a' }, 'A'),
      ),
    );
    expect(radio).toContain('type="radio"');
    expect(radio).toMatch(/checked=""/);
    expect(html(h(OptionRow, { control: 'toggle' }, 'Wi-Fi'))).toContain(
      'role="switch"',
    );
  });

  it('is a fieldset named by its legend, which a screen reader reads', () => {
    const list = html(
      h(OptionsList, { label: 'Notifications' }, h(OptionRow, null, 'Email')),
    );
    expect(list).toMatch(/<fieldset[^>]*class=/);
    expect(list).toMatch(/<legend[^>]*>Notifications<\/legend>/);
  });
});
