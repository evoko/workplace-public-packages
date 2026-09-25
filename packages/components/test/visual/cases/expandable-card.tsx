import oracle from '../../../../../spec/verify/expandable-card.json';
import {
  ExpandableCard,
  type ExpandableCardProps,
} from '../../../src/ExpandableCard.js';
import type { VisualCase } from './types.js';

// Figma's words, expanded or not as the variant is; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <ExpandableCard
      {...(v.props as Pick<ExpandableCardProps, 'expanded'>)}
      title="Label"
      description="Content"
      style={{ width: 320 }}
    />
  ),
} satisfies VisualCase;
