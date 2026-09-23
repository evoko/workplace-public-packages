import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderTailwind } from '../src/emit/tailwind.mjs';

const { spec } = buildTokenSpec(loadContract());
const { css, theme, utilities, manifest } = renderTailwind(spec);
const has = (line) => expect(theme).toContain(`  ${line}`);

describe('renderTailwind, for Tailwind CSS 4', () => {
  it('is a stylesheet that brings tokens.css with it', () => {
    expect(css).toContain("@import './tokens.css';");
    expect(css).toContain('@theme inline {');
    expect(css).not.toMatch(/export|require\(|module\./);
  });

  it('registers colours as references, so dark mode keeps switching with data-theme', () => {
    has('--color-surface-background: var(--solar-color-surface-background);');
  });

  it('puts inset and stack on the spacing scale, and radius and shadow in their own', () => {
    has('--spacing-inset-md: var(--solar-inset-md);');
    has('--spacing-stack-lg: var(--solar-stack-lg);');
    has('--radius-control: var(--solar-radius-control);');
    has('--shadow-control: var(--solar-shadow-control);');
  });

  it('maps type sizes, font families and easings, but not the weights Tailwind already has', () => {
    has('--text-display-lg: var(--solar-type-size-display-lg);');
    has('--font-inter: var(--solar-type-font-family-inter);');
    has('--ease-out: var(--solar-motion-ease-out);');
    expect(css).not.toContain('--font-weight-');
  });

  it('uses real pixels for breakpoints, which media queries cannot read from a variable', () => {
    has('--breakpoint-md: 1024px;');
  });

  it('makes utilities for the families Tailwind 4 has no namespace for', () => {
    expect(utilities).toContain(
      '@utility border-default {\n  border-width: var(--solar-border-default);\n}',
    );
    expect(utilities).toContain(
      '@utility z-dialog {\n  z-index: var(--solar-z-dialog);\n}',
    );
    expect(utilities).toContain(
      '@utility duration-fast {\n  --tw-duration: var(--solar-motion-duration-fast);\n  transition-duration: var(--solar-motion-duration-fast);\n}',
    );
  });

  it('does not redefine a core utility that means something else', () => {
    // Tailwind's border-none is border-style: none; SOLAR's border.none width is border-0.
    expect(css).not.toContain('@utility border-none');
    expect(manifest).not.toHaveProperty(['border.none']);
  });

  it('exposes the semantic layer only, apart from motion and the font families', () => {
    expect(css).not.toContain('--color-brand-red:');
    expect(Object.keys(manifest).length).toBeGreaterThan(300);
  });

  it('registers every theme variable once', () => {
    const names = theme.map((l) => l.trim().split(':')[0]);
    expect(new Set(names).size).toBe(names.length);
  });
});
