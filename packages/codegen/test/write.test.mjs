import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repoRoot } from '../src/util/paths.mjs';
import { writeGenerated } from '../src/util/write.mjs';

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
