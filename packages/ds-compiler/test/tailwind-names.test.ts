import { describe, expect, it } from 'vitest';
import {
  TAILWIND_NAMESPACES,
  sourceNameFromTailwind,
  tailwindVarName,
} from '../src/targets/tailwind/names.js';
import {
  renderColor,
  renderDimension,
  renderTokenValue,
} from '../src/targets/css-values.js';
import { parseDimension, parseLiteral } from '../src/tokens/values.js';

describe('tailwind variable names', () => {
  it('maps namespaced categories and keeps the source name for the rest', () => {
    expect(tailwindVarName('color', ['text', 'default'], 'fx')).toBe(
      '--color-fx-text-default',
    );
    expect(tailwindVarName('space', ['2'], 'fx')).toBe('--spacing-fx-2');
    expect(tailwindVarName('font-family', ['body'], 'fx')).toBe(
      '--font-fx-body',
    );
    expect(tailwindVarName('font-size', ['md'], 'fx')).toBe('--text-fx-md');
    expect(tailwindVarName('font-weight', ['semibold'], 'fx')).toBe(
      '--font-weight-fx-semibold',
    );
    expect(tailwindVarName('line-height', ['tight'], 'fx')).toBe(
      '--leading-fx-tight',
    );
    expect(tailwindVarName('letter-spacing', ['tight'], 'fx')).toBe(
      '--tracking-fx-tight',
    );
    expect(tailwindVarName('shadow', ['sm'], 'fx')).toBe('--shadow-fx-sm');
    expect(tailwindVarName('easing', ['standard'], 'fx')).toBe(
      '--ease-fx-standard',
    );
    expect(tailwindVarName('duration', ['fast'], 'fx')).toBe(
      '--fx-duration-fast',
    );
    expect(tailwindVarName('border-width', ['1'], 'fx')).toBe(
      '--fx-border-width-1',
    );
    expect(tailwindVarName('size', ['control', 'md'], 'fx')).toBe(
      '--fx-size-control-md',
    );
    expect(Object.keys(TAILWIND_NAMESPACES)).toHaveLength(10);
  });

  it('inverts every name, preferring the longest namespace', () => {
    expect(sourceNameFromTailwind('--color-fx-text-default', 'fx')).toBe(
      '--fx-color-text-default',
    );
    expect(sourceNameFromTailwind('--font-weight-fx-semibold', 'fx')).toBe(
      '--fx-font-weight-semibold',
    );
    expect(sourceNameFromTailwind('--font-fx-weight-x', 'fx')).toBe(
      '--fx-font-family-weight-x',
    );
    expect(sourceNameFromTailwind('--text-fx-md', 'fx')).toBe(
      '--fx-font-size-md',
    );
    expect(sourceNameFromTailwind('--fx-duration-fast', 'fx')).toBe(
      '--fx-duration-fast',
    );
    expect(sourceNameFromTailwind('--color-other-x', 'fx')).toBeNull();
    expect(sourceNameFromTailwind('--tw-something', 'fx')).toBeNull();
  });

  it('rejects a candidate that is not a valid token name', () => {
    expect(sourceNameFromTailwind('--fx-notacat-x', 'fx')).toBeNull();
    expect(sourceNameFromTailwind('--color-fx-Text', 'fx')).toBeNull();
  });
});

describe('value rendering', () => {
  const refName = (id: string): string => `--ref-${id}`;

  it('renders colors compactly and dimensions with units', () => {
    expect(renderColor('#1863d3ff')).toBe('#1863d3');
    expect(renderColor('#00000033')).toBe('#00000033');
    expect(renderDimension({ value: 0, unit: 'px' })).toBe('0px');
    expect(renderDimension({ value: 0.5, unit: 'rem' })).toBe('0.5rem');
  });

  it('formats a very small number without exponential notation and parses back', () => {
    const rendered = renderDimension({ value: 1e-7, unit: 'rem' });
    expect(rendered).toBe('0.0000001rem');
    expect(parseDimension(rendered)).toEqual({ value: 1e-7, unit: 'rem' });
  });

  it('renders every token type', () => {
    expect(renderTokenValue({ hex: '#ffffffff' }, 'color', refName)).toBe(
      '#ffffff',
    );
    expect(
      renderTokenValue({ value: 8, unit: 'px' }, 'dimension', refName),
    ).toBe('8px');
    expect(
      renderTokenValue(
        { families: ['Open Sans', 'Arial', 'sans-serif'] },
        'fontFamily',
        refName,
      ),
    ).toBe("'Open Sans', Arial, sans-serif");
    expect(renderTokenValue({ weight: 600 }, 'fontWeight', refName)).toBe(
      '600',
    );
    expect(renderTokenValue({ value: 1.5 }, 'number', refName)).toBe('1.5');
    expect(renderTokenValue({ ms: 150 }, 'duration', refName)).toBe('150ms');
    expect(
      renderTokenValue({ points: [0.4, 0, 0.2, 1] }, 'cubicBezier', refName),
    ).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(renderTokenValue({ layers: [] }, 'shadow', refName)).toBe('none');
    expect(
      renderTokenValue(
        {
          layers: [
            {
              inset: false,
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 1, unit: 'px' },
              blur: { value: 2, unit: 'px' },
              spread: { value: 0, unit: 'px' },
              color: { hex: '#00000033' },
            },
            {
              inset: true,
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 0, unit: 'px' },
              blur: { value: 0, unit: 'px' },
              spread: { value: 2, unit: 'px' },
              color: { ref: 'color.focus.ring' },
            },
          ],
        },
        'shadow',
        refName,
      ),
    ).toBe(
      '0px 1px 2px 0px #00000033, inset 0px 0px 0px 2px var(--ref-color.focus.ring)',
    );
  });

  it('round-trips font family names through quoting and unescaping', () => {
    const names = [
      "Bob's Font",
      'Say "Hi"',
      'Mixed \'a\' "b"',
      'Back\\slash',
      'Open Sans',
      'serif',
    ];
    for (const name of names) {
      const input = { families: [name, 'serif'] };
      const rendered = renderTokenValue(input, 'fontFamily', refName);
      expect(parseLiteral(rendered, 'fontFamily', 'fx')).toEqual(input);
    }
  });
});
