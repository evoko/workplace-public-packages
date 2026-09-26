/**
 * ProgressBar's Playground: its feedback, and how far along it is, the `value` extra in percent
 * (the shell takes 0 to 100), shown above it, as SOLAR asks an app to say it. It fills its
 * container, the width box.
 */

import { ProgressBar, type ProgressBarProps } from '../../src/ProgressBar.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const value = p.whole('value');
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{`${value}%`}</span>
        <ProgressBar
          feedback={p.choice<NonNullable<ProgressBarProps['feedback']>>(
            'feedback',
          )}
          value={value}
          aria-label="Progress"
        />
      </div>
    );
  },
} satisfies PlaygroundBuilder;
