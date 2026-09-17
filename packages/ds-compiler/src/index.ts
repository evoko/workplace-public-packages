export const COMPILER_NAME = '@bwp-web/ds-compiler';

export {
  build,
  buildIR,
  writeIR,
  scanTodo,
  IR_FILE,
  TOKENS_DIR,
  COMPONENTS_DIR,
} from './build.js';
export type { BuildResult } from './build.js';
export { lint } from './lint.js';
export {
  loadConfig,
  modeSelectorFor,
  defaultModeSelector,
  CONFIG_FILE,
} from './config.js';
export type { DsConfig } from './config.js';
export {
  Diagnostics,
  ERROR_CATALOG,
  formatDiagnostic,
  sortDiagnosticsForDisplay,
} from './errors.js';
export type {
  Diagnostic,
  DiagnosticCode,
  Severity,
  SourceLocation,
} from './errors.js';
export { serializeIR, stableStringify, sourceHash } from './ir/serialize.js';
export type { SourceFile } from './ir/serialize.js';
export { IR_VERSION } from './ir/types.js';
export type {
  AxisIR,
  ComponentIR,
  DesignIR,
  IRValue,
  IRValueLiteral,
  IRValueToken,
  ManifestTargets,
  Mode,
  Rule,
  SlotIR,
  TargetHints,
  Token,
  TokenId,
} from './ir/types.js';
export {
  CATEGORY_TYPES,
  TOKEN_CATEGORIES,
  isTokenCategory,
  parseTokenName,
  tokenIdToCssName,
  categoryOfTokenId,
} from './tokens/categories.js';
export type { TokenCategory } from './tokens/categories.js';
export type {
  ColorValue,
  CubicBezierValue,
  DimensionUnit,
  DimensionValue,
  DurationValue,
  FontFamilyValue,
  FontWeightValue,
  NumberValue,
  ShadowLayer,
  ShadowValue,
  TokenType,
  TokenValue,
} from './tokens/values.js';
export {
  manifestSchema,
  parseManifest,
  loadManifest,
  manifestJsonSchema,
} from './components/manifest.js';
export type { Manifest } from './components/manifest.js';
export {
  PSEUDO_STATES,
  STATE_ORDER,
  compareStates,
  sortStates,
  stateForAttribute,
} from './components/states.js';
export { parseSelector } from './components/selector.js';
export type { ParsedSelector } from './components/selector.js';
export {
  BASELINE_PROPERTIES,
  FORBIDDEN_SHORTHANDS,
  PROPERTY_TABLE,
  expandShorthand,
  parseLiteralForProperty,
} from './components/properties.js';
export type { LiteralKind, PropertySpec } from './components/properties.js';
export { compareRules, sortRules, ruleKey } from './components/rules.js';
export { parseComponentCss } from './components/parse-component.js';
export {
  scaffoldTokens,
  renderTokenScaffold,
  CATEGORY_EXAMPLES,
  ScaffoldError,
} from './scaffold/tokens.js';
export {
  scaffoldComponent,
  renderComponentCss,
  renderComponentManifest,
  KNOWN_TARGETS,
} from './scaffold/component.js';
export type { ComponentScaffoldOptions } from './scaffold/component.js';
