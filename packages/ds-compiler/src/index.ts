export const COMPILER_NAME = '@bwp-web/ds-compiler';

export { build, buildIR, writeIR, scanTodo } from './build.js';
export type { BuildResult } from './build.js';
export { lint } from './lint.js';
export { IR_FILE, TOKENS_DIR, COMPONENTS_DIR, ENTRY_FILE } from './paths.js';
export {
  ENTRY_HEADER,
  checkEntryCss,
  discoverEntrySources,
  expectedEntryCss,
  renderEntryCss,
  writeEntryCss,
} from './entry.js';
export type { EntrySources } from './entry.js';
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
export { COMPILER_VERSION } from './version.js';
export { generate, UnknownTargetError } from './generate.js';
export type { GenerateResult } from './generate.js';
export { verify } from './verify/index.js';
export type { StepStatus, VerifyResult, VerifyStep } from './verify/index.js';
export { checkDrift } from './verify/drift.js';
export { diffIR, ruleDiffKey } from './verify/ir-diff.js';
export type { DiffScope, IRDifference } from './verify/ir-diff.js';
export { computeCoverage, renderCoverageMarkdown } from './verify/coverage.js';
export type { CoverageReport } from './verify/coverage.js';
export { outDirFor, pluginContext } from './targets/plugin.js';
export type {
  CoverageEntry,
  CoverageStatus,
  GeneratedFile,
  PluginContext,
  TargetPlugin,
} from './targets/plugin.js';
export {
  TARGET_HINT_SCHEMAS,
  TARGET_IDS,
  tailwindHintsSchema,
  targetsSchema,
} from './targets/hints.js';
export type { TargetId } from './targets/hints.js';
export { TARGETS, getTarget, targetIds } from './targets/index.js';
export { tailwindPlugin } from './targets/tailwind/index.js';
export {
  TAILWIND_NAMESPACES,
  sourceNameFromTailwind,
  tailwindVarName,
} from './targets/tailwind/names.js';
export {
  generateTailwind,
  renderComponents,
  renderIRValue,
  renderIndex,
  renderTheme,
  tailwindHeader,
  varNameFor,
} from './targets/tailwind/render.js';
export {
  manifestFromComponent,
  reparseTailwind,
} from './targets/tailwind/reparse.js';
export {
  FORM_CONTROL_ELEMENTS,
  renderRuleSelector,
  stateSelector,
} from './components/render-selector.js';
export type { SelectorTarget } from './components/render-selector.js';
export {
  formatNumber,
  renderColor,
  renderDimension,
  renderFontFamily,
  renderLiteralValue,
  renderShadow,
  renderTokenValue,
} from './targets/css-values.js';
export { generateOutputs } from './generate.js';
export type { PluginOutput } from './targets/plugin.js';
export { muiHintsSchema } from './targets/hints.js';
export {
  MUI_ID,
  ignoredForMui,
  isMappedForMui,
  muiExclusion,
} from './targets/mui/hints.js';
export {
  camelCase,
  camelCategory,
  camelProperty,
  colorSchemeSelectorFor,
  kebabCategory,
  kebabProperty,
  muiVarName,
  muiVarPath,
  pascalCase,
  propNameFor,
  slotClassName,
  sourceNameFromMui,
  specificityKey,
  themeKeyFor,
} from './targets/mui/names.js';
export { HTML_ELEMENTS } from './targets/mui/html-elements.js';
export {
  MUI_PACKAGE,
  MUI_RANGE,
  buildMuiModel,
  muiHeaderText,
  muiModelSchema,
  muiValue,
} from './targets/mui/model.js';
export type {
  MuiAxisModel,
  MuiComponentModel,
  MuiComponentTheme,
  MuiDeclarations,
  MuiModel,
  MuiSlotModel,
  MuiStateProp,
  MuiThemeOptions,
  MuiVariant,
} from './targets/mui/model.js';
export { generateMui } from './targets/mui/generate.js';
export {
  muiHeader,
  quoteTs,
  renderAugmentationTs,
  renderModelJson,
  renderThemeTs,
  renderTsLiteral,
  themeFactoryName,
  themeOptionsName,
} from './targets/mui/render-ts.js';
export {
  renderComponentTsx,
  renderComponentsIndex,
  renderIndexTs,
  renderTypecheckTsx,
} from './targets/mui/render-component.js';
