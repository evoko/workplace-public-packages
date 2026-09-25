import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { AgendaRow } from '../src/AgendaRow.tsx';
import { AllDayBar } from '../src/AllDayBar.tsx';
import { CalendarDayCell } from '../src/CalendarDayCell.tsx';
import { CalendarToolbar } from '../src/CalendarToolbar.tsx';
import { EventChip } from '../src/EventChip.tsx';
import { TimeAxisLabel } from '../src/TimeAxisLabel.tsx';
import { TimeSlot } from '../src/TimeSlot.tsx';
import { WeekdayHeader } from '../src/WeekdayHeader.tsx';

const html = (el) => renderToString(el);
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

describe('the SOLAR Event Chip and All-Day Bar shells', () => {
  it('draws a chip’s time and repeat icon only where given, the icon named', () => {
    const plain = html(h(EventChip, { title: 'Standup' }));
    expect(drawn(plain, 'SolarEventChip-time')).toBe(false);
    expect(drawn(plain, 'SolarEventChip-repeating')).toBe(false);
    const full = html(
      h(EventChip, { title: 'Standup', time: '9:00', repeating: true }),
    );
    expect(full).toContain('9:00');
    expect(full).toContain('aria-label="Repeats"');
  });

  it('draws a bar’s time only where given', () => {
    expect(
      drawn(html(h(AllDayBar, { title: 'Offsite' })), 'SolarAllDayBar-time'),
    ).toBe(false);
    expect(html(h(AllDayBar, { title: 'Offsite', time: 'All day' }))).toContain(
      'All day',
    );
  });
});

describe('the SOLAR Calendar Day Cell shell', () => {
  it('is a grid cell, today the current date, selected said so', () => {
    const today = html(
      h(CalendarDayCell, {
        day: '15',
        today: true,
        selected: true,
        label: 'Monday 15 September',
      }),
    );
    expect(today).toContain('role="gridcell"');
    expect(today).toContain('aria-current="date"');
    expect(today).toContain('aria-selected="true"');
    expect(today).toContain('aria-label="Monday 15 September"');
    expect(drawn(today, 'SolarCalendarDayCell-today')).toBe(true);
    const plain = html(h(CalendarDayCell, { day: '16' }));
    expect(plain).not.toContain('aria-current');
    expect(plain).toContain('aria-selected="false"');
  });

  it('holds the caller’s Event Chips under its date', () => {
    const day = html(
      h(
        CalendarDayCell,
        { day: '15' },
        h(EventChip, { title: 'Standup' }),
        h(EventChip, { title: 'Review' }),
      ),
    );
    expect(day.indexOf('15')).toBeLessThan(day.indexOf('Standup'));
    expect(day).toContain('Review');
  });
});

describe('the SOLAR grid parts', () => {
  it('heads a column with its weekday, today marked', () => {
    const today = html(h(WeekdayHeader, { emphasis: 'today' }, 'Mon'));
    expect(today).toContain('role="columnheader"');
    expect(today).toContain('aria-current="date"');
    expect(html(h(WeekdayHeader, null, 'Tue'))).not.toContain('aria-current');
  });

  it('marks an hour on the rail, the current one marked', () => {
    const now = html(h(TimeAxisLabel, { emphasis: 'now' }, '9 AM'));
    expect(now).toContain('role="rowheader"');
    expect(now).toContain('aria-current="time"');
  });

  it('draws a slot as a grid cell, selected said so, its rule dashed', () => {
    const slot = html(h(TimeSlot, { selected: true, label: 'Monday 9 AM' }));
    expect(slot).toContain('role="gridcell"');
    expect(slot).toContain('aria-selected="true"');
    expect(drawn(slot, 'SolarTimeSlot-selected')).toBe(true);
    expect(drawn(slot, 'SolarTimeSlot--halfHourRule')).toBe(true);
    expect(slot).toContain('--solar-border-style:dashed');
  });
});

describe('the SOLAR Agenda Row shell', () => {
  it('draws the comfortable row’s times and words, the compact row’s range', () => {
    const comfortable = html(
      h(AgendaRow, {
        title: 'Standup',
        start: '9:00',
        end: '10:00',
        meta: 'Room A',
      }),
    );
    expect(comfortable).toContain('9:00');
    expect(comfortable).toContain('Room A');
    const compact = html(
      h(AgendaRow, {
        density: 'compact',
        title: 'Standup',
        start: '9:00',
        end: '10:00',
      }),
    );
    expect(compact).toContain('9:00 – 10:00');
  });

  it('is a button that says it is selected, where it can be pressed', () => {
    const row = html(
      h(AgendaRow, { title: 'Standup', selected: true, onClick: () => {} }),
    );
    expect(row).toContain('role="button"');
    expect(row).toContain('aria-pressed="true"');
    expect(html(h(AgendaRow, { title: 'Standup' }))).not.toContain(
      'role="button"',
    );
  });

  it('draws its dot in its event’s category, Event Chip’s colours, blue by default', () => {
    const red = html(h(AgendaRow, { title: 'Standup', category: 'red' }));
    expect(red).toContain('--solar-color-data-category-01-strong');
    expect(red).not.toContain('--solar-color-data-category-06-strong');
    expect(html(h(AgendaRow, { title: 'Standup' }))).toContain(
      '--solar-color-data-category-06-strong',
    );
  });

  it('draws an all-day bar in its event’s category too', () => {
    const bar = html(h(AllDayBar, { title: 'Offsite', category: 'green' }));
    expect(bar).toContain('--solar-color-data-category-04-strong');
  });
});

describe('the SOLAR Calendar Toolbar shell', () => {
  it('is a toolbar with its own named navigation and the caller’s views and action', () => {
    const bar = html(
      h(CalendarToolbar, {
        range: 'October 5 – 11, 2026',
        previousLabel: 'Previous week',
        nextLabel: 'Next week',
        views: h('span', null, 'VIEWS'),
        action: h('span', null, 'ACTION'),
      }),
    );
    expect(bar).toContain('role="toolbar"');
    expect(bar).toContain('aria-label="Previous week"');
    expect(bar).toContain('aria-label="Next week"');
    expect(bar).toContain('Today');
    expect(bar).toContain('VIEWS');
    expect(bar).toContain('ACTION');
  });
});
