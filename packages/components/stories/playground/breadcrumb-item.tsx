/**
 * Breadcrumb Item's Playground: an item works only in its trail, so it is drawn in a Breadcrumbs
 * after a sample Home. The trail decides its type by its place, so `type` places it: a link is an
 * ancestor, a sample current page after it; the current page is the trail's last. Its words are the
 * `label` extra; a disabled one is text. Each link's click is logged with its words.
 */

import { BreadcrumbItem } from '../../src/BreadcrumbItem.js';
import { Breadcrumbs } from '../../src/Breadcrumbs.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const type = p.choice<'link' | 'current'>('type');
    const label = p.text('label');
    return (
      <Breadcrumbs>
        <BreadcrumbItem onClick={() => p.log('onClick', 'Home')}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem
          type={type}
          disabled={p.flag('disabled')}
          onClick={() => p.log('onClick', label)}
        >
          {label}
        </BreadcrumbItem>
        {type === 'link' ? <BreadcrumbItem>Current page</BreadcrumbItem> : null}
      </Breadcrumbs>
    );
  },
} satisfies PlaygroundBuilder;
