import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { FileUpload } from '../src/FileUpload.tsx';

const upload = (props = {}) => renderToString(h(FileUpload, props));

describe('the SOLAR FileUpload shell', () => {
  it('takes a file in a real file input, of its types, opened by Browse', () => {
    const html = upload({ accept: '.jpg,.png', name: 'photo' });
    expect(html).toMatch(
      /<input[^>]*type="file"[^>]*hidden=""[^>]*accept="\.jpg,\.png"[^>]*name="photo"/,
    );
    expect(html).toContain('>Browse</button>');
    expect(html).toContain('Select a file…');
  });

  it('shows the file chosen, with replace and remove, in Browse’s place', () => {
    const html = upload({ defaultValue: [new File([''], 'plan.pdf')] });
    expect(html).toContain('plan.pdf');
    expect(html).toContain('aria-label="Replace file"');
    expect(html).toContain('aria-label="Remove file"');
    expect(html).not.toContain('>Browse</button>');
  });
});
