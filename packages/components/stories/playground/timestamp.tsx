/**
 * Timestamp's Playground: its format, size and emphasis; its words the `text` extra, and, for
 * `combined`, the absolute time they abbreviate the `detail` extra, shown on hover. The moment
 * itself is a fixed sample.
 */

import { Timestamp, type TimestampProps } from '../../src/Timestamp.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const format = p.choice<NonNullable<TimestampProps['format']>>('format');
    const detail = p.words('detail');
    return (
      <Timestamp
        format={format}
        size={p.choice<NonNullable<TimestampProps['size']>>('size')}
        emphasis={p.choice<NonNullable<TimestampProps['emphasis']>>('emphasis')}
        dateTime="2026-04-18T14:32:00Z"
        detail={format === 'combined' ? detail : undefined}
      >
        {p.text('text')}
      </Timestamp>
    );
  },
} satisfies PlaygroundBuilder;
