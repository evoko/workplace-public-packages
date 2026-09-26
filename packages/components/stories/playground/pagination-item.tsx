/**
 * PaginationItem's Playground: a page works only in its row, so it is drawn first of three, its two
 * sample siblings the pages after it. Its number is the `page` words' (1 where they are no whole
 * number, as Flutter's page is a number). The row decides which is current: `selected` on makes this
 * page current, off the sibling chosen last (the first at first). Choosing a page sets `selected`
 * and is logged with its number. A disabled page stays inert.
 */

import { useState } from 'react';
import { PaginationItem } from '../../src/PaginationItem.js';
import type { Playground, PlaygroundBuilder } from './types.js';

/** A page's number from words: a whole number from 1, or 1. */
const pageOf = (words: string) =>
  /^\s*\d+\s*$/.test(words) ? Math.max(1, Number(words)) : 1;

function PaginationItemPlayground({ p }: { p: Playground }) {
  // Which sibling is current while this page is not.
  const [sibling, setSibling] = useState(0);
  const page = pageOf(p.text('page'));
  const selected = p.flag('selected');
  return (
    <div
      role="group"
      aria-label="Pages"
      style={{ display: 'flex', gap: 'var(--solar-stack-2xs)' }}
    >
      <PaginationItem
        selected={selected}
        disabled={p.flag('disabled')}
        onClick={() => {
          p.set('selected', true);
          p.log('onClick', page);
        }}
      >
        {page}
      </PaginationItem>
      {[page + 1, page + 2].map((n, i) => (
        <PaginationItem
          key={i}
          selected={!selected && sibling === i}
          onClick={() => {
            setSibling(i);
            p.set('selected', false);
            p.log('onClick', n);
          }}
        >
          {n}
        </PaginationItem>
      ))}
    </div>
  );
}

export default {
  render: (p) => <PaginationItemPlayground p={p} />,
} satisfies PlaygroundBuilder;
