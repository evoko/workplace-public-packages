import oracle from '../../../../../spec/verify/insight-card.json';
import {
  InsightCard,
  type InsightCardProps,
} from '../../../src/InsightCard.js';
import type { VisualCase } from './types.js';

// Figma's words, a More menu, pressable so a hover is reached as a user reaches it; as wide as
// Figma draws it.
export default {
  oracle,
  render: (v) => (
    <InsightCard
      {...(v.props as Pick<
        InsightCardProps,
        'severity' | 'selected' | 'loading'
      >)}
      title="Label"
      description="Description goes here"
      moreItems={[{ label: 'Dismiss', onSelect: () => {} }]}
      onClick={() => {}}
      style={{ width: 320 }}
    />
  ),
} satisfies VisualCase;
