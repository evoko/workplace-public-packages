import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Autocomplete } from '../src/Autocomplete.tsx';
import { DatePicker } from '../src/DatePicker.tsx';
import { DatePickerDayCell } from '../src/DatePickerDayCell.tsx';
import { DatePickerOpen } from '../src/DatePickerOpen.tsx';
import { Dropdown } from '../src/Dropdown.tsx';
import { DropdownItem } from '../src/DropdownItem.tsx';
import { Select } from '../src/Select.tsx';
import { TimePicker } from '../src/TimePicker.tsx';
import { TimePickerDropdown } from '../src/TimePickerDropdown.tsx';
import * as calendar from '../src/internal/calendar.ts';
import * as clock from '../src/internal/clock.ts';

const html = (el) => renderToString(el);
const input = (text) => /<input[^>]*>/.exec(text)[0];
const count = (text, re) => (text.match(re) ?? []).length;
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

describe('the calendar the date pickers share', () => {
  it('reads and writes ISO dates, which carry no time zone', () => {
    expect(calendar.parseIso('2026-04-24')).toEqual({
      year: 2026,
      month: 4,
      day: 24,
    });
    for (const no of ['2026-02-30', '2026-13-01', '24/04/2026', '', null])
      expect(calendar.parseIso(no), String(no)).toBeNull();
    expect(
      calendar.isoOf(calendar.dateOf({ year: 2026, month: 4, day: 5 })),
    ).toBe('2026-04-05');
  });

  it('steps by days and months, a month on kept inside a shorter month', () => {
    const jan31 = { year: 2026, month: 1, day: 31 };
    expect(calendar.addMonths(jan31, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(calendar.addDays(jan31, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 1,
    });
    expect(calendar.addMonths(jan31, -2)).toEqual({
      year: 2025,
      month: 11,
      day: 30,
    });
  });

  it('lays a month out in whole weeks from the week’s first day', () => {
    // April 2026 from Monday, as Figma draws it: 30 and 31 March first, 3 May last.
    const weeks = calendar.weeksOf(2026, 4, 1);
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][0]).toEqual({ year: 2026, month: 3, day: 30 });
    expect(weeks[4][6]).toEqual({ year: 2026, month: 5, day: 3 });
    // From Sunday, the month starts on the week's fourth day.
    expect(calendar.weeksOf(2026, 4, 0)[0][3]).toEqual({
      year: 2026,
      month: 4,
      day: 1,
    });
  });

  it('starts the week on the locale’s first day, and names the days short', () => {
    expect(calendar.firstWeekday('en-GB')).toBe(1);
    expect(calendar.firstWeekday('en-US')).toBe(0);
    expect(calendar.weekdayNames(1, 'en-GB')).toEqual([
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
      'Su',
    ]);
    expect(calendar.monthName(2026, 4, 'en-GB')).toBe('April 2026');
  });

  it('reads figures back in the locale’s order, and refuses what is no date', () => {
    const day = { year: 2026, month: 4, day: 24 };
    expect(calendar.shortDate(day, 'en-GB')).toBe('24/04/2026');
    expect(calendar.shortDate(day, 'en-US')).toBe('04/24/2026');
    expect(calendar.parseShortDate('24/04/2026', 'en-GB')).toEqual(day);
    expect(calendar.parseShortDate('4-24-2026', 'en-US')).toEqual(day);
    for (const no of ['31/02/2026', '24/04', 'soon'])
      expect(calendar.parseShortDate(no, 'en-GB'), no).toBeNull();
  });
});

describe('the clock the time pickers share', () => {
  it('reads either clock, with the locale’s words for morning and afternoon', () => {
    const at = (hour, minute) => ({ hour, minute });
    const read = {
      '9:30 AM': at(9, 30),
      '9.30pm': at(21, 30),
      '21:30': at(21, 30),
      2130: at(21, 30),
      9: at(9, 0),
      '12:00 AM': at(0, 0),
      '12 pm': at(12, 0),
      '9:30 a.m.': at(9, 30),
    };
    for (const [text, time] of Object.entries(read))
      expect(clock.parseTimeWords(text, 'en-US'), text).toEqual(time);
    for (const no of ['25:00', '13pm', '7:61', 'noon'])
      expect(clock.parseTimeWords(no, 'en-US'), no).toBeNull();
  });

  it('writes a time on the locale’s clock, and steps through the day', () => {
    expect(clock.twelveHour('en-US')).toBe(true);
    expect(clock.twelveHour('en-GB')).toBe(false);
    expect(clock.timeWords({ hour: 21, minute: 5 }, 'en-GB')).toBe('21:05');
    expect(clock.timeWords({ hour: 0, minute: 0 }, 'en-US')).toBe('12:00 AM');
    expect(clock.timesOf(30)).toHaveLength(48);
    expect(
      clock
        .timesOf(15, clock.parseHhmm('09:00'), clock.parseHhmm('10:00'))
        .map(clock.hhmmOf),
    ).toEqual(['09:00', '09:15', '09:30', '09:45', '10:00']);
    expect(clock.parseHhmm('24:00')).toBeNull();
  });
});

describe('the SOLAR Select and Dropdown shells', () => {
  it('Select is a labelled combobox showing its choice, or its placeholder', () => {
    const empty = html(
      h(
        Select,
        { label: 'Fruit', id: 'fruit', placeholder: 'Pick one' },
        h(DropdownItem, { value: 'apple' }, 'Apple'),
      ),
    );
    expect(empty).toContain('role="combobox"');
    expect(empty).toContain('Pick one');
    expect(empty).toMatch(/<label[^>]*for="fruit"/);
    const chosen = html(
      h(
        Select,
        { value: 'apple', onChange() {} },
        h(DropdownItem, { value: 'apple' }, 'Apple'),
      ),
    );
    expect(chosen).toContain('Apple');
    expect(chosen).not.toContain('Pick one');
  });

  it('Dropdown is the same control, drawn Dropdown’s way', () => {
    const text = html(
      h(
        Dropdown,
        { placeholder: 'Sort by' },
        h(DropdownItem, { value: 'name' }, 'Name'),
      ),
    );
    expect(text).toContain('role="combobox"');
    expect(drawn(text, 'SolarDropdown--field')).toBe(true);
    expect(drawn(text, 'SolarSelect--field')).toBe(false);
  });
});

describe('the SOLAR Autocomplete shell', () => {
  it('is a combobox input, its suggestions closed until asked for', () => {
    const text = html(
      h(Autocomplete, { options: ['Oslo', 'Lima'], placeholder: 'City' }),
    );
    expect(input(text)).toContain('role="combobox"');
    expect(input(text)).toContain('aria-expanded="false"');
    expect(text).not.toContain('Lima');
  });
});

describe('the SOLAR Date Picker Day Cell shell', () => {
  it('is a grid cell, announced selected, as today, or disabled', () => {
    const cell = (props) => html(h(DatePickerDayCell, props, '24'));
    expect(cell({})).toMatch(/role="gridcell"[^>]*aria-selected="false"/);
    expect(cell({ selected: true })).toContain('aria-selected="true"');
    expect(cell({ today: true })).toContain('aria-current="date"');
    expect(cell({})).not.toContain('aria-current');
    expect(cell({ disabled: true })).toContain('aria-disabled="true"');
    expect(
      drawn(cell({ disabled: true }), 'SolarDatePickerDayCell-disabled'),
    ).toBe(true);
  });
});

describe('the SOLAR Date Picker Open shell', () => {
  const month = (props = {}) =>
    html(
      h(DatePickerOpen, {
        defaultMonth: '2026-04-01',
        weekStartsOn: 1,
        locale: 'en-GB',
        today: '2026-04-01',
        ...props,
      }),
    );

  it('draws the month’s weeks, the days either side disabled', () => {
    const text = month({ value: '2026-04-15' });
    expect(text).toContain('April 2026');
    expect(text).toContain('role="grid"');
    expect(count(text, /role="row"/g)).toBe(5);
    expect(count(text, /role="gridcell"/g)).toBe(35);
    // 30 and 31 March, and 1 to 3 May.
    expect(count(text, /aria-disabled="true"/g)).toBe(5);
    expect(count(text, /aria-selected="true"/g)).toBe(1);
    expect(text).toMatch(
      /aria-label="Wednesday, 15 April 2026"[^>]*aria-selected="true"|aria-selected="true"[^>]*aria-label="Wednesday, 15 April 2026"/,
    );
    expect(count(text, /aria-current="date"/g)).toBe(1);
  });

  it('gives the grid one stop for Tab, the chosen day, and names each day in full', () => {
    const text = month({ value: '2026-04-15' });
    expect(count(text, /tabindex="0"/g)).toBe(1);
    expect(text).toMatch(
      /<div[^>]*(aria-label="Wednesday, 15 April 2026"[^>]*tabindex="0"|tabindex="0"[^>]*aria-label="Wednesday, 15 April 2026")/,
    );
    expect(text).toContain('aria-label="Friday, 24 April 2026"');
  });

  it('names its arrows, and hides the weekday row from a screen reader', () => {
    const text = month();
    expect(text).toMatch(/<button[^>]*aria-label="Previous month"/);
    expect(text).toMatch(/<button[^>]*aria-label="Next month"/);
    expect(text).toMatch(/aria-hidden="true"[^>]*>(<span[^>]*>Mo<\/span>)/);
  });

  it('refuses the dates outside min and max, and the ones the caller refuses', () => {
    const text = month({
      min: '2026-04-10',
      max: '2026-04-20',
      isDateDisabled: (iso) => iso === '2026-04-15',
    });
    // 9 before, 10 after, one refused, and the five of the months either side.
    expect(count(text, /aria-disabled="true"/g)).toBe(9 + 10 + 1 + 5);
  });

  it('shows the next month beside it when double, which Figma draws in the page', () => {
    const text = month({ inline: true, type: 'double' });
    expect(text).toContain('April 2026');
    expect(text).toContain('May 2026');
    expect(count(text, /role="grid"/g)).toBe(2);
  });

  it('is a dialog only where it floats', () => {
    expect(month()).not.toContain('role="dialog"');
  });
});

describe('the SOLAR DatePicker shell', () => {
  it('writes its date in the locale’s figures, and its button opens a dialog', () => {
    const text = html(
      h(DatePicker, {
        value: '2026-05-11',
        onChange() {},
        locale: 'en-GB',
        id: 'd',
      }),
    );
    expect(input(text)).toContain('value="11/05/2026"');
    expect(input(text)).toContain('id="d"');
    expect(text).toMatch(
      /<button[^>]*aria-label="Choose date"[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"/,
    );
    expect(drawn(text, 'SolarDatePicker-filled')).toBe(true);
  });

  it('is empty, not filled, with no date, and its button disabled with it', () => {
    const text = html(
      h(DatePicker, { disabled: true, placeholder: 'dd/mm/yyyy' }),
    );
    expect(input(text)).toContain('value=""');
    expect(drawn(text, 'SolarDatePicker-filled')).toBe(false);
    expect(text).toMatch(/<button[^>]*disabled=""/);
  });

  it('stars a mandatory label, and is described by its helper', () => {
    const text = html(
      h(DatePicker, {
        id: 'd',
        label: 'Start',
        mandatory: true,
        helper: 'When',
      }),
    );
    expect(input(text)).toContain('required=""');
    expect(input(text)).toContain('aria-describedby="d-helper"');
    expect(text).toMatch(
      /SolarDatePicker-required[^>]*><span aria-hidden="true">\*<\/span>/,
    );
  });
});

describe('the SOLAR TimePicker and TimePicker Dropdown shells', () => {
  it('writes its time on the locale’s clock, and its button opens a listbox', () => {
    const us = html(
      h(TimePicker, { value: '21:30', onChange() {}, locale: 'en-US' }),
    );
    expect(input(us)).toContain('value="9:30 PM"');
    expect(us).toMatch(
      /<button[^>]*aria-label="Choose time"[^>]*aria-haspopup="listbox"/,
    );
    const gb = html(
      h(TimePicker, { value: '21:30', onChange() {}, locale: 'en-GB' }),
    );
    expect(input(gb)).toContain('value="21:30"');
  });

  it('lists the times a step apart, the chosen one selected', () => {
    const text = html(
      h(TimePickerDropdown, { value: '09:30', locale: 'en-GB', step: 30 }),
    );
    expect(text).toContain('role="listbox"');
    expect(count(text, /role="option"/g)).toBe(48);
    expect(count(text, /aria-selected="true"/g)).toBe(1);
    expect(text).toMatch(/aria-selected="true"[^>]*>(?:(?!<\/li>).)*>9:30</);
  });

  it('keeps to min and max', () => {
    const text = html(
      h(TimePickerDropdown, {
        min: '09:00',
        max: '10:00',
        step: 15,
        locale: 'en-GB',
      }),
    );
    expect(count(text, /role="option"/g)).toBe(5);
    expect(text).toContain('9:45');
    expect(text).not.toContain('10:15');
    expect(text).not.toContain('8:45');
  });
});
