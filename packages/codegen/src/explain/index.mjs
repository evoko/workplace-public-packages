/**
 * `solar:explain`: why a component draws what it draws, cell by cell (design spec §6).
 *
 * For one variant, each layer and property as a chain: what Figma draws (the oracle), the recipe
 * entry that wins for the variant and the token it names, resolved as the oracle resolves Figma's,
 * where that entry came from (a Figma variant, the shared defaults, an overlay rule, and its
 * reason), what excuses a difference (a finding still open, a decision), and what each platform drew
 * the last time its visual check ran (the checks' reports). Without a variant, the component's
 * summary: its variants, every excused difference, and every failure the last runs reported.
 *
 * It reads the pipeline's own outputs, built in memory from the current sources, and the reports on
 * disk, and writes nothing. The recipe lookup is the Flutter recipe's (`lookup` in every generated
 * `Solar<Name>Recipe`), which applies the precedence the MUI recipe's cascade gives.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { statePrecedence } from '../emit/flutter-component.mjs';
import { flattenSpec } from '../spec.mjs';
import { packagesDir } from '../util/paths.mjs';
import { cellValue, PROPERTIES_OF } from '../verify/oracle.mjs';

/** The oracle property each IR cell covers, the other way round: `fontSize` is `typography`'s. */
const CELL_OF = Object.fromEntries(
  Object.entries(PROPERTIES_OF).flatMap(([cell, props]) =>
    props.map((p) => [p, cell]),
  ),
);

/** The value a derived axis takes in a variant, from the content the oracle fills it with. */
function derivedValue(d, content = []) {
  const has = (x) => content.includes(x);
  const w = d.when.find((w) =>
    [...(w.given ?? []), ...(w.props ?? [])].every(has),
  );
  return w?.value ?? d.default;
}

/** A variant's props as the recipe keys them: the API's, and each derived axis's from content. */
export function recipeProps(spec, variant) {
  const props = { ...variant.props };
  for (const [axis, d] of Object.entries(spec.derived ?? {}))
    props[axis] = derivedValue(d, variant.content);
  return props;
}

/** The appearance axes the recipe's keys are made of, in order (`variant=primary, danger=false`). */
function appearanceAxes(spec) {
  const first = Object.values(spec.style)
    .flatMap((st) => [
      ...Object.keys(st.appearance ?? {}),
      ...Object.values(st.combined ?? {}).flatMap((c) => Object.keys(c)),
    ])
    .find((k) => k !== 'default');
  return first?.split(', ').map((part) => part.split('=')[0]) ?? [];
}

/**
 * The recipe entry for one cell of one layer in one variant, and where it sits, by the recipe's
 * precedence: a state that holds beats the resting value, the per-size-and-appearance entry beats
 * the per-appearance one, and the resting value falls back through appearance, size and base.
 *
 * @returns {{at: string, entry: object} | null}
 */
export function lookupCell(spec, layer, cell, variant) {
  const st = spec.style[layer];
  if (!st) return null;
  const props = recipeProps(spec, variant);
  const combo =
    appearanceAxes(spec)
      .map((a) => `${a}=${String(props[a])}`)
      .join(', ') || 'default';
  const size = 'size' in spec.api ? String(props.size) : '';
  const holds = (state) =>
    spec.states.includes(state)
      ? variant.state === state
      : props[state] === true;
  const at = (path, entry) => (entry ? { at: path, entry } : null);
  for (const state of statePrecedence(spec.component)) {
    if (!holds(state)) continue;
    const hit =
      at(
        `combined ${size} · ${combo} · ${state}`,
        st.combined?.[size]?.[combo]?.[state]?.[cell],
      ) ??
      at(
        `appearance ${combo} · ${state}`,
        st.appearance?.[combo]?.[state]?.[cell],
      );
    if (hit) return hit;
  }
  return (
    at(
      `combined ${size} · ${combo} · default`,
      st.combined?.[size]?.[combo]?.default?.[cell],
    ) ??
    at(
      `appearance ${combo} · default`,
      st.appearance?.[combo]?.default?.[cell],
    ) ??
    at(`size ${size}`, st.size?.[size]?.[cell]) ??
    at('base', st.base?.[cell])
  );
}

/** Two values as the checks compare them: numbers by value, the rest as strings. */
const same = (a, b) =>
  a !== undefined &&
  b !== undefined &&
  (typeof a === 'number' || typeof b === 'number'
    ? Math.abs(Number(a) - Number(b)) < 0.01
    : String(a).toLowerCase() === String(b).toLowerCase());

/**
 * A corner no rounder than its box allows, as the checks compare one: no corner is drawn rounder
 * than half the box's shorter side, so a pill's radius.full (9999) and Figma's half its size draw
 * the same round.
 */
function corner(property, value, box) {
  if (!property.startsWith('radius') || typeof value !== 'number') return value;
  const sides = [box.width, box.height].filter((n) => typeof n === 'number');
  return sides.length ? Math.min(value, ...sides.map((n) => n / 2)) : value;
}

/** An IR entry as one phrase: its token, literal, keyword or none. */
export function entryText(entry) {
  if (!entry) return 'no entry';
  if (entry.token) return entry.token;
  if (entry.none) return 'none';
  if (entry.keyword) return entry.keyword;
  if (entry.literal !== undefined) return `${entry.literal} (literal)`;
  if (entry.value !== undefined) return String(entry.value);
  return JSON.stringify(entry);
}

/** Where an IR entry came from, as a phrase: Figma's variant, the defaults, or the overlay. */
function originOf(entry) {
  if (!entry?.from) return null;
  if (entry.from === 'overlay') return 'the overlay';
  if (entry.from === 'defaults') return 'the shared defaults';
  return `Figma's "${entry.from}"`;
}

/** The report file names each check writes, by component name in code. */
const reportFiles = (name) => ({
  web: join(
    packagesDir,
    'components',
    'test',
    'visual',
    '.out',
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  ),
  flutter: join(
    packagesDir,
    'solar_flutter',
    'build',
    'visual',
    name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
  ),
});

/**
 * What the visual checks reported the last time they ran, per platform: the failures, the excused
 * differences they measured (gaps), and when. A platform whose check has not run is absent.
 */
export function loadReports(
  name,
  { read = readFileSync, exists = existsSync, stat = statSync } = {},
) {
  const out = {};
  for (const [platform, stem] of Object.entries(reportFiles(name))) {
    const failures = `${stem}-failures.json`;
    const gaps = `${stem}-gaps.json`;
    if (!exists(failures) && !exists(gaps)) continue;
    const load = (f) => (exists(f) ? JSON.parse(read(f, 'utf8')) : []);
    out[platform] = {
      failures: load(failures),
      gaps: load(gaps),
      at: stat(exists(failures) ? failures : gaps).mtime,
    };
  }
  return out;
}

/** What one platform drew of one property, from its report, or null where it reported nothing. */
function drawnBy(report, variant, layer, property) {
  if (!report) return null;
  const hit = (list) =>
    list.find(
      (e) =>
        e.variant === variant.figma &&
        e.layer === layer &&
        e.property === property,
    );
  const failure = hit(report.failures);
  if (failure)
    return { status: 'failed', value: failure.rendered ?? failure.painted };
  const gap = hit(report.gaps);
  if (gap) return { status: 'excused', value: gap.rendered ?? gap.painted };
  return { status: 'matched' };
}

/**
 * Every row of one variant: a layer's property with Figma's value, the recipe's entry and value,
 * the excuse, and what each platform drew.
 *
 * @param {{spec: object, oracle: object, tokens: object, reports: object}} ctx
 * @param {object} variant one of the oracle's
 * @param {{layer?: string, property?: string}} [only]
 */
export function explainVariant(ctx, variant, only = {}) {
  const byName = new Map(flattenSpec(ctx.tokens).map((t) => [t.name, t]));
  const rows = [];
  for (const [layer, values] of Object.entries(variant.layers)) {
    if (only.layer && layer !== only.layer) continue;
    for (const [property, figma] of Object.entries(values)) {
      if (property === 'hidden') continue;
      if (only.property && property !== only.property) continue;
      const cell = CELL_OF[property];
      const hit = cell ? lookupCell(ctx.spec, layer, cell, variant) : null;
      const entry = hit?.entry;
      // A cell the caller's prop fills (Avatar's colour), where the variant gives one: the
      // prop's value is what is drawn, the recipe's only without one.
      const caller = cell && ctx.spec.callers?.[`${layer}.${cell}`];
      const given =
        caller?.prop && variant.props[caller.prop] != null
          ? {
              prop: caller.prop,
              value: variant.props[caller.prop],
              reason: caller.reason,
            }
          : null;
      const recipe = given
        ? given.value
        : entry
          ? typeof entry.literal === 'number'
            ? entry.literal
            : cellValue(byName, entry, property)
          : undefined;
      const excuse = (variant.excused ?? []).find(
        (e) => e.layer === layer && e.property === property,
      );
      rows.push({
        layer,
        property,
        cell,
        figma,
        at: hit?.at ?? null,
        entry: entry ?? null,
        recipe,
        caller: given,
        agrees:
          recipe === undefined
            ? null
            : same(
                corner(property, recipe, values),
                corner(property, figma, values),
              ),
        excuse: excuse ?? null,
        web: drawnBy(ctx.reports.web, variant, layer, property),
        flutter: drawnBy(ctx.reports.flutter, variant, layer, property),
      });
    }
  }
  return rows;
}

/** Whether a row holds anything to read beyond agreement: a difference, an excuse, a failure. */
export const notable = (row) =>
  row.excuse ||
  row.agrees === false ||
  row.web?.status === 'failed' ||
  row.flutter?.status === 'failed';

/** The variants a query picks: an index, the Figma name, or `axis=value` parts all of which hold. */
export function pickVariants(oracle, query) {
  if (/^\d+$/.test(query)) {
    const v = oracle.variants[Number(query)];
    return v ? [v] : [];
  }
  const exact = oracle.variants.filter((v) => v.figma === query);
  if (exact.length) return exact;
  const parts = query
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return oracle.variants.filter((v) => {
    const own = v.figma.split(', ');
    return parts.every((p) => own.includes(p));
  });
}

const show = (v) =>
  v === undefined ? '—' : typeof v === 'string' ? v : JSON.stringify(v);

/** When a report was written, as a local date and time. */
const when = (date) =>
  `${date.toISOString().slice(0, 10)} ${date.toTimeString().slice(0, 5)}`;

function drawnText(label, d) {
  if (!d) return `${label} not run`;
  if (d.status === 'matched') return `${label} matched Figma`;
  if (d.status === 'excused') return `${label} drew ${show(d.value)} (excused)`;
  return `${label} drew ${show(d.value)}: FAILED`;
}

/** The overlay rules on one cell of one layer: `layer.cell`, or a section's (`layer.size.sm.cell`). */
const rulesOn = (spec, layer, cell) =>
  cell
    ? (spec.overlay?.rules ?? []).filter(
        (r) =>
          r.at === `${layer}.${cell}` ||
          (r.at.startsWith(`${layer}.`) && r.at.endsWith(`.${cell}`)),
      )
    : [];

/** The rows of one variant as text: a line each where all agree, a block where anything differs. */
export function formatVariant(ctx, variant, rows, { full = false } = {}) {
  const out = [];
  const index = ctx.oracle.variants.indexOf(variant);
  const props = recipeProps(ctx.spec, variant);
  out.push(
    `${ctx.spec.component} · ${variant.figma} (variant ${index} of ${ctx.oracle.variants.length})`,
  );
  out.push(
    `  the code's props: ${Object.entries(props)
      .map(([k, v]) => `${k}=${v}`)
      .join(
        ', ',
      )}${variant.state !== 'default' ? `, in ${variant.state}` : ''}${variant.content?.length ? `; content: ${variant.content.join(', ')}` : ''}`,
  );
  let layer = null;
  for (const row of rows) {
    if (row.layer !== layer) {
      layer = row.layer;
      const path = ctx.spec.layers[layer]?.path;
      const hidden = variant.layers[layer]?.hidden
        ? ', hidden in this variant'
        : '';
      out.push('', `${layer}${path ? `  (Figma ${path})` : ''}${hidden}`);
      for (const r of ctx.spec.overlay?.rules ?? [])
        if (r.at === layer || r.at.endsWith(`→ ${layer}`))
          out.push(`  rule ${r.rule} ${r.at}: ${r.reason}`);
    }
    const recipe = row.caller
      ? `the caller's ${row.caller.prop}, ${show(row.caller.value)} here; without one, ${entryText(row.entry)}`
      : row.entry
        ? `${entryText(row.entry)}${row.recipe !== undefined && row.entry.token ? ` = ${show(row.recipe)}` : ''}`
        : row.cell
          ? 'no entry'
          : 'not in the recipe';
    if (!full && !notable(row)) {
      out.push(
        `  ${row.property.padEnd(16)} ${show(row.figma).padEnd(12)} ${recipe}${row.at ? `  [${row.at}]` : ''}`,
      );
      continue;
    }
    out.push(`  ${row.property}`);
    out.push(`    Figma    ${show(row.figma)}`);
    out.push(
      `    recipe   ${recipe}${row.at ? `, from ${row.at}` : ''}${row.agrees === false ? '  ≠ Figma' : ''}`,
    );
    const origin = originOf(row.entry);
    if (origin) out.push(`             read from ${origin}`);
    if (row.caller?.reason)
      out.push(`             the caller's: ${row.caller.reason}`);
    if (row.entry?.reason) out.push(`             why: ${row.entry.reason}`);
    if (row.entry?.allowed)
      out.push(`             literal allowed: ${row.entry.allowed}`);
    if (row.entry?.replaced)
      out.push(
        `             replaces Figma's ${entryText(row.entry.replaced)}`,
      );
    // The overlay's rules on this cell (`field.height`, `root.size.sm.width`), but for the one
    // whose reason the entry already gave.
    for (const r of rulesOn(ctx.spec, row.layer, row.cell))
      if (r.reason !== row.entry?.reason)
        out.push(`    rule     ${r.rule} ${r.at}: ${r.reason}`);
    if (row.excuse)
      out.push(
        `    excused  ${row.excuse.finding ?? ''}${row.excuse.decision ? ` (decided: ${row.excuse.decision})` : ' (open)'}${row.excuse.reason ? `: ${row.excuse.reason}` : ''}`,
      );
    out.push(
      `    ${drawnText('web', row.web)}; ${drawnText('Flutter', row.flutter)}`,
    );
  }
  return out.join('\n');
}

/**
 * A component's summary: its variants and what is excused or failing in each, the excused
 * differences grouped by why, and each platform's last report.
 */
export function formatSummary(ctx) {
  const { spec, oracle, reports } = ctx;
  const out = [];
  const layers = Object.keys(spec.layers).length;
  out.push(
    `${spec.component}: ${oracle.variants.length} variants, ${layers} layers; overlay ${spec.overlay?.file ?? 'none'} (${spec.overlay?.rules?.length ?? 0} rules)`,
  );
  for (const platform of ['web', 'flutter']) {
    const r = reports[platform];
    out.push(
      `  last ${platform === 'web' ? 'web' : 'Flutter'} check: ${r ? `${when(r.at)}, ${r.failures.length} failures, ${r.gaps.length} excused differences measured` : 'not run'}`,
    );
  }
  out.push('', 'Variants (pass the number or the name to --variant)');
  oracle.variants.forEach((v, i) => {
    const failed = ['web', 'flutter'].filter((p) =>
      reports[p]?.failures.some((f) => f.variant === v.figma),
    );
    const excused = v.excused?.length ?? 0;
    out.push(
      `  ${String(i).padStart(3)}  ${v.figma}${excused ? `  · ${excused} excused` : ''}${failed.length ? `  · FAILED on ${failed.join(' and ')}` : ''}`,
    );
  });
  const groups = new Map();
  oracle.variants.forEach((v, i) => {
    for (const e of v.excused ?? []) {
      const key = `${e.layer}.${e.property}\u0000${e.finding}\u0000${e.decision ?? ''}\u0000${e.reason ?? ''}`;
      if (!groups.has(key)) groups.set(key, { e, variants: [] });
      groups.get(key).variants.push(i);
    }
  });
  out.push(
    '',
    'Excused differences (Figma differs from the code, decided or still open)',
  );
  if (!groups.size) out.push('  none');
  for (const { e, variants } of groups.values())
    out.push(
      `  ${e.layer}.${e.property}  ${e.decision ? `decided (${e.decision})` : 'open'}  ${e.finding ?? ''}`,
      ...(e.reason ? [`      ${e.reason}`] : []),
      `      in variants ${variants.join(', ')}`,
    );
  const failures = ['web', 'flutter'].flatMap((p) =>
    (reports[p]?.failures ?? []).map((f) => ({ ...f, platform: p })),
  );
  out.push('', 'Failures in the last runs');
  if (!failures.length) out.push('  none');
  for (const f of failures)
    out.push(
      `  ${f.platform}: ${f.variant} · ${f.layer}.${f.property}: Figma ${show(f.figma)}, drawn ${show(f.rendered ?? f.painted)}`,
    );
  return out.join('\n');
}
