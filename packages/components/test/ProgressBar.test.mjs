import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { ProgressBar } from '../src/ProgressBar.tsx';

describe('the SOLAR ProgressBar shell', () => {
  it('is a determinate progressbar at its value', () => {
    const html = renderToString(
      h(ProgressBar, { value: 40, 'aria-label': 'Upload' }),
    );
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="40"');
    expect(html).toContain('aria-label="Upload"');
  });
});
