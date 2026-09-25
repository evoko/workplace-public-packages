import oracle from '../../../../../spec/verify/bar.json';
import { Bar, type BarProps } from '../../../src/Bar.js';
import type { VisualCase } from './types.js';

// Each colour, in Figma's 32 × 80 (it fills the box its chart gives it).
export default {
  oracle,
  render: (v) => (
    <div style={{ width: 32, height: 80, display: 'flex' }}>
      <Bar {...(v.props as Pick<BarProps, 'color'>)} data-case-root="" />
    </div>
  ),
} satisfies VisualCase;
