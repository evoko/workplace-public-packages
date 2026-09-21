// Builds the human/agent documentation for SOLAR Web from docs/solar-web/raw/**/*.json.
// Run: node docs/solar-web/build-docs.mjs
// Outputs (all generated, do not edit by hand):
//   docs/solar-web/catalog.json          one record per component set / standalone component
//   docs/solar-web/token-usage.json      reverse index: token -> components that bind it
//   docs/solar-web/INDEX.md              table of every page with links
//   docs/solar-web/<section>/<slug>.md   one page per Figma page
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
  statSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url));
const rawDir = join(here, 'raw');
const manifest = JSON.parse(readFileSync(join(rawDir, '_pages.json'), 'utf8'));
const decode = (s) =>
  String(s ?? '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
// Wrap HTML-looking tags in code spans so Markdown renderers do not swallow them.
const safe = (s) => decode(s).replace(/(<[a-zA-Z][^>]*>)/g, '`$1`');
const esc = (s) => decode(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const tok = (s) => {
  const m = /^\{([^:]+):(.+)\}$/.exec(s);
  return m ? { collection: m[1], path: m[2] } : null;
};
const docName = (t) =>
  t.collection === 'Color'
    ? 'color.' + t.path.replace(/\//g, '.')
    : t.collection === 'Type'
      ? 'type.' + t.path.replace(/\//g, '.')
      : t.path.replace(/\//g, '.');
const fmtTok = (s) => {
  const t = tok(s);
  if (!t) return '`' + s + '` ⚠️ hard-coded';
  return (
    '`' +
    docName(t) +
    '`' +
    (['Color', 'Spatial', 'Type', 'Primitives', 'Layout'].includes(t.collection)
      ? ''
      : ' (' + t.collection + ')')
  );
};
const CHROME = new Set(['SOLAR®', 'Biamp Design System', '1.0']);

const pages = [];
for (const p of manifest.pages) {
  const f = join(rawDir, p.section, p.slug + '.json');
  if (!existsSync(f)) {
    pages.push({ ...p, missing: true });
    continue;
  }
  pages.push({ ...p, data: JSON.parse(readFileSync(f, 'utf8')) });
}

// ---------- analysis helpers ----------
function walk(node, fn, path = []) {
  fn(node, path);
  for (const c of node.children || []) walk(c, fn, [...path, node.name]);
}
function collectTokens(tree, variants) {
  const used = {
    fills: new Set(),
    strokes: new Set(),
    text: new Set(),
    icons: new Set(),
    spacing: new Set(),
    radius: new Set(),
    borderWidth: new Set(),
    size: new Set(),
    typography: new Set(),
    effects: new Set(),
    textStyles: new Set(),
    other: new Set(),
  };
  const hard = [];
  const slots = [];
  const nested = new Set();
  walk(tree, (n, path) => {
    const where = [...path.slice(1), n.name].join(' › ') || n.name;
    for (const f of n.fills || []) {
      if (tok(f))
        (n.type === 'TEXT'
          ? used.text
          : n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION'
            ? used.icons
            : used.fills
        ).add(f);
      else if (/^#/.test(f))
        hard.push({ layer: where, prop: 'fill', value: f });
    }
    for (const s of n.strokes || []) {
      if (tok(s)) used.strokes.add(s);
      else if (/^#/.test(s))
        hard.push({ layer: where, prop: 'stroke', value: s });
    }
    if (n.effectStyle) used.effects.add(n.effectStyle);
    if (n.textStyle) used.textStyles.add(n.textStyle);
    const v = n.vars || {};
    for (const [prop, val] of Object.entries(v)) {
      const arr = Array.isArray(val) ? val : [val];
      for (const a of arr) {
        const s = '{' + a + '}';
        if (/padding|itemSpacing|counterAxisSpacing/.test(prop))
          used.spacing.add(s);
        else if (/Radius/.test(prop)) used.radius.add(s);
        else if (/stroke.*Weight/.test(prop)) used.borderWidth.add(s);
        else if (
          /^(width|height|minWidth|minHeight|maxWidth|maxHeight)$/.test(prop)
        )
          used.size.add(s);
        else if (/font|lineHeight|letterSpacing|paragraph/.test(prop))
          used.typography.add(s);
        else used.other.add(prop + '=' + s);
      }
    }
    if (n.layout && !v.itemSpacing && n.layout.gap && n.type !== 'INSTANCE')
      hard.push({ layer: where, prop: 'gap', value: n.layout.gap + 'px' });
    if (n.layout && n.type !== 'INSTANCE') {
      const [t, r, b, l] = n.layout.pad;
      const bound = (k) => v[k] !== undefined;
      if (t && !bound('paddingTop'))
        hard.push({ layer: where, prop: 'paddingTop', value: t + 'px' });
      if (r && !bound('paddingRight'))
        hard.push({ layer: where, prop: 'paddingRight', value: r + 'px' });
      if (b && !bound('paddingBottom'))
        hard.push({ layer: where, prop: 'paddingBottom', value: b + 'px' });
      if (l && !bound('paddingLeft'))
        hard.push({ layer: where, prop: 'paddingLeft', value: l + 'px' });
    }
    if (
      n.radius !== undefined &&
      n.type !== 'INSTANCE' &&
      !Object.keys(v).some((k) => /Radius/.test(k))
    )
      hard.push({
        layer: where,
        prop: 'radius',
        value: JSON.stringify(n.radius) + 'px',
      });
    if (n.propRefs)
      for (const [prop, ref] of Object.entries(n.propRefs))
        slots.push({
          layer: where,
          controls: prop,
          prop: ref.replace(/#.*$/, ''),
        });
    if (n.type === 'INSTANCE' && n.main) nested.add(n.main);
  });
  for (const vd of variants || []) {
    for (const f of vd.fills || []) if (tok(f)) used.fills.add(f);
    for (const s of vd.strokes || []) if (tok(s)) used.strokes.add(s);
    for (const t of vd.textFills || []) if (tok(t)) used.text.add(t);
    for (const i of vd.iconFills || []) if (tok(i)) used.icons.add(i);
    if (vd.effect) used.effects.add(vd.effect);
  }
  const out = {};
  for (const [k, s] of Object.entries(used)) out[k] = [...s].sort();
  return { used: out, hard, slots, nested: [...nested].sort() };
}
function axesOf(props) {
  const axes = {};
  const other = {};
  for (const [k, v] of Object.entries(props || {})) {
    if (v.type === 'VARIANT')
      axes[k] = { options: v.options, default: v.default };
    else other[k.replace(/#.*$/, '')] = { type: v.type, default: v.default };
  }
  return { axes, other };
}
function descriptionChecks(desc, set, analysis) {
  const issues = [];
  const d = decode(desc || '');
  if (!d.trim()) issues.push('Component description is empty.');
  const m =
    /Variants?\s*\(?\s*(\d+)\s*\)?\s*(?::|variants)?/i.exec(d) ||
    /(\d+)\s+variants/i.exec(d);
  if (m && Number(m[1]) !== set.variantCount && Number(m[1]) > 1)
    issues.push(
      `Description says ${m[1]} variants; the set has ${set.variantCount}.`,
    );
  const { axes } = axesOf(set.props);
  for (const [axis, def] of Object.entries(axes)) {
    const re = new RegExp(
      '•\\s*' +
        axis.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') +
        '\\s*[—–-]\\s*([^\\n]+)',
      'i',
    );
    const mm = re.exec(d);
    if (!mm) continue;
    const claimed = mm[1]
      .replace(/\(.*?\)/g, '')
      .split(/\s*[|·,]\s*|\s+or\s+/)
      .map((s) => s.trim().split(/\s+/)[0])
      .filter(Boolean);
    const missing = claimed.filter((c) => !def.options.includes(c));
    const extra = def.options.filter((o) => !claimed.includes(o));
    if (missing.length || extra.length)
      issues.push(
        `Axis \`${axis}\`: description lists [${claimed.join(', ')}], set has [${def.options.join(', ')}].`,
      );
  }
  const stateAxis = Object.entries(axes).find(([k]) => /^state$/i.test(k));
  if (stateAxis) {
    const o = stateAxis[1].options;
    if (o.includes('focus') && o.includes('focused'))
      issues.push('State axis has both `focus` and `focused`.');
    if (o.includes('pressed') && o.includes('active'))
      issues.push('State axis has both `pressed` and `active`.');
    const canon = [
      'default',
      'hover',
      'pressed',
      'active',
      'focus',
      'focused',
      'disabled',
      'loading',
      'selected',
      'filled',
      'error',
      'open',
      'checked',
      'unchecked',
      'mixed',
      'indeterminate',
      'on',
      'off',
      'current',
      'visited',
      'dragging',
      'error-focused',
      'readonly',
      'read-only',
      'success',
      'warning',
      'danger',
      'info',
      'neutral',
      'expanded',
      'collapsed',
      'empty',
      'complete',
      'incomplete',
      'skipped',
    ];
    const odd = o.filter((x) => !canon.includes(x.toLowerCase()));
    if (odd.length)
      issues.push(`State axis uses non-standard value(s): ${odd.join(', ')}.`);
  }
  if (analysis) {
    const prim = [
      ...analysis.used.fills,
      ...analysis.used.strokes,
      ...analysis.used.text,
      ...analysis.used.icons,
    ].filter((t) => /^\{Primitives:/.test(t));
    if (prim.length) {
      const u = [...new Set(prim)].map((t) => '`' + docName(tok(t)) + '`');
      issues.push(
        'Primitive color bound directly (CLR-002): ' +
          u.slice(0, 8).join(', ') +
          (u.length > 8 ? ` … (+${u.length - 8} more)` : '') +
          '.',
      );
    }
    const wrongCol = [
      ...analysis.used.fills,
      ...analysis.used.strokes,
      ...analysis.used.text,
      ...analysis.used.icons,
    ].filter((t) => /^\{(Spatial|Type|Layout):/.test(t));
    if (wrongCol.length)
      issues.push(
        'Non-color variable bound as a color: ' +
          [...new Set(wrongCol)]
            .map((t) => '`' + docName(tok(t)) + '`')
            .join(', ') +
          '.',
      );
    const localDup = Object.values(analysis.used)
      .flat()
      .filter((t) => /^\{[A-Za-z]+\(local\):/.test(t));
    if (localDup.length)
      issues.push(
        'Bound to a LOCAL duplicate of a Foundations token (should bind the library variable): ' +
          [...new Set(localDup)]
            .map((t) => '`' + t.slice(1, -1) + '`')
            .join(', ') +
          '.',
      );
    const legacy = Object.values(analysis.used)
      .flat()
      .filter((t) =>
        /^\{(Base Typograhy|Scale|Sematic|Legacy [A-Za-z]+):/.test(t),
      );
    if (legacy.length)
      issues.push(
        'Binds legacy non-SOLAR collection(s): ' +
          [...new Set(legacy)].join(', ') +
          '.',
      );
  }
  return issues;
}
function treeMd(n, depth = 0, lines = []) {
  const ind = '  '.repeat(depth);
  const bits = [];
  if (n.type === 'INSTANCE')
    bits.push(
      'instance of **' +
        n.main +
        '**' +
        (n.variant
          ? ' (' +
            Object.entries(n.variant)
              .map(([k, v]) => k + '=' + v)
              .join(', ') +
            ')'
          : ''),
    );
  else if (n.type === 'TEXT')
    bits.push(
      'text' +
        (n.textStyle ? ' `' + n.textStyle + '`' : '') +
        (n.text ? ' "' + n.text.replace(/\n/g, ' ') + '"' : ''),
    );
  else bits.push(n.type.toLowerCase());
  if (n.layout)
    bits.push(
      `${n.layout.dir === 'HORIZONTAL' ? 'row' : n.layout.dir === 'VERTICAL' ? 'column' : n.layout.dir.toLowerCase()} gap ${n.layout.gap} pad ${n.layout.pad.join('/')} ${n.layout.sizing}`,
    );
  else if (n.sizing) bits.push(n.sizing);
  bits.push(n.size.join('×'));
  const toks = [];
  for (const f of n.fills || []) toks.push('fill ' + fmtTok(f));
  for (const s of n.strokes || [])
    toks.push(
      'stroke ' +
        fmtTok(s) +
        (n.strokeWeight !== undefined ? ' ' + n.strokeWeight + 'px' : ''),
    );
  if (n.effectStyle) toks.push('effect `' + n.effectStyle + '`');
  const v = n.vars || {};
  const short = {};
  for (const [k, val] of Object.entries(v)) {
    const key = k
      .replace(/^(topLeft|topRight|bottomLeft|bottomRight)Radius$/, 'radius')
      .replace(/^stroke(Top|Right|Bottom|Left)Weight$/, 'strokeWeight')
      .replace(/^padding(Top|Right|Bottom|Left)$/, 'padding');
    (short[key] ||= new Set()).add(Array.isArray(val) ? val.join(',') : val);
  }
  for (const [k, s] of Object.entries(short))
    toks.push(
      k +
        ' ' +
        [...s].map((x) => '`' + docName(tok('{' + x + '}')) + '`').join(', '),
    );
  if (n.opacity !== undefined) toks.push('opacity ' + n.opacity);
  if (n.propRefs)
    toks.push(
      'prop ' +
        Object.entries(n.propRefs)
          .map(([p, r]) => p + '←' + r.replace(/#.*$/, ''))
          .join(', '),
    );
  lines.push(
    `${ind}- ${n.hidden ? '~~' : ''}**${n.name}**${n.hidden ? '~~ (hidden by default)' : ''} · ${bits.join(' · ')}${toks.length ? '  \n' + ind + '  ' + toks.join(' · ') : ''}`,
  );
  for (const c of n.children || []) treeMd(c, depth + 1, lines);
  return lines;
}
function docTextMd(docText, title) {
  const out = [];
  for (const t of docText || []) {
    const s = safe(t).trim();
    if (!s || CHROME.has(s) || s === title) continue;
    if (s.length <= 40 && !/[.!?]$/.test(s) && !s.includes('\n'))
      out.push(`\n**${s}**\n`);
    else
      out.push(
        s
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) =>
            /^(DO|DON'T)\s{2,}/.test(l) ? '- ' + l.replace(/\s{2,}/, ': ') : l,
          )
          .join('  \n') + '\n',
      );
  }
  return out.join('\n');
}
function variantTable(set) {
  const axes = Object.keys(axesOf(set.props).axes);
  const head = `| ${axes.join(' | ')} | size | fill | stroke | effect | text | icon |\n| ${axes.map(() => '---').join(' | ')} | --- | --- | --- | --- | --- | --- |`;
  const rows = set.variants.map((v) => {
    const vals = Object.fromEntries(
      v.variant.split(',').map((s) => s.trim().split('=')),
    );
    return `| ${axes.map((a) => vals[a] ?? '').join(' | ')} | ${v.size.join('×')} | ${(v.fills || []).map(fmtTok).join('<br>')} | ${(v.strokes || []).map(fmtTok).join('<br>')} | ${v.effect ? '`' + v.effect + '`' : ''} | ${(v.textFills || []).map(fmtTok).join('<br>')} | ${(v.iconFills || []).map(fmtTok).join('<br>')} |`;
  });
  return (
    head +
    '\n' +
    rows.join('\n') +
    (set.variantsTruncated ? '\n\n_Variant digest truncated at 150._' : '')
  );
}

// ---------- build ----------
const catalog = [];
const tokenUsage = {};
const indexRows = {};
const pageIssues = [];
for (const p of pages) {
  const outDir = join(here, p.section);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const md = [];
  md.push(`# ${p.title}\n`);
  md.push(
    `> SOLAR Web · Figma page \`${p.data ? p.data.page : ''}\` (id \`${p.id}\`) · section \`${p.section}\` · raw data: [\`raw/${p.section}/${p.slug}.json\`](${relative(outDir, join(rawDir, p.section, p.slug + '.json'))})\n`,
  );
  if (p.missing) {
    md.push('_Not extracted yet._\n');
    writeFileSync(join(outDir, p.slug + '.md'), md.join('\n'));
    (indexRows[p.section] ||= []).push({ ...p, sets: 0, variants: 0 });
    continue;
  }
  const d = p.data;
  if (d.pageContext)
    md.push(
      '## Agent context (`@SOLAR:PAGE_CONTEXT`)\n\n```\n' +
        d.pageContext +
        '\n```\n',
    );
  const allSets = [
    ...d.componentSets.map((s) => ({ ...s, kind: 'set' })),
    ...d.components.map((c) => ({
      ...c,
      kind: 'component',
      variantCount: 1,
      variants: [],
      defaultVariantTree: c.tree,
    })),
  ];
  let variantTotal = 0;
  for (const set of allSets) {
    variantTotal += set.variantCount;
    const { axes, other } = axesOf(set.props);
    const analysis = collectTokens(set.defaultVariantTree, set.variants);
    const issues = descriptionChecks(set.description, set, analysis);
    const rec = {
      name: set.name,
      kind: set.kind,
      section: p.section,
      slug: p.slug,
      pageId: p.id,
      nodeId: set.id,
      description: decode(set.description),
      variantCount: set.variantCount,
      defaultVariant: set.defaultVariant || null,
      axes,
      props: other,
      defaultSize: set.defaultVariantTree.size,
      layout: set.defaultVariantTree.layout || null,
      tokens: analysis.used,
      hardcoded: analysis.hard,
      slots: analysis.slots,
      composes: analysis.nested,
      issues,
      docText: (d.docText || [])
        .map(decode)
        .filter((t) => !CHROME.has(t.trim())),
    };
    catalog.push(rec);
    for (const group of Object.values(analysis.used))
      for (const t of group) {
        const key = tok(t) ? docName(tok(t)) : t;
        (tokenUsage[key] ||= new Set()).add(set.name);
      }
    md.push(
      `## ${set.kind === 'set' ? 'Component set' : 'Component'}: ${set.name}\n`,
    );
    if (set.description)
      md.push(
        safe(set.description)
          .split('\n')
          .map((l) => (l.trim() ? l : ''))
          .join('\n') + '\n',
      );
    if (Object.keys(axes).length || Object.keys(other).length) {
      md.push(
        '### Props\n\n| Prop | Type | Options / default |\n| --- | --- | --- |',
      );
      for (const [k, v] of Object.entries(axes))
        md.push(
          `| \`${k}\` | variant | ${v.options.map((o) => (o === v.default ? `**${o}**` : o)).join(' · ')} |`,
        );
      for (const [k, v] of Object.entries(other))
        md.push(
          `| \`${k}\` | ${v.type.toLowerCase().replace('_', ' ')} | default \`${v.default}\` |`,
        );
      md.push('');
    }
    if (set.defaultVariant)
      md.push(
        `Default variant: \`${set.defaultVariant}\` · ${set.variantCount} variants · default size ${set.defaultVariantTree.size.join('×')}px\n`,
      );
    md.push('### Anatomy (default variant)\n');
    md.push(treeMd(set.defaultVariantTree).join('\n') + '\n');
    if (set.census)
      md.push(
        'Instance census (tree capped at depth 3): ' +
          Object.entries(set.census)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => `${k} ×${v}`)
            .join(', ') +
          '\n',
      );
    const tk = analysis.used;
    const tokLines = [];
    const lab = {
      fills: 'Fills',
      strokes: 'Strokes',
      text: 'Text color',
      icons: 'Icon color',
      spacing: 'Spacing',
      radius: 'Radius',
      borderWidth: 'Border width',
      size: 'Sizes',
      typography: 'Typography vars',
      effects: 'Effects',
      textStyles: 'Text styles',
      other: 'Other',
    };
    for (const [k, arr] of Object.entries(tk))
      if (arr.length)
        tokLines.push(
          `| ${lab[k]} | ${arr.map((x) => (tok(x) ? '`' + docName(tok(x)) + '`' : '`' + x + '`')).join(', ')} |`,
        );
    if (tokLines.length)
      md.push(
        '### Tokens used\n\n| Role | Tokens |\n| --- | --- |\n' +
          tokLines.join('\n') +
          '\n',
      );
    if (analysis.slots.length)
      md.push(
        '### Slots and prop-controlled layers\n\n| Layer | Controlled property | Prop |\n| --- | --- | --- |\n' +
          analysis.slots
            .map((s) => `| ${s.layer} | ${s.controls} | \`${s.prop}\` |`)
            .join('\n') +
          '\n',
      );
    if (analysis.nested.length)
      md.push(
        '### Composes\n\n' +
          analysis.nested.map((n) => '- ' + n).join('\n') +
          '\n',
      );
    if (set.kind === 'set' && set.variants.length > 1)
      md.push('### Variant matrix\n\n' + variantTable(set) + '\n');
    if (analysis.hard.length || issues.length) {
      md.push('### Issues detected\n');
      for (const i of issues) md.push('- ' + i);
      for (const h of analysis.hard)
        md.push(`- Hard-coded ${h.prop} \`${h.value}\` on layer *${h.layer}*`);
      md.push('');
    }
  }
  if (d.frames && d.frames.length) {
    md.push('## Compositions and examples on this page\n');
    for (const fr of d.frames) {
      md.push(
        `### ${fr.name} (${fr.type.toLowerCase()}${fr.main ? ' of ' + fr.main : ''}, ${fr.size.join('×')})\n`,
      );
      if (fr.census && Object.keys(fr.census).length)
        md.push(
          'Uses: ' +
            Object.entries(fr.census)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => `${k} ×${v}`)
              .join(', ') +
            '\n',
        );
      if (fr.tree) md.push(treeMd(fr.tree).join('\n') + '\n');
      if (fr.texts)
        md.push(
          fr.texts.map((t) => '> ' + safe(t).replace(/\n/g, ' ')).join('\n') +
            '\n',
        );
    }
  }
  const boiler =
    p.slug !== 'breadcrumbs' &&
    (d.docText || []).some((t) =>
      /aria-label="Breadcrumb"|breadcrumb trail/i.test(decode(t)),
    );
  if (boiler) {
    md.push(
      '## Issues detected (page)\n\n- Documentation card contains Breadcrumbs boilerplate text; it does not describe this component.\n',
    );
    pageIssues.push({
      slug: p.slug,
      section: p.section,
      title: p.title,
      finding: 'Documentation card is Breadcrumbs boilerplate.',
    });
  }
  const dt = docTextMd(d.docText, p.title);
  if (dt.trim()) md.push('## Documentation card\n' + dt);
  writeFileSync(
    join(outDir, p.slug + '.md'),
    md.join('\n').replace(/\n{3,}/g, '\n\n'),
  );
  (indexRows[p.section] ||= []).push({
    ...p,
    sets: allSets.length,
    variants: variantTotal,
    names: allSets.map((s) => s.name),
  });
}
writeFileSync(
  join(here, 'catalog.json'),
  JSON.stringify(
    {
      _note:
        'Generated by build-docs.mjs from raw/. One record per component set or standalone component in SOLAR Web.',
      generated: new Date().toISOString().slice(0, 10),
      count: catalog.length,
      components: catalog,
    },
    null,
    2,
  ) + '\n',
);
const usage = Object.fromEntries(
  Object.entries(tokenUsage)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => [k, [...v].sort()]),
);
writeFileSync(
  join(here, 'token-usage.json'),
  JSON.stringify(
    {
      _note:
        'Generated by build-docs.mjs. Token (documentation dot-name) -> SOLAR Web components whose default variant or variant digest binds it. Hard-coded values are not tokens and are listed per component in catalog.json.',
      generated: new Date().toISOString().slice(0, 10),
      tokens: usage,
    },
    null,
    2,
  ) + '\n',
);
// Aggregated issues report
let iss =
  "# SOLAR Web — issues detected by the extractor\n\nGenerated by `build-docs.mjs`. Two kinds of findings: **description mismatches** (the Figma description claims variants or axis values that the component set does not have) and **hard-coded values** (a fill, stroke, gap, padding or radius on a component layer that is not bound to a SOLAR variable). Hard-coded values inside nested instances are reported on the nested component's own page, not here.\n\n";
const descIssues = catalog.filter((c) => c.issues.length);
const hardIssues = catalog.filter((c) => c.hardcoded.length);
iss += `## Description mismatches (${descIssues.length} components)\n\n| Component | Page | Finding |\n| --- | --- | --- |\n`;
for (const c of descIssues)
  for (const i of c.issues)
    iss += `| ${c.name} | [${c.slug}](${c.section}/${c.slug}.md) | ${i.replace(/\|/g, '\\|')} |\n`;
iss +=
  `\n## Page-level findings (${pageIssues.length} pages)\n\n| Page | Finding |\n| --- | --- |\n` +
  pageIssues
    .map((i) => `| [${i.title}](${i.section}/${i.slug}.md) | ${i.finding} |`)
    .join('\n') +
  '\n';
iss += `\n## Hard-coded values (${hardIssues.length} components, ${hardIssues.reduce((n, c) => n + c.hardcoded.length, 0)} findings)\n\n| Component | Page | Layer | Property | Value |\n| --- | --- | --- | --- | --- |\n`;
for (const c of hardIssues)
  for (const h of c.hardcoded)
    iss += `| ${c.name} | [${c.slug}](${c.section}/${c.slug}.md) | ${h.layer.replace(/\|/g, '\\|')} | ${h.prop} | \`${h.value}\` |\n`;
writeFileSync(join(here, 'issues.md'), iss);
let idx =
  '# SOLAR Web — page index\n\nGenerated by `build-docs.mjs`. One row per Figma page; component names are the component sets defined on that page.\n\n';
const total = { pages: 0, sets: 0, variants: 0 };
for (const [section, rows] of Object.entries(indexRows)) {
  idx += `## ${section}\n\n| Page | Components (variants) | Doc |\n| --- | --- | --- |\n`;
  for (const r of rows) {
    total.pages++;
    total.sets += r.sets;
    total.variants += r.variants;
    idx += `| ${r.title} | ${r.missing ? '_not extracted_' : (r.names || []).join(', ') + ' (' + r.variants + ')'} | [${r.slug}.md](${r.section}/${r.slug}.md) |\n`;
  }
  idx += '\n';
}
idx = idx.replace(
  'One row per Figma page;',
  `${total.pages} pages, ${total.sets} component sets/components, ${total.variants} variants. One row per Figma page;`,
);
writeFileSync(join(here, 'INDEX.md'), idx);
execSync(
  'npx prettier --write "docs/solar-web/**/*.md" docs/solar-web/catalog.json docs/solar-web/token-usage.json',
  { cwd: join(here, '..', '..'), stdio: 'ignore' },
);
console.log(
  `pages ${total.pages} (missing ${pages.filter((p) => p.missing).length}) sets ${total.sets} variants ${total.variants} tokens ${Object.keys(usage).length}`,
);
