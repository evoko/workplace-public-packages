import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Alert } from '../src/Alert.tsx';
import { AlertSmall } from '../src/AlertSmall.tsx';
import { Banner } from '../src/Banner.tsx';
import { EmptyState } from '../src/EmptyState.tsx';
import { Toast } from '../src/Toast.tsx';
import { cls } from './classes.mjs';

// By the shell's prefix (AlertSmall), the component's name.
const NAMES = {
  Alert: 'Alert',
  AlertSmall: 'Alert Small',
  Banner: 'Banner',
  EmptyState: 'EmptyState',
  Toast: 'Toast',
};
const drawn = (html, prefix, layer) =>
  new RegExp(`<[a-z]+[^>]*class="${cls(NAMES[prefix], layer)}[ "]`).test(html);

describe('the SOLAR callouts', () => {
  it('are announced at once where they warn, and politely otherwise', () => {
    expect(
      renderToString(h(Alert, { type: 'danger', title: 'Lost' })),
    ).toContain('role="alert"');
    expect(
      renderToString(h(AlertSmall, { type: 'info', title: 'Note' })),
    ).toContain('role="status"');
  });

  it('draw what they are given, the action a button', () => {
    const html = renderToString(
      h(Alert, { title: 'Saved', action: 'Undo', onAction() {} }),
    );
    expect(html).toContain('>Saved</span>');
    expect(html).toMatch(
      /<button type="button" class="SolarAlert-action[^>]*>Undo<\/button>/,
    );
    expect(drawn(html, 'Alert', 'description')).toBe(false);
    expect(drawn(html, 'Alert', 'statusIndicator')).toBe(true);
  });
});

describe('the SOLAR Banner', () => {
  it('draws its message, a close button where onClose is given, and the caller’s Button', () => {
    const html = renderToString(
      h(Banner, {
        type: 'warning',
        description: 'Maintenance tonight',
        primaryButton: h('button', null, 'Details'),
        onClose() {},
      }),
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('>Maintenance tonight</span>');
    expect(html).toContain('aria-label="Dismiss"');
    expect(drawn(html, 'Banner', 'primaryButton')).toBe(true);
    expect(drawn(html, 'Banner', 'secondaryButton')).toBe(false);
    expect(drawn(html, 'Banner', 'iconWarning')).toBe(true);
  });
});

describe('the SOLAR Toast', () => {
  it('holds a SOLAR Tag with the caller’s words, and its action', () => {
    const html = renderToString(
      h(Toast, {
        status: 'success',
        message: 'File saved',
        tag: 'Room A',
        action: 'Undo',
      }),
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('>Room A</span>');
    expect(html).toContain('>File saved</span>');
    expect(drawn(html, 'Toast', 'chevron')).toBe(false);
  });
});

describe('the SOLAR EmptyState', () => {
  it('draws only what it is given', () => {
    const html = renderToString(h(EmptyState, { title: 'No rooms yet' }));
    expect(html.replace(/<style[^<]*<\/style>/g, '')).toMatch(/^<div/);
    expect(html).toContain('>No rooms yet</span>');
    expect(drawn(html, 'EmptyState', 'description')).toBe(false);
    expect(drawn(html, 'EmptyState', 'action')).toBe(false);
  });
});
