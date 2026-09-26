/**
 * Breadcrumbs' Playground: a trail of the `items` extra's sample pages from the top, the last the
 * current page; past five the middle collapses to an ellipsis, whose menu lists the pages it hides.
 * Choosing a page goes to it, as an app's trail does: the trail ends at it (`items` is set), and the
 * click is logged with its words.
 */

import { BreadcrumbItem } from '../../src/BreadcrumbItem.js';
import { Breadcrumbs } from '../../src/Breadcrumbs.js';
import { pages } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Breadcrumbs>
      {pages.slice(0, p.whole('items')).map((page, i) => (
        <BreadcrumbItem
          key={page}
          onClick={() => {
            p.set('items', i + 1);
            p.log('onClick', page);
          }}
        >
          {page}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  ),
} satisfies PlaygroundBuilder;
