/**
 * All-Day Bar's Playground: its variant, span, category, time and title from their controls, a
 * cleared time left out. It fills the width box, as a bar fills the columns it spans. A styled
 * part: what a click does is the app's, and it takes none.
 */

import { AllDayBar, type AllDayBarProps } from '../../src/AllDayBar.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <AllDayBar
      variant={p.choice<NonNullable<AllDayBarProps['variant']>>('variant')}
      span={p.choice<NonNullable<AllDayBarProps['span']>>('span')}
      category={p.choice<NonNullable<AllDayBarProps['category']>>('category')}
      time={p.words('time')}
      title={p.text('title')}
    />
  ),
} satisfies PlaygroundBuilder;
