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
import type { MuiCatalog } from './catalog.js';
import { isMappedForMui } from './hints.js';
import {
  buildComponentModel,
  MUI_PACKAGE,
  MUI_RANGE,
  muiModelSchema,
  type MuiComponentModel,
  type MuiDeclarations,
  type MuiMappedModel,
  type MuiModel,
} from './model.js';
import {
  colorSchemeSelectorFor,
  kebabCategory,
  kebabProperty,
  propNameFor,
  sourceNameFromMui,
  specificityKey,
} from './names.js';

const MODEL_FILE = 'theme.model.json';
const AT: SourceLocation = { file: MODEL_FILE, line: 1, column: 1 };
const VAR_REF = /var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g;
const KEY = /^(&+)((?::[a-z-]+|\[[^\]]+\])*)( \.([A-Za-z0-9_-]+))?$/;
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

/**
 * The first key at which two `mapped` values differ, as `.key: <expected>
 * vs <actual>` (e.g. `.resetCount: 13 vs 12`), so a catalog change that only
 * shifts the reset count is visible in the outer message instead of being
 * flattened to the uninformative `(mapped)`. `''` when either side is null
 * (the mismatch is "mapped vs not mapped", already clear from the field
 * name alone).
 */
function firstDifferingMappedKey(
  expected: MuiMappedModel | null,
  actual: MuiMappedModel | null,
): string {
  if (!expected || !actual) {
    return '';
  }
  for (const key of Object.keys(expected) as (keyof MuiMappedModel)[]) {
    if (stableStringify(expected[key]) !== stableStringify(actual[key])) {
      return `.${key}: ${JSON.stringify(expected[key])} vs ${JSON.stringify(actual[key])}`;
    }
  }
  return '';
}

/** The first top-level key at which `expected` and `actual` differ, for a metadata-mismatch message. */
function firstDifferingKey(
  expected: MuiComponentModel,
  actual: MuiComponentModel,
): string {
  for (const key of Object.keys(expected) as (keyof MuiComponentModel)[]) {
    if (stableStringify(expected[key]) !== stableStringify(actual[key])) {
      return key === 'mapped'
        ? `mapped${firstDifferingMappedKey(expected.mapped, actual.mapped)}`
        : key;
    }
  }
  return 'unknown';
}

function checkMeta(
  model: MuiModel,
  catalog: MuiCatalog | null,
  config: DsConfig,
  diag: Diagnostics,
): void {
  const { themeOptions } = model;
  const fail = (message: string): void => {
    diag.add('DS-E081', `mui: ${message}`, AT);
  };
  if (model.framework.name !== MUI_PACKAGE) {
    fail(
      `framework.name is "${model.framework.name}", expected "${MUI_PACKAGE}"`,
    );
  }
  if (model.framework.range !== MUI_RANGE) {
    fail(
      `framework.range is "${model.framework.range}", expected "${MUI_RANGE}"`,
    );
  }
  const expectedVersion = catalog?.framework.version ?? null;
  if (model.framework.version !== expectedVersion) {
    fail(
      `framework.version is ${JSON.stringify(model.framework.version)}, expected ${JSON.stringify(expectedVersion)}`,
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

/**
 * Splits a variant key into slot and states; null when it is not in the
 * generated form. `slotByClass` resolves the slot from the class the
 * generator put on it (`FxMenu-badge` for an own component,
 * `MuiButton-startIcon` for a mapped one). Specificity is checked by the
 * caller.
 */
function parseKey(
  key: string,
  slotByClass: Readonly<Record<string, string>>,
): ParsedKey | null {
  const m = KEY.exec(key);
  if (!m) {
    return null;
  }
  let slot = 'root';
  if (m[3] !== undefined) {
    const found = slotByClass[m[4]];
    if (found === undefined) {
      return null;
    }
    slot = found;
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
  catalog: MuiCatalog | null,
  tokens: Record<TokenId, Token>,
  config: DsConfig,
  diag: Diagnostics,
): Record<string, ComponentIR> | null {
  const before = diag.errors.length;
  const prefix = config.prefix;
  // The model's own component metadata is untrusted output, but it is the
  // only place a mapped component's theme key (`MuiButton`, not derived from
  // the design-system name) is recorded, so the lookup goes through it
  // rather than recomputing theme keys from the IR.
  const metaByThemeKey = new Map(
    Object.values(model.components).map((c) => [c.themeKey, c.name]),
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
    const name = metaByThemeKey.get(themeKey);
    const component = name ? ir.components[name] : undefined;
    if (!name || !component) {
      diag.add(
        'DS-E081',
        `mui: generated theme entry "${themeKey}" matches no component`,
        AT,
      );
      continue;
    }
    if (!isMappedForMui(component)) {
      diag.add(
        'DS-E081',
        `mui: generated theme entry for component "${name}", which is excluded or unmapped for mui`,
        AT,
      );
      continue;
    }
    // The model's own component metadata (props, slots, axes, mapping, …)
    // must be exactly what the IR (and, for a mapped component, the catalog)
    // would produce; a generator that drifted from either here would
    // otherwise only be caught later, and less clearly, by a selector or
    // declaration mismatch (or not at all, for a field the selector
    // reconstruction never reads, like `exportName`). The rebuild also
    // yields the resets a mapped component needs below, computed exactly
    // once rather than a second time from the mapping.
    const built = buildComponentModel(
      ir,
      component,
      catalog,
      new Diagnostics(),
    );
    const expectedMeta = built?.model ?? null;
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
    const meta = actualMeta;
    const componentBefore = diag.errors.length;
    const rootElement = component.slots.root?.element ?? 'div';
    const target = { name, rootElement };
    const entry = model.themeOptions.components[themeKey];
    const slotByClass: Record<string, string> = Object.fromEntries(
      Object.entries(meta.slots).map(([slot, s]) => [s.className, slot]),
    );

    // For a mapped component, the leading `expected.length` variants are the
    // resets: recomputed here from the IR and the catalog (the same pure
    // function `buildMuiModel` used to generate them) and required to be
    // byte-identical, so a stale or hand-edited catalog or reset fails
    // round-trip instead of silently drifting. The remaining variants are
    // the design system's own rules, reparsed exactly as for an own
    // component below, with messages indexed by their position in the full
    // `variants` array.
    let variants = entry.variants;
    let variantOffset = 0;
    if (meta.mapped) {
      if (
        stableStringify(entry.defaultProps ?? null) !==
        stableStringify(meta.mapped.defaultProps)
      ) {
        diag.add(
          'DS-E081',
          `mui: ${name}: defaultProps differ from the mapping`,
          AT,
        );
        continue;
      }
      // `built` is non-null here: `expectedMeta` (its `.model`) already
      // compared equal to `actualMeta` above, and `MuiComponentModel` is
      // always a truthy object, so `built?.model` being non-null means
      // `built` itself is non-null.
      const expected = built!.resets;
      const resetPrefix = entry.variants.slice(0, expected.length);
      if (stableStringify(resetPrefix) !== stableStringify(expected)) {
        diag.add(
          'DS-E081',
          `mui: ${name}: the leading ${expected.length} variants are not the resets computed from the catalog`,
          AT,
        );
        continue;
      }
      variants = entry.variants.slice(expected.length);
      variantOffset = expected.length;
    } else if (entry.defaultProps !== undefined) {
      diag.add(
        'DS-E081',
        `mui: ${name}: an own component has no defaultProps`,
        AT,
      );
      continue;
    }

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
    variants.forEach((variant, i) => {
      const where = `${themeKey}.variants[${i + variantOffset}]`;
      const keys = Object.keys(variant.style);
      if (keys.length !== 1) {
        diag.add(
          'DS-E081',
          `mui: ${where} must have exactly one selector key`,
          AT,
        );
        return;
      }
      const key = keys[0];
      const styleAtKey = variant.style[key];
      // Every variant past the reset prefix is a design-system rule, which
      // is never media-wrapped; `MuiVariant.style` is widened to allow a
      // media wrapper only for the resets `computeResets` produces.
      if (Object.values(styleAtKey).some((v) => typeof v === 'object')) {
        diag.add(
          'DS-E081',
          `mui: ${where} has a nested (media) key outside the reset prefix`,
          AT,
        );
        return;
      }
      const axes: Record<string, string> = {};
      for (const [prop, value] of Object.entries(variant.props)) {
        // variant props are MUI prop names for a mapped component, the
        // design-system's own camelCase prop names for an own one; map them
        // back to manifest axes.
        const axis = Object.keys(component.axes).find((a) =>
          meta.mapped
            ? meta.mapped.axisMap[a] === prop
            : propNameFor(a) === prop,
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
      const parsed = parseKey(key, slotByClass);
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
        parsed.slot === 'root' ? null : meta.slots[parsed.slot].className,
      );
      if (canonical !== key) {
        diag.add(
          'DS-E081',
          `mui: ${where} selector key "${key}" is not the canonical form "${canonical}"`,
          AT,
        );
        return;
      }
      emit(
        parsed.slot,
        axes,
        parsed.states,
        styleAtKey as MuiDeclarations,
        where,
      );
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
  catalog: MuiCatalog | null,
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
  checkMeta(model, catalog, ctx.config, diag);
  const tokens =
    diag.errors.length > before ? null : reparseTokens(model, ctx.config, diag);
  const components = tokens
    ? reparseComponents(model, ir, catalog, tokens, ctx.config, diag)
    : null;
  if (!tokens || !components) {
    return null;
  }
  return { irVersion: ir.irVersion, meta: { ...ir.meta }, tokens, components };
}
