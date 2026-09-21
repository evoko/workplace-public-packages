// Shared Figma REST client for the SOLAR fetchers (docs/solar/raw and docs/solar-web/raw).
// Token from $FIGMA_TOKEN or ~/.config/figma/token (never committed). Read scopes only.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

export function token() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN.trim();
  try {
    return readFileSync(
      join(homedir(), '.config', 'figma', 'token'),
      'utf8',
    ).trim();
  } catch {
    throw new Error(
      'No Figma token: set FIGMA_TOKEN or create ~/.config/figma/token',
    );
  }
}

export async function figmaGet(path, params = {}) {
  const url = new URL('https://api.figma.com' + path);
  for (const [k, v] of Object.entries(params))
    if (v !== undefined) url.searchParams.set(k, String(v));
  let last = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { 'X-Figma-Token': token() } });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 30);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (res.status >= 500) {
      last = `Figma ${res.status}`;
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      continue;
    }
    const body = await res.json();
    if (!res.ok || body.err)
      throw new Error(
        `Figma ${res.status} ${path}: ${body.err || body.message || ''}`,
      );
    return body;
  }
  throw new Error(
    `Figma: gave up after 5 attempts on ${path} (${last || 'rate limited'})`,
  );
}

// Opens a file: reads its head (name, version, page list) and prepares a response cache
// keyed by the file version, so an unchanged file costs no page requests and a changed
// one is re-fetched automatically. `nodes(ids, cacheName)` is GET /v1/files/KEY/nodes
// through that cache, with a small delay after each real request to stay under rate limits.
export async function openFile(
  key,
  {
    cacheRoot = join(tmpdir(), 'solar-rest-cache', key),
    fresh = false,
    delayMs = 400,
  } = {},
) {
  const head = await figmaGet(`/v1/files/${key}`, { depth: 1 });
  const version = String(head.version || 'unknown');
  const cacheDir = join(cacheRoot, version);
  if (fresh && existsSync(cacheDir)) {
    console.log('cache: --fresh, discarding', cacheDir);
    rmSync(cacheDir, { recursive: true, force: true });
  }
  mkdirSync(cacheDir, { recursive: true });
  return {
    key,
    head,
    version,
    cacheDir,
    pages: head.document.children,
    async nodes(ids, cacheName) {
      const f = join(cacheDir, cacheName + '.json');
      if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8'));
      const resp = await figmaGet(`/v1/files/${key}/nodes`, { ids });
      writeFileSync(f, JSON.stringify(resp));
      await new Promise((r) => setTimeout(r, delayMs));
      return resp;
    },
  };
}

// Page-name helpers shared by both manifests.
export const slugify = (t) =>
  t
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const statusOf = (name) =>
  /🟢/.test(name)
    ? 'done'
    : /🟡/.test(name)
      ? 'wip'
      : /🟠/.test(name)
        ? 'draft'
        : 'none';

export const cleanTitle = (name) =>
  name
    .replace(/^\s*↳\s*/, '')
    .replace(/[🟢🟡🟠]/g, '')
    .trim();

// Writes raw/_meta.json next to a fetcher.
export function writeMeta(dir, file, extra) {
  writeFileSync(
    join(dir, '_meta.json'),
    JSON.stringify(
      {
        _note: 'Provenance of the raw extraction, written by fetch-rest.mjs.',
        file: file.key,
        fileName: file.head.name,
        version: file.version,
        lastModified: file.head.lastModified,
        fetchedOn: new Date().toISOString().slice(0, 10),
        ...extra,
      },
      null,
      2,
    ) + '\n',
  );
}
