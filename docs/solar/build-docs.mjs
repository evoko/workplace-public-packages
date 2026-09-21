// Renders docs/solar/figma-pages/ from docs/solar/raw/: one Markdown page per Foundations
// Figma page (verbatim text in reading order, tables, page-context block), an INDEX.md,
// and page-context.json (every @SOLAR:PAGE_CONTEXT block, machine-readable).
// The curated chapters (01-…18-*.md) are NOT touched; this is the generated layer they can
// be checked against.  node docs/solar/build-docs.mjs
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const rawDir = join(here, 'raw');
const outDir = join(here, 'figma-pages');
const manifest = JSON.parse(readFileSync(join(rawDir, '_pages.json'), 'utf8'));
const meta = existsSync(join(rawDir, '_meta.json'))
  ? JSON.parse(readFileSync(join(rawDir, '_meta.json'), 'utf8'))
  : null;
// Only used to stamp a chapter on --mark-reviewed, which is a deliberate human action.
// Generated files record the source's fetch date instead, so rebuilds are deterministic.
const today = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
const MARK =
  args.indexOf('--mark-reviewed') >= 0
    ? args[args.indexOf('--mark-reviewed') + 1]
    : null;

// ---------- content hashes: what a chapter was reviewed against ----------
// The hash covers the page's text (all blocks, recursively) and its page-context block, not
// positions or sizes, so moving a slide around does not count as a change.
const textsOf = (bs, acc = []) => {
  for (const b of bs) {
    if (b.t === 'group') textsOf(b.blocks, acc);
    else if (b.t === 'table')
      acc.push(b.rows.map((r) => r.join('\t')).join('\n'));
    else acc.push(b.text || b.name || '');
  }
  return acc;
};
const sha = (t) => createHash('sha1').update(t).digest('hex').slice(0, 12);
const hashes = {};
const rawDocs = {};
for (const p of manifest.pages) {
  if (p.exclude) continue;
  const src = join(rawDir, p.section, p.slug + '.json');
  if (!existsSync(src)) continue;
  const d = JSON.parse(readFileSync(src, 'utf8'));
  rawDocs[p.section + '/' + p.slug] = d;
  const texts = d.slides.flatMap((sl) => [
    sl.title || '',
    sl.subtitle || '',
    ...textsOf(sl.blocks),
  ]);
  hashes[p.section + '/' + p.slug] = sha(
    texts.join('\n') + '\n' + (d.pageContext || ''),
  );
}
hashes['page-context'] = sha(
  Object.entries(rawDocs)
    .filter(([, d]) => d.pageContext)
    .map(([k, d]) => k + '\n' + d.pageContext)
    .join('\n\n'),
);

// ---------- primitives pages vs figma-variables.json ----------
// The primitives Color page renders one swatch per palette value with its name and hex; the
// other primitives pages render tables of token -> value. Both are compared with the token
// inventory so a Figma edit that the deliberate capture has not caught yet shows up.
const inv = JSON.parse(
  readFileSync(join(here, 'tokens', 'figma-variables.json'), 'utf8'),
);
const primFlat = {};
for (const [grp, v] of Object.entries(inv.primitives)) {
  if (Array.isArray(v)) for (const x of v) primFlat[`${grp}/${x}`] = x;
  else for (const [k, x] of Object.entries(v)) primFlat[`${grp}/${k}`] = x;
}
const hexOf = (v) =>
  v && typeof v === 'object' ? v.hex : typeof v === 'string' ? v : null;
const primByHex = {};
for (const [k, v] of Object.entries(primFlat)) {
  const h = hexOf(v);
  if (h && /^#/.test(h)) (primByHex[h.toLowerCase()] ||= []).push(k);
}
const named = {}; // figma name -> [value] for all collections, for table lookups
for (const [k, v] of Object.entries(primFlat)) named[k] = [hexOf(v) ?? v];
for (const [k, v] of Object.entries(inv.spatial))
  if (!k.startsWith('_')) named[k] = [v[1]];
for (const [k, v] of Object.entries(inv.type))
  if (!k.startsWith('_')) named[k] = v;
const swatchCheck = {
  checked: 0,
  matched: 0,
  unmatched: [],
  tables: 0,
  tableMatched: 0,
  tableUnmatched: [],
};
const numOf = (t) => {
  const m = String(t).match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
};
for (const [key, d] of Object.entries(rawDocs)) {
  if (!key.startsWith('primitives/')) continue;
  for (const sw of d.swatches) {
    const hexLabel = sw.labels.find((l) => /^#[0-9a-f]{6}$/i.test(l.trim()));
    if (!hexLabel) continue;
    swatchCheck.checked++;
    const h = hexLabel.trim().toLowerCase();
    const name = sw.labels
      .find((l) => l !== hexLabel)
      ?.trim()
      .toLowerCase();
    const cands = primByHex[h] || [];
    const hit =
      cands.find((c) => name && c.toLowerCase().endsWith('/' + name)) ||
      cands[0];
    if (hit && (!sw.hex || sw.hex.slice(0, 7) === h)) swatchCheck.matched++;
    else
      swatchCheck.unmatched.push(
        `${key}: ${sw.labels.join(' · ')} (rendered ${sw.hex || '—'})${cands.length ? '' : ' — no primitive with this hex'}`,
      );
  }
  const tables = [];
  const walkT = (bs) =>
    bs.forEach((b) =>
      b.t === 'table'
        ? tables.push(b)
        : b.t === 'group'
          ? walkT(b.blocks)
          : null,
    );
  d.slides.forEach((sl) => walkT(sl.blocks));
  for (const t of tables)
    for (const row of t.rows.slice(1)) {
      const tok = row.find((c) =>
        /^[a-z0-9-]+(\/[a-z0-9.-]+)+$/i.test(c.trim()),
      );
      if (!tok || !named[tok.trim()]) continue;
      const vals = row
        .filter((c) => c !== tok)
        .map(numOf)
        .filter((n) => n !== null);
      if (!vals.length) continue;
      swatchCheck.tables++;
      const expect = named[tok.trim()].map(numOf).filter((n) => n !== null);
      if (expect.some((e) => vals.includes(e))) swatchCheck.tableMatched++;
      else
        swatchCheck.tableUnmatched.push(
          `${key}: ${tok.trim()} shows ${vals.join('/')}, inventory has ${expect.join('/')}`,
        );
    }
}

// ---------- curated chapters: front matter with sources and reviewed hashes ----------
// ---
// solar:
//   reviewed: 2026-09-21
//   figmaVersion: "2397931579128493119"
//   sources:
//     documentation/introduction: 3f2a9c1b7d5e
// ---
const chapterFiles = readdirSync(here)
  .filter((f) => /^\d\d-.*\.md$/.test(f))
  .sort();
const parseFront = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = { sources: {}, reviewed: null, figmaVersion: null, raw: m[0] };
  for (const line of m[1].split('\n')) {
    let x;
    if ((x = line.match(/^\s+reviewed:\s*["']?([\d-]+)["']?\s*$/)))
      fm.reviewed = x[1];
    else if ((x = line.match(/^\s+figmaVersion:\s*["']?(\w+)["']?\s*$/)))
      fm.figmaVersion = x[1];
    else if (
      (x = line.match(
        /^\s+([\w-]+\/[\w-]+|page-context):\s*["']?([\w-]+)["']?\s*$/,
      ))
    )
      fm.sources[x[1]] = x[2];
  }
  return fm;
};
const chapters = chapterFiles.map((f) => {
  const text = readFileSync(join(here, f), 'utf8');
  return { file: f, text, fm: parseFront(text) };
});

if (MARK) {
  // stamp the current hashes into one chapter (or all): the reviewer has reconciled it
  for (const c of chapters) {
    if (MARK !== 'all' && MARK !== c.file) continue;
    if (!c.fm) {
      console.log(
        `mark-reviewed: ${c.file} has no front matter with solar.sources; add one first`,
      );
      continue;
    }
    const lines = [
      '---',
      'solar:',
      `  reviewed: ${today}`,
      `  figmaVersion: "${meta?.version || 'unknown'}"`,
      '  sources:',
    ];
    for (const k of Object.keys(c.fm.sources))
      lines.push(`    ${k}: ${hashes[k] || 'unknown-page'}`);
    lines.push('---', '');
    const next = lines.join('\n') + c.text.slice(c.fm.raw.length);
    writeFileSync(join(here, c.file), next);
    c.text = next;
    c.fm = parseFront(next);
    console.log(`mark-reviewed: ${c.file} stamped`);
  }
}

// which chapters cite which page, for the generated page headers
const citedBy = {};
for (const c of chapters)
  for (const k of Object.keys(c.fm?.sources || {}))
    (citedBy[k] ||= []).push(c.file);

// start clean so removed pages do not linger
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// Markdown reads * and _ as emphasis, and Prettier stopped adding these escapes in 3.9, so the
// generator adds them itself. Code fences are emitted raw and never pass through here.
const esc = (s) =>
  String(s)
    .replace(/</g, '&lt;')
    .replace(/\|/g, '\\|')
    .replace(/([*_])/g, '\\$1');
const cell = (s) => esc(s).replace(/\s*\n\s*/g, ' ');
// single newlines inside a Figma text box are hard line breaks, blank lines stay paragraphs
const para = (s) =>
  esc(s)
    .replace(/\n{3,}/g, '\n\n')
    .split('\n\n')
    .map((par) => par.split('\n').join('\\\n'))
    .join('\n\n');

// runs of three or more short one-line paragraphs read better as a list
const SHORT = (b) =>
  b.t === 'p' && b.text.length <= 60 && !b.text.includes('\n');
function render(blocks, out, depth = 0) {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (SHORT(b)) {
      let j = i;
      while (j < blocks.length && SHORT(blocks[j])) j++;
      if (j - i >= 3) {
        out.push(
          blocks
            .slice(i, j)
            .map((x) => `- ${cell(x.text)}`)
            .join('\n') + '\n',
        );
        i = j - 1;
        continue;
      }
    }
    switch (b.t) {
      case 'h': {
        const lvl = Math.min(6, Math.max(3, b.level + 1));
        out.push(`${'#'.repeat(lvl)} ${cell(b.text)}\n`);
        break;
      }
      case 'p':
        out.push(para(b.text) + '\n');
        break;
      case 'code':
        out.push('```\n' + b.text + '\n```\n');
        break;
      case 'table': {
        const [h, ...rows] = b.rows;
        out.push(
          `| ${h.map(cell).join(' | ')} |\n| ${h.map(() => '---').join(' | ')} |\n` +
            rows.map((r) => `| ${r.map(cell).join(' | ')} |`).join('\n') +
            '\n',
        );
        break;
      }
      case 'image':
        out.push(`_[image: ${cell(b.name)}]_\n`);
        break;
      case 'group': {
        // a card: first text becomes a bold lead, the rest follows
        const inner = [];
        render(b.blocks, inner, depth + 1);
        if (!inner.length) break;
        const [first, ...rest] = inner;
        const lead = first.startsWith('#') ? first : `**${first.trim()}**\n`;
        out.push([lead, ...rest].join('\n'));
        break;
      }
    }
  }
}

const rows = [];
const contexts = {};
let pages = 0;
for (const p of manifest.pages) {
  if (p.exclude) {
    rows.push(
      `| ${p.section} | ${esc(p.title)} | excluded: ${esc(p.excludeReason || '')} | | | |`,
    );
    continue;
  }
  const src = join(rawDir, p.section, p.slug + '.json');
  if (!existsSync(src)) continue;
  const d = rawDocs[p.section + '/' + p.slug];
  const key = p.section + '/' + p.slug;
  const chapterLinks = (citedBy[key] || [])
    .map((f) => `[${f}](../../${f})`)
    .join(', ');
  const md = [];
  md.push(`# ${esc(d.page)}\n`);
  md.push(
    `> Verbatim text of the Figma page \`${esc(d.page)}\` (id \`${d.pageId}\`, section ${p.section}${p.status !== 'none' ? ', status ' + p.status : ''}${p.missingInFigma ? ', **no longer in Figma**' : ''}), extracted by \`raw/fetch-rest.mjs\` and rendered by \`build-docs.mjs\`. Generated file, do not edit; it is review material, not the reference. Content hash \`${hashes[key]}\`. ${chapterLinks ? `Curated chapter${citedBy[key].length > 1 ? 's' : ''}: ${chapterLinks}.` : 'No curated chapter cites this page.'}\n`,
  );
  let n = 0;
  // cover slides carry decorative number art: drop bare numbers when there are many of them
  const isDigits = (b) => b.t === 'p' && /^\d{1,3}$/.test(b.text);
  for (const s of d.slides) {
    if (s.blocks.filter(isDigits).length >= 10)
      s.blocks = s.blocks.filter((b) => !isDigits(b));
    if (!s.blocks.length) continue;
    n++;
    md.push(`## ${s.title ? cell(s.title) : `Slide ${n}`}\n`);
    if (s.subtitle) md.push(`_${cell(s.subtitle)}_\n`);
    render(s.blocks, md);
  }
  if (d.swatches.length && p.section === 'primitives') {
    md.push(`## Swatches bound to variables\n`);
    md.push(
      `Containers on this page whose fill is bound to a Figma variable, with their labels. Variable ids are local to the Foundations file; names come from [../../tokens/figma-variables.json](../../tokens/figma-variables.json).\n`,
    );
    md.push(
      `| Labels | Rendered | Variable id |\n| --- | --- | --- |\n` +
        d.swatches
          .map(
            (s) =>
              `| ${cell(s.labels.join(' · '))} | \`${s.hex || '—'}\`${s.opacity < 1 ? ` @ ${Math.round(s.opacity * 100)}%` : ''} | \`${s.variableId}\` |`,
          )
          .join('\n') +
        '\n',
    );
  }
  if (d.pageContext) {
    md.push(`## @SOLAR:PAGE_CONTEXT\n`);
    md.push(
      `The machine-readable context block the SOLAR team placed on this page, verbatim.\n`,
    );
    md.push('```text\n' + d.pageContext.trim() + '\n```\n');
    contexts[p.slug] = d.pageContext.trim();
  }
  const out = join(outDir, p.section, p.slug + '.md');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, md.join('\n'));
  rows.push(
    `| ${p.section} | [${esc(p.title)}](${p.section}/${p.slug}.md) | ${p.status === 'none' ? '' : p.status}${p.missingInFigma ? ' ⚠️ missing' : ''} | ${d.slides.length} | ${d.blockCount} | ${d.pageContext ? '✓' : ''} |`,
  );
  pages++;
}

const prov = meta
  ? `Source: Figma file \`${meta.fileName}\` (key \`${meta.file}\`), version \`${meta.version}\`, last modified ${meta.lastModified.slice(0, 10)}, fetched ${meta.fetchedOn}.`
  : 'Source: see raw/_meta.json.';
writeFileSync(
  join(outDir, 'INDEX.md'),
  `# SOLAR Foundations — Figma pages, verbatim\n\n${prov} ${pages} pages. Generated by \`docs/solar/build-docs.mjs\`; regenerate with \`npm run solar:foundations\`.\n\nThese pages are the raw text of the Foundations file in reading order, for checking the curated chapters in [../README.md](../README.md) against what Figma currently says. They are not the reference; the chapters and [../tokens/figma-variables.json](../tokens/figma-variables.json) are.\n\n| Section | Page | Status | Slides | Text blocks | Page context |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`,
);
// ---------- review status: which curated chapters are behind Figma ----------
const statusRows = [];
let behind = 0;
for (const c of chapters) {
  if (!c.fm) {
    statusRows.push(`| [${c.file}](${c.file}) | — | ⚠️ no front matter | — |`);
    behind++;
    continue;
  }
  const changed = Object.entries(c.fm.sources).filter(
    ([k, h]) => hashes[k] !== h,
  );
  const missing = changed.filter(([k]) => !hashes[k]).map(([k]) => k);
  const stale = changed.filter(([k]) => hashes[k]).map(([k]) => k);
  const state = !changed.length
    ? '✅ in sync'
    : `⚠️ behind: ${[...stale.map((k) => `\`${k}\` changed`), ...missing.map((k) => `\`${k}\` missing`)].join(', ')}`;
  if (changed.length) behind++;
  statusRows.push(
    `| [${c.file}](${c.file}) | ${Object.keys(c.fm.sources)
      .map((k) =>
        k === 'page-context' ? '`page-context`' : `[${k}](figma-pages/${k}.md)`,
      )
      .join(', ')} | ${state} | ${c.fm.reviewed} |`,
  );
}
writeFileSync(
  join(here, 'review-status.md'),
  `# Curated chapters vs Figma\n\nGenerated by \`docs/solar/build-docs.mjs\` on every \`npm run solar:foundations\` / \`solar:sync\`. Each chapter's front matter names the Figma pages it was written from and the content hash of each page at review time. A row is **behind** when a source page's text has changed since; review the chapter against [figma-pages/](figma-pages/INDEX.md), then stamp it with \`node docs/solar/build-docs.mjs --mark-reviewed <chapter-file>\` (or \`all\`). Nothing rewrites a chapter automatically.\n\n${prov}\n\n**${chapters.length} chapters, ${behind} behind.**\n\n| Chapter | Sources | Status | Reviewed |\n| --- | --- | --- | --- |\n${statusRows.join('\n')}\n`,
);
{
  const sc = swatchCheck;
  const lines = [
    '',
    '## Primitives pages vs `tokens/figma-variables.json`',
    '',
    'Swatches on the primitives pages carry a name and a hex; token tables carry a name and a value. Both are looked up in the token inventory on every build. A mismatch here means Figma changed a primitive and the deliberate capture (`tokens/capture-variables.js`) has not been re-run.',
    '',
    `- Colour swatches: ${sc.matched} of ${sc.checked} match a primitive by hex${sc.unmatched.length ? `; **${sc.unmatched.length} do not**` : ''}.`,
    ...(sc.tables
      ? [
          `- Table rows naming a token: ${sc.tableMatched} of ${sc.tables} show the inventory value${sc.tableUnmatched.length ? `; **${sc.tableUnmatched.length} do not**` : ''}.`,
        ]
      : [
          '- No token tables were recognised on the primitives pages (the scale sheets use column instances, not row frames); only swatches are checked.',
        ]),
    ...(sc.unmatched.length
      ? [
          '',
          'A swatch mismatch where the rendered colour equals another primitive means the label text on the Figma page is wrong, not the variable; report it to the SOLAR team.',
        ]
      : []),
    ...sc.unmatched.slice(0, 40).map((x) => `  - ⚠️ ${x}`),
    ...sc.tableUnmatched.slice(0, 40).map((x) => `  - ⚠️ ${x}`),
    '',
  ];
  writeFileSync(
    join(here, 'review-status.md'),
    readFileSync(join(here, 'review-status.md'), 'utf8') + lines.join('\n'),
  );
  console.log(
    `primitives check: swatches ${sc.matched}/${sc.checked}, table rows ${sc.tableMatched}/${sc.tables}`,
  );
}
console.log(`review-status: ${chapters.length} chapters, ${behind} behind`);
writeFileSync(
  join(outDir, '_hashes.json'),
  JSON.stringify(
    {
      _note:
        'Content hash per Figma page (text + page context), as used in chapter front matter. Generated by build-docs.mjs.',
      fileVersion: meta?.version || null,
      pages: hashes,
    },
    null,
    2,
  ) + '\n',
);

writeFileSync(
  join(outDir, 'page-context.json'),
  JSON.stringify(
    {
      _note:
        'Every @SOLAR:PAGE_CONTEXT block in the Foundations file, verbatim, keyed by page slug. Generated by build-docs.mjs. Lowest precedence of the SOLAR sources: figma-variables.json wins, then the chapter prose, then these blocks.',
      sourceFetchedOn: meta?.fetchedOn || null,
      fileVersion: meta?.version || null,
      pages: contexts,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `figma-pages: ${pages} pages, ${Object.keys(contexts).length} page-context blocks`,
);
const files = readdirSync(outDir, { recursive: true })
  .filter((f) => /\.(md|json)$/.test(f))
  .map((f) => join(outDir, f))
  .concat(
    join(here, 'review-status.md'),
    MARK ? chapters.map((c) => join(here, c.file)) : [],
  );
execSync(`npx prettier --write ${files.map((f) => `"${f}"`).join(' ')}`, {
  stdio: 'ignore',
});
