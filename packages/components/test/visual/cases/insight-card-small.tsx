import oracle from '../../../../../spec/verify/insight-card-small.json';
import {
  InsightCardSmall,
  type InsightCardSmallProps,
} from '../../../src/InsightCardSmall.js';
import type { VisualCase } from './types.js';

// Figma's words, pressable so a hover is reached as a user reaches it; as wide as Figma
// draws it.
export default {
  oracle,
  render: (v) => (
    <InsightCardSmall
      {...(v.props as Pick<InsightCardSmallProps, 'severity' | 'loading'>)}
      title="Label"
      description="Description goes here"
      onClick={() => {}}
      style={{ width: 320 }}
    />
  ),
} satisfies VisualCase;
