import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { cls } from './classes.mjs';
import { PageNavButton } from '../src/PageNavButton.tsx';
import { PageNavigator } from '../src/PageNavigator.tsx';
import { Pagination, pagesOf } from '../src/Pagination.tsx';
import { PaginationEllipsis } from '../src/PaginationEllipsis.tsx';
import { PaginationItem } from '../src/PaginationItem.tsx';
import { PaginationNav } from '../src/PaginationNav.tsx';
import { Step } from '../src/Step.tsx';
import { Stepper } from '../src/Stepper.tsx';
import { StepperIndicator } from '../src/StepperIndicator.tsx';

/** The markup, the recipe's CSS left out. */
const html = (el) =>
  renderToString(el).replace(/<style[^>]*>.*?<\/style>/g, '');
const count = (text, re) => (text.match(re) ?? []).length;
/** Whether an element carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);

describe('the pages a Pagination shows', () => {
  // The first, the last, the current ± 1, and three at the end the current is near, as Figma draws
  // 1 2 3 … 12 (owner decision); a gap of one page is that page.
  it('are Figma’s: three at the near end, the current ± 1 in the middle', () => {
    expect(pagesOf(1, 12)).toEqual([1, 2, 3, 'gap', 12]);
    expect(pagesOf(2, 12)).toEqual([1, 2, 3, 'gap', 12]);
    expect(pagesOf(3, 12)).toEqual([1, 2, 3, 4, 'gap', 12]);
    expect(pagesOf(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12]);
    expect(pagesOf(11, 12)).toEqual([1, 'gap', 10, 11, 12]);
    expect(pagesOf(12, 12)).toEqual([1, 'gap', 10, 11, 12]);
  });

  it('fill a gap of one page with it, and show every page of a short list', () => {
    expect(pagesOf(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pagesOf(2, 3)).toEqual([1, 2, 3]);
    expect(pagesOf(1, 1)).toEqual([1]);
  });
});

describe('the SOLAR Pagination shells', () => {
  it('is a nav named Pagination and a list, the current page announced', () => {
    const text = html(h(Pagination, { count: 12, page: 1 }));
    expect(text).toMatch(/<nav[^>]*aria-label="Pagination"/);
    expect(text).toContain('<ul');
    expect(count(text, /aria-current="page"/g)).toBe(1);
    expect(text).toMatch(/aria-current="page"[^>]*aria-label="Page 1"/);
    // 1 2 3 … 12: four pages, one gap, two arrows.
    expect(count(text, /aria-label="Page \d+"/g)).toBe(4);
    expect(count(text, /SolarPaginationEllipsis--label/g)).toBe(1);
  });

  it('disables the previous arrow on the first page and the next on the last', () => {
    const first = html(h(Pagination, { count: 12, page: 1 }));
    const button = (text, label) =>
      new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`).exec(text)[0];
    expect(button(first, 'Previous page')).toContain('disabled=""');
    expect(button(first, 'Next page')).not.toContain('disabled=""');
    const last = html(h(Pagination, { count: 12, page: 12 }));
    expect(button(last, 'Next page')).toContain('disabled=""');
  });

  it('draws each item in the layer Figma draws at its place', () => {
    const text = html(h(Pagination, { count: 12, page: 1 }));
    for (const layer of [
      'previous',
      'page1',
      'page2',
      'page3',
      'paginationEllipsis',
      'page12',
      'next',
    ])
      expect(drawn(text, cls('Pagination', layer)), layer).toBe(true);
  });

  it('draws nothing for a single page, and links its pages where told', () => {
    expect(html(h(Pagination, { count: 1 }))).toBe('');
    expect(
      html(h(Pagination, { count: 3, page: 1, hrefOf: (p) => `/p/${p}` })),
    ).toContain('href="/p/2"');
  });

  it('its parts: a page, an arrow pointing its way, an ellipsis that is no control', () => {
    expect(html(h(PaginationItem, { selected: true }, 4))).toMatch(
      /aria-current="page"/,
    );
    expect(html(h(PaginationNav, { direction: 'next' }))).toContain(
      'aria-label="Next page"',
    );
    const gap = html(h(PaginationEllipsis));
    expect(gap).toContain('…');
    expect(gap).not.toContain('<button');
  });
});

describe('the SOLAR Page Navigator shells', () => {
  it('says where the reader is, announced as it changes, its buttons disabled at the ends', () => {
    const text = html(h(PageNavigator, { count: 10, page: 1 }));
    expect(text).toMatch(/aria-live="polite"[^>]*>1 of 10</);
    expect(text).toMatch(
      /<button[^>]*disabled=""[^>]*>(?:(?!<\/button>).)*Previous/,
    );
    expect(text).toContain('Next');
    expect(
      html(
        h(PageNavigator, {
          count: 4,
          page: 2,
          indicator: (p, n) => `Step ${p}/${n}`,
        }),
      ),
    ).toContain('Step 2/4');
  });

  it('a button says Previous or Next, its words replaceable', () => {
    expect(html(h(PageNavButton, { direction: 'next' }))).toContain('>Next<');
    expect(html(h(PageNavButton, null, 'Back'))).toContain('>Back<');
  });
});

describe('the SOLAR Stepper shells', () => {
  const stepper = (props) =>
    html(
      h(Stepper, { steps: ['Plan', 'Build', 'Ship'], activeStep: 1, ...props }),
    );

  it('announces the active step, in a list named Progress', () => {
    const text = stepper({ type: 'no label' });
    expect(text).toMatch(/<ol[^>]*aria-label="Progress"/);
    expect(count(text, /aria-current="step"/g)).toBe(1);
    // No words drawn: each step's label is read.
    expect(text).toContain('SolarStepper-name">Build<');
  });

  it('draws each part in the layer Figma draws for its status', () => {
    const round = stepper({ type: 'with label' });
    for (const layer of [
      'stepsStep',
      'stepsStep2',
      'stepsStep3',
      'progress',
      'progressRectangle2',
    ])
      expect(drawn(round, cls('Stepper', layer)), layer).toBe(true);
    // The fill reaches the active step, the second of three.
    expect(round).toMatch(
      /SolarStepper--progressRectangle2[^"]*"[^>]*style="width:50%"/,
    );
    const lines = stepper({ type: 'line', activeStep: 0 });
    expect(drawn(lines, 'SolarStepper--rectangle1')).toBe(true);
    expect(drawn(lines, 'SolarStepper--rectangle2')).toBe(true);
    expect(drawn(lines, 'SolarStepper--rectangle3')).toBe(true);
  });

  it('marks the step in error, and makes completed steps buttons where told', () => {
    expect(stepper({ type: 'no label', errorStep: 2 })).toContain('>!<');
    const back = stepper({ type: 'with label', onStepClick() {} });
    expect(count(back, /<button/g)).toBe(1);
    expect(count(stepper({ type: 'with label' }), /<button/g)).toBe(0);
  });

  it('a Step draws its circle and its words, a circle its mark by status', () => {
    expect(
      html(h(Step, { label: 'Plan', number: 1, type: 'horizontal' })),
    ).toMatch(/1(<!-- -->)?\. (<!-- -->)?Plan/);
    expect(
      html(h(StepperIndicator, { number: 2, status: 'upcoming' })),
    ).toContain('>2<');
    expect(html(h(StepperIndicator, { number: 2, status: 'error' }))).toContain(
      '>!<',
    );
    expect(html(h(StepperIndicator, { number: 2 }))).toContain(
      'aria-hidden="true"',
    );
  });
});
