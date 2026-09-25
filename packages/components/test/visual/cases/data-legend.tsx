import oracle from '../../../../../spec/verify/data-legend.json';
import { DataLegend, type DataLegendProps } from '../../../src/DataLegend.js';
import type { VisualCase } from './types.js';

// Figma's sample colours, the first of which the check measures (its StatusIndicator's success).
const colours = [
  'var(--solar-color-surface-feedback-success-strong)',
  'var(--solar-color-surface-feedback-warning-strong)',
  'var(--solar-color-surface-feedback-danger-strong)',
  'var(--solar-color-surface-feedback-info-strong)',
];

// Each direction with as many series as Figma draws (the oracle's items), each named.
export default {
  oracle,
  render: (v) => (
    <DataLegend
      {...(v.props as Pick<DataLegendProps, 'direction'>)}
      items={Array.from(
        { length: Number(/items=(\d)/.exec(v.figma)?.[1] ?? 2) },
        (_, i) => ({ label: `Series ${i + 1}`, color: colours[i]! }),
      )}
    />
  ),
} satisfies VisualCase;
