/**
 * The overlay audit: what the overlays decide more than once, and what they decide that no longer
 * needs deciding. Read-only, from the overlays as written and the IRs as built (`spec/components/`),
 * so it reports what the last `solar:codegen` wrote. Never part of the build: a repeated decision
 * is a question for a person (is it one decision, for `spec/overlay/defaults.yaml`?), not an error.
 *
 * Four lists:
 * - **repeated decisions**: one rule kind, on one cell, to one value, in three components or more
 *   (the zero insets were one, found by hand after sixteen overlays had written it);
 * - **repeated reasons**: one sentence written verbatim three times or more, across the overlays
 *   (a reason another rule can give by reference, `reason: { as: … }`, or a rule to share);
 * - **literals a token now matches**: an `allowLiteral` cell whose raw value a token of its family
 *   has, which may be a `bind` after a token sync;
 * - **sets Figma now agrees with**: a `set` whose value is what Figma draws there and that decides
 *   no finding in the component's oracle (a set can still be what decides Figma's unbound raw
 *   value in the same cell), so it decides nothing.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { specDir } from '../util/paths.mjs';

const KINDS = ['set', 'bind', 'allowLiteral'];

/** A cell's family of tokens, for a literal a token may now have. */
const familiesOf = (cell, icon) => {
  // A size is an icon's only on an icon (a control's 32 is no icon.2xl).
  if (/^(width|height)$/.test(cell)) return icon ? ['icon'] : [];
  if (/^padding|^gap$/.test(cell)) return ['inset', 'stack'];
  if (/^radius/.test(cell)) return ['radius'];
  if (/[bB]order.*Width$/.test(cell)) return ['border'];
  return [];
};

/** A rule's address with its layer kept and its look (`appearance.<look>`) read as any look. */
const shapeOf = (kind, at) => {
  const parts = at.split('.');
  if (kind === 'set' && parts[1] === 'appearance') parts[2] = '*';
  if (kind === 'set' && parts[1] === 'combined') parts[3] = '*';
  return parts.join('.');
};

/** What a rule decides, as one comparable word. */
const valueOf = (kind, rule) =>
  kind === 'set'
    ? (rule.token ?? rule.keyword ?? (rule.none ? 'none' : '?'))
    : kind === 'bind'
      ? `${rule.literal} → ${rule.token ?? JSON.stringify(rule.tokens)}`
      : `${(rule.values ?? ['any']).join(', ')}`;

/**
 * @param {object} o
 * @param {string[]} o.components the components the build covers
 * @param {(c: string) => object | null} o.overlayOf the parsed overlay of one
 * @param {object} o.names the token names (`tokenNames`)
 * @param {(c: string) => string} o.fileOf the IR file of one, under spec/components/
 */
export function auditOverlays({ components, overlayOf, names, fileOf }) {
  const decisions = new Map();
  const reasons = new Map();
  const literals = [];
  const agreed = [];
  for (const component of components) {
    const overlay = overlayOf(component);
    if (!overlay) continue;
    for (const kind of KINDS)
      for (const [at, rule] of Object.entries(overlay[kind] ?? {})) {
        const key = `${kind} ${shapeOf(kind, at)} = ${valueOf(kind, rule)}`;
        (decisions.get(key) ?? decisions.set(key, new Set()).get(key)).add(
          component,
        );
      }
    for (const rules of Object.values(overlay))
      if (rules && typeof rules === 'object' && !Array.isArray(rules))
        for (const rule of Object.values(rules))
          if (typeof rule?.reason === 'string') {
            const r = rule.reason.trim();
            const at =
              reasons.get(r) ??
              reasons.set(r, { count: 0, in: new Set() }).get(r);
            at.count++;
            at.in.add(component);
          }
    const file = join(specDir, 'components', fileOf(component));
    if (!existsSync(file)) continue;
    const ir = JSON.parse(readFileSync(file, 'utf8'));
    const oracle = join(specDir, 'verify', fileOf(component));
    const setDecides = setFindings(
      existsSync(oracle) ? JSON.parse(readFileSync(oracle, 'utf8')) : {},
    );
    for (const [layer, style] of Object.entries(ir.style ?? {}))
      for (const [where, cells] of cellsOf(style))
        for (const [cell, entry] of Object.entries(cells)) {
          if (entry?.allowed && typeof entry.literal === 'number') {
            const icon =
              /^icon/i.test(layer) ||
              String(style.base?.component?.keyword ?? '').startsWith('Icon/');
            const tokens = names.matching(
              entry.literal,
              familiesOf(cell, icon),
            );
            if (tokens.length)
              literals.push({
                component,
                at: `${layer}.${where}${cell}`,
                literal: entry.literal,
                tokens,
              });
          }
          if (entry?.from === 'overlay' && entry.replaced) {
            const was = entry.replaced;
            const same =
              (entry.token !== undefined && was.token === entry.token) ||
              (entry.keyword !== undefined && was.keyword === entry.keyword) ||
              (entry.none && was.none);
            if (same && !setDecides.has(`${layer}.${cell}`))
              agreed.push({ component, at: `${layer}.${where}${cell}` });
          }
        }
  }
  return {
    decisions: [...decisions]
      .filter(([, cs]) => cs.size >= 3)
      .map(([key, cs]) => ({ key, components: [...cs].sort() }))
      .sort(
        (a, b) =>
          b.components.length - a.components.length || (a.key < b.key ? -1 : 1),
      ),
    reasons: [...reasons]
      .filter(([, r]) => r.count >= 3)
      .map(([reason, r]) => ({
        reason,
        count: r.count,
        components: [...r.in].sort(),
      }))
      .sort((a, b) => b.count - a.count || (a.reason < b.reason ? -1 : 1)),
    literals,
    agreed,
  };
}

/** Every `<layer>.<cell>` a finding decided by a `set` names, anywhere in an oracle. */
function setFindings(oracle) {
  const out = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      if (v.decision === 'set' && typeof v.finding === 'string') {
        const m = /^component\.[^.]+\.([^.#@]+)\.([^.#@]+)[#@]/.exec(v.finding);
        if (m) out.add(`${m[1]}.${m[2]}`);
      }
      Object.values(v).forEach(walk);
    }
  };
  walk(oracle);
  return out;
}

/** Every cell block of a layer's style, with where it sits (`base.`, `appearance.<look>.<state>.`). */
function* cellsOf(style) {
  yield ['base.', style.base ?? {}];
  for (const [size, cells] of Object.entries(style.size ?? {}))
    yield [`size.${size}.`, cells];
  for (const [look, states] of Object.entries(style.appearance ?? {}))
    for (const [state, cells] of Object.entries(states))
      yield [`appearance.${look}.${state}.`, cells];
  for (const [size, looks] of Object.entries(style.combined ?? {}))
    for (const [look, states] of Object.entries(looks))
      for (const [state, cells] of Object.entries(states))
        yield [`combined.${size}.${look}.${state}.`, cells];
}

/** The audit as markdown. */
export function renderAudit(audit, { limit = 25 } = {}) {
  const out = ['# Overlay audit', ''];
  out.push(
    '## Repeated decisions',
    '',
    'One rule kind, on one cell, to one value, in three components or more: one decision for',
    '`spec/overlay/defaults.yaml`, where it holds for every component (it may not: check the',
    'components it would reach and does not list).',
    '',
    '| Components | Decision | In |',
    '| --- | --- | --- |',
    ...audit.decisions
      .slice(0, limit)
      .map(
        (d) =>
          `| ${d.components.length} | \`${d.key}\` | ${d.components.join(', ')} |`,
      ),
    '',
    '## Repeated reasons',
    '',
    'A sentence written verbatim three times or more: give it once, and the others by reference',
    '(`reason: { as: "<section> <address>" }`), or share the rule with a pattern.',
    '',
    '| Times | Reason | In |',
    '| --- | --- | --- |',
    ...audit.reasons
      .slice(0, limit)
      .map(
        (r) =>
          `| ${r.count} | ${r.reason.replace(/\|/g, '\\|')} | ${r.components.join(', ')} |`,
      ),
    '',
    '## Literals a token now matches',
    '',
    'An allowed literal a token of its family has: a `bind`, where the token is what is meant (an',
    'icon size is not always an icon).',
    '',
    audit.literals.length
      ? [
          '| Component | Cell | Literal | Tokens |',
          '| --- | --- | --- | --- |',
          ...audit.literals.map(
            (l) =>
              `| ${l.component} | \`${l.at}\` | ${l.literal} | ${l.tokens.join(', ')} |`,
          ),
        ].join('\n')
      : 'None.',
    '',
    '## Sets Figma now agrees with',
    '',
    'A `set` whose value is what Figma draws there decides nothing: delete it.',
    '',
    audit.agreed.length
      ? audit.agreed.map((a) => `- ${a.component}: \`${a.at}\``).join('\n')
      : 'None.',
    '',
  );
  return out.join('\n');
}
