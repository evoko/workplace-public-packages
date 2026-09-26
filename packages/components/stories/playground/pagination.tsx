/**
 * Pagination's Playground: the `count` pages and the current `page` extras, which choosing a page
 * or an arrow sets. The page is kept within the pages shown: where `count` drops below it, the
 * builder writes the last page back, so the panel shows the page the component does.
 */

import { useEffect } from 'react';
import { Pagination } from '../../src/Pagination.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function PaginationPlayground({ p }: { p: Playground }) {
  const count = p.whole('count');
  const wanted = p.whole('page');
  const page = Math.min(wanted, count);
  useEffect(() => {
    if (page !== wanted) p.set('page', page);
    // `p` is rebuilt on every render; the page alone decides whether to write it back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, wanted]);
  return (
    <Pagination
      count={count}
      page={page}
      onChange={(n) => {
        p.set('page', n);
        p.log('onChange', n);
      }}
    />
  );
}

export default {
  render: (p) => <PaginationPlayground p={p} />,
} satisfies PlaygroundBuilder;
