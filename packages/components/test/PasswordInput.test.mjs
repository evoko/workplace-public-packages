import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { PasswordInput } from '../src/PasswordInput.tsx';

const field = (props = {}) => renderToString(h(PasswordInput, props));
const input = (html) => /<input[^>]*>/.exec(html)[0];

describe('the SOLAR Password Input shell', () => {
  it('is a password input a password manager fills, labelled by its label', () => {
    const html = field({ label: 'Password', id: 'pw' });
    expect(input(html)).toContain('type="password"');
    expect(input(html)).toContain('autoComplete="current-password"');
    expect(html).toMatch(
      /<label for="pw" class="SolarPasswordInput-label[^"]*">/,
    );
    expect(input(field({ autoComplete: 'new-password' }))).toContain(
      'autoComplete="new-password"',
    );
  });

  it('shows and hides its words with SOLAR’s eye, a toggle for the input', () => {
    const html = field({ id: 'pw' });
    expect(html).toMatch(
      /<button type="button" aria-label="Show password" aria-pressed="false" aria-controls="pw" class="[^"]*SolarPasswordInput--icon/,
    );
  });

  it('draws the forgot-password link beside the helper, where given', () => {
    const html = field({
      helper: 'At least 12 characters',
      forgotPassword: h('a', { href: '/reset' }, 'Forgot password?'),
    });
    expect(html).toMatch(
      /SolarPasswordInput-helper[^>]*>At least 12 characters/,
    );
    expect(html).toMatch(
      /SolarPasswordInput-forgotPassword[^>]*><a href="\/reset">/,
    );
  });
});
