import { renderRuleSelector } from '../../components/render-selector.js';
import { parseComponentCss } from '../../components/parse-component.js';
import { PSEUDO_STATES, stateForAttribute } from '../../components/states.js';
import { modeSelectorFor, type DsConfig } from '../../config.js';
import {
  Diagnostics,
  formatDiagnostic,
  type SourceLocation,
} from '../../errors.js';
import { stableStringify } from '../../ir/serialize.js';
import type { ComponentIR, DesignIR, Token, TokenId } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import { parseTokenName, type TokenCategory } from '../../tokens/categories.js';
import { parseTokenFile, type RawToken } from '../../tokens/parse-tokens.js';
import { resolveTokens } from '../../tokens/resolve-tokens.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import {
  manifestFromComponent,
  verifySelectorOrder,
} from '../reparse-support.js';
import { isMappedForMui } from './hints.js';
import {
  componentModel,
  MUI_PACKAGE,
  muiModelSchema,
  type MuiComponentModel,
  type MuiModel,
} from './model.js';
import {
  colorSchemeSelectorFor,
  kebabCategory,
  kebabProperty,
  propNameFor,
  slotClassName,
  sourceNameFromMui,
  specificityKey,
  themeKeyFor,
} from './names.js';

const MODEL_FILE = 'theme.model.json';
const AT: SourceLocation = { file: MODEL_FILE, line: 1, column: 1 };
const VAR_REF = /var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g;
const KEY = /^(&+)((?::[a-z-]+|\[[^\]]+\])*)( \.([A-Za-z0-9]+)-([a-z0-9-]+))?$/;
const STATE_TOKEN = /:[a-z-]+|\[[^\]]+\]/g;
const ATTRIBUTE = /^\[([a-z-]+)(?:="([^"]*)")?\]$/;

function rewriteVars(
  value: string,
  prefix: string,
  onUnknown: (name: string) => void,
): string {
  return value.replace(VAR_REF, (whole: string, name: string) => {
    const src = sourceNameFromMui(name, prefix);
    if (!src) {
      onUnknown(name);
      return whole;
    }
    return `var(${src})`;
  });
}

/**
 * Wraps every error on `parserDiag` as one DS-E081 on `diag`, keeping the
 * inner diagnostic's own code, title, and message. Reserved for diagnostics
 * produced by a real parser (`parseTokenFile`, `resolveTokens`,
 * `parseComponentCss`, `verifySelectorOrder`); the reparser's own structural
 * checks report DS-E081 directly instead, with no code to wrap.
 */
function wrapParserErrors(diag: Diagnostics, parserDiag: Diagnostics): void {
  for (const d of parserDiag.errors) {
    // Inner locations point at synthetic CSS; the model file is the real place.
    const text = formatDiagnostic({ ...d, location: undefined }).split('\n')[0];
    diag.add('DS-E081', `mui: ${text}`, AT);
  }
}

/** The first top-level key at which `expected` and `actual` differ, for a metadata-mismatch message. */
function firstDifferingKey(
  expected: MuiComponentModel,
  actual: MuiComponentModel,
): string {
  for (const key of Object.keys(expected) as (keyof MuiComponentModel)[]) {
    if (stableStringify(expected[key]) !== stableStringify(actual[key])) {
      return key;
    }
  }
  return 'unknown';
}

function checkMeta(model: MuiModel, config: DsConfig, diag: Diagnostics): void {
  const { themeOptions } = model;
  const fail = (message: string): void => {
    diag.add('DS-E081', `mui: ${message}`, AT);
  };
  if (model.framework.name !== MUI_PACKAGE) {
    fail(
      `framework.name is "${model.framework.name}", expected "${MUI_PACKAGE}"`,
    );
  }
  if (model.prefix !== config.prefix) {
    fail(`prefix is "${model.prefix}", expected "${config.prefix}"`);
  }
  if (themeOptions.cssVariables.cssVarPrefix !== config.prefix) {
    fail(
      `cssVariables.cssVarPrefix is "${themeOptions.cssVariables.cssVarPrefix}", expected "${config.prefix}"`,
    );
  }
  const selector = colorSchemeSelectorFor(config.modeSelector);
  if (themeOptions.cssVariables.colorSchemeSelector !== selector) {
    fail(
      `cssVariables.colorSchemeSelector is "${themeOptions.cssVariables.colorSchemeSelector}", expected "${selector}"`,
    );
  }
  if (themeOptions.defaultColorScheme !== config.defaultMode) {
    fail(
      `defaultColorScheme is "${themeOptions.defaultColorScheme}", expected "${config.defaultMode}"`,
    );
  }
  const schemes = Object.keys(themeOptions.colorSchemes);
  if (schemes.join(',') !== config.modes.join(',')) {
    fail(
      `colorSchemes are ${schemes.join(', ')}, expected ${config.modes.join(', ')}`,
    );
  }
}

/**
 * Token variables back to source declarations: colors from each scheme's
 * `palette.tokens` (declared only in `:root` when every scheme agrees, so a
 * mode-invariant token stays invariant), everything else from `tokens`. Each
 * category becomes one synthetic token file for the compiler's own parser.
 */
function reparseTokens(
  model: MuiModel,
  config: DsConfig,
  diag: Diagnostics,
): Record<TokenId, Token> | null {
  const before = diag.errors.length;
  const prefix = config.prefix;
  const byCategory = new Map<TokenCategory, Map<string, string[]>>();
  const push = (category: TokenCategory, mode: string, line: string): void => {
    const byMode = byCategory.get(category) ?? new Map<string, string[]>();
    byCategory.set(category, byMode);
    const lines = byMode.get(mode) ?? [];
    byMode.set(mode, lines);
    lines.push(line);
  };
  const rewrite = (value: string, where: string): string =>
    rewriteVars(value, prefix, (name) =>
      diag.add(
        'DS-E081',
        `mui: ${where} references "${name}", which is not a generated token variable`,
        AT,
      ),
    );

  const colorKeys = new Set<string>();
  for (const scheme of Object.values(model.themeOptions.colorSchemes)) {
    for (const key of Object.keys(scheme.palette.tokens)) {
      colorKeys.add(key);
    }
  }
  for (const key of [...colorKeys].sort(codeUnitCompare)) {
    const name = `--${prefix}-color-${key}`;
    if (!parseTokenName(name, prefix)) {
      diag.add(
        'DS-E081',
        `mui: palette.tokens key "${key}" is not a token path`,
        AT,
      );
      continue;
    }
    const values = config.modes.map(
      (m) => model.themeOptions.colorSchemes[m]?.palette.tokens[key],
    );
    if (values.some((v) => v === undefined)) {
      diag.add(
        'DS-E081',
        `mui: palette.tokens key "${key}" is missing from a color scheme`,
        AT,
      );
      continue;
    }
    const where = `palette.tokens.${key}`;
    if (values.every((v) => v === values[0])) {
      push(
        'color',
        config.defaultMode,
        `  ${name}: ${rewrite(values[0]!, where)};`,
      );
    } else {
      config.modes.forEach((m, i) =>
        push('color', m, `  ${name}: ${rewrite(values[i]!, where)};`),
      );
    }
  }
  for (const [camel, entries] of Object.entries(model.themeOptions.tokens)) {
    const category = kebabCategory(camel);
    if (!category) {
      diag.add('DS-E081', `mui: tokens.${camel} is not a token category`, AT);
      continue;
    }
    if (category === 'color') {
      diag.add(
        'DS-E081',
        'mui: tokens.color is not allowed; color tokens live under palette.tokens',
        AT,
      );
      continue;
    }
    for (const key of Object.keys(entries).sort(codeUnitCompare)) {
      const name = `--${prefix}-${category}-${key}`;
      if (!parseTokenName(name, prefix)) {
        diag.add(
          'DS-E081',
          `mui: tokens.${camel} key "${key}" is not a token path`,
          AT,
        );
        continue;
      }
      push(
        category,
        config.defaultMode,
        `  ${name}: ${rewrite(entries[key], `tokens.${camel}.${key}`)};`,
      );
    }
  }
  if (diag.errors.length > before) {
    return null;
  }
  const raws: RawToken[] = [];
  const parserDiag = new Diagnostics();
  const otherModes = config.modes.filter((m) => m !== config.defaultMode);
  for (const [category, byMode] of [...byCategory].sort((a, b) =>
    codeUnitCompare(a[0], b[0]),
  )) {
    const lines: string[] = [];
    for (const mode of [config.defaultMode, ...otherModes]) {
      const decls = byMode.get(mode);
      if (!decls) {
        continue;
      }
      lines.push(
        mode === config.defaultMode
          ? ':root {'
          : `${modeSelectorFor(config, mode)} {`,
        ...decls,
        '}',
      );
    }
    raws.push(
      ...parseTokenFile(
        `src/tokens/${category}.css`,
        `${lines.join('\n')}\n`,
        config,
        parserDiag,
      ),
    );
  }
  const tokens = resolveTokens(raws, config, parserDiag);
  wrapParserErrors(diag, parserDiag);
  return parserDiag.hasErrors() ? null : tokens;
}

interface ParsedKey {
  slot: string;
  states: string[];
}

/** Splits a variant key into slot and states; null when it is not in the generated form. Specificity is checked by the caller. */
function parseKey(
  key: string,
  themeKey: string,
  slots: readonly string[],
): ParsedKey | null {
  const m = KEY.exec(key);
  if (!m) {
    return null;
  }
  let slot = 'root';
  if (m[3] !== undefined) {
    if (m[4] !== themeKey || m[5] === 'root' || !slots.includes(m[5])) {
      return null;
    }
    slot = m[5];
  }
  const states: string[] = [];
  for (const token of m[2].match(STATE_TOKEN) ?? []) {
    if (token.startsWith(':')) {
      const state = PSEUDO_STATES[token.slice(1)];
      if (!state) {
        return null;
      }
      states.push(state);
      continue;
    }
    const attr = ATTRIBUTE.exec(token);
    const state = attr ? stateForAttribute(attr[1], attr[2]) : null;
    if (!state) {
      return null;
    }
    states.push(state);
  }
  return { slot, states };
}

function reparseComponents(
  model: MuiModel,
  ir: DesignIR,
  tokens: Record<TokenId, Token>,
  config: DsConfig,
  diag: Diagnostics,
): Record<string, ComponentIR> | null {
  const before = diag.errors.length;
  const prefix = config.prefix;
  const byThemeKey = new Map(
    Object.keys(ir.components).map((n) => [themeKeyFor(prefix, n), n]),
  );
  const themeKeys = Object.keys(model.themeOptions.components);
  const metaKeys = Object.values(model.components).map((c) => c.themeKey);
  if (themeKeys.join(',') !== metaKeys.join(',')) {
    diag.add(
      'DS-E081',
      `mui: components (${metaKeys.join(', ')}) and themeOptions.components (${themeKeys.join(', ')}) disagree`,
      AT,
    );
  }
  const out: Record<string, ComponentIR> = {};
  for (const themeKey of themeKeys) {
    const name = byThemeKey.get(themeKey);
    if (!name) {
      diag.add(
        'DS-E081',
        `mui: generated theme entry "${themeKey}" matches no component`,
        AT,
      );
      continue;
    }
    const component = ir.components[name];
    if (!isMappedForMui(component)) {
      diag.add(
        'DS-E081',
        `mui: generated theme entry for component "${name}", which is excluded or unmapped for mui`,
        AT,
      );
      continue;
    }
    // The model's own component metadata (props, slots, axes, …) must be
    // exactly what the IR would produce; a generator that drifted from the
    // IR here would otherwise only be caught later, and less clearly, by a
    // selector or declaration mismatch (or not at all, for a field the
    // selector reconstruction never reads, like `exportName`).
    const expectedMeta = componentModel(component, prefix, new Diagnostics());
    const actualMeta = model.components[name];
    if (
      !expectedMeta ||
      !actualMeta ||
      stableStringify(expectedMeta) !== stableStringify(actualMeta)
    ) {
      const key =
        expectedMeta && actualMeta
          ? firstDifferingKey(expectedMeta, actualMeta)
          : 'missing';
      diag.add(
        'DS-E081',
        `mui: ${name}: component metadata differs from the IR (${key})`,
        AT,
      );
      continue;
    }
    const componentBefore = diag.errors.length;
    const rootElement = component.slots.root?.element ?? 'div';
    const target = { name, rootElement };
    const slots = Object.keys(component.slots);
    const entry = model.themeOptions.components[themeKey];
    const originals: { selector: string; location: SourceLocation }[] = [];
    const texts: string[] = [];
    const emit = (
      slot: string,
      axes: Record<string, string>,
      states: string[],
      decls: Record<string, string>,
      where: string,
    ): void => {
      const selector = renderRuleSelector(prefix, target, {
        slot,
        axes,
        states,
      });
      const body = Object.keys(decls)
        .sort(codeUnitCompare)
        .map(
          (p) =>
            `  ${kebabProperty(p)}: ${rewriteVars(decls[p], prefix, (v) => diag.add('DS-E081', `mui: ${where} references "${v}", which is not a generated token variable`, AT))};`,
        );
      originals.push({ selector, location: AT });
      texts.push(`${selector} {\n${body.join('\n')}\n}`);
    };
    if (Object.keys(entry.styleOverrides.root).length > 0) {
      emit(
        'root',
        {},
        [],
        entry.styleOverrides.root,
        `${themeKey}.styleOverrides.root`,
      );
    }
    entry.variants.forEach((variant, i) => {
      const where = `${themeKey}.variants[${i}]`;
      const keys = Object.keys(variant.style);
      if (keys.length !== 1) {
        diag.add(
          'DS-E081',
          `mui: ${where} must have exactly one selector key`,
          AT,
        );
        return;
      }
      const axes: Record<string, string> = {};
      for (const [prop, value] of Object.entries(variant.props)) {
        // variant props are the camelCase prop names; map them back to manifest axes
        const axis = Object.keys(component.axes).find(
          (a) => propNameFor(a) === prop,
        );
        const def = axis ? component.axes[axis] : undefined;
        if (!axis || !def || !def.values.includes(value)) {
          diag.add(
            'DS-E081',
            `mui: ${where} selects unknown axis prop ${prop}="${value}"`,
            AT,
          );
          return;
        }
        axes[axis] = value;
      }
      const key = keys[0];
      const parsed = parseKey(key, themeKey, slots);
      if (!parsed) {
        diag.add(
          'DS-E081',
          `mui: ${where} has a selector key "${key}" that is not in the generated form`,
          AT,
        );
        return;
      }
      const canonical = specificityKey(
        Object.keys(axes).length,
        parsed.states,
        rootElement,
        parsed.slot === 'root' ? null : slotClassName(themeKey, parsed.slot),
      );
      if (canonical !== key) {
        diag.add(
          'DS-E081',
          `mui: ${where} selector key "${key}" is not the canonical form "${canonical}"`,
          AT,
        );
        return;
      }
      emit(parsed.slot, axes, parsed.states, variant.style[key], where);
    });
    if (diag.errors.length > componentBefore) {
      continue;
    }
    const parserDiag = new Diagnostics();
    const parsed = parseComponentCss(
      MODEL_FILE,
      `${texts.join('\n\n')}\n`,
      manifestFromComponent(component),
      tokens,
      config,
      parserDiag,
    );
    wrapParserErrors(diag, parserDiag);
    if (!parsed) {
      continue;
    }
    out[name] = parsed;
    if (parserDiag.hasErrors()) {
      continue;
    }
    const rendered = parsed.rules.map((r) =>
      renderRuleSelector(prefix, target, r),
    );
    const selectorDiag = new Diagnostics();
    verifySelectorOrder(originals, rendered, AT, selectorDiag);
    wrapParserErrors(diag, selectorDiag);
  }
  return diag.errors.length > before ? null : out;
}

/**
 * Turns `theme.model.json` back into an IR with the compiler's own parsers:
 * token variables are rewritten to source names and parsed per category;
 * each component's `styleOverrides.root` and `variants` are reconstructed
 * into rules in the design system's selector grammar, parsed, and their order
 * and selector keys compared with the canonical form. Every problem is
 * reported as DS-E081 at `theme.model.json`.
 */
export function reparseMui(
  files: GeneratedFile[],
  ir: DesignIR,
  ctx: PluginContext,
  diag: Diagnostics,
): DesignIR | null {
  const file = files.find((f) => f.path === MODEL_FILE);
  if (!file) {
    diag.add('DS-E081', `mui: output lacks ${MODEL_FILE}`, AT);
    return null;
  }
  let json: unknown;
  try {
    json = JSON.parse(file.contents);
  } catch (err) {
    diag.add(
      'DS-E081',
      `mui: ${MODEL_FILE} is not valid JSON: ${(err as Error).message}`,
      AT,
    );
    return null;
  }
  const checked = muiModelSchema.safeParse(json);
  if (!checked.success) {
    const issues = checked.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    diag.add(
      'DS-E081',
      `mui: ${MODEL_FILE} does not match the model schema: ${issues}`,
      AT,
    );
    return null;
  }
  const model = checked.data as MuiModel;
  const before = diag.errors.length;
  checkMeta(model, ctx.config, diag);
  const tokens =
    diag.errors.length > before ? null : reparseTokens(model, ctx.config, diag);
  const components = tokens
    ? reparseComponents(model, ir, tokens, ctx.config, diag)
    : null;
  if (!tokens || !components) {
    return null;
  }
  return { irVersion: ir.irVersion, meta: { ...ir.meta }, tokens, components };
}
