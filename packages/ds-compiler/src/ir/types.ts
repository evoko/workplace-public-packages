import type { SourceLocation } from '../errors.js';
import type { TokenCategory } from '../tokens/categories.js';
import type {
  DimensionValue,
  TokenType,
  TokenValue,
} from '../tokens/values.js';

export const IR_VERSION = 1 as const;

export type Mode = string;

/** Dot-separated path, category first: "color.primary.default". */
export type TokenId = string;

interface TokenBase {
  $type: TokenType;
  category: TokenCategory;
  path: string[];
  /** The custom property name in the source CSS, e.g. "--bwp-color-primary-default". */
  cssName: string;
  source: SourceLocation;
}

/** Single value when modeInvariant, otherwise one value per mode. Aliases are resolved. */
export type Token =
  | (TokenBase & {
      modeInvariant: true;
      $value: TokenValue;
      /** Present when the source used var(): the referenced token id. */
      alias?: TokenId;
    })
  | (TokenBase & {
      modeInvariant: false;
      $value: Record<Mode, TokenValue>;
      /** Present when the source used var(): the referenced token id, per mode. */
      alias?: Partial<Record<Mode, TokenId>>;
    });

export interface IRValueToken {
  kind: 'token';
  ref: TokenId;
}

/**
 * Only keyword, dimension, number, color, and string literals exist because
 * duration, easing, and shadow properties are token-only in the property table.
 */
export interface IRValueLiteral {
  kind: 'literal';
  type: 'color' | 'dimension' | 'keyword' | 'number' | 'string';
  value: string | number | DimensionValue;
}

export type IRValue = IRValueToken | IRValueLiteral;

export interface Rule {
  slot: string;
  axes: Record<string, string>;
  states: string[];
  declarations: Record<string, IRValue>;
  source: SourceLocation;
}

export type TargetHints =
  | { excluded: string }
  | { excluded?: never; [hint: string]: unknown };

export type ManifestTargets = Record<string, TargetHints>;

export interface AxisIR {
  values: string[];
  default: string;
}

export interface SlotIR {
  element: string;
  optional: boolean;
}

export interface ComponentIR {
  name: string;
  displayName: string;
  description?: string;
  axes: Record<string, AxisIR>;
  states: string[];
  slots: Record<string, SlotIR>;
  preview: Record<string, string>;
  rules: Rule[];
  targets: ManifestTargets;
}

export interface DesignIR {
  irVersion: typeof IR_VERSION;
  meta: {
    name: string;
    prefix: string;
    modes: Mode[];
    defaultMode: Mode;
    rootFontSize: number;
    /** Selector for non-default modes, with `{mode}` as the placeholder. */
    modeSelector: string;
    sourceHash: string;
  };
  tokens: Record<TokenId, Token>;
  components: Record<string, ComponentIR>;
}
