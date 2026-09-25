import oracle from '../../../../../spec/verify/chart-tooltip.json';
import { ChartTooltip } from '../../../src/ChartTooltip.js';
import type { VisualCase } from './types.js';

// Figma's sample colours, the first of which the check measures (its StatusIndicator's success).
const colours = [
  'var(--solar-color-surface-feedback-success-strong)',
  'var(--solar-color-surface-feedback-warning-strong)',
  'var(--solar-color-surface-feedback-danger-strong)',
];

// Figma's title and value: one bare value (single), or three named series (multi).
export default {
  oracle,
  render: (v) => (
    <ChartTooltip
      title="Jan 2026"
      rows={
        (v.props as { series?: string }).series === 'multi' ||
        /multi/.test(v.figma)
          ? colours.map((color, i) => ({
              label: `Series ${i + 1}`,
              value: '60.4k',
              color,
            }))
          : [{ value: '60.4k', color: colours[0]! }]
      }
    />
  ),
} satisfies VisualCase;
