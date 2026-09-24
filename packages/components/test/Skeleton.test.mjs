import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Skeleton } from '../src/Skeleton.tsx';

describe('the SOLAR Skeleton shell', () => {
  it('is decorative, MUI’s rectangular pulse, whatever the type', () => {
    const html = renderToString(h(Skeleton, { type: 'text' }));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('MuiSkeleton-rectangular');
    expect(html).toContain('MuiSkeleton-pulse');
    expect(html).not.toContain('MuiSkeleton-text');
  });
});
