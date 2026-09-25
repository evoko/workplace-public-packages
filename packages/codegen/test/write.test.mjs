import { afterAll, describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repoRoot } from '../src/util/paths.mjs';
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
  it('holds every write until committed, so a run that throws first rewrites nothing', () => {
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
      expect(commitGenerated()).toBe(2);
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

  it('refuses a commit with nothing deferred', () => {
    expect(() => commitGenerated()).toThrow(/no writes are deferred/);
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
