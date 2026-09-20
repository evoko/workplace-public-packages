// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { applyMode, clearMode, copyModeToHost, currentMode } from './mode';

function host(): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-parity-cell', 'css|base');
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute('data-fx-theme');
  document.documentElement.className = '';
});

describe('applyMode', () => {
  it('sets and clears a data attribute', () => {
    const mode = { kind: 'attribute' as const, name: 'data-fx-theme' };
    applyMode(mode, 'dark');
    expect(document.documentElement.getAttribute('data-fx-theme')).toBe('dark');
    clearMode(mode, ['light', 'dark']);
    expect(document.documentElement.hasAttribute('data-fx-theme')).toBe(false);
  });

  it('sets and clears a class built from the template', () => {
    const mode = { kind: 'class' as const, prefix: 'theme-', suffix: '' };
    applyMode(mode, 'dark');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(
      true,
    );
    applyMode(mode, 'light');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(
      false,
    );
    expect(document.documentElement.classList.contains('theme-light')).toBe(
      true,
    );
    clearMode(mode, ['light', 'dark']);
    expect(document.documentElement.className).toBe('');
  });

  it('carries an attribute mode to every cell host', () => {
    const mode = { kind: 'attribute' as const, name: 'data-fx-theme' };
    const cell = host();
    applyMode(mode, 'dark');
    expect(cell.getAttribute('data-fx-theme')).toBe('dark');
    applyMode(mode, 'light');
    expect(cell.getAttribute('data-fx-theme')).toBe('light');
    clearMode(mode, ['light', 'dark']);
    expect(cell.hasAttribute('data-fx-theme')).toBe(false);
  });

  it('carries a class mode to every cell host', () => {
    const mode = { kind: 'class' as const, prefix: 'theme-', suffix: '' };
    const cell = host();
    applyMode(mode, 'dark');
    expect(cell.className).toBe('theme-dark');
    applyMode(mode, 'light');
    expect(cell.className).toBe('theme-light');
    clearMode(mode, ['light', 'dark']);
    expect(cell.className).toBe('');
  });
});

describe('currentMode and copyModeToHost', () => {
  it('reads the document mode and gives it to a host that mounted later', () => {
    const mode = { kind: 'attribute' as const, name: 'data-fx-theme' };
    expect(currentMode(mode)).toBeNull();
    applyMode(mode, 'dark');
    expect(currentMode(mode)).toBe('dark');
    const late = host();
    expect(late.hasAttribute('data-fx-theme')).toBe(false);
    copyModeToHost(late, mode);
    expect(late.getAttribute('data-fx-theme')).toBe('dark');
  });

  it('reads a class mode and copies nothing when the document has none', () => {
    const mode = { kind: 'class' as const, prefix: 'theme-', suffix: '' };
    const late = host();
    copyModeToHost(late, mode);
    expect(late.className).toBe('');
    applyMode(mode, 'dark');
    expect(currentMode(mode)).toBe('dark');
    const later = host();
    copyModeToHost(later, mode);
    expect(later.className).toBe('theme-dark');
  });
});
