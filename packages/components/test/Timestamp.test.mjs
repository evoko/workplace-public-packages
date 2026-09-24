import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Timestamp } from '../src/Timestamp.tsx';

describe('the SOLAR Timestamp shell', () => {
  it('is a <time> with the moment machine-readable, and the app’s words', () => {
    const html = renderToString(
      h(Timestamp, { dateTime: new Date('2026-04-18T14:32:00Z') }, '2 min ago'),
    );
    expect(html).toMatch(/<time[^>]*datetime="2026-04-18T14:32:00.000Z"/i);
    expect(html).toContain('>2 min ago</span>');
  });

  it('shows the absolute time on hover, for combined', () => {
    const html = renderToString(
      h(
        Timestamp,
        {
          format: 'combined',
          dateTime: '2026-04-18T14:32:00Z',
          detail: 'Apr 18, 2026, 14:32',
        },
        '2 min ago',
      ),
    );
    expect(html).toContain('title="Apr 18, 2026, 14:32"');
  });
});
