import { readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { z } from 'zod';
import type { Diagnostics, SourceLocation } from './errors.js';
import { IDENTIFIER_PATTERN } from './identifiers.js';

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
        /** Where this target's generated files go, relative to the source root. */
        outDir: relativePosixPath.optional(),
      }),
    )
    .default({}),
  /** Where `bwp-ds verify` writes the coverage report, relative to the source root. */
  coverageFile: relativePosixPath.default('coverage.md'),
});

export interface DsConfig {
  name: string;
  prefix: string;
  modes: string[];
  defaultMode: string;
  rootFontSize: number;
  modeSelector: string;
  targets: Record<string, { outDir?: string }>;
  coverageFile: string;
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
  return {
    name: raw.name,
    prefix: raw.prefix,
    modes: raw.modes,
    defaultMode: raw.defaultMode,
    rootFontSize: raw.rootFontSize,
    modeSelector: raw.modeSelector ?? defaultModeSelector(raw.prefix),
    targets: raw.targets,
    coverageFile: raw.coverageFile,
  };
}

export function modeSelectorFor(config: DsConfig, mode: string): string {
  return config.modeSelector.replaceAll('{mode}', mode);
}
