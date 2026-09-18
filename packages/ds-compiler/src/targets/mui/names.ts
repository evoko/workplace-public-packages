import { stateSelector } from '../../components/render-selector.js';
import {
  TOKEN_CATEGORIES,
  parseTokenName,
  type TokenCategory,
} from '../../tokens/categories.js';
import { normalizeQuotes } from '../../tokens/parse-tokens.js';

/** `date-picker-2` to `DatePicker2`. */
export function pascalCase(kebab: string): string {
  return kebab
    .split('-')
    .filter((part) => part !== '')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

/** `font-weight` to `fontWeight`. */
export function camelCase(kebab: string): string {
  const pascal = pascalCase(kebab);
  return pascal === '' ? '' : pascal[0].toLowerCase() + pascal.slice(1);
}

/** The theme key and class-name stem of a component: `<Prefix><Name>`, e.g. `BwpExample`. */
export function themeKeyFor(prefix: string, componentName: string): string {
  return pascalCase(prefix) + pascalCase(componentName);
}

/** `BwpExample-icon`: the class each slot element carries. */
export function slotClassName(themeKey: string, slot: string): string {
  return `${themeKey}-${slot}`;
}

const CAMEL_TO_CATEGORY = new Map<string, TokenCategory>(
  TOKEN_CATEGORIES.map((c) => [camelCase(c), c]),
);

export function camelCategory(category: TokenCategory): string {
  return camelCase(category);
}

export function kebabCategory(camel: string): TokenCategory | null {
  return CAMEL_TO_CATEGORY.get(camel) ?? null;
}

export function camelProperty(kebab: string): string {
  return camelCase(kebab);
}

/** The React prop name for a kebab-case axis, slot, or state name. */
export function propNameFor(name: string): string {
  return camelCase(name);
}

export function kebabProperty(camel: string): string {
  return camel.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
}

/**
 * The theme path MUI turns into a CSS variable: colors live per color scheme
 * under `palette.tokens`, everything else under the root `tokens` key by
 * camelCased category. The token path is joined with `-` as one key so
 * `color.text` and `color.text.default` never collide as object and string.
 */
export function muiVarPath(token: {
  category: TokenCategory;
  path: readonly string[];
}): string[] {
  const key = token.path.join('-');
  return token.category === 'color'
    ? ['palette', 'tokens', key]
    : ['tokens', camelCategory(token.category), key];
}

/** `--<prefix>-palette-tokens-text-default` or `--<prefix>-tokens-fontWeight-semibold`. */
export function muiVarName(
  prefix: string,
  token: { category: TokenCategory; path: readonly string[] },
): string {
  return `--${prefix}-${muiVarPath(token).join('-')}`;
}

/** Inverse of `muiVarName`: the source custom property, or null when the name is not a generated token variable. */
export function sourceNameFromMui(name: string, prefix: string): string | null {
  const lead = `--${prefix}-`;
  if (!name.startsWith(lead)) {
    return null;
  }
  const rest = name.slice(lead.length);
  let source: string;
  if (rest.startsWith('palette-tokens-')) {
    source = `${lead}color-${rest.slice('palette-tokens-'.length)}`;
  } else if (rest.startsWith('tokens-')) {
    const [camel, ...path] = rest.slice('tokens-'.length).split('-');
    const category = kebabCategory(camel);
    // Colors never live under the root "tokens" key, only under
    // palette.tokens, so this can never be a real generated variable.
    if (!category || category === 'color' || path.length === 0) {
      return null;
    }
    source = `${lead}${category}-${path.join('-')}`;
  } else {
    return null;
  }
  return parseTokenName(source, prefix) ? source : null;
}

const ATTRIBUTE_SELECTOR = /^(?::root)?\[(data-[a-z][a-z0-9-]*)="\{mode\}"\]$/;
const CLASS_SELECTOR =
  /^(?::root)?\.([a-z][a-z0-9-]*-)?\{mode\}(-?[a-z0-9-]*)$/;

/**
 * MUI's `cssVariables.colorSchemeSelector` for a design-system mode selector:
 * `:root[data-x="{mode}"]` or `[data-x="{mode}"]` becomes `data-x` (MUI
 * renders `[data-x="<mode>"]`), `.x-{mode}` or `:root.{mode}-y` becomes a
 * `%s` template. Anything else (a tag, a descendant, a media query) is null.
 */
export function colorSchemeSelectorFor(modeSelector: string): string | null {
  const selector = normalizeQuotes(modeSelector.trim());
  const attribute = ATTRIBUTE_SELECTOR.exec(selector);
  if (attribute) {
    return attribute[1];
  }
  const cls = CLASS_SELECTOR.exec(selector);
  if (cls) {
    return `.${cls[1] ?? ''}%s${cls[2]}`;
  }
  return null;
}

/**
 * The nested selector key for a rule inside `styleOverrides.root` or a
 * `variants` entry. `&` is repeated once per selected axis on top of the root
 * class, so the Emotion class stacks to the same specificity the CSS target
 * gets from `.root[data-axis="v"]…`; states render exactly as the design
 * system does (so `disabled` follows the root element), and a non-root slot
 * becomes a descendant class.
 */
export function specificityKey(
  axesCount: number,
  states: readonly string[],
  rootElement: string,
  slot: string,
  themeKey: string,
): string {
  const root = '&'.repeat(1 + axesCount);
  const stateText = states.map((s) => stateSelector(s, rootElement)).join('');
  const slotText = slot === 'root' ? '' : ` .${slotClassName(themeKey, slot)}`;
  return `${root}${stateText}${slotText}`;
}
