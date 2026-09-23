import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { cssLiteral, renderCss } from '../src/emit/css.mjs';

const { spec } = buildTokenSpec(loadContract());
const { css } = renderCss(spec);

describe('cssLiteral', () => {
  it('formats each type the way CSS needs it', () => {
    expect(cssLiteral('dimension', '16px')).toBe('16px');
    expect(cssLiteral('duration', '100ms')).toBe('100ms');
    expect(cssLiteral('cubicBezier', [0.42, 0, 1, 1])).toBe(
      'cubic-bezier(0.42, 0, 1, 1)',
    );
    // A stack, never a bare name: a font that fails to load must not fall to the browser's serif.
    expect(cssLiteral('fontFamily', 'Open Sans')).toBe(
      '"Open Sans", system-ui, sans-serif',
    );
    expect(cssLiteral('fontFamily', 'Inter')).toBe(
      '"Inter", "Open Sans", system-ui, sans-serif',
    );
    expect(cssLiteral('fontFamily', 'IBM Plex Mono')).toBe(
      '"IBM Plex Mono", "Roboto Mono", ui-monospace, monospace',
    );
    expect(() => cssLiteral('fontFamily', 'Comic Sans')).toThrow(
      /no web font stack for Comic Sans/,
    );
    expect(cssLiteral('fontWeight', 600)).toBe('600');
  });
});

describe('renderCss', () => {
  it('emits light values on :root and dark under the theme attribute', () => {
    expect(css).toMatch(
      /:root \{[\s\S]*--solar-color-surface-background: #f5f5f5;/,
    );
    expect(css).toMatch(
      /\[data-theme='dark'\] \{[\s\S]*--solar-color-surface-background: #111111;/,
    );
  });

  it('switches type sizes under the mobile media query', () => {
    expect(css).toMatch(
      /@media \(max-width: 767\.98px\)[\s\S]*--solar-type-size-display-lg: 40px;/,
    );
  });

  it('never emits the invalid values that are in the Figma data', () => {
    // The token is legitimately named motion.ease.both, so the property name contains
    // "ease-both". What must never appear is the invalid keyword as a value.
    expect(css).not.toMatch(/:\s*ease-(both|in|out)\s*;/);
    expect(css).toContain(
      '--solar-motion-ease-both: cubic-bezier(0.42, 0, 0.58, 1);',
    );
    expect(css).not.toMatch(/--solar-type-font-weight-\d+: [A-Za-z]/);
  });

  it('emits the SOLAR Web layout tokens and the z-index ladder', () => {
    expect(css).toContain('--solar-layout-grid-columns-lg: 12;');
    expect(css).toContain('--solar-z-dialog: 400;');
  });

  it('emits shadows as composites in both modes', () => {
    expect(css).toMatch(
      /--solar-shadow-control: 0px 1px 1px 0px rgba\(0, 0, 0, 0\.05\);/,
    );
  });

  it('does not emit typography composites as custom properties', () => {
    expect(css).not.toContain('--solar-typography-');
  });
});
