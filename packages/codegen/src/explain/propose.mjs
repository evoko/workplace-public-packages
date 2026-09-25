/**
 * `solar:explain --propose <layer>.<cell>`: the overlay rule that decides a cell, as YAML ready to
 * paste into `spec/overlay/<component>.yaml`, with its address spelled as the overlay spells it.
 * Most of deciding a finding is choosing the rule kind and writing its address, which is
 * mechanical from what the pipeline has: the finding, the cell, whether a token has Figma's value,
 * and which axes Figma's value actually varies with. The reason is a person's: the proposer leaves
 * `TODO(reason)` in its place, which the build refuses (normalize/overlay.mjs, PLACEHOLDER).
 *
 * - an unbound value a token of the cell's family has → `bind`, `literal` and `token` (or
 *   `tokens` per size);
 * - an unbound value no token has → `allowLiteral`, its reason the governance gap;
 * - an axis finding → `accept` where one or two variants differ (a slip, most likely), `follows`
 *   with the axes Figma's value varies with otherwise, the other given as a comment;
 * - any other finding → `accept`;
 * - a cell with no finding open → a `set` at the recipe entry the variant reads, to change it.
 *
 * Where numbered sibling layers (`dayGridDayCell`, `dayGridDayCell2`…) hold the same finding, one
 * patterned address covers them all.
 */

import { flattenSpec } from '../spec.mjs';
import { canonical } from '../emit/manifest.mjs';
import { PLACEHOLDER } from '../normalize/overlay.mjs';
import { PROPERTIES_OF } from '../verify/oracle.mjs';
import { lookupCell } from './index.mjs';

/** The token families a raw value of a cell may be bound to (the overlay audit's, and bind's). */
const familiesOf = (cell, isIcon) => {
  if (/^(width|height)$/.test(cell)) return isIcon ? ['icon'] : [];
  if (/^padding|^gap$/.test(cell)) return ['inset', 'stack'];
  if (/^radius/.test(cell)) return ['radius'];
  if (/[bB]order.*Width$/.test(cell)) return ['border'];
  return [];
};

/** An oracle property named instead of its cell (`fontSize` for `typography`). */
export function cellOf(name) {
  if (name in PROPERTIES_OF) return name;
  const found = Object.entries(PROPERTIES_OF).find(([, props]) =>
    props.includes(name),
  );
  return found?.[0] ?? name;
}

const axesOf = (figma) =>
  Object.fromEntries(figma.split(', ').map((p) => p.split('=')));

/**
 * The fewest of Figma's axes that Figma's value of one layer's cell is a function of, over every
 * variant that draws the layer, in the order Figma lists them.
 */
export function axesVaried(oracle, layer, cell) {
  const props = PROPERTIES_OF[cell] ?? [cell];
  const rows = oracle.variants
    .filter((v) => v.layers[layer] && !v.layers[layer].hidden)
    .map((v) => ({
      axes: axesOf(v.figma),
      value: JSON.stringify(props.map((p) => v.layers[layer][p])),
    }));
  if (!rows.length) return [];
  const all = Object.keys(rows[0].axes);
  const subsets = [];
  for (let mask = 0; mask < 1 << all.length; mask++)
    subsets.push(all.filter((_, i) => mask & (1 << i)));
  subsets.sort((a, b) => a.length - b.length);
  for (const axes of subsets) {
    const seen = new Map();
    const ok = rows.every(({ axes: at, value }) => {
      const key = axes.map((a) => at[a]).join('|');
      if (!seen.has(key)) seen.set(key, value);
      return seen.get(key) === value;
    });
    if (ok) return axes;
  }
  return all;
}

/** The tokens of a family with a value, by name, for a raw number. */
function tokensWith(tokens, families, literal) {
  return flattenSpec(tokens)
    .filter(
      (t) =>
        families.some((f) => t.name.startsWith(`${f}.`)) &&
        typeof t.value !== 'object' &&
        canonical.dimension(t.value) === literal,
    )
    .map((t) => t.name)
    .sort();
}

/** The overlay's `rename`, the other way: a code axis or value back to Figma's spelling. */
function figmaSpelling(overlay) {
  const axis = {};
  const value = {};
  for (const [figma, rule] of Object.entries(overlay?.rename ?? {})) {
    const code = rule.to ?? figma;
    axis[code] = figma;
    for (const [from, to] of Object.entries(rule.values ?? {}))
      (value[code] ??= {})[String(to)] = from;
  }
  return (look) =>
    look
      .split(', ')
      .map((part) => {
        const [a, v] = part.split('=');
        if (v === undefined) return part;
        return `${axis[a] ?? a}=${value[a]?.[v] ?? v}`;
      })
      .join(', ');
}

/** A recipe entry's place (`lookupCell`'s `at`) as a `set` address, in Figma's spelling. */
export function setAddress(layer, cell, at, overlay) {
  const figma = figmaSpelling(overlay);
  const [section, ...rest] = at.split(' ');
  const parts = rest.join(' ').split(' · ');
  if (section === 'base') return `${layer}.base.${cell}`;
  if (section === 'size') return `${layer}.size.${parts[0]}.${cell}`;
  if (section === 'appearance')
    return `${layer}.appearance.${figma(parts[0])}.${parts[1]}.${cell}`;
  return `${layer}.combined.${parts[0]}.${figma(parts[1])}.${parts[2]}.${cell}`;
}

const yamlBlock = (section, address, fields, comment = null) =>
  [
    ...(comment ? [`# ${comment}`] : []),
    `${section}:`,
    `  ${address}:`,
    ...Object.entries(fields).map(([k, v]) => `    ${k}: ${v}`),
  ].join('\n');

const commented = (text) =>
  text
    .split('\n')
    .map((l) => `# ${l}`)
    .join('\n');

/**
 * The rule for one cell, as YAML with comments.
 *
 * @param {{spec: object, oracle: object, deviations: object[], tokens: object, overlay: object}} ctx
 * @param {{layer: string, cell: string, variant?: object}} at the IR layer, the cell (or an
 *   oracle property), and the variant a `set` is for
 */
export function proposeRule(ctx, { layer, cell: named, variant }) {
  const { spec, oracle, deviations, tokens, overlay } = ctx;
  const cell = cellOf(named);
  const own = spec.layers[layer];
  if (!own) throw new Error(`${spec.component} has no layer ${layer}`);
  const pathOf = (name) => spec.layers[name]?.path;
  const open = (name) =>
    deviations.filter(
      (d) => d.layer === pathOf(name) && d.cell === cell && !d.decision,
    );
  const findings = open(layer).filter(
    (d) =>
      !variant ||
      d.kind !== 'axis' ||
      d.variants?.some((x) => x.variant === variant.figma),
  );
  const reason = (why) => JSON.stringify(`${PLACEHOLDER}: ${why}`);

  // Numbered siblings holding the same finding: one patterned address for all of them.
  const stem = layer.replace(/\d+$/, '');
  const peers = Object.keys(spec.layers).filter((n) =>
    new RegExp(`^${stem}\\d*$`).test(n),
  );
  const patterned = (kind, same = () => true) =>
    peers.length > 1 &&
    peers.every((p) => open(p).some((d) => d.kind === kind && same(d)))
      ? `${stem}*`
      : layer;

  if (!findings.length) {
    const figmaVariant = variant ?? oracle.variants[0];
    const hit = lookupCell(spec, layer, cell, figmaVariant);
    if (!hit)
      return `# ${spec.component} ${layer}.${cell}: no finding is open, and the recipe has no entry for it.`;
    const current =
      hit.entry.token ??
      hit.entry.keyword ??
      (hit.entry.none ? 'none' : hit.entry.literal);
    const decided = deviations.find(
      (d) => d.layer === own.path && d.cell === cell && d.decision,
    );
    return [
      `# ${spec.component} ${layer}.${cell}: no finding is open${decided ? ` (${decided.token} is decided by ${decided.decision.rule})` : ''}.`,
      `# In ${figmaVariant.figma} the recipe reads ${hit.at}: ${current}. To change it, set it:`,
      yamlBlock('set', setAddress(layer, cell, hit.at, overlay), {
        [hit.entry.token ? 'token' : hit.entry.keyword ? 'keyword' : 'none']:
          hit.entry.token ?? hit.entry.keyword ?? 'true',
        reason: reason(
          'what the code draws here instead, and why; change the value above',
        ),
      }),
    ].join('\n');
  }

  const keeps = reason(
    'why the code keeps its value: a slip the design review lists, or a difference known and intended',
  );
  const blocks = findings
    .filter((d) => d.kind !== 'axis')
    .map((d) => {
      const head = `${d.token}: ${d.figmaValue}`;
      if (d.kind === 'unbound') {
        const isIcon = own.type === 'INSTANCE' || /icon/i.test(layer);
        const families = familiesOf(cell, isIcon);
        const literals = d.literals ?? [];
        const bound = literals.map((l) => tokensWith(tokens, families, l));
        const address = patterned(
          'unbound',
          (x) => JSON.stringify(x.literals) === JSON.stringify(literals),
        );
        if (literals.length && bound.every((t) => t.length === 1)) {
          const fields =
            literals.length === 1
              ? { literal: literals[0], token: bound[0][0] }
              : {
                  tokens: `{ ${literals.map((l, i) => `${l}: ${bound[i][0]}`).join(', ')} }`,
                };
          return yamlBlock(
            'bind',
            `${address}.${cell}`,
            {
              ...fields,
              reason: reason('the same value, governed token'),
            },
            head,
          );
        }
        const ambiguous = bound.some((t) => t.length > 1)
          ? ` (${bound
              .flat()
              .filter((t, i, a) => a.indexOf(t) === i)
              .join(
                ', ',
              )} have the value: bind to the one the design means, or allow the literal)`
          : '';
        return yamlBlock(
          'allowLiteral',
          `${address}.${cell}`,
          {
            reason: reason(
              `SOLAR has no ${families.join(' or ') || 'variable'} for ${literals.join(', ')}, raised as a governance gap${ambiguous}`,
            ),
          },
          `${head}. ${d.raise ?? ''}`.trim(),
        );
      }
      return yamlBlock('accept', d.token, { reason: keeps }, head);
    })
    .filter(Boolean);
  const axisFindings = findings.filter((d) => d.kind === 'axis');
  if (axisFindings.length) blocks.push(proposeAxes(axisFindings));
  return blocks.join('\n\n');

  /** Every axis finding on the cell, together: one `follows` decides them all. */
  function proposeAxes(list) {
    const axes = axesVaried(oracle, layer, cell);
    const heads = list.map((d) => `# ${d.token}: ${d.figmaValue}`).join('\n');
    const accept = [
      'accept:',
      ...list.flatMap((d) => [`  ${d.token}:`, `    reason: ${keeps}`]),
    ].join('\n');
    // A finding whose axis Figma's drawn value does not vary with: the tokens differ, the values
    // they draw do not (two names of one colour), so nothing to follow, and accept says so.
    const seen = list.filter((d) =>
      Object.keys(d.where ?? {}).some((a) => axes.includes(a)),
    );
    if (!seen.length)
      return `${heads}\n# The tokens differ, but what they draw does not: Figma's value, as drawn, varies with ${axes.join(', ')} alone, as the recipe's does.\n${accept}`;
    const follows = [
      'follows:',
      `  ${patterned('axis')}.${cell}:`,
      `    axes: [${axes.join(', ')}]`,
      `    reason: ${reason(`why Figma's value is right: it follows ${axes.join(', ')}`)}`,
    ].join('\n');
    // One or two variants against the rest is most often a slip; more is a pattern Figma means.
    const slip = seen.every((d) => (d.variants?.length ?? 0) <= 2);
    const why = `# Figma's value varies with ${axes.join(', ')}.`;
    return slip
      ? `${heads}\n${why}\n${accept}\n\n# Or, if Figma is right and the value is meant to change:\n${commented(follows)}`
      : `${heads}\n${why} To draw it as Figma does:\n${follows}\n\n# Or, if the differing variants are a slip:\n${commented(accept)}`;
  }
}
