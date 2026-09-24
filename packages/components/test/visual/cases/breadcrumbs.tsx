import oracle from '../../../../../spec/verify/breadcrumbs.json';
import { BreadcrumbItem } from '../../../src/BreadcrumbItem.js';
import { Breadcrumbs } from '../../../src/Breadcrumbs.js';
import type { OracleVariant, VisualCase } from './types.js';

/** The pages Figma's trail holds: its count, or seven where it is past five ("multiple"). */
const pages = (v: OracleVariant) => {
  const n = /items=(\d+)/.exec(v.figma)?.[1];
  return n === undefined ? 7 : Number(n);
};

// Figma's trail of links, the last the current page; past five, collapsed as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <Breadcrumbs>
      {Array.from({ length: pages(v) }, (_, i) => (
        <BreadcrumbItem key={i} href="#">
          Label
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  ),
} satisfies VisualCase;
