import type { ChildNode, Declaration, Rule as CssRule } from 'postcss';
import { renderRuleSelector } from '../../components/render-selector.js';
import { parseComponentCss } from '../../components/parse-component.js';
import { modeSelectorFor, type DsConfig } from '../../config.js';
import {
  Diagnostics,
  formatDiagnostic,
  type SourceLocation,
} from '../../errors.js';
import type { ComponentIR, DesignIR, Token, TokenId } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import type { TokenCategory } from '../../tokens/categories.js';
import { parseTokenName } from '../../tokens/categories.js';
import {
  normalizeQuotes,
  parseCss,
  parseTokenFile,
  type RawToken,
} from '../../tokens/parse-tokens.js';
import { resolveTokens } from '../../tokens/resolve-tokens.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import {
  manifestFromComponent,
  verifySelectorOrder,
} from '../reparse-support.js';
import { isMappedForTailwind } from './hints.js';
import { sourceNameFromTailwind } from './names.js';

export { manifestFromComponent } from '../reparse-support.js';

const VAR_REF = /var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g;

/** Rewrites every var(--tailwind-name) to var(--source-name); reports names that map to nothing. */
function rewriteVars(
  value: string,
  prefix: string,
  onUnknown: (name: string) => void,
): string {
  return value.replace(VAR_REF, (whole: string, name: string) => {
    const src = sourceNameFromTailwind(name, prefix);
    if (!src) {
      onUnknown(name);
      return whole;
    }
    return `var(${src})`;
  });
}

interface ThemeBlocks {
  /** category -> mode -> source-form declaration lines */
  byCategory: Map<TokenCategory, Map<string, string[]>>;
}

function collectThemeDecl(
  decl: Declaration,
  mode: string,
  config: DsConfig,
  blocks: ThemeBlocks,
  diag: Diagnostics,
): void {
  const at = {
    file: 'theme.css',
    line: decl.source?.start?.line ?? 1,
    column: decl.source?.start?.column ?? 1,
  };
  const src = sourceNameFromTailwind(decl.prop, config.prefix);
  const parsed = src ? parseTokenName(src, config.prefix) : null;
  if (!src || !parsed) {
    diag.add('DS-E011', `"${decl.prop}" is not a generated token variable`, at);
    return;
  }
  const value = rewriteVars(decl.value, config.prefix, (name) =>
    diag.add('DS-E013', `"${name}" is not a generated token variable`, at),
  );
  const byMode =
    blocks.byCategory.get(parsed.category) ?? new Map<string, string[]>();
  blocks.byCategory.set(parsed.category, byMode);
  const lines = byMode.get(mode) ?? [];
  byMode.set(mode, lines);
  lines.push(`  ${src}: ${value};`);
}

function reparseTheme(
  css: string,
  config: DsConfig,
  diag: Diagnostics,
): Record<TokenId, Token> | null {
  const root = parseCss('theme.css', css, diag);
  if (!root) {
    return null;
  }
  const blocks: ThemeBlocks = { byCategory: new Map() };
  const modeOf = (selector: string): string | null =>
    config.modes.find(
      (m) =>
        m !== config.defaultMode &&
        normalizeQuotes(modeSelectorFor(config, m)) ===
          normalizeQuotes(selector.trim()),
    ) ?? null;

  const eachDecl = (
    parent: { each: (cb: (n: ChildNode) => void) => void },
    mode: string,
  ): void => {
    parent.each((child) => {
      if (child.type === 'decl') {
        collectThemeDecl(child, mode, config, blocks, diag);
      } else if (child.type !== 'comment') {
        diag.add('DS-E010', `unexpected ${child.type} inside a theme block`, {
          file: 'theme.css',
          line: child.source?.start?.line ?? 1,
          column: child.source?.start?.column ?? 1,
        });
      }
    });
  };

  root.each((node) => {
    if (node.type === 'comment') {
      return;
    }
    if (node.type === 'atrule' && node.name === 'theme') {
      const params = node.params.trim();
      if (params !== 'static') {
        diag.add(
          'DS-E010',
          `expected "@theme static", got "@theme ${params}"`,
          {
            file: 'theme.css',
            line: node.source?.start?.line ?? 1,
            column: node.source?.start?.column ?? 1,
          },
        );
        return;
      }
      eachDecl(node, config.defaultMode);
      return;
    }
    if (node.type === 'rule') {
      const mode = modeOf(node.selector);
      if (mode) {
        eachDecl(node, mode);
        return;
      }
    }
    diag.add(
      'DS-E010',
      `unexpected ${node.type} at the top level of theme.css`,
      {
        file: 'theme.css',
        line: node.source?.start?.line ?? 1,
        column: node.source?.start?.column ?? 1,
      },
    );
  });
  if (diag.hasErrors()) {
    return null;
  }

  const raws: RawToken[] = [];
  const otherModes = config.modes.filter((m) => m !== config.defaultMode);
  for (const [category, byMode] of [...blocks.byCategory].sort((a, b) =>
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
        diag,
      ),
    );
  }
  const tokens = resolveTokens(raws, config, diag);
  return diag.hasErrors() ? null : tokens;
}

interface Group {
  /** Location of the first rule seen for this component, for diagnostics that describe the whole group. */
  location: SourceLocation;
  /** Trimmed original selector text, one per rule occurrence, in the order they were seen. */
  originals: { selector: string; location: SourceLocation }[];
  /** Rewritten rule text (source-form var() references), one per rule occurrence, in the same order. */
  texts: string[];
}

function reparseComponents(
  css: string,
  ir: DesignIR,
  tokens: Record<TokenId, Token>,
  config: DsConfig,
  diag: Diagnostics,
): Record<string, ComponentIR> | null {
  const root = parseCss('components.css', css, diag);
  if (!root) {
    return null;
  }
  const rootClass = new RegExp(`^\\.${config.prefix}-([a-z0-9-]+)`);
  const groups = new Map<string, Group>();
  const at = (node: ChildNode): SourceLocation => ({
    file: 'components.css',
    line: node.source?.start?.line ?? 1,
    column: node.source?.start?.column ?? 1,
  });

  const visit = (rule: CssRule): void => {
    const m = rootClass.exec(rule.selector.trim());
    if (!m) {
      diag.add(
        'DS-E030',
        `cannot attribute "${rule.selector}" to a component`,
        at(rule),
      );
      return;
    }
    rule.walkDecls((decl) => {
      decl.value = rewriteVars(decl.value, config.prefix, (name) =>
        diag.add(
          'DS-E043',
          `"${name}" is not a generated token variable`,
          at(decl),
        ),
      );
    });
    const location = at(rule);
    const group = groups.get(m[1]) ?? { location, originals: [], texts: [] };
    groups.set(m[1], group);
    group.originals.push({ selector: rule.selector.trim(), location });
    group.texts.push(rule.toString());
  };

  root.each((node) => {
    if (node.type === 'comment') {
      return;
    }
    if (
      node.type === 'atrule' &&
      node.name === 'layer' &&
      node.params === 'components'
    ) {
      node.each((child) => {
        if (child.type === 'rule') {
          visit(child);
        } else if (child.type !== 'comment') {
          diag.add(
            'DS-E034',
            `unexpected ${child.type} inside @layer components`,
            at(child),
          );
        }
      });
      return;
    }
    diag.add(
      'DS-E034',
      `unexpected ${node.type} at the top level of components.css`,
      at(node),
    );
  });
  if (diag.hasErrors()) {
    return null;
  }

  const out: Record<string, ComponentIR> = {};
  for (const [name, group] of [...groups].sort((a, b) =>
    codeUnitCompare(a[0], b[0]),
  )) {
    const component = ir.components[name];
    if (!component) {
      diag.add(
        'DS-E030',
        `generated rules for unknown component "${name}"`,
        group.location,
      );
      continue;
    }
    if (!isMappedForTailwind(component)) {
      diag.add(
        'DS-E030',
        `generated rules for component "${name}", which is excluded or unmapped for tailwind`,
        group.location,
      );
      continue;
    }
    const errorsBefore = diag.errors.length;
    const parsed = parseComponentCss(
      'components.css',
      `${group.texts.join('\n\n')}\n`,
      manifestFromComponent(component),
      tokens,
      config,
      diag,
    );
    if (!parsed) {
      continue;
    }
    out[name] = parsed;
    if (diag.errors.length > errorsBefore) {
      // parseComponentCss already reported the real problem (e.g. a
      // malformed selector); comparing selectors against a component it
      // could only partially parse would just add noise.
      continue;
    }
    const target = {
      name,
      rootElement: component.slots.root?.element ?? 'div',
    };
    const rendered = parsed.rules.map((r) =>
      renderRuleSelector(config.prefix, target, r),
    );
    verifySelectorOrder(
      group.originals,
      rendered,
      { file: 'components.css', line: 1, column: 1 },
      diag,
    );
  }
  return diag.hasErrors() ? null : out;
}

/**
 * Turns the generated Tailwind files back into an IR using the compiler's own
 * parsers: variable names are rewritten to source form, `@theme` becomes
 * `:root`, mode rules become mode blocks, and `@layer components` rules are
 * grouped by root class. Every problem is reported as DS-E081 on `diag`,
 * wrapping the underlying diagnostic.
 */
export function reparseTailwind(
  files: GeneratedFile[],
  ir: DesignIR,
  ctx: PluginContext,
  diag: Diagnostics,
): DesignIR | null {
  const theme = files.find((f) => f.path === 'theme.css');
  const components = files.find((f) => f.path === 'components.css');
  if (!theme || !components) {
    diag.add('DS-E081', 'tailwind output lacks theme.css or components.css', {
      file: 'theme.css',
      line: 1,
      column: 1,
    });
    return null;
  }
  const inner = new Diagnostics();
  const tokens = reparseTheme(theme.contents, ctx.config, inner);
  const parsedComponents = tokens
    ? reparseComponents(components.contents, ir, tokens, ctx.config, inner)
    : null;
  for (const d of inner.errors) {
    const file = d.location?.file ?? 'theme.css';
    // The remapped location below already carries the position; composing
    // the message from a location-less copy keeps it from also embedding the
    // (possibly synthetic, e.g. src/tokens/space.css) inner file path.
    const text = formatDiagnostic({ ...d, location: undefined }).split('\n')[0];
    diag.add('DS-E081', `tailwind: ${text}`, {
      file: file.startsWith('src/tokens/') ? 'theme.css' : file,
      line: d.location?.line ?? 1,
      column: d.location?.column ?? 1,
    });
  }
  if (!tokens || !parsedComponents) {
    return null;
  }
  return {
    irVersion: ir.irVersion,
    meta: { ...ir.meta },
    tokens,
    components: parsedComponents,
  };
}
