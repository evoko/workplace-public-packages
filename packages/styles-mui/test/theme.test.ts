import { readFileSync } from 'node:fs';
import type {
  SupportedColorScheme,
  Theme,
  ThemeOptions,
} from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import * as generated from '../src/index.js';

interface Model {
  prefix: string;
  framework: { name: string; range: string };
  themeOptions: {
    cssVariables: { cssVarPrefix: string; colorSchemeSelector: string };
    defaultColorScheme: string;
    colorSchemes: Record<
      string,
      { palette: { tokens: Record<string, string> } }
    >;
    tokens: Record<string, Record<string, string>>;
    components: Record<
      string,
      {
        defaultProps?: Record<string, unknown>;
        variants: {
          props: Record<string, string>;
          style: Record<string, unknown>;
        }[];
      }
    >;
  };
  components: Record<
    string,
    {
      themeKey: string;
      kind: 'own' | 'mapped';
      mapped: { resetCount: number } | null;
    }
  >;
}

const model = JSON.parse(
  readFileSync(
    new URL('../src/generated/theme.model.json', import.meta.url),
    'utf8',
  ),
) as Model;
const pascal = (s: string): string => s[0].toUpperCase() + s.slice(1);
const exportsByName = generated as unknown as Record<string, unknown>;
const themeOptions = exportsByName[
  `${model.prefix}ThemeOptions`
] as ThemeOptions;
const createDsTheme = exportsByName[`create${pascal(model.prefix)}Theme`] as (
  options?: ThemeOptions,
) => Theme;

/** Every custom property declared by the theme's stylesheets, last writer wins. */
function declaredVars(theme: Theme): Record<string, string> {
  const out: Record<string, string> = {};
  for (const sheet of theme.generateStyleSheets()) {
    for (const decls of Object.values(sheet)) {
      for (const [name, value] of Object.entries(
        decls as Record<string, string>,
      )) {
        out[name] = String(value);
      }
    }
  }
  return out;
}

describe('@bwp-web/styles-mui theme', () => {
  it('exports theme options that are deep-equal to theme.model.json', () => {
    expect(themeOptions).toBeDefined();
    expect(JSON.parse(JSON.stringify(themeOptions))).toEqual(
      model.themeOptions,
    );
  });

  it('peer-depends on the MUI range the model was generated for', () => {
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { peerDependencies: Record<string, string> };
    expect(pkg.peerDependencies[model.framework.name]).toBe(
      model.framework.range,
    );
  });

  it('creates a theme with every component entry and every token variable, values verbatim', () => {
    const theme = createDsTheme();
    for (const { themeKey } of Object.values(model.components)) {
      expect(
        theme.components?.[themeKey as keyof typeof theme.components],
      ).toBeDefined();
    }
    const vars = declaredVars(theme);
    const prefix = model.themeOptions.cssVariables.cssVarPrefix;
    for (const [category, entries] of Object.entries(
      model.themeOptions.tokens,
    )) {
      for (const [key, value] of Object.entries(entries)) {
        // a bare number would have gained "px"; the model only holds strings
        expect(vars[`--${prefix}-tokens-${category}-${key}`]).toBe(value);
      }
    }
    for (const key of Object.keys(
      model.themeOptions.colorSchemes[model.themeOptions.defaultColorScheme]
        .palette.tokens,
    )) {
      expect(vars[`--${prefix}-palette-tokens-${key}`]).toBeDefined();
    }
  });

  it('switches color schemes with the design system mode selector', () => {
    const theme = createDsTheme();
    const selectors = theme
      .generateStyleSheets()
      .flatMap((sheet) => Object.keys(sheet));
    for (const mode of Object.keys(model.themeOptions.colorSchemes)) {
      if (mode === model.themeOptions.defaultColorScheme) {
        continue;
      }
      // `getColorSchemeSelector` returns a selector suffixed with " &" for
      // nested use (e.g. inside `styled`); `generateStyleSheets` keys are
      // the bare selector the nested form is built from.
      expect(selectors).toContain(
        theme
          .getColorSchemeSelector(mode as SupportedColorScheme)
          .replace(/ &$/, ''),
      );
    }
  });

  it('deep-merges consumer options on top', () => {
    const theme = createDsTheme({
      components: { MuiButton: { defaultProps: { disableRipple: true } } },
    });
    expect(theme.components?.MuiButton?.defaultProps?.disableRipple).toBe(true);
    for (const { themeKey } of Object.values(model.components)) {
      expect(
        theme.components?.[themeKey as keyof typeof theme.components],
      ).toBeDefined();
    }
  });

  it('themes MUI Button with parity defaults, resets first, then the design system', () => {
    const entry = model.themeOptions.components.MuiButton;
    expect(entry.defaultProps).toMatchObject({
      disableElevation: true,
      disableFocusRipple: true,
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
      size: 'md',
      variant: 'filled',
    });
    const resetCount = model.components.button.mapped!.resetCount;
    expect(resetCount).toBeGreaterThan(0);
    const resets = entry.variants.slice(0, resetCount);
    expect(resets.every((v) => 'variant' in v.props && 'size' in v.props)).toBe(
      true,
    );
    expect(JSON.stringify(resets)).toContain('"minWidth":"revert"');
    expect(JSON.stringify(resets)).toContain(
      '"WebkitTapHighlightColor":"revert"',
    );
    const theme = createDsTheme();
    expect(theme.components?.MuiButton?.defaultProps).toEqual(
      entry.defaultProps,
    );
  });
});
