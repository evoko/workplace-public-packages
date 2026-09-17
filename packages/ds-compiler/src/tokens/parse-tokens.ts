import { basename } from 'node:path';
import postcss, { CssSyntaxError, type ChildNode, type Root } from 'postcss';
import { modeSelectorFor, type DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { Mode, TokenId } from '../ir/types.js';
import {
  isTokenCategory,
  parseTokenName,
  type TokenCategory,
} from './categories.js';

export interface RawToken {
  id: TokenId;
  category: TokenCategory;
  path: string[];
  cssName: string;
  mode: Mode;
  raw: string;
  location: SourceLocation;
}

interface Positioned {
  source?: { start?: { line: number; column: number } };
}

export function locationOf(file: string, node: Positioned): SourceLocation {
  return {
    file,
    line: node.source?.start?.line ?? 1,
    column: node.source?.start?.column ?? 1,
  };
}

/** Parses CSS text, reporting a syntax error as DS-E061 at its position. */
export function parseCss(
  filePath: string,
  css: string,
  diag: Diagnostics,
): Root | null {
  try {
    return postcss.parse(css, { from: filePath });
  } catch (err) {
    if (err instanceof CssSyntaxError) {
      diag.add('DS-E061', `CSS syntax error: ${err.reason}`, {
        file: filePath,
        line: err.line ?? 1,
        column: err.column ?? 1,
      });
    } else {
      diag.add('DS-E061', `CSS syntax error: ${(err as Error).message}`, {
        file: filePath,
        line: 1,
        column: 1,
      });
    }
    return null;
  }
}

export function categoryFromFile(filePath: string): TokenCategory | null {
  const base = basename(filePath, '.css');
  return isTokenCategory(base) ? base : null;
}

/** Quote style is irrelevant: Prettier may rewrite [a="b"] as [a='b']. */
export function normalizeQuotes(selector: string): string {
  return selector.replace(/'/g, '"');
}

export function modeForSelector(
  selector: string,
  config: DsConfig,
): Mode | null {
  const wanted = normalizeQuotes(selector);
  if (wanted === ':root') {
    return config.defaultMode;
  }
  for (const mode of config.modes) {
    if (
      mode !== config.defaultMode &&
      normalizeQuotes(modeSelectorFor(config, mode)) === wanted
    ) {
      return mode;
    }
  }
  return null;
}

export function parseTokenFile(
  filePath: string,
  css: string,
  config: DsConfig,
  diag: Diagnostics,
): RawToken[] {
  const category = categoryFromFile(filePath);
  if (!category) {
    diag.add(
      'DS-E017',
      `"${basename(filePath)}" is not named after a token category`,
      { file: filePath, line: 1, column: 1 },
    );
    return [];
  }
  const root = parseCss(filePath, css, diag);
  if (!root) {
    return [];
  }
  const out: RawToken[] = [];
  root.each((node: ChildNode) => {
    if (node.type === 'comment') {
      return;
    }
    if (node.type !== 'rule') {
      const what =
        node.type === 'atrule' ? `@${node.name}` : `${node.type} node`;
      diag.add(
        'DS-E010',
        `Unexpected ${what} in token file; only :root and mode blocks are allowed`,
        locationOf(filePath, node),
      );
      return;
    }
    const selector = node.selector.trim();
    const mode = modeForSelector(selector, config);
    if (mode === null) {
      const normalizedSelector = normalizeQuotes(selector);
      const defaultSelector = normalizeQuotes(
        modeSelectorFor(config, config.defaultMode),
      );
      if (normalizedSelector === defaultSelector) {
        diag.add(
          'DS-E010',
          `Selector "${selector}" is the default mode "${config.defaultMode}"; declare default-mode values in :root`,
          locationOf(filePath, node),
        );
        return;
      }
      diag.add(
        'DS-E010',
        `Selector "${selector}" is not :root or a configured mode selector`,
        locationOf(filePath, node),
      );
      return;
    }
    node.each((child) => {
      if (child.type === 'comment') {
        return;
      }
      if (child.type !== 'decl') {
        diag.add(
          'DS-E010',
          `Unexpected ${child.type === 'rule' ? `nested rule "${child.selector}"` : child.type} inside "${selector}"`,
          locationOf(filePath, child),
        );
        return;
      }
      const parsed = child.prop.startsWith('--')
        ? parseTokenName(child.prop, config.prefix)
        : null;
      if (!parsed) {
        diag.add(
          'DS-E011',
          `"${child.prop}" does not match --${config.prefix}-${category}-<path>`,
          locationOf(filePath, child),
        );
        return;
      }
      if (parsed.category !== category) {
        diag.add(
          'DS-E011',
          `"${child.prop}" belongs to category "${parsed.category}" but is declared in ${basename(filePath)}`,
          locationOf(filePath, child),
        );
        return;
      }
      if (child.important) {
        diag.add(
          'DS-E012',
          `"${child.prop}" must not use !important`,
          locationOf(filePath, child),
        );
        // Fall through: still push the RawToken (child.value already excludes
        // the flag) so a valid token isn't also reported as missing a mode.
      }
      out.push({
        id: parsed.id,
        category,
        path: parsed.path,
        cssName: child.prop,
        mode,
        raw: child.value.trim(),
        location: locationOf(filePath, child),
      });
    });
  });
  return out;
}
