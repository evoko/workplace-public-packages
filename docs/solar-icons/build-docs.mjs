// Renders docs/solar-icons/{INDEX.md, catalog.json, issues.md, CHANGELOG.md} from raw/.
//   node docs/solar-icons/build-docs.mjs
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const rawDir = join(here, 'raw');
const manifest = JSON.parse(readFileSync(join(rawDir, '_pages.json'), 'utf8'));
const meta = existsSync(join(rawDir, '_meta.json'))
  ? JSON.parse(readFileSync(join(rawDir, '_meta.json'), 'utf8'))
  : null;
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/</g, '&lt;').replace(/\|/g, '\\|');
const pascal = (name) =>
  name
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase());

const catalog = [];
const logos = [];
const issues = [];
const indexSections = [];
let changelog = null;
let variantFiles = 0,
  bytes = 0;

const svgInfo = (rel) => {
  const p = join(here, rel);
  if (!existsSync(p)) return { exists: false };
  const s = readFileSync(p, 'utf8');
  const st = statSync(p);
  bytes += st.size;
  variantFiles++;
  const colours = [
    ...new Set(
      [...s.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map((m) =>
        m[1].toLowerCase(),
      ),
    ),
  ];
  return {
    exists: true,
    bytes: st.size,
    paths: (s.match(/<path\b/g) || []).length,
    colours,
    hasStroke: /stroke="/.test(s),
    hasClipOrMask: /<clipPath|<mask/.test(s),
    viewBox: (s.match(/viewBox="([^"]+)"/) || [])[1] || null,
  };
};

for (const p of manifest.pages) {
  if (p.exclude || p.missingInFigma) continue;
  const src = join(rawDir, p.kind, p.slug + '.json');
  if (!existsSync(src)) continue;
  const d = JSON.parse(readFileSync(src, 'utf8'));
  if (d.kind === 'icons') {
    if (!d.icons.length) continue;
    const rows = [];
    for (const ic of d.icons) {
      const rec = {
        name: ic.name,
        component: 'Icon' + pascal(ic.name),
        kebab: ic.kebab,
        fileStem: ic.fileStem || ic.kebab,
        category: p.title,
        page: p.slug,
        setId: ic.setId,
        description: ic.description,
        size: ic.size,
        variants: {},
        issues: [...ic.issues],
      };
      for (const [k, v] of Object.entries(ic.variants)) {
        const info = v.file ? svgInfo(v.file) : { exists: false };
        rec.variants[k] = {
          id: v.id,
          file: v.file || null,
          fill: v.fills?.[0] || null,
          leaves: v.leaves,
          ...info,
        };
        if (!info.exists)
          rec.issues.push(`${k}: SVG file missing (${v.file || 'no export'})`);
        else {
          if (info.viewBox !== '0 0 24 24')
            rec.issues.push(`${k}: viewBox is ${info.viewBox}`);
          if (info.colours.length > 1)
            rec.issues.push(
              `${k}: SVG uses ${info.colours.length} colours (${info.colours.join(', ')})`,
            );
          if (info.hasStroke) rec.issues.push(`${k}: SVG contains strokes`);
          if (info.hasClipOrMask)
            rec.issues.push(`${k}: SVG contains clipPath/mask`);
        }
      }
      catalog.push(rec);
      for (const i of rec.issues)
        issues.push(`| ${esc(ic.name)} | ${esc(p.title)} | ${esc(i)} |`);
      const cell = (k) =>
        rec.variants[k]?.file
          ? `<img src="${rec.variants[k].file}" width="24" height="24" alt="${esc(ic.name)} ${k}">`
          : '—';
      rows.push(
        `| ${cell('outline')} | ${cell('solid')} | \`${esc(ic.name)}\` | \`${rec.component}\` | \`${rec.fileStem}\` | ${rec.issues.length ? '⚠️ ' + rec.issues.length : ''} |`,
      );
    }
    indexSections.push(
      `## ${esc(p.title)}\n\n${d.icons.length} icons. Figma page \`${d.pageId}\`, raw data [raw/icons/${p.slug}.json](raw/icons/${p.slug}.json).\n\n| Outline | Solid | Figma name | Component | File stem | Issues |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`,
    );
  } else if (d.kind === 'logos') {
    const rows = [];
    for (const st of d.sets) {
      const set = {
        name: st.name,
        kebab: st.kebab,
        setId: st.setId,
        description: st.description,
        variants: [],
      };
      for (const v of st.variants) {
        const exists = v.file && existsSync(join(here, v.file));
        set.variants.push({
          name: v.name,
          props: v.props,
          id: v.id,
          size: v.size,
          file: v.file || null,
          raster: !!v.images,
          exists,
        });
        if (!exists)
          issues.push(`| ${esc(st.name)} | Logos | asset missing: ${v.file} |`);
        rows.push(
          `| ${exists ? `<img src="${v.file}" height="32" alt="${esc(v.name)}">` : '—'} | \`${esc(st.name)}\` | \`${esc(v.name)}\` | ${v.size[0]}×${v.size[1]} | ${v.images ? 'PNG @2x (raster in Figma)' : 'SVG'} | \`${v.file}\` |`,
        );
      }
      logos.push(set);
    }
    indexSections.push(
      `## Logos\n\nFigma page \`${d.pageId}\`, raw data [raw/logos/${p.slug}.json](raw/logos/${p.slug}.json). Logos are not icons: they keep their own colours and must never be recoloured with \`currentColor\`.\n\n| Preview | Set | Variant | Size | Format | File |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`,
    );
  } else if (d.kind === 'meta' && p.slug === 'changelog') changelog = d;
}

// duplicates across categories
const byKebab = {};
for (const r of catalog) (byKebab[r.kebab] ||= []).push(r);
for (const [k, rs] of Object.entries(byKebab))
  if (rs.length > 1)
    for (const r of rs)
      if (!r.issues.some((i) => /collision/.test(i))) {
        r.issues.push(
          `Name collision with ${rs
            .filter((x) => x !== r)
            .map((x) => x.page)
            .join(', ')}`,
        );
        issues.push(
          `| ${esc(r.name)} | ${esc(r.category)} | Name collision across pages: ${rs.map((x) => x.page).join(', ')} |`,
        );
      }

const prov = meta
  ? `Source: Figma file \`${meta.fileName}\` (key \`${meta.file}\`), version \`${meta.version}\`, last modified ${meta.lastModified.slice(0, 10)}, fetched ${meta.fetchedOn}.`
  : 'Source: see raw/_meta.json.';
const withIssues = catalog.filter((r) => r.issues.length).length;

writeFileSync(
  join(here, 'catalog.json'),
  JSON.stringify(
    {
      _note:
        'Generated by docs/solar-icons/build-docs.mjs from raw/. One record per Icon/* component set: PascalCase component name, kebab file stem, category, and per variant (outline | solid) the Figma node id, exported SVG path, bound fill token, path count and colours found in the SVG. The SVGs are exported verbatim from Figma; a code generator should replace the single fill colour with currentColor.',
      generated: today,
      fileVersion: meta?.version || null,
      iconFill: 'Primitives:color/neutral/900',
      count: catalog.length,
      icons: catalog,
      logos,
    },
    null,
    2,
  ) + '\n',
);

writeFileSync(
  join(here, 'INDEX.md'),
  `# SOLAR Icons\n\n${prov} ${catalog.length} icons in ${indexSections.length - (logos.length ? 1 : 0)} categories, ${variantFiles} SVG variants (${(bytes / 1024).toFixed(0)} KB), ${logos.reduce((n, l) => n + l.variants.length, 0)} logo assets. Generated by \`docs/solar-icons/build-docs.mjs\`; regenerate with \`npm run solar:icons\`.\n\nEvery icon is a Figma component set \`Icon/<Name>\` with two variants, \`solid=false\` (outline) and \`solid=true\`, drawn on a 24 × 24 grid with one fill bound to the Foundations primitive \`color/neutral/900\`. Files live in [svg/outline/](svg/outline/) and [svg/solid/](svg/solid/) under the kebab-case name; \`catalog.json\` maps names to files and Figma ids. ${withIssues ? `**${withIssues} icons have findings**, listed in [issues.md](issues.md).` : 'No findings.'}\n\n${indexSections.join('\n')}`,
);

writeFileSync(
  join(here, 'issues.md'),
  `# SOLAR Icons — findings\n\nGenerated by \`build-docs.mjs\`. ${prov}\n\n${issues.length ? `| Icon | Page | Finding |\n| --- | --- | --- |\n${issues.join('\n')}\n` : 'No findings.\n'}`,
);

if (changelog) {
  const t = changelog.tables[0] || [];
  writeFileSync(
    join(here, 'CHANGELOG.md'),
    `# SOLAR Icons — Figma changelog\n\nVerbatim from the file's Changelog page (contributor column omitted). ${prov}\n\n${changelog.texts
      .filter((x) => x.length > 40)
      .map((x) => x + '\n')
      .join('\n')}\n${
      t.length
        ? `| ${t[0].map(esc).join(' | ')} |\n| ${t[0].map(() => '---').join(' | ')} |\n${t
            .slice(1)
            .map((r) => `| ${r.map(esc).join(' | ')} |`)
            .join('\n')}\n`
        : ''
    }`,
  );
}
console.log(
  `icons: ${catalog.length} icons, ${variantFiles} svg files, ${logos.length} logo sets, ${issues.length} findings on ${withIssues} icons`,
);
execSync(
  `npx prettier --write "${join(here, '*.md')}" "${join(here, 'catalog.json')}"`,
  { stdio: 'ignore' },
);
