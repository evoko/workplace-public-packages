// Formats generated text in memory, before it is written, so a run can compare each output with
// the file on disk and leave an unchanged one untouched (src/util/write.mjs, commitGenerated).
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import * as prettier from 'prettier';

/**
 * The text as `prettier --write` would leave the file at `path`: the same Prettier (the
 * repository's), the same config resolution, EditorConfig included as the CLI does.
 */
export async function formatWithPrettier(path, text) {
  const config = await prettier.resolveConfig(path, { editorconfig: true });
  return prettier.format(text, { ...config, filepath: path });
}

// The Dart package a file belongs to: the nearest directory above it holding a pubspec.yaml.
function packageRoot(path) {
  for (let dir = dirname(path); dir !== dirname(dir); dir = dirname(dir))
    if (existsSync(join(dir, 'pubspec.yaml'))) return dir;
  throw new Error(`no pubspec.yaml above ${path}`);
}

/** Whether `error` says the `dart` executable could not be started: the SDK is not on PATH. */
export const isMissingSdk = (error) =>
  error?.code === 'ENOENT' && Boolean(error.syscall?.startsWith('spawn'));

/**
 * The files (a Map, path -> Dart source) as `dart format` leaves them, in one `dart format` run.
 *
 * Each file is written to a mirror inside its own package's `.dart_tool/`, so the formatter
 * resolves the same language version (the package config) and the same page width
 * (analysis_options.yaml) as it would for the file itself, and the real files are not touched.
 * The mirror is this process's own, so two runs at once never share one. Throws when `dart
 * format` cannot run (the SDK is not on PATH: `isMissingSdk`) or fails.
 */
export function formatDart(files) {
  if (files.size === 0) return new Map();
  const mirrors = new Map();
  const roots = new Set();
  for (const path of files.keys()) {
    const root = packageRoot(path);
    const mirrorRoot = join(
      root,
      '.dart_tool',
      `solar-codegen-format-${process.pid}`,
    );
    roots.add(mirrorRoot);
    mirrors.set(path, join(mirrorRoot, relative(root, path)));
  }
  try {
    for (const [path, mirror] of mirrors) {
      mkdirSync(dirname(mirror), { recursive: true });
      writeFileSync(mirror, files.get(path));
    }
    execFileSync('dart', ['format', ...mirrors.values()], { stdio: 'ignore' });
    return new Map(
      [...mirrors].map(([path, mirror]) => [
        path,
        readFileSync(mirror, 'utf8'),
      ]),
    );
  } finally {
    for (const root of roots) rmSync(root, { recursive: true, force: true });
  }
}
