import { describe, expect, it } from 'vitest';
import {
  camelCase,
  camelCategory,
  camelProperty,
  colorSchemeSelectorFor,
  kebabCategory,
  kebabProperty,
  muiVarName,
  pascalCase,
  slotClassName,
  sourceNameFromMui,
  specificityKey,
  themeKeyFor,
} from '../src/targets/mui/names.js';
import { TOKEN_CATEGORIES } from '../src/tokens/categories.js';

describe('mui names', () => {
  it('cases identifiers', () => {
    expect(pascalCase('example')).toBe('Example');
    expect(pascalCase('date-picker-2')).toBe('DatePicker2');
    expect(camelCase('font-weight')).toBe('fontWeight');
    expect(camelCase('color')).toBe('color');
    expect(themeKeyFor('bwp', 'example')).toBe('BwpExample');
    expect(themeKeyFor('fx', 'date-picker')).toBe('FxDatePicker');
    expect(slotClassName('BwpExample', 'icon')).toBe('BwpExample-icon');
  });

  it('maps every token category to a camel key and back', () => {
    for (const category of TOKEN_CATEGORIES) {
      expect(kebabCategory(camelCategory(category))).toBe(category);
    }
    expect(camelCategory('z-index')).toBe('zIndex');
    expect(kebabCategory('nope')).toBeNull();
  });

  it('maps CSS properties to camelCase and back', () => {
    expect(camelProperty('border-top-left-radius')).toBe('borderTopLeftRadius');
    expect(kebabProperty('borderTopLeftRadius')).toBe('border-top-left-radius');
    expect(camelProperty('color')).toBe('color');
  });

  it('names token variables the way MUI derives them and inverts the mapping', () => {
    const color = { category: 'color' as const, path: ['text', 'default'] };
    const weight = { category: 'font-weight' as const, path: ['semibold'] };
    const space = { category: 'space' as const, path: ['2'] };
    expect(muiVarName('bwp', color)).toBe('--bwp-palette-tokens-text-default');
    expect(muiVarName('bwp', weight)).toBe('--bwp-tokens-fontWeight-semibold');
    expect(muiVarName('bwp', space)).toBe('--bwp-tokens-space-2');
    expect(sourceNameFromMui('--bwp-palette-tokens-text-default', 'bwp')).toBe(
      '--bwp-color-text-default',
    );
    expect(sourceNameFromMui('--bwp-tokens-fontWeight-semibold', 'bwp')).toBe(
      '--bwp-font-weight-semibold',
    );
    expect(sourceNameFromMui('--bwp-tokens-space-2', 'bwp')).toBe(
      '--bwp-space-2',
    );
    expect(sourceNameFromMui('--bwp-tokens-nope-x', 'bwp')).toBeNull();
    expect(sourceNameFromMui('--bwp-palette-primary-main', 'bwp')).toBeNull();
    expect(sourceNameFromMui('--other-tokens-space-2', 'bwp')).toBeNull();
    expect(sourceNameFromMui('--bwp-tokens-space-', 'bwp')).toBeNull();
    // colors never live under the root "tokens" key, only under palette.tokens
    expect(sourceNameFromMui('--fx-tokens-color-x', 'fx')).toBeNull();
  });

  it('derives the MUI colorSchemeSelector from the mode selector', () => {
    expect(colorSchemeSelectorFor(':root[data-bwp-theme="{mode}"]')).toBe(
      'data-bwp-theme',
    );
    expect(colorSchemeSelectorFor("[data-theme='{mode}']")).toBe('data-theme');
    expect(colorSchemeSelectorFor('.theme-{mode}')).toBe('.theme-%s');
    expect(colorSchemeSelectorFor(':root.{mode}-mode')).toBe('.%s-mode');
    expect(colorSchemeSelectorFor('html[data-theme="{mode}"]')).toBeNull();
    expect(
      colorSchemeSelectorFor(':root[data-theme="{mode}"] body'),
    ).toBeNull();
    expect(
      colorSchemeSelectorFor('@media (prefers-color-scheme: {mode})'),
    ).toBeNull();
  });

  it('builds the nested selector key that reproduces the CSS target specificity', () => {
    expect(specificityKey(0, [], 'button', 'root', 'FxChip')).toBe('&');
    expect(specificityKey(0, ['hover'], 'button', 'root', 'FxChip')).toBe(
      '&:hover',
    );
    expect(specificityKey(1, [], 'button', 'root', 'FxChip')).toBe('&&');
    expect(
      specificityKey(2, ['hover', 'disabled'], 'button', 'root', 'FxChip'),
    ).toBe('&&&:hover:disabled');
    expect(specificityKey(0, ['disabled'], 'div', 'root', 'FxTag')).toBe(
      '&[aria-disabled="true"]',
    );
    expect(specificityKey(1, ['hover'], 'button', 'icon', 'FxChip')).toBe(
      '&&:hover .FxChip-icon',
    );
    expect(specificityKey(0, [], 'button', 'icon', 'FxChip')).toBe(
      '& .FxChip-icon',
    );
  });
});
