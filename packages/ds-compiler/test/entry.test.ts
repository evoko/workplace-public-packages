import {
  existsSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build, buildIR } from '../src/build.js';
import {
  ENTRY_HEADER,
  checkEntryCss,
  discoverEntrySources,
  expectedEntryCss,
  renderEntryCss,
  writeEntryCss,
} from '../src/entry.js';
import { Diagnostics } from '../src/errors.js';
import { lint } from '../src/lint.js';
import { ENTRY_FILE, IR_FILE } from '../src/paths.js';
import { MINI_CONFIG, makeRoot } from './helpers.js';

describe('entry file rendering', () => {
  it('renders the header, then token imports, then component imports', () => {
    const text = renderEntryCss({
      tokens: ['color', 'space'],
      components: ['badge'],
    });
    expect(text).toBe(
      `${ENTRY_HEADER}\n\n@import './tokens/color.css';\n@import './tokens/space.css';\n\n@import './components/badge/badge.css';\n`,
    );
  });

  it('renders only the header for an empty root', () => {
    expect(renderEntryCss({ tokens: [], components: [] })).toBe(
      `${ENTRY_HEADER}\n`,
    );
  });

  it('sorts unsorted tokens and components before rendering', () => {
    const text = renderEntryCss({
      tokens: ['space', 'color'],
      components: ['button', 'badge'],
    });
    expect(text).toBe(
      `${ENTRY_HEADER}\n\n@import './tokens/color.css';\n@import './tokens/space.css';\n\n@import './components/badge/badge.css';\n@import './components/button/button.css';\n`,
    );
  });

  it('discovers token files and complete component directories in code-unit order', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/space.css': ':root { --fx-space-1: 4px; }',
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
      'src/tokens/MAPPING.md': '# mapping',
      'src/components/button/button.css': '.fx-button { display: block; }',
      'src/components/button/button.manifest.json': '{}',
      'src/components/broken/notes.txt': 'no css here',
      'src/components/badge/badge.css': '.fx-badge { display: block; }',
    });
    expect(discoverEntrySources(root)).toEqual({
      tokens: ['color', 'space'],
      components: ['badge', 'button'],
    });
  });

  it('returns empty lists when the source directories do not exist', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(discoverEntrySources(root)).toEqual({ tokens: [], components: [] });
  });

  it('does not treat a directory named legacy.css under tokens as a token file', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    mkdirSync(join(root, 'src/tokens/legacy.css'), { recursive: true });
    expect(discoverEntrySources(root).tokens).toEqual(['color']);
  });

  it('does not import a broken symlinked token file', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    symlinkSync(
      join(root, 'src/tokens/does-not-exist.css'),
      join(root, 'src/tokens/broken.css'),
    );
    expect(discoverEntrySources(root).tokens).toEqual(['color']);
  });

  it('imports a valid symlinked token file, which also appears in the IR', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'external/space.css': ':root { --fx-space-1: 4px; }',
    });
    mkdirSync(join(root, 'src/tokens'), { recursive: true });
    symlinkSync(
      join(root, 'external/space.css'),
      join(root, 'src/tokens/space.css'),
    );
    expect(discoverEntrySources(root).tokens).toEqual(['space']);

    const result = buildIR(root);
    expect(result.diagnostics.items).toEqual([]);
    expect(result.ir).not.toBeNull();
    expect(result.ir!.tokens['space.1']).toBeDefined();
  });
});

describe('checkEntryCss', () => {
  it('reports DS-E070 when the file is missing', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    const diag = new Diagnostics();
    checkEntryCss(root, diag);
    expect(diag.items).toHaveLength(1);
    expect(diag.items[0]).toMatchObject({
      code: 'DS-E070',
      location: { file: ENTRY_FILE, line: 1, column: 1 },
    });
    expect(diag.items[0].message).toContain('missing');
  });

  it('reports DS-E070 when the file is stale and nothing when it matches', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
      'src/index.css': "@import './tokens/color.css';\n",
    });
    const stale = new Diagnostics();
    checkEntryCss(root, stale);
    expect(stale.items.map((d) => d.code)).toEqual(['DS-E070']);
    expect(stale.items[0].message).toContain('does not match');

    writeFileSync(join(root, ENTRY_FILE), expectedEntryCss(root));
    const fresh = new Diagnostics();
    checkEntryCss(root, fresh);
    expect(fresh.items).toEqual([]);
  });

  it('reports DS-E070 without throwing when src/index.css is a directory', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    mkdirSync(join(root, ENTRY_FILE));
    const diag = new Diagnostics();
    expect(() => checkEntryCss(root, diag)).not.toThrow();
    expect(diag.items.map((d) => d.code)).toEqual(['DS-E070']);
    expect(diag.items[0].message).toContain('EISDIR');

    expect(() => lint(root)).not.toThrow();
    expect(lint(root).items.map((d) => d.code)).toEqual(['DS-E070']);
  });
});

describe('writeEntryCss', () => {
  it('creates the file, is idempotent, and rewrites a stale file', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    const first = writeEntryCss(root);
    expect(first).toEqual({ path: join(root, ENTRY_FILE), changed: true });
    expect(readFileSync(first.path, 'utf8')).toBe(expectedEntryCss(root));
    expect(writeEntryCss(root).changed).toBe(false);

    writeFileSync(first.path, '/* edited by hand */\n');
    expect(writeEntryCss(root).changed).toBe(true);
    expect(readFileSync(first.path, 'utf8')).toBe(expectedEntryCss(root));
  });

  it('creates src/ when the root has no source directories yet', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const { path } = writeEntryCss(root);
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf8')).toBe(`${ENTRY_HEADER}\n`);
  });

  it('wraps a write failure in an Error starting with "cannot write src/index.css:"', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    mkdirSync(join(root, ENTRY_FILE));
    expect(() => writeEntryCss(root)).toThrow(/^cannot write src\/index\.css:/);
  });
});

describe('lint and build with the entry file', () => {
  const files = {
    'ds.config.json': MINI_CONFIG,
    'src/tokens/color.css': ':root { --fx-color-a: #000; }',
  };

  it('lint reports only DS-E070 for a root without an entry file', () => {
    const root = makeRoot(files);
    expect(lint(root).items.map((d) => d.code)).toEqual(['DS-E070']);
  });

  it('build writes the entry file and reports its path; lint is then clean', () => {
    const root = makeRoot(files);
    const result = build(root);
    expect(result.ir).not.toBeNull();
    expect(result.entryFile).toBe(join(root, ENTRY_FILE));
    expect(readFileSync(result.entryFile!, 'utf8')).toContain(
      "@import './tokens/color.css';",
    );
    expect(lint(root).items).toEqual([]);
  });

  it('build writes the entry file but not the IR when the IR has errors', () => {
    const root = makeRoot({
      ...files,
      'src/tokens/space.css': ':root { --fx-space-1: nope; }',
    });
    const result = build(root);
    expect(result.ir).toBeNull();
    expect(result.entryFile).toBe(join(root, ENTRY_FILE));
    expect(existsSync(result.entryFile!)).toBe(true);
    expect(existsSync(join(root, IR_FILE))).toBe(false);
  });

  it('lint skips the entry check when the config cannot be loaded', () => {
    const root = makeRoot({
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    expect(lint(root).items.map((d) => d.code)).toEqual(['DS-E001']);
  });
});
