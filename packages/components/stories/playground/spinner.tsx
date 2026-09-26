/** Spinner's Playground: its size and variant, named "Loading". */

import { Spinner, type SpinnerProps } from '../../src/Spinner.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Spinner
      size={p.choice<NonNullable<SpinnerProps['size']>>('size')}
      variant={p.choice<NonNullable<SpinnerProps['variant']>>('variant')}
      aria-label="Loading"
    />
  ),
} satisfies PlaygroundBuilder;
