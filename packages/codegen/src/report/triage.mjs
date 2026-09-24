// A survey of every SOLAR Web component, for planning: whether today's pipeline builds it, what it
// is made of, what it needs beyond what is built, and how many findings it would bring, before any
// overlay decides them. Read-only: it builds each IR in memory and writes nothing, so it is never
// part of solar:codegen and is not held to CI's rebuild check.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildComponentSpec } from '../normalize/components.mjs';
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
 * One row of the survey. `known` is every component name in the catalog, so a composed child is
 * told from an icon instance.
 */
export function triageEntry(entry, set, { names, known, done }) {
  const row = {
    name: entry.name,
    section: entry.section,
    kind: entry.kind === 'set' ? 'set' : 'standalone',
    variants: entry.variantCount,
    done: done.has(entry.name),
    composes: [...new Set(entry.composes ?? [])]
      .filter((n) => known.has(n) && n !== entry.name)
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
      { names, fileVersion: 'triage' },
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
    const k = classify(d);
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
 * for patterns and views too). A standalone component, one Figma drew with no variants, is
 * offered to the pipeline as it stands, which today refuses it.
 */
export function triage(
  catalog,
  {
    names,
    done,
    scope = 'components/',
    rawDir = join(docsDir, 'solar-web', 'raw'),
  },
) {
  const known = new Set(catalog.components.map((c) => c.name));
  const rows = [];
  for (const entry of catalog.components) {
    if (!entry.section.startsWith(scope)) continue;
    const page = JSON.parse(
      readFileSync(join(rawDir, entry.section, `${entry.slug}.json`), 'utf8'),
    );
    const set =
      entry.kind === 'set'
        ? page.componentSets.find((s) => s.name === entry.name)
        : (() => {
            const c = page.components.find((x) => x.name === entry.name);
            return {
              name: c.name,
              props: c.props,
              defaultVariant: null,
              defaultVariantTree: c.tree,
              variants: [],
            };
          })();
    rows.push(triageEntry(entry, set, { names, known, done }));
  }
  return levels(rows).sort(
    (a, b) => byCodeUnit(a.section, b.section) || byCodeUnit(a.name, b.name),
  );
}

const cell = (v) => String(v).replaceAll('|', '\\|');
const count = (rows, f) => rows.filter(f).length;
const sum = (rows, k) => rows.reduce((n, r) => n + (r.findings[k] ?? 0), 0);

/** The survey as markdown: totals, then one row per component. */
export function renderTriage(rows, { fileVersion }) {
  const kinds = ['axis', 'zeroInset', 'boundable', 'noToken'];
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
    `From \`npm run solar:triage\`, SOLAR Web file version \`${fileVersion}\`. Findings are counted ` +
      `before any overlay decides them: \`axis\` a value that changes across an axis it should not ` +
      `follow; \`0-inset\` a padding or gap left unbound at 0; \`token\` an unbound value a token has; ` +
      `\`no token\` one no token has (a governance gap).`,
    ``,
    `- ${rows.length} components: ${count(rows, (r) => r.kind === 'set')} sets, ` +
      `${count(rows, (r) => r.kind === 'standalone')} standalone; ${count(rows, (r) => r.done)} generated.`,
    `- ${builds.length} build an IR today; ${rows.length - builds.length} do not.`,
    `- ${total} findings: ${sum(builds, 'axis')} axis, ${sum(builds, 'zeroInset')} 0-inset, ` +
      `${sum(builds, 'boundable')} token, ${sum(builds, 'noToken')} no token, ` +
      `${total - kinds.reduce((n, k) => n + sum(builds, k), 0)} other.`,
    ``,
    `| Component | Section | Kind | Variants | Level | Composes | API | States | Slots | Features | axis | 0-inset | token | no token | other |`,
    `| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |`,
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
      : [`**does not build:** ${r.error}`, '', '', '', '', '', '', '', ''];
    lines.push(`| ${[...head, ...body].map(cell).join(' | ')} |`);
  }
  return lines.join('\n') + '\n';
}
