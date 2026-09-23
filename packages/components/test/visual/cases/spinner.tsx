import oracle from '../../../../../spec/verify/spinner.json';
import { Spinner, type SpinnerProps } from '../../../src/Spinner.js';
import type { VisualCase } from './types.js';

export default {
  oracle,
  render: (v) => (
    <Spinner {...(v.props as SpinnerProps)} aria-label="Loading" />
  ),
} satisfies VisualCase;
