import { afterAll, describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repoRoot } from '../src/util/paths.mjs';
import {
  formatDart,
  formatWithPrettier,
  isMissingSdk,
} from '../src/util/format.mjs';
import {
  commitGenerated,
  deferWrites,
  pruneGenerated,
  writeGenerated,
} from '../src/util/write.mjs';

// The guard only allows writes inside the repository, so the one positive test has to create a
// real directory here. It cleans up after itself rather than leaving that to a manual step.
const scratch = [];
afterAll(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});

describe('writeGenerated', () => {
  it('refuses to write anywhere under docs/, because docs/ mirrors Figma', () => {
    expect(() =>
      writeGenerated(
        join(repoRoot, 'docs', 'solar', 'tokens', 'figma-variables.json'),
        '{}',
      ),
    ).toThrow(/read-only to the generator/);
  });

  it('refuses to write outside the repository', () => {
    expect(() => writeGenerated(join(tmpdir(), 'escape.txt'), 'x')).toThrow(
      /outside the repository/,
    );
  });

  it('writes inside the repository and creates missing directories', () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    const file = join(dir, 'nested', 'out.txt');
    writeGenerated(file, 'hello');
    expect(readFileSync(file, 'utf8')).toBe('hello');
  });
});

describe('deferWrites', () => {
  it('holds every write until committed, so a run that throws first rewrites nothing', async () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    const file = join(dir, 'Alert.tsx');
    writeFileSync(file, 'committed');
    deferWrites();
    try {
      writeGenerated(file, 'this run');
      writeGenerated(join(dir, 'new', 'Card.tsx'), 'this run');
      expect(readFileSync(file, 'utf8')).toBe('committed');
      expect(existsSync(join(dir, 'new'))).toBe(false);
    } finally {
      expect(await commitGenerated()).toHaveLength(2);
    }
    expect(readFileSync(file, 'utf8')).toBe('this run');
    expect(readFileSync(join(dir, 'new', 'Card.tsx'), 'utf8')).toBe('this run');
  });

  it('leaves no partial file beside what it wrote', () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    writeGenerated(join(dir, 'out.txt'), 'whole');
    expect(readdirSync(dir)).toEqual(['out.txt']);
  });

  it('refuses a commit with nothing deferred', async () => {
    await expect(commitGenerated()).rejects.toThrow(/no writes are deferred/);
  });
});

describe('commitGenerated, writing only what changed', () => {
  // An mtime well in the past, so a rewrite is told from a skip whatever the clock's resolution.
  const past = new Date('2020-01-01T00:00:00Z');
  const aged = (file, text) => {
    writeFileSync(file, text);
    utimesSync(file, past, past);
  };
  const mtime = (file) => statSync(file).mtimeMs;

  it('leaves a file already holding the text untouched, its mtime too', async () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    const same = join(dir, 'same.ts');
    const changed = join(dir, 'changed.ts');
    aged(same, 'unchanged\n');
    aged(changed, 'last run\n');
    deferWrites();
    writeGenerated(same, 'unchanged\n');
    writeGenerated(changed, 'this run\n');
    writeGenerated(join(dir, 'new.ts'), 'new\n');

    const written = await commitGenerated();

    expect(written.map((p) => p.split('/').pop()).sort()).toEqual([
      'changed.ts',
      'new.ts',
    ]);
    expect(mtime(same)).toBe(past.getTime());
    expect(mtime(changed)).not.toBe(past.getTime());
    expect(readFileSync(changed, 'utf8')).toBe('this run\n');
  });

  it('compares the formatted text, so an unformatted output of an unchanged file writes nothing', async () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    const file = join(dir, 'theme.ts');
    // As Prettier leaves it under the repository's config: single quotes, trailing commas.
    aged(file, "export const theme = { a: 'x', b: [1, 2] };\n");
    deferWrites();
    writeGenerated(file, 'export const theme = {a:"x",b:[1,2]}');

    const written = await commitGenerated(
      async (held) =>
        new Map(
          await Promise.all(
            [...held].map(async ([path, text]) => [
              path,
              await formatWithPrettier(path, text),
            ]),
          ),
        ),
    );

    expect(written).toEqual([]);
    expect(mtime(file)).toBe(past.getTime());
  });

  it('writes the formatted text where it differs', async () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    const file = join(dir, 'theme.ts');
    aged(file, "export const theme = { a: 'x' };\n");
    deferWrites();
    writeGenerated(file, 'export const theme = {a:"y"}');

    const written = await commitGenerated(
      async (held) =>
        new Map([[file, await formatWithPrettier(file, held.get(file))]]),
    );

    expect(written).toHaveLength(1);
    expect(readFileSync(file, 'utf8')).toBe(
      "export const theme = { a: 'y' };\n",
    );
  });

  it('writes nothing when the formatter throws', async () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    const file = join(dir, 'broken.ts');
    aged(file, 'last run\n');
    deferWrites();
    writeGenerated(file, 'export const = ;');

    await expect(
      commitGenerated(
        async (held) =>
          new Map([[file, await formatWithPrettier(file, held.get(file))]]),
      ),
    ).rejects.toThrow();
    expect(readFileSync(file, 'utf8')).toBe('last run\n');
  });
});

describe('pruneGenerated', () => {
  it('removes what this run did not write, and keeps what it did', () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    writeGenerated(join(dir, 'kept.ts'), 'current');
    // Left over from an earlier run: an icon that no longer exists in Figma.
    mkdirSync(join(dir, 'gone'), { recursive: true });
    writeFileSync(join(dir, 'gone', 'IconRetired.tsx'), 'stale');
    writeFileSync(join(dir, 'stale.json'), 'stale');

    const removed = pruneGenerated(dir);

    expect(removed.map((p) => p.split('/').pop()).sort()).toEqual([
      'IconRetired.tsx',
      'stale.json',
    ]);
    expect(readFileSync(join(dir, 'kept.ts'), 'utf8')).toBe('current');
    expect(
      existsSync(join(dir, 'gone')),
      'an emptied directory is removed',
    ).toBe(false);
  });

  it('is held to the same guard as a write', () => {
    expect(() => pruneGenerated(join(repoRoot, 'docs'))).toThrow(
      /read-only to the generator/,
    );
  });
});

describe('formatDart', () => {
  const hasDart = spawnSync('dart', ['--version']).status === 0;

  // A Dart package of its own inside the repository, as the mirror sits in its package root.
  const dartPackage = () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    writeFileSync(
      join(dir, 'pubspec.yaml'),
      "name: tmp\nenvironment:\n  sdk: '>=3.13.0 <4.0.0'\n",
    );
    return dir;
  };
  const mirrorsLeft = (dir) =>
    readdirSync(join(dir, '.dart_tool')).filter((name) =>
      name.startsWith('solar-codegen-format'),
    );

  it.skipIf(!hasDart)(
    'formats in a mirror inside the package, leaving the real file alone',
    () => {
      const dir = dartPackage();
      const file = join(dir, 'lib', 'a.dart');

      const out = formatDart(new Map([[file, 'const  a=1;']]));

      expect(out.get(file)).toBe('const a = 1;\n');
      expect(existsSync(file), 'the real file is not written').toBe(false);
      expect(mirrorsLeft(dir), 'the mirror is removed').toEqual([]);
    },
  );

  it.skipIf(!hasDart)(
    'throws on Dart it cannot format, and that is not a missing SDK',
    () => {
      const dir = dartPackage();
      const file = join(dir, 'lib', 'a.dart');
      let error;
      try {
        formatDart(new Map([[file, 'const a = ;']]));
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(isMissingSdk(error)).toBe(false);
      expect(mirrorsLeft(dir), 'the mirror is removed').toEqual([]);
    },
  );

  it('throws a missing-SDK error when dart is not on PATH', () => {
    const dir = dartPackage();
    const file = join(dir, 'lib', 'a.dart');
    const path = process.env.PATH;
    process.env.PATH = join(dir, 'no-such-bin');
    let error;
    try {
      formatDart(new Map([[file, 'const a = 1;']]));
    } catch (e) {
      error = e;
    } finally {
      process.env.PATH = path;
    }
    expect(isMissingSdk(error)).toBe(true);
    expect(mirrorsLeft(dir), 'the mirror is removed').toEqual([]);
  });
});
