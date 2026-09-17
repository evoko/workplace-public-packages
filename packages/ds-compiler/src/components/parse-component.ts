import type { ChildNode, Rule as PostcssRule } from 'postcss';
import type { DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import { stableStringify } from '../ir/serialize.js';
import type {
  ComponentIR,
  IRValue,
  Rule,
  Token,
  TokenId,
} from '../ir/types.js';
import { locationOf, parseCss } from '../tokens/parse-tokens.js';
import { parseVarRef } from '../tokens/values.js';
import type { Manifest } from './manifest.js';
import { FORM_CONTROL_ELEMENTS } from './render-selector.js';
import {
  FORBIDDEN_SHORTHANDS,
  PROPERTY_TABLE,
  expandShorthand,
  parseLiteralForProperty,
  type LiteralKind,
  type PropertySpec,
} from './properties.js';
import { mergeDeclarations, ruleKey, sortRules } from './rules.js';
import { parseSelector } from './selector.js';

export type TokenTable = Record<TokenId, Token>;

export function parseComponentCss(
  cssPath: string,
  css: string,
  manifest: Manifest,
  tokens: TokenTable,
  config: DsConfig,
  diag: Diagnostics,
): ComponentIR | null {
  const root = parseCss(cssPath, css, diag);
  if (!root) {
    return null;
  }
  const rules = new Map<string, Rule>();
  const axisOrder = Object.keys(manifest.axes);
  const rootElement = manifest.slots.root?.element ?? 'div';

  root.each((node: ChildNode) => {
    if (node.type === 'comment') {
      return;
    }
    if (node.type === 'atrule') {
      diag.add(
        'DS-E034',
        `@${node.name} is not allowed in component files`,
        locationOf(cssPath, node),
      );
      return;
    }
    if (node.type === 'decl') {
      diag.add(
        'DS-E034',
        `declaration "${node.prop}" outside a rule`,
        locationOf(cssPath, node),
      );
      return;
    }
    if (node.type !== 'rule') {
      return;
    }
    const location = locationOf(cssPath, node);
    const declarations = collectDeclarations(
      node,
      cssPath,
      tokens,
      config,
      diag,
    );
    for (const selector of node.selectors) {
      const trimmed = selector.trim();
      const parsed = parseSelector(
        trimmed,
        manifest,
        config.prefix,
        location,
        diag,
      );
      if (!parsed) {
        continue;
      }
      if (
        !FORM_CONTROL_ELEMENTS.has(rootElement) &&
        /:disabled\b|\[\s*disabled\s*\]/.test(trimmed)
      ) {
        diag.add(
          'DS-W003',
          `"${trimmed}" uses :disabled or [disabled], but the root element is <${rootElement}>, which can never be disabled`,
          locationOf(cssPath, node),
        );
      }
      const key = ruleKey(parsed.slot, parsed.axes, parsed.states, axisOrder);
      let rule = rules.get(key);
      if (!rule) {
        rule = {
          slot: parsed.slot,
          axes: parsed.axes,
          states: parsed.states,
          declarations: {},
          source: location,
        };
        rules.set(key, rule);
      }
      mergeDeclarations(rule, declarations, location, diag);
    }
  });

  // A rule whose declarations all failed to resolve (or whose block was
  // comment-only) has nothing to emit; drop it rather than keep an empty rule.
  const nonEmptyRules = [...rules.values()].filter(
    (r) => Object.keys(r.declarations).length > 0,
  );

  return {
    name: manifest.name,
    displayName: manifest.displayName,
    description: manifest.description,
    axes: manifest.axes,
    states: manifest.states,
    slots: manifest.slots,
    preview: manifest.preview,
    rules: sortRules(nonEmptyRules, manifest),
    targets: manifest.targets,
  };
}

function collectDeclarations(
  rule: PostcssRule,
  cssPath: string,
  tokens: TokenTable,
  config: DsConfig,
  diag: Diagnostics,
): Record<string, IRValue> {
  const out: Record<string, IRValue> = {};
  rule.each((child: ChildNode) => {
    if (child.type === 'comment') {
      return;
    }
    if (child.type === 'rule') {
      diag.add(
        'DS-E034',
        `nested rule "${child.selector}" is not allowed`,
        locationOf(cssPath, child),
      );
      return;
    }
    if (child.type === 'atrule') {
      diag.add(
        'DS-E034',
        `@${child.name} is not allowed inside a rule`,
        locationOf(cssPath, child),
      );
      return;
    }
    if (child.type !== 'decl') {
      return;
    }
    const location = locationOf(cssPath, child);
    if (child.important) {
      diag.add('DS-E034', `"${child.prop}" uses !important`, location);
      return;
    }
    const prop = child.prop.toLowerCase();
    if (FORBIDDEN_SHORTHANDS.has(prop)) {
      diag.add('DS-E045', `"${prop}" is a forbidden shorthand`, location);
      return;
    }
    const expansion = expandShorthand(prop, child.value);
    let pairs: Array<[string, string]>;
    if (expansion === null) {
      pairs = [[prop, child.value.trim()]];
    } else if (!expansion.ok) {
      diag.add(
        'DS-E042',
        `"${prop}: ${child.value}": ${expansion.reason}`,
        location,
      );
      return;
    } else {
      pairs = Object.entries(expansion.declarations);
    }
    for (const [p, v] of pairs) {
      const spec = PROPERTY_TABLE[p];
      if (!spec) {
        diag.add('DS-E040', `"${p}" is not a supported property`, location);
        continue;
      }
      const value = resolveValue(
        p,
        v,
        spec,
        tokens,
        config.prefix,
        location,
        diag,
      );
      if (!value) {
        continue;
      }
      const existing = out[p];
      if (existing) {
        if (stableStringify(existing) !== stableStringify(value)) {
          diag.add(
            'DS-E046',
            `"${p}" is set twice in this rule with different values`,
            location,
          );
        }
        continue;
      }
      out[p] = value;
    }
  });
  return out;
}

const LITERAL_KIND_LABELS: Record<LiteralKind, string> = {
  dimension: 'a dimension',
  number: 'a number',
  'identifier-list': 'a comma-separated identifier list',
};

/** Describes every value form `spec` accepts, for the DS-E042 message. */
function describeAllowed(spec: PropertySpec): string {
  const parts: string[] = [];
  if (spec.categories.length > 0) {
    parts.push(`a ${spec.categories.join(' or ')} token`);
  }
  for (const kind of spec.literalKinds) {
    parts.push(LITERAL_KIND_LABELS[kind]);
  }
  if (spec.literals.length > 0) {
    parts.push(`one of: ${spec.literals.join(', ')}`);
  }
  return parts.join(', ');
}

function resolveValue(
  prop: string,
  raw: string,
  spec: PropertySpec,
  tokens: TokenTable,
  prefix: string,
  location: SourceLocation,
  diag: Diagnostics,
): IRValue | null {
  const ref = parseVarRef(raw, prefix);
  if (ref) {
    if (!ref.ok) {
      diag.add('DS-E042', `"${prop}: ${raw}": ${ref.reason}`, location);
      return null;
    }
    const token = tokens[ref.id];
    if (!token) {
      diag.add(
        'DS-E043',
        `"${prop}" references "${ref.name}", which is not defined`,
        location,
      );
      return null;
    }
    if (!spec.categories.includes(token.category)) {
      if (spec.categories.length === 0) {
        diag.add(
          'DS-E044',
          `"${prop}" does not accept token references`,
          location,
        );
        return null;
      }
      diag.add(
        'DS-E044',
        `"${prop}" accepts ${spec.categories.join(', ')} tokens, but "${ref.name}" is a ${token.category} token`,
        location,
      );
      return null;
    }
    return { kind: 'token', ref: ref.id };
  }
  const literal = parseLiteralForProperty(prop, raw);
  if (literal) {
    return literal;
  }
  if (spec.tokenRequired) {
    const escapes =
      spec.literals.length > 0
        ? ` (or one of: ${spec.literals.join(', ')})`
        : '';
    diag.add(
      'DS-E041',
      `"${prop}: ${raw}" must reference a ${spec.categories.join(' or ')} token${escapes}`,
      location,
    );
    return null;
  }
  diag.add(
    'DS-E042',
    `"${prop}: ${raw}" is not an allowed value; allowed: ${describeAllowed(spec)}`,
    location,
  );
  return null;
}
