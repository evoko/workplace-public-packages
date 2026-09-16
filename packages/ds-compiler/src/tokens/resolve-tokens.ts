import type { DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import { stableStringify } from '../ir/serialize.js';
import type { Mode, Token, TokenId } from '../ir/types.js';
import { CATEGORY_TYPES, type TokenCategory } from './categories.js';
import type { RawToken } from './parse-tokens.js';
import {
  parseLiteralForTypes,
  parseVarRef,
  type TokenType,
  type TokenValue,
} from './values.js';

type Entry =
  | {
      kind: 'literal';
      type: TokenType;
      value: TokenValue;
      location: SourceLocation;
    }
  | { kind: 'alias'; ref: TokenId; location: SourceLocation };

interface Group {
  /** The declaration that names/locates the group; prefers the default mode. */
  first: RawToken;
  byMode: Map<Mode, RawToken>;
}

interface Pending {
  id: TokenId;
  category: TokenCategory;
  path: string[];
  cssName: string;
  /** True when declared only in :root. */
  declaredInvariant: boolean;
  entries: Map<Mode, Entry>;
  location: SourceLocation;
}

interface Resolved {
  type: TokenType;
  value: TokenValue;
}

export function resolveTokens(
  raws: RawToken[],
  config: DsConfig,
  diag: Diagnostics,
): Record<TokenId, Token> {
  const dropped = new Set<TokenId>();
  const grouped = groupAndValidate(raws, config, diag, dropped);
  const pending = parseEntries(grouped, config, diag, dropped);
  const memo = new Map<string, Resolved | null>();
  const reportedCycles = new Set<string>();

  const resolveEntry = (
    id: TokenId,
    mode: Mode,
    stack: TokenId[],
  ): Resolved | null => {
    const memoKey = `${id}@${mode}`;
    if (memo.has(memoKey)) {
      return memo.get(memoKey)!;
    }
    const finish = (result: Resolved | null): Resolved | null => {
      memo.set(memoKey, result);
      return result;
    };
    const token = pending.get(id);
    if (!token) {
      return finish(null);
    }
    const entry =
      token.entries.get(mode) ??
      (token.declaredInvariant
        ? token.entries.get(config.defaultMode)
        : undefined);
    if (!entry) {
      return finish(null);
    }
    if (entry.kind === 'literal') {
      return finish({
        type: entry.type,
        value: structuredClone(entry.value),
      });
    }
    // Alias: a self-reference or a reference back up the resolution stack is a cycle.
    if (entry.ref === id || stack.includes(entry.ref)) {
      const idx = entry.ref === id ? stack.length : stack.indexOf(entry.ref);
      const members = [...stack.slice(idx), id];
      const cycleKey = [...members].sort().join('|');
      if (!reportedCycles.has(cycleKey)) {
        reportedCycles.add(cycleKey);
        const firstMember = members[0];
        const firstLocation =
          pending.get(firstMember)?.location ?? entry.location;
        diag.add(
          'DS-E013',
          `Alias cycle: ${[...members, entry.ref].join(' -> ')}`,
          firstLocation,
        );
      }
      return finish(null);
    }
    // The referenced token already failed its own diagnostic; do not cascade.
    if (dropped.has(entry.ref)) {
      return finish(null);
    }
    if (!pending.has(entry.ref)) {
      diag.add(
        'DS-E013',
        `"${token.cssName}" references unknown token "${entry.ref}"`,
        entry.location,
      );
      return finish(null);
    }
    const target = resolveEntry(entry.ref, mode, [...stack, id]);
    if (!target) {
      return finish(null);
    }
    if (!CATEGORY_TYPES[token.category].includes(target.type)) {
      diag.add(
        'DS-E014',
        `"${token.cssName}" (category ${token.category}) aliases "${entry.ref}" of type ${target.type}; allowed: ${CATEGORY_TYPES[token.category].join(', ')}`,
        entry.location,
      );
      return finish(null);
    }
    return finish(target);
  };

  const tokens: Record<TokenId, Token> = {};
  for (const id of [...pending.keys()].sort()) {
    const token = pending.get(id)!;
    const perMode: Record<Mode, TokenValue> = {};
    let type: TokenType | null = null;
    let firstMode: Mode | null = null;
    let failed = false;
    for (const mode of config.modes) {
      const resolved = resolveEntry(id, mode, []);
      if (!resolved) {
        failed = true;
        break;
      }
      if (type !== null && resolved.type !== type) {
        diag.add(
          'DS-E012',
          `"${token.cssName}" resolves to ${type} in "${firstMode}" but ${resolved.type} in "${mode}"; a token must have one value type across modes`,
          token.location,
        );
        failed = true;
        break;
      }
      perMode[mode] = structuredClone(resolved.value);
      type = resolved.type;
      firstMode = mode;
    }
    if (failed || !type) {
      continue;
    }
    tokens[id] = toToken(token, perMode, type, config);
  }
  return tokens;
}

/** Builds the final Token, a discriminated union on modeInvariant. */
function toToken(
  pending: Pending,
  perMode: Record<Mode, TokenValue>,
  type: TokenType,
  config: DsConfig,
): Token {
  const serialized = config.modes.map((m) => stableStringify(perMode[m]));
  const allValuesEqual = serialized.every((s) => s === serialized[0]);

  const declaredModes = [...pending.entries.keys()];
  const allLiteral = declaredModes.every(
    (m) => pending.entries.get(m)!.kind === 'literal',
  );
  const aliasEntries = declaredModes
    .map((m) => pending.entries.get(m)!)
    .filter((e): e is Extract<Entry, { kind: 'alias' }> => e.kind === 'alias');
  const allSameAlias =
    aliasEntries.length === declaredModes.length &&
    new Set(aliasEntries.map((e) => e.ref)).size === 1;
  // Mixing a literal mode with an alias mode (or aliasing different targets
  // per mode) must stay mode-variant even when the resolved values match.
  const aliasShapeAgrees =
    allLiteral || allSameAlias || pending.declaredInvariant;
  const invariant = allValuesEqual && aliasShapeAgrees;

  const aliasByMode: Partial<Record<Mode, TokenId>> = {};
  for (const [mode, entry] of pending.entries) {
    if (entry.kind === 'alias') {
      aliasByMode[mode] = entry.ref;
    }
  }
  const hasAlias = Object.keys(aliasByMode).length > 0;

  const base = {
    $type: type,
    category: pending.category,
    path: pending.path,
    cssName: pending.cssName,
    source: pending.location,
  };

  // Token is a discriminated union on modeInvariant, so build each arm explicitly.
  if (invariant) {
    const out: Token = {
      ...base,
      modeInvariant: true,
      $value: perMode[config.defaultMode],
    };
    const alias = aliasByMode[config.defaultMode];
    if (alias !== undefined) {
      out.alias = alias;
    }
    return out;
  }
  const out: Token = { ...base, modeInvariant: false, $value: perMode };
  if (hasAlias) {
    out.alias = aliasByMode;
  }
  return out;
}

function groupAndValidate(
  raws: RawToken[],
  config: DsConfig,
  diag: Diagnostics,
  dropped: Set<TokenId>,
): Map<TokenId, Group> {
  const grouped = new Map<TokenId, Group>();
  for (const raw of raws) {
    const group = grouped.get(raw.id) ?? { first: raw, byMode: new Map() };
    if (group.byMode.has(raw.mode)) {
      diag.add(
        'DS-E016',
        `"${raw.cssName}" is declared twice for mode "${raw.mode}"`,
        raw.location,
      );
      continue;
    }
    group.byMode.set(raw.mode, raw);
    grouped.set(raw.id, group);
  }
  for (const group of grouped.values()) {
    group.first = group.byMode.get(config.defaultMode) ?? group.first;
  }
  for (const [id, group] of grouped) {
    const modes = [...group.byMode.keys()];
    const onlyDefault = modes.length === 1 && modes[0] === config.defaultMode;
    const all = config.modes.every((m) => group.byMode.has(m));
    if (!onlyDefault && !all) {
      const missing = config.modes.filter((m) => !group.byMode.has(m));
      diag.add(
        'DS-E015',
        `"${group.first.cssName}" (${id}) is missing in mode(s): ${missing.join(', ')}. Declare it in every mode or only in :root.`,
        group.first.location,
      );
      grouped.delete(id);
      dropped.add(id);
    }
  }
  return grouped;
}

function parseEntries(
  grouped: Map<TokenId, Group>,
  config: DsConfig,
  diag: Diagnostics,
  dropped: Set<TokenId>,
): Map<TokenId, Pending> {
  const pending = new Map<TokenId, Pending>();
  for (const [id, group] of grouped) {
    const entries = new Map<Mode, Entry>();
    let ok = true;
    for (const [mode, raw] of group.byMode) {
      // Literal parsers run first so shadows with an embedded var() color parse.
      // Safe because no literal parser accepts a bare whole-value var(); if a
      // future category adds one, aliases of that category would be shadowed.
      const types = CATEGORY_TYPES[raw.category];
      const literal = parseLiteralForTypes(raw.raw, types, config.prefix);
      if (literal) {
        entries.set(mode, {
          kind: 'literal',
          type: literal.type,
          value: literal.value,
          location: raw.location,
        });
        continue;
      }
      const ref = parseVarRef(raw.raw, config.prefix);
      if (ref) {
        if (!ref.ok) {
          diag.add('DS-E012', `"${raw.cssName}": ${ref.reason}`, raw.location);
          ok = false;
          continue;
        }
        entries.set(mode, {
          kind: 'alias',
          ref: ref.id,
          location: raw.location,
        });
        continue;
      }
      diag.add(
        'DS-E012',
        `"${raw.cssName}": "${raw.raw}" is not a valid ${types.join(' or ')} value`,
        raw.location,
      );
      ok = false;
    }
    if (!ok) {
      dropped.add(id);
      continue;
    }
    pending.set(id, {
      id,
      category: group.first.category,
      path: group.first.path,
      cssName: group.first.cssName,
      declaredInvariant:
        group.byMode.size === 1 && group.byMode.has(config.defaultMode),
      entries,
      location: group.first.location,
    });
  }
  return pending;
}
