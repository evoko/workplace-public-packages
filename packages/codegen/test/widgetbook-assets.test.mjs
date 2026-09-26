import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packagesDir } from '../src/util/paths.mjs';

// `flutter analyze` fails on an asset directory the pubspec declares that does not exist. The
// Widgetbook app's oracles, assets/verify/, are copied in by scripts/widgetbook.mjs and
// git-ignored, so on a fresh checkout (CI analyses before it builds) the directory was missing and
// the Dart job failed for many commits while every local run, where the copy existed, passed. So
// every declared directory must be in git itself, whatever is copied into it later.

const app = join(packagesDir, 'solar_flutter', 'widgetbook');

/** The asset directories the app's pubspec declares (`flutter: assets:`), relative to the app. */
const declared = () => {
  const lines = readFileSync(join(app, 'pubspec.yaml'), 'utf8').split('\n');
  const start = lines.findIndex((l) => /^\s+assets:\s*$/.test(l));
  const dirs = [];
  for (const line of lines.slice(start + 1)) {
    const m = line.match(/^\s+-\s+(\S+\/)\s*$/);
    if (!m) break;
    dirs.push(m[1]);
  }
  return dirs;
};

describe('Widgetbook assets', () => {
  it('declares the oracles directory', () => {
    expect(declared()).toContain('assets/verify/');
  });

  it('keeps every declared asset directory in git, so a fresh checkout analyses clean', () => {
    for (const dir of declared()) {
      // Tracked, or new and not ignored: either is what the next commit puts in a checkout.
      const kept = execFileSync(
        'git',
        ['ls-files', '--cached', '--others', '--exclude-standard', '--', dir],
        {
          cwd: app,
          encoding: 'utf8',
        },
      ).trim();
      expect(kept, dir).not.toBe('');
    }
  });
});
