/**
 * PageNavigator's Playground: where the reader is is the `pageIndicator` words, which it shows: their
 * first two whole numbers are the page and the count ("1 of 10", or "Step 1/10"), and words with
 * fewer are one page. Going back or on writes the new page into the words, in the tester's wording,
 * and is logged; a page past the count is written back as the last.
 */

import { useEffect } from 'react';
import { PageNavigator } from '../../src/PageNavigator.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function PageNavigatorPlayground({ p }: { p: Playground }) {
  const words = p.text('pageIndicator');
  const numbers = words.match(/\d+/g) ?? [];
  const counted = numbers.length >= 2;
  const count = counted ? Math.max(1, Number(numbers[1])) : 1;
  const wanted = counted ? Number(numbers[0]) : 1;
  const page = Math.min(Math.max(wanted, 1), count);
  /** The words at page `n`: their first number replaced. */
  const at = (n: number) => words.replace(/\d+/, String(n));
  useEffect(() => {
    if (counted && page !== wanted) p.set('pageIndicator', at(page));
    // `p` and `at` are rebuilt on every render; the page alone decides whether to write it back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counted, page, wanted]);
  return (
    <PageNavigator
      count={count}
      page={page}
      indicator={() => words}
      onChange={(n) => {
        p.set('pageIndicator', at(n));
        p.log('onChange', n);
      }}
    />
  );
}

export default {
  render: (p) => <PageNavigatorPlayground p={p} />,
} satisfies PlaygroundBuilder;
