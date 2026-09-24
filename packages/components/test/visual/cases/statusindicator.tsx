import oracle from '../../../../../spec/verify/statusindicator.json';
import {
  StatusIndicator,
  type StatusIndicatorProps,
} from '../../../src/StatusIndicator.js';
import type { VisualCase } from './types.js';

// Labelled, so it is the announced mark: decorative or not, it draws the same.
export default {
  oracle,
  render: (v) => (
    <StatusIndicator
      {...(v.props as StatusIndicatorProps)}
      label={String(v.props.type)}
    />
  ),
} satisfies VisualCase;
