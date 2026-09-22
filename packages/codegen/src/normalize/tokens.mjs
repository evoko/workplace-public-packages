import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { docsDir } from '../util/paths.mjs';
import { EXT } from '../spec.mjs';
import { dtcgType } from './token-type.mjs';
import { applyDeviation } from './deviations.mjs';

export function loadContract() {
  return JSON.parse(
    readFileSync(join(docsDir, 'solar/tokens/css-contract.json'), 'utf8'),
  );
}

function setPath(tree, docName, node) {
  const parts = docName.split('.');
  let cur = tree;
  for (const part of parts.slice(0, -1)) {
    cur[part] ??= {};
    // Do not reject nesting under a segment that already carries $value: a few Figma
    // doc names (color.border.inverse) are both a value and the namespace root for
    // finer variants (…inverse.subtle, …inverse.strong). Such a node ends up with
    // $type/$value/$extensions alongside further, non-$ child keys; flattenSpec()
    // knows to read both. A genuine duplicate is still caught below.
    cur = cur[part];
  }
  const leaf = parts.at(-1);
  if (cur[leaf] && '$value' in cur[leaf]) {
    throw new Error(`duplicate token: ${docName}`);
  }
  // Merge rather than assign. The leaf may already exist as a group holding finer variants
  // that happened to be processed first, and overwriting it would silently drop them.
  cur[leaf] = { ...(cur[leaf] ?? {}), ...node };
}

const px = (n) => `${n}px`;

export function buildTokenSpec(contract) {
  const spec = {};
  const deviations = [];
  const record = (d) => {
    if (d) deviations.push(d);
  };

  // Doc names that are both a leaf value and the namespace root of finer variants
  // (e.g. color.border.inverse vs. color.border.inverse.subtle) are a structural
  // deviation from a plain DTCG tree, not a value deviation, so they are recorded
  // here rather than in normalize/deviations.mjs.
  const allDocs = new Set(contract.variables.map((v) => v.doc));
  const hybridRoots = new Set(
    contract.variables
      .map((v) => v.doc)
      .filter((doc) =>
        [...allDocs].some((other) => other.startsWith(`${doc}.`)),
      ),
  );

  for (const v of contract.variables) {
    const type = dtcgType(v);
    const raw = v.value ?? v.light ?? v.desktop;
    // Layout's grid/columns/* values are numeric (a column count), but css-contract.json
    // carries every "value" field as a string; coerce to a real number here so the DTCG
    // $type: 'number' tokens hold numbers, not numeric strings.
    const typedRaw = type === 'number' ? Number(raw) : raw;
    const { value, deviation } = applyDeviation(
      { doc: v.doc, value: typedRaw },
      type,
    );
    record(deviation);

    if (hybridRoots.has(v.doc)) {
      record({
        token: v.doc,
        figmaValue: v.figma,
        reason:
          `${v.doc} is used in Figma both as a standalone value and as the namespace ` +
          `for finer variants (e.g. ${v.doc}.subtle). A DTCG tree node cannot cleanly be ` +
          'both, so it is emitted with its own $value and the variants nested beneath it.',
        raise: `Ask SOLAR to give ${v.doc} an explicit base/default sibling name in Figma.`,
      });
    }

    const meta = { tier: v.tier, figma: v.figma, collection: v.collection };
    if (v.collection === 'Color') meta.modes = { light: v.light, dark: v.dark };
    if (v.collection === 'Type')
      meta.modes = { desktop: v.desktop, mobile: v.mobile };
    if (v.lightAlias) meta.alias = { light: v.lightAlias, dark: v.darkAlias };
    else if (v.alias) meta.alias = v.alias;
    if (v.source) meta.source = v.source;
    if (type === 'fontWeight') meta.figmaStyleName = raw;

    setPath(spec, v.doc, {
      $type: type,
      $value: value,
      $extensions: { [EXT]: meta },
    });
  }

  for (const e of contract.effectStyles) {
    // Layer geometry is mode independent; only the bound colour changes between Light and
    // Dark, so the alias is kept here and resolved by each emitter.
    setPath(spec, e.doc, {
      $type: 'shadow',
      $value: e.layers.map((l) => ({
        color: `{color.${l.colorVar.replaceAll('/', '.')}}`,
        offsetX: px(l.x),
        offsetY: px(l.y),
        blur: px(l.blur),
        spread: px(l.spread),
      })),
      $extensions: {
        [EXT]: {
          tier: 'semantic',
          figma: e.figma,
          modes: { light: e.light, dark: e.dark },
        },
      },
    });
  }

  for (const t of contract.textStyles) {
    if (t.figma.startsWith('.') || t.figma.startsWith('_')) continue;
    const doc = `typography.${t.figma.replaceAll('/', '.')}`;
    setPath(spec, doc, {
      $type: 'typography',
      $value: {
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight,
        fontSize: px(t.sizeDesktop),
        lineHeight: px(t.lineHeightDesktop),
        letterSpacing: t.letterSpacing,
      },
      $extensions: {
        [EXT]: {
          tier: 'semantic',
          figma: t.figma,
          sizeToken: t.sizeVar,
          lineHeightToken: t.lineHeightVar,
          modes: {
            desktop: {
              fontSize: px(t.sizeDesktop),
              lineHeight: px(t.lineHeightDesktop),
            },
            mobile: {
              fontSize: px(t.sizeMobile),
              lineHeight: px(t.lineHeightMobile),
            },
          },
        },
      },
    });
  }

  for (const [name, value] of Object.entries(contract.zIndex)) {
    if (name.startsWith('_')) continue;
    setPath(spec, `z.${name}`, {
      $type: 'number',
      $value: value,
      $extensions: {
        [EXT]: {
          tier: 'semantic',
          figma: null,
          source: 'Agentic Reference page',
        },
      },
    });
  }

  return { spec, deviations };
}
