// A survey of every SOLAR Web component, for planning: whether today's pipeline builds it, what it
// is made of, what it needs beyond what is built, and how many findings are still open once the
// shared defaults and its own overlay, where it has one, have decided theirs. Read-only: it
// builds each IR in memory and writes nothing, so it is never part of solar:codegen and is not
// held to CI's rebuild check.
import { join } from 'node:path';
import {
  addressOf,
  buildComponentSpec,
  componentOf,
} from '../normalize/components.mjs';
import { docsDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';

const INSETS = new Set([
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'gap',
]);
const SIDES = [
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
];

/** Every cell name a layer's style uses, across base, size and appearance entries. */
function cellsOf(style) {
  const cells = new Set();
  const add = (entry) => {
    for (const k of Object.keys(entry ?? {})) cells.add(k);
  };
  for (const s of Object.values(style)) {
    add(s.base);
    for (const group of [s.size, s.appearance, s.combined])
      for (const byKey of Object.values(group ?? {}))
        for (const entry of Object.values(byKey ?? {})) add(entry);
  }
  return cells;
}

/**
 * What one finding is, for counting: an unbound zero inset (padding or gap left at 0, which
 * `inset.none` governs), an unbound value some token has, one no token has (a governance gap), or
 * the finding's own kind.
 */
export function classify(d) {
  if (d.kind !== 'unbound') return d.kind;
  if (INSETS.has(d.cell) && /^0,/.test(d.figmaValue)) return 'zeroInset';
  return d.suggest?.length ? 'boundable' : 'noToken';
}

/**
 * One row of the survey, named by the component's address. `resolve` turns a composed child's
 * Figma name into a component's address, or null for an icon instance. `defaults` and `overlay` decide what they decide, as in the build:
 * those findings are counted as `decided`, and the rest by their class.
 */
export function triageEntry(
  entry,
  set,
  { names, resolve, address, done, defaults = null, overlay = null },
) {
  const row = {
    name: address,
    section: entry.section,
    kind: entry.kind === 'set' ? 'set' : 'standalone',
    variants: entry.variantCount,
    done: done.has(address),
    composes: [
      ...new Set(
        (entry.composes ?? []).map((n) => resolve(n, entry)).filter(Boolean),
      ),
    ]
      .filter((a) => a !== address)
      .sort(byCodeUnit),
    builds: true,
    error: null,
    api: [],
    states: [],
    slots: {},
    features: [],
    findings: {},
  };
  let built;
  try {
    built = buildComponentSpec(
      { entry, set },
      { names, fileVersion: 'triage', overlay, defaults },
    );
  } catch (e) {
    row.builds = false;
    row.error = e.message;
    return row;
  }
  const { spec, deviations } = built;
  row.api = Object.keys(spec.api);
  row.states = spec.states.filter((s) => s !== 'default');
  for (const slot of Object.values(spec.slots))
    row.slots[slot.type] = (row.slots[slot.type] ?? 0) + 1;
  // A cell that only a finding names still says what the set is made of: without the overlay's
  // `follows`, a divider's per-side widths are axis findings, not entries.
  const cells = cellsOf(spec.style);
  for (const d of deviations) if (d.cell) cells.add(d.cell);
  if (cells.has('glyph')) row.features.push('glyph');
  if (cells.has('image')) row.features.push('image');
  if (cells.has('typography')) row.features.push('text');
  if (SIDES.some((s) => cells.has(s))) row.features.push('sides');
  for (const d of deviations) {
    const k = d.decision ? 'decided' : classify(d);
    row.findings[k] = (row.findings[k] ?? 0) + 1;
  }
  return row;
}

/**
 * The composition level of each row: 0 composes nothing in the catalog, otherwise one more than
 * its deepest child, so building level by level never waits on a later one. A cycle is reported,
 * not followed.
 */
export function levels(rows) {
  const byName = new Map(rows.map((r) => [r.name, r]));
  const memo = new Map();
  const level = (name, path = []) => {
    if (memo.has(name)) return memo.get(name);
    if (path.includes(name)) return Infinity;
    const r = byName.get(name);
    const deps = (r?.composes ?? []).map((n) => level(n, [...path, name]));
    const l = deps.length ? Math.max(...deps) + 1 : 0;
    memo.set(name, l);
    return l;
  };
  for (const r of rows) r.level = level(r.name);
  return rows;
}

/**
 * Surveys the catalog's entries under `scope` (a section prefix: `components/` by default; ''
 * for patterns and views too), sets and standalone components alike.
 */
export function triage(
  catalog,
  {
    names,
    done,
    defaults = null,
    overlayOf = () => null,
    excluded = {},
    scope = 'components/',
    rawDir = join(docsDir, 'solar-web', 'raw'),
  },
) {
  // A composed child by its Figma name: the one component of that name, or, where two share it, the
  // one in the composer's own section (Date Picker Open composes the date picker's Day Cell, not
  // the calendar's). An icon instance is no component.
  const resolve = (name, from) => {
    const all = catalog.components.filter(
      (c) => c.name === name && (c.kind === 'set' || c.kind === 'component'),
    );
    const pick =
      all.length === 1 ? all[0] : all.find((c) => c.section === from.section);
    return pick ? addressOf(catalog, pick) : null;
  };
  const rows = [];
  for (const entry of catalog.components) {
    if (!entry.section.startsWith(scope)) continue;
    // Left out of the flow by decision: no candidate, and none of its findings counted.
    if (excluded[addressOf(catalog, entry)]) continue;
    const set = componentOf(entry, { rawDir });
    rows.push(
      triageEntry(entry, set, {
        names,
        resolve,
        address: addressOf(catalog, entry),
        done,
        defaults,
        overlay: overlayOf(addressOf(catalog, entry)),
      }),
    );
  }
  return levels(rows).sort(
    (a, b) => byCodeUnit(a.section, b.section) || byCodeUnit(a.name, b.name),
  );
}

const cell = (v) => String(v).replaceAll('|', '\\|');
const count = (rows, f) => rows.filter(f).length;
const sum = (rows, k) => rows.reduce((n, r) => n + (r.findings[k] ?? 0), 0);

/** The survey as markdown: totals, then one row per component. */
export function renderTriage(rows, { fileVersion, excluded = {} }) {
  const kinds = ['axis', 'zeroInset', 'boundable', 'noToken', 'decided'];
  const others = (r) =>
    Object.entries(r.findings)
      .filter(([k]) => !kinds.includes(k))
      .map(([k, n]) => `${n} ${k}`)
      .join(', ');
  const builds = rows.filter((r) => r.builds);
  const total = builds.reduce(
    (n, r) => n + Object.values(r.findings).reduce((a, b) => a + b, 0),
    0,
  );
  const lines = [
    `# SOLAR Web triage`,
    ``,
    `From \`npm run solar:triage\`, SOLAR Web file version \`${fileVersion}\`. Findings the shared ` +
      `defaults or a component's overlay decide are counted as \`decided\`; the rest are open: ` +
      `\`axis\` a value that changes across an axis it should not follow; \`0-inset\` a padding or ` +
      `gap left unbound at 0; \`token\` an unbound value a token has; \`no token\` one no token has ` +
      `(a governance gap).`,
    ``,
    `- ${rows.length} components: ${count(rows, (r) => r.kind === 'set')} sets, ` +
      `${count(rows, (r) => r.kind === 'standalone')} standalone; ${count(rows, (r) => r.done)} generated.`,
    `- ${builds.length} build an IR today; ${rows.length - builds.length} do not.`,
    ...Object.entries(excluded).map(
      ([name, reason]) => `- Left out of the flow: ${name}. ${reason}`,
    ),
    `- ${total} findings, ${sum(builds, 'decided')} decided; open: ${sum(builds, 'axis')} axis, ` +
      `${sum(builds, 'zeroInset')} 0-inset, ${sum(builds, 'boundable')} token, ` +
      `${sum(builds, 'noToken')} no token, ${total - kinds.reduce((n, k) => n + sum(builds, k), 0)} other.`,
    ``,
    `| Component | Section | Kind | Variants | Level | Composes | API | States | Slots | Features | axis | 0-inset | token | no token | decided | other |`,
    `| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |`,
  ];
  for (const r of rows) {
    const name = r.done ? `**${r.name}** (done)` : r.name;
    const section = r.section.replace(/^components\//, '');
    const head = [
      name,
      section,
      r.kind,
      r.variants,
      r.level,
      r.composes.join(', '),
    ];
    const body = r.builds
      ? [
          r.api.join(', '),
          r.states.join(', '),
          Object.entries(r.slots)
            .map(([t, n]) => `${n} ${t}`)
            .join(', '),
          r.features.join(', '),
          ...kinds.map((k) => r.findings[k] ?? 0),
          others(r),
        ]
      : [`**does not build:** ${r.error}`, '', '', '', '', '', '', '', '', ''];
    lines.push(`| ${[...head, ...body].map(cell).join(' | ')} |`);
  }
  return lines.join('\n') + '\n';
}
