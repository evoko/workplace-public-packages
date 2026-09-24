import oracle from '../../../../../spec/verify/trend-badge.json';
import { TrendBadge, type TrendBadgeProps } from '../../../src/TrendBadge.js';
import type { VisualCase } from './types.js';

// Labelled, so it is the announced mark: decorative or not, it draws the same.
export default {
  oracle,
  render: (v) => (
    <TrendBadge
      {...(v.props as TrendBadgeProps)}
      label={String(v.props.type)}
    />
  ),
} satisfies VisualCase;
