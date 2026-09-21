// Fails when a file in this public repository contains a credential, or an e-mail address or
// phone number that has not been reviewed and accepted.
//
//   node scripts/check-personal-data.mjs                 # check (exit 1 on a new finding)
//   node scripts/check-personal-data.mjs --list          # print every finding, accepted or not
//   node scripts/check-personal-data.mjs --accept        # add current findings to the baseline
//
// Why a baseline: the SOLAR design files contain placeholder text written by real people, and
// some of it is already public and has been reviewed. Those occurrences are listed in
// personal-data-baseline.json with a reason. Anything NOT in that list fails the check, so a
// future `npm run solar:sync` that pulls in a new address is caught before it is committed.
// Credentials are never accepted, with or without a baseline entry.
//
// Limits: personal NAMES cannot be detected reliably and are not scanned. Review the diff of a
// sync by hand when Figma content changes. See docs/README.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const args = process.argv.slice(2);
const LIST = args.includes('--list');
const ACCEPT = args.includes('--accept');
const baselinePath = join(here, 'personal-data-baseline.json');
const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf8'))
  : { accepted: [] };

// Reserved, non-routable domains (RFC 2606 / 6761) plus the ones SOLAR uses for placeholders.
const ALLOWED_DOMAINS =
  /(^|\.)(example\.(com|org|net)|test|invalid|localhost|example)$/i;
// Suffixes that make an "address" a filename or a version, not an e-mail: image@2x.png,
// npm@10.9.0, pkg@1.2.3. A real address ends in an alphabetic top-level domain.
const NOT_A_TLD = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  'ico',
  'css',
  'html',
  'htm',
  'json',
  'jsonc',
  'md',
  'mjs',
  'cjs',
  'js',
  'ts',
  'tsx',
  'jsx',
  'yml',
  'yaml',
  'toml',
  'lock',
  'txt',
  'csv',
  'xml',
  'sh',
  'zip',
]);
// Files that legitimately contain the patterns themselves.
const SELF = new Set([
  'scripts/check-personal-data.mjs',
  'scripts/personal-data-baseline.json',
]);
const BINARY = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.pdf',
  '.zip',
  '.gz',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
]);

const RULES = [
  // Credentials. Always fatal: a baseline entry cannot accept these.
  {
    id: 'figma-token',
    secret: true,
    re: /figd_[A-Za-z0-9_-]{20,}/g,
    what: 'Figma personal access token',
  },
  {
    id: 'github-token',
    secret: true,
    re: /gh[pousr]_[A-Za-z0-9]{30,}/g,
    what: 'GitHub token',
  },
  {
    id: 'aws-key',
    secret: true,
    re: /AKIA[0-9A-Z]{16}/g,
    what: 'AWS access key id',
  },
  {
    id: 'private-key',
    secret: true,
    re: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/g,
    what: 'private key',
  },
  // Personal data.
  {
    id: 'email',
    re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+\b/g,
    what: 'e-mail address',
    ignore: (m) => {
      const domain = m.split('@')[1] || '';
      const tld = domain.split('.').pop().toLowerCase();
      if (!/^[a-z]{2,}$/.test(tld)) return true; // npm@10.9.0 and friends
      if (NOT_A_TLD.has(tld)) return true; // workplace@2x.png
      return ALLOWED_DOMAINS.test(domain);
    },
  },
  {
    id: 'phone',
    re: /\+\d[\d  ()-]{7,17}\d/g,
    what: 'phone number',
    // A run that is only zeros is a placeholder, not a number.
    ignore: (m) => /^[+0\s()-]+$/.test(m),
  },
];

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  },
)
  .split('\0')
  .filter(Boolean)
  .filter((f) => !SELF.has(f) && !BINARY.has(extname(f).toLowerCase()));

const findings = [];
for (const file of files) {
  let text;
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch {
    continue;
  }
  if (text.includes('\0')) continue; // binary without a known extension
  let lines = null;
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text))) {
      const match = m[0];
      if (rule.ignore?.(match)) continue;
      lines ??= text.slice(0, text.length).split('\n');
      const line = text.slice(0, m.index).split('\n').length;
      findings.push({
        file,
        line,
        rule: rule.id,
        what: rule.what,
        match,
        secret: !!rule.secret,
      });
    }
  }
}

const key = (f) => `${f.file}\u0000${f.match}`;
const acceptedKeys = new Set(
  baseline.accepted.map((a) => `${a.file}\u0000${a.match}`),
);
const isAccepted = (f) => !f.secret && acceptedKeys.has(key(f));
const secrets = findings.filter((f) => f.secret);
const fresh = findings.filter((f) => !f.secret && !isAccepted(f));
const accepted = findings.filter(isAccepted);
const seen = new Set(findings.map(key));
const stale = baseline.accepted.filter(
  (a) => !seen.has(`${a.file}\u0000${a.match}`),
);
const mask = (f) =>
  f.secret ? f.match.slice(0, 6) + '…' + ` (${f.match.length} chars)` : f.match;
// One line per file + match, however often it occurs, because that is what the baseline keys on.
const show = (list) => {
  const byKey = new Map();
  for (const f of list) {
    const k = key(f);
    const cur = byKey.get(k);
    if (cur) cur.count++;
    else byKey.set(k, { ...f, count: 1 });
  }
  return [...byKey.values()]
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    .map(
      (f) =>
        `  ${f.file}:${f.line}  ${f.what}: ${mask(f)}${f.count > 1 ? ` (×${f.count})` : ''}`,
    )
    .join('\n');
};

if (ACCEPT) {
  if (secrets.length) {
    console.error(
      `Refusing to write a baseline: ${secrets.length} credential(s) found.\n${show(secrets)}`,
    );
    process.exit(1);
  }
  const merged = [];
  const added = new Set();
  for (const a of baseline.accepted)
    if (
      seen.has(`${a.file}\u0000${a.match}`) &&
      !added.has(`${a.file}\u0000${a.match}`)
    ) {
      merged.push(a);
      added.add(`${a.file}\u0000${a.match}`);
    }
  for (const f of fresh)
    if (!added.has(key(f))) {
      merged.push({
        file: f.file,
        match: f.match,
        rule: f.rule,
        reason: 'TODO: why this is acceptable in a public repository',
      });
      added.add(key(f));
    }
  merged.sort(
    (a, b) => a.file.localeCompare(b.file) || a.match.localeCompare(b.match),
  );
  writeFileSync(
    baselinePath,
    JSON.stringify({ ...baseline, accepted: merged }, null, 2) + '\n',
  );
  console.log(
    `baseline: ${merged.length} accepted (${merged.length - baseline.accepted.filter((a) => seen.has(`${a.file}\u0000${a.match}`)).length} added, ${stale.length} stale removed). Fill in each new "reason".`,
  );
  process.exit(0);
}

const uniq = (list) => new Set(list.map(key)).size;
console.log(
  `scanned ${files.length} files: ${uniq(accepted)} accepted, ${uniq(fresh)} new, ${secrets.length} credentials`,
);
if (LIST && accepted.length)
  console.log(`\nAccepted (in the baseline):\n${show(accepted)}`);
if (stale.length)
  console.log(
    `\nStale baseline entries, no longer present — prune them with --accept:\n` +
      stale.map((a) => `  ${a.file}  ${a.match}`).join('\n'),
  );
if (secrets.length)
  console.error(
    `\nCREDENTIALS — remove these and rotate them:\n${show(secrets)}`,
  );
if (fresh.length)
  console.error(
    `\nNEW personal data, not reviewed:\n${show(fresh)}\n\n` +
      `If Figma content legitimately contains these, redact them in the extractor, or run\n` +
      `  node scripts/check-personal-data.mjs --accept\n` +
      `and write a reason for each entry in scripts/personal-data-baseline.json.`,
  );
process.exit(secrets.length || fresh.length ? 1 : 0);
