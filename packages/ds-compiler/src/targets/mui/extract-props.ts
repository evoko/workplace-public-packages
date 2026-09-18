import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { codeUnitCompare } from '../../sources.js';
import type { MuiCatalogProp } from './catalog.js';

export interface MuiPropsExtraction {
  /** Own props (including ButtonBase's when extended), sorted by name. */
  props: Record<string, MuiCatalogProp>;
  /** The `RootComponent` default of `<Component>TypeMap`, or null when the file has none. Informational only: the real root element is determined at capture time by rendering the component. */
  rootElement: string | null;
}

/** A resolved `OverridableStringUnion<X, Overrides>` reference: `X`'s node, not yet reduced to string literals. */
interface OverridableRef {
  firstArg: ts.TypeNode;
  overrides: string;
}

function literalMembers(node: ts.TypeNode): string[] | null {
  const types = ts.isUnionTypeNode(node) ? node.types : [node];
  const out: string[] = [];
  for (const t of types) {
    if (ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal)) {
      out.push(t.literal.text);
    } else {
      return null;
    }
  }
  return out;
}

/**
 * Flattens a top-level union and unwraps parentheses, without descending
 * into any other type reference's type arguments: `X | undefined` and
 * `(X | Y) | Z` yield `X`'s and `Y`'s and `Z`'s own top-level members, but
 * `Partial<Record<X, string>>` yields only the `Partial<...>` reference
 * itself, never `X`.
 */
function topLevelMembers(node: ts.TypeNode): ts.TypeNode[] {
  if (ts.isParenthesizedTypeNode(node)) {
    return topLevelMembers(node.type);
  }
  if (ts.isUnionTypeNode(node)) {
    return node.types.flatMap(topLevelMembers);
  }
  return [node];
}

/**
 * A prop is an overridable union only when `OverridableStringUnion<X,
 * Overrides>` is the prop's *own* top-level type (optionally wrapped in a
 * top-level union, e.g. `| undefined` or `| (string & {})`) — never when it
 * merely appears nested inside another type reference's type arguments,
 * such as `variantMapping`'s `Partial<Record<OverridableStringUnion<...>,
 * string>>`, which is a lookup table keyed by the union, not the union
 * itself.
 */
function findOverridableRef(
  type: ts.TypeNode,
  sf: ts.SourceFile,
): OverridableRef | null {
  for (const member of topLevelMembers(type)) {
    if (
      ts.isTypeReferenceNode(member) &&
      member.typeName.getText(sf) === 'OverridableStringUnion' &&
      member.typeArguments?.length === 2
    ) {
      return {
        firstArg: member.typeArguments[0],
        overrides: member.typeArguments[1].getText(sf),
      };
    }
  }
  return null;
}

/** The `@default` tag's text, quotes stripped, or null for an absent or empty tag. */
function defaultTag(member: ts.PropertySignature): string | null {
  for (const tag of ts.getJSDocTags(member)) {
    if (tag.tagName.text !== 'default') {
      continue;
    }
    const text =
      typeof tag.comment === 'string'
        ? tag.comment
        : (tag.comment ?? []).map((part) => part.text).join('');
    const trimmed = text.trim();
    if (trimmed === '') {
      return null;
    }
    const quoted = /^(['"])([\s\S]*)\1$/.exec(trimmed);
    return quoted ? quoted[2] : trimmed;
  }
  return null;
}

/** One `.d.ts` file's lazily-created `ts.Program` and checker, for members the fast AST path cannot resolve. */
interface CheckerEntry {
  checker: ts.TypeChecker;
  /** The same file, but as parsed (and bound) by `program`; the fast-parsed `sf` is a different, unbound tree. */
  sf: ts.SourceFile;
}

function createChecker(file: string): CheckerEntry | null {
  const program = ts.createProgram([file], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    noEmit: true,
    types: [],
  });
  const sf = program.getSourceFile(file);
  return sf ? { checker: program.getTypeChecker(), sf } : null;
}

/**
 * Resolves `<interfaceName>.<memberName>`'s `OverridableStringUnion` first
 * type argument with the type checker: locates the member again inside the
 * program's own (bound) source file, resolves the type node to a `ts.Type`,
 * and keeps every string-literal member (a template-literal or aliased
 * member such as `` `text${Capitalize<keyof TypeText>}` `` is not a literal
 * and is dropped, not stringified). Used only when the fast AST path (all
 * members are inline string literals) fails.
 */
function unionViaChecker(
  file: string,
  interfaceName: string,
  memberName: string,
  cache: Map<string, CheckerEntry | null>,
): string[] | null {
  let entry = cache.get(file);
  if (entry === undefined) {
    entry = createChecker(file);
    cache.set(file, entry);
  }
  if (!entry) {
    return null;
  }
  const { checker, sf } = entry;
  let typeNode: ts.TypeNode | null = null;
  ts.forEachChild(sf, (node) => {
    if (
      typeNode ||
      !ts.isInterfaceDeclaration(node) ||
      node.name.text !== interfaceName
    ) {
      return;
    }
    for (const member of node.members) {
      if (
        ts.isPropertySignature(member) &&
        ts.isIdentifier(member.name) &&
        member.name.text === memberName &&
        member.type
      ) {
        typeNode = member.type;
      }
    }
  });
  if (!typeNode) {
    return null;
  }
  const ref = findOverridableRef(typeNode, sf);
  if (!ref) {
    return null;
  }
  const resolved = checker.getTypeFromTypeNode(ref.firstArg);
  const members = resolved.isUnion() ? resolved.types : [resolved];
  const values: string[] = [];
  for (const t of members) {
    if (t.isStringLiteral()) {
      values.push(t.value);
    }
  }
  return values;
}

/**
 * Merges every declaration of `interface <name> { ... }` in `sf` (TypeScript
 * allows more than one, and later ones augment earlier ones). Members whose
 * union cannot be read as inline string literals fall back to the type
 * checker via `checkerCache`, lazily creating at most one `ts.Program` for
 * `file`.
 */
function propsOfInterface(
  sf: ts.SourceFile,
  name: string,
  file: string,
  checkerCache: Map<string, CheckerEntry | null>,
): Record<string, MuiCatalogProp> | null {
  let result: Record<string, MuiCatalogProp> | null = null;
  ts.forEachChild(sf, (node) => {
    if (!ts.isInterfaceDeclaration(node) || node.name.text !== name) {
      return;
    }
    result ??= {};
    for (const member of node.members) {
      if (
        !ts.isPropertySignature(member) ||
        !(ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
      ) {
        continue;
      }
      const key = member.name.text;
      const type = member.type
        ? member.type.getText(sf).replace(/\s+/g, ' ')
        : 'unknown';
      const ref = member.type ? findOverridableRef(member.type, sf) : null;
      if (!ref) {
        result[key] = { kind: 'other', type, default: defaultTag(member) };
        continue;
      }
      // Fast path: every member of the union is an inline string literal.
      // Slow path: at least one member is a type reference, a template
      // literal, or similar; ask the type checker to resolve it.
      const values =
        literalMembers(ref.firstArg) ??
        unionViaChecker(file, name, key, checkerCache) ??
        [];
      result[key] = {
        kind: 'union',
        type,
        default: defaultTag(member),
        values,
        overrides: ref.overrides,
      };
    }
  });
  return result;
}

function rootComponentDefault(
  sf: ts.SourceFile,
  component: string,
): string | null {
  let found: string | null = null;
  ts.forEachChild(sf, (node) => {
    if (
      !(ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) ||
      node.name.text !== `${component}TypeMap` ||
      !node.typeParameters
    ) {
      return;
    }
    for (const param of node.typeParameters) {
      if (
        param.name.text === 'RootComponent' &&
        param.default &&
        ts.isLiteralTypeNode(param.default) &&
        ts.isStringLiteral(param.default.literal)
      ) {
        found = param.default.literal.text;
      }
    }
  });
  return found;
}

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
}

/**
 * Reads `<muiDir>/<Component>/<Component>.d.ts` with the TypeScript AST: every
 * member of `<Component>OwnProps` (falling back to `<Component>Props`), laid
 * over `ButtonBaseOwnProps` when the file extends ButtonBase, each with its
 * `OverridableStringUnion` members and overrides interface when it has one,
 * and its `@default`. Null when the file is missing, or neither
 * `<Component>OwnProps` nor `<Component>Props` is declared as an interface.
 */
export function extractMuiProps(
  muiDir: string,
  component: string,
): MuiPropsExtraction | null {
  const file = join(muiDir, component, `${component}.d.ts`);
  if (!existsSync(file)) {
    return null;
  }
  const sf = parse(file);
  const checkerCache = new Map<string, CheckerEntry | null>();
  const own =
    propsOfInterface(sf, `${component}OwnProps`, file, checkerCache) ??
    propsOfInterface(sf, `${component}Props`, file, checkerCache);
  if (!own) {
    return null;
  }
  let base: Record<string, MuiCatalogProp> = {};
  const baseFile = join(muiDir, 'ButtonBase', 'ButtonBase.d.ts');
  if (
    component !== 'ButtonBase' &&
    /\bExtendButtonBase(?:TypeMap)?\b/.test(sf.text) &&
    existsSync(baseFile)
  ) {
    base =
      propsOfInterface(
        parse(baseFile),
        'ButtonBaseOwnProps',
        baseFile,
        checkerCache,
      ) ?? {};
  }
  const merged = { ...base, ...own };
  return {
    props: Object.fromEntries(
      Object.keys(merged)
        .sort(codeUnitCompare)
        .map((k) => [k, merged[k]]),
    ),
    rootElement: rootComponentDefault(sf, component),
  };
}
