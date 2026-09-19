import { readFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { z } from 'zod';
import type { Diagnostics, SourceLocation } from './errors.js';
import { IDENTIFIER_PATTERN } from './identifiers.js';
import { SRC_DIR } from './paths.js';

export const CONFIG_FILE = 'ds.config.json';

const relativePosixPath = z
  .string()
  .min(1)
  .refine(
    (p) => !isAbsolute(p) && !p.includes('\\'),
    'must be a relative POSIX path',
  );

const rawConfigSchema = z.strictObject({
  name: z.string().min(1),
  prefix: z
    .string()
    .regex(
      /^[a-z][a-z0-9]*$/,
      'prefix must be lowercase letters and digits, starting with a letter',
    ),
  modes: z
    .array(z.string().regex(/^[a-z][a-z0-9-]*$/))
    .min(1)
    .refine((m) => new Set(m).size === m.length, 'modes must be unique'),
  defaultMode: z.string(),
  rootFontSize: z.number().positive().default(16),
  modeSelector: z
    .string()
    .refine((s) => s.includes('{mode}'), 'modeSelector must contain {mode}')
    .optional(),
  targets: z
    .record(
      z.string().regex(IDENTIFIER_PATTERN, 'target ids are kebab-case'),
      z.strictObject({
        /**
         * Where this target's generated files go, relative to the source
         * root; must resolve outside src/ and must not be the root itself or
         * an ancestor of it. The directory is owned by the generator: every
         * file it did not produce there, at any depth and including
         * dotfiles, is deleted.
         */
        outDir: relativePosixPath.optional(),
        /** Free-form string options a plugin reads (the stories plugin needs `muiPackage`). */
        options: z.record(z.string(), z.string()).optional(),
      }),
    )
    .default({}),
  /**
   * Where `bwp-ds verify` writes the coverage report, relative to the source
   * root; must be a `.md` file and must not resolve to or inside src/.
   */
  coverageFile: relativePosixPath.default('coverage.md'),
  /**
   * How `bwp-ds verify --rendered` runs the rendered-parity check: a shell
   * command and the directory (relative to the source root) to run it in.
   */
  rendered: z
    .strictObject({
      cwd: relativePosixPath,
      command: z.string().min(1),
      /** Milliseconds before the command is killed; default 600000 (10 minutes). */
      timeoutMs: z.number().int().positive().optional(),
    })
    .optional(),
});

export interface DsConfig {
  name: string;
  prefix: string;
  modes: string[];
  defaultMode: string;
  rootFontSize: number;
  modeSelector: string;
  targets: Record<
    string,
    { outDir?: string; options?: Record<string, string> }
  >;
  coverageFile: string;
  rendered?: { cwd: string; command: string; timeoutMs?: number };
}

export function defaultModeSelector(prefix: string): string {
  return `:root[data-${prefix}-theme="{mode}"]`;
}

export function loadConfig(
  rootDir: string,
  diag: Diagnostics,
): DsConfig | null {
  const file = join(rootDir, CONFIG_FILE);
  const at: SourceLocation = { file: CONFIG_FILE, line: 1, column: 1 };

  let contents: string;
  try {
    contents = readFileSync(file, 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      diag.add('DS-E001', `${CONFIG_FILE} not found in ${rootDir}`);
      return null;
    }
    diag.add(
      'DS-E001',
      `${CONFIG_FILE} could not be read: ${(err as Error).message}`,
      at,
    );
    return null;
  }

  if (contents.charCodeAt(0) === 0xfeff) {
    contents = contents.slice(1);
  }

  let json: unknown;
  try {
    json = JSON.parse(contents);
  } catch (err) {
    diag.add(
      'DS-E001',
      `${CONFIG_FILE} is not valid JSON: ${(err as Error).message}`,
      at,
    );
    return null;
  }
  const parsed = rawConfigSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    diag.add('DS-E001', `${CONFIG_FILE} is invalid: ${issues}`, at);
    return null;
  }
  const raw = parsed.data;
  if (!raw.modes.includes(raw.defaultMode)) {
    diag.add(
      'DS-E001',
      `${CONFIG_FILE} is invalid: defaultMode "${raw.defaultMode}" is not one of modes [${raw.modes.join(', ')}]`,
      at,
    );
    return null;
  }
  // Case-folded so the guard rejects the same configs on a case-insensitive
  // filesystem (macOS, Windows) as it does on case-sensitive Linux CI.
  const fold = (p: string) => p.toLowerCase();
  const srcDir = resolve(rootDir, SRC_DIR);
  for (const [id, targetConfig] of Object.entries(raw.targets)) {
    const outDir = targetConfig.outDir;
    if (outDir === undefined) {
      continue;
    }
    const abs = resolve(rootDir, outDir);
    // outDir must not be the root or an ancestor of it (relative(abs, rootDir)
    // not starting with ".." means rootDir is at or below abs), and must not
    // be src/ itself or anything inside it (the same test against srcDir).
    const rootInsideOutDir = !relative(fold(abs), fold(rootDir)).startsWith(
      '..',
    );
    const outDirInsideSrc = !relative(fold(srcDir), fold(abs)).startsWith('..');
    if (rootInsideOutDir || outDirInsideSrc) {
      diag.add(
        'DS-E001',
        `targets.${id}.outDir "${outDir}" must be a directory outside the source root's src/ and not the root itself or a parent of it; generate deletes files it did not produce there`,
        at,
      );
      return null;
    }
  }
  const absCoverage = resolve(rootDir, raw.coverageFile);
  const coverageInsideSrc = !relative(
    fold(srcDir),
    fold(absCoverage),
  ).startsWith('..');
  if (coverageInsideSrc || !raw.coverageFile.toLowerCase().endsWith('.md')) {
    diag.add(
      'DS-E001',
      `coverageFile "${raw.coverageFile}" must be a .md file outside the source root's src/`,
      at,
    );
    return null;
  }
  return {
    name: raw.name,
    prefix: raw.prefix,
    modes: raw.modes,
    defaultMode: raw.defaultMode,
    rootFontSize: raw.rootFontSize,
    modeSelector: raw.modeSelector ?? defaultModeSelector(raw.prefix),
    targets: raw.targets,
    coverageFile: raw.coverageFile,
    ...(raw.rendered ? { rendered: raw.rendered } : {}),
  };
}

export function modeSelectorFor(config: DsConfig, mode: string): string {
  return config.modeSelector.replaceAll('{mode}', mode);
}
