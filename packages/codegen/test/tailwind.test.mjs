import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderTailwind } from '../src/emit/tailwind.mjs';

const { spec } = buildTokenSpec(loadContract());
const { ts, preset } = renderTailwind(spec);

describe('renderTailwind', () => {
  it('maps colours to CSS variable references so dark mode keeps working', () => {
    expect(preset.theme.extend.colors['surface-background']).toBe(
      'var(--solar-color-surface-background)',
    );
  });

  it('maps spacing, radius and border width', () => {
    expect(preset.theme.extend.spacing['inset-md']).toBe(
      'var(--solar-inset-md)',
    );
    expect(preset.theme.extend.borderRadius.control).toBe(
      'var(--solar-radius-control)',
    );
    expect(preset.theme.extend.borderWidth.default).toBe(
      'var(--solar-border-default)',
    );
  });

  it('maps breakpoints to screens using real pixel values, not variables', () => {
    expect(preset.theme.extend.screens.md).toBe('1024px');
  });

  it('exposes the font families, which Tailwind has no default for, but not the weights', () => {
    expect(preset.theme.extend.fontFamily.inter).toBe(
      'var(--solar-type-font-family-inter)',
    );
    expect(Object.keys(preset.theme.extend.fontFamily)).toHaveLength(6);
    // SOLAR's 100 to 900 are exactly Tailwind's built-in scale, so they are not re-exported.
    expect(preset.theme.extend.fontWeight).toBeUndefined();
  });

  it('maps durations and easings', () => {
    expect(preset.theme.extend.transitionDuration.fast).toBe(
      'var(--solar-motion-duration-fast)',
    );
    expect(preset.theme.extend.transitionTimingFunction.both).toBe(
      'var(--solar-motion-ease-both)',
    );
  });

  it('resolves shadow aliases rather than passing the composite string through', () => {
    expect(preset.theme.extend.boxShadow.control).toBe(
      'var(--solar-shadow-control)',
    );
  });

  it('emits a module that imports nothing', () => {
    expect(ts).not.toContain('import');
    expect(ts).toContain('export const solarTailwindPreset');
  });
});
