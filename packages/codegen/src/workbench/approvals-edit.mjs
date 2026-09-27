/**
 * spec/approvals.yaml's text with an approval added or removed, for the viewers' Approve and Undo
 * approval buttons: a person presses them, never an agent (CLAUDE.md). The text is spliced, as an
 * overlay's is (overlay-edit.mjs), so the header comment, a person's notes and every other line
 * stay byte for byte; components stay in name order, platforms in PLATFORMS order, and each line
 * is written as `solar:status` prints it to paste.
 */

import { isMap, parseDocument } from 'yaml';
import { PLATFORMS } from '../approvals/graph.mjs';
import { approvalKey, approvalLine } from '../approvals/status.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import {
  keyOf,
  lineStart,
  pairEnd,
  pairStart,
  tidyJoin,
} from './overlay-edit.mjs';

/** The record's components as pairs, `[]` where it has none. */
function componentsOf(text) {
  const doc = parseDocument(text);
  if (doc.errors.length) throw new Error(doc.errors[0].message);
  if (doc.contents == null) return [];
  if (!isMap(doc.contents) || doc.contents.flow)
    throw new Error('spec/approvals.yaml is not a block map of components.');
  return doc.contents.items;
}

/** The component's platforms as pairs; null where it holds nothing a line can be spliced into. */
function platformsOf(component) {
  const value = component.value;
  if (value == null || (isMap(value) && !value.items.length)) return null;
  if (!isMap(value) || value.flow)
    throw new Error(
      `spec/approvals.yaml writes ${keyOf(component)} in a form other than one line per platform.`,
    );
  return value.items;
}

/** Where a component's lines begin: its comment with it, but never the header above the first. */
const componentStart = (text, components, component) =>
  pairStart(text, component, lineStart(text, components[0].key.range[0]));

/**
 * @param {string} text the record
 * @param {string} name the component (`Button`)
 * @param {'web' | 'flutter'} platform
 * @param {{fingerprint: string, by: string, on: string}} approval
 * @returns {string} the new text
 */
export function withApproval(text, name, platform, approval) {
  let source = text ?? '';
  if (source && !source.endsWith('\n')) source += '\n';
  const line = `${approvalLine(platform, approval)}\n`;
  const block = `${approvalKey(name)}:\n${line}`;
  const components = componentsOf(source);
  const component = components.find((p) => keyOf(p) === name);

  if (!component) {
    const next = components.find((p) => byCodeUnit(String(keyOf(p)), name) > 0);
    if (next) {
      const at = componentStart(source, components, next);
      return source.slice(0, at) + block + source.slice(at);
    }
    if (components.length) {
      const at = pairEnd(source, components.at(-1));
      return source.slice(0, at) + block + source.slice(at);
    }
    const header = source.trimEnd();
    return `${header}${header ? '\n\n' : ''}${block}`;
  }

  const platforms = platformsOf(component);
  if (!platforms) {
    // `Button:` with nothing under it: its lines become the block.
    const from = lineStart(source, component.key.range[0]);
    return (
      source.slice(0, from) + block + source.slice(pairEnd(source, component))
    );
  }
  const existing = platforms.find((p) => keyOf(p) === platform);
  if (existing) {
    const from = lineStart(source, existing.key.range[0]);
    return (
      source.slice(0, from) + line + source.slice(pairEnd(source, existing))
    );
  }
  const rank = (p) => {
    const i = PLATFORMS.indexOf(keyOf(p));
    return i === -1 ? PLATFORMS.length : i;
  };
  const next = platforms.find((p) => rank(p) > PLATFORMS.indexOf(platform));
  const at = next
    ? pairStart(source, next, lineStart(source, platforms[0].key.range[0]))
    : pairEnd(source, platforms.at(-1));
  return source.slice(0, at) + line + source.slice(at);
}

/**
 * The record without each `{ name, platform }`, and without a component left with nothing; a
 * pair it does not hold is passed over.
 * @param {string} text the record
 * @param {{name: string, platform: string}[]} pairs
 * @returns {string} the new text
 */
export function withoutApprovals(text, pairs) {
  let source = text ?? '';
  if (source && !source.endsWith('\n')) source += '\n';
  for (const { name, platform } of pairs) {
    const components = componentsOf(source);
    const component = components.find((p) => keyOf(p) === name);
    const platforms = component && platformsOf(component);
    const existing = platforms?.find((p) => keyOf(p) === platform);
    if (!existing) continue;
    const last = platforms.length === 1;
    const from = last
      ? componentStart(source, components, component)
      : pairStart(
          source,
          existing,
          lineStart(source, platforms[0].key.range[0]),
        );
    const to = pairEnd(source, last ? component : existing);
    source = tidyJoin(source.slice(0, from) + source.slice(to), from);
  }
  return source;
}

/**
 * What withdrawing one approval takes with it: the component, and every component on that platform
 * that uses it (uses are transitive) and is recorded as approved, since an approval above an
 * unapproved child fails `solar:status --check`.
 * @param {Record<string, {name: string, uses: string[]}[]>} coloured each platform's components
 * @param {object} approvals the record, as `readApprovals` gives it
 * @param {string} name
 * @param {'web' | 'flutter'} platform
 * @returns {string[]} the component first, then its users in name order
 */
export function withdrawnBy(coloured, approvals, name, platform) {
  const users = (coloured[platform] ?? [])
    .filter((c) => c.uses.includes(name) && approvals?.[c.name]?.[platform])
    .map((c) => c.name)
    .sort(byCodeUnit);
  return [name, ...users];
}
