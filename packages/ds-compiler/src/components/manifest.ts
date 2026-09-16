import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { Diagnostics } from '../errors.js';
import type { ManifestTargets } from '../ir/types.js';
import { PROPERTY_TABLE } from './properties.js';

export const identifier = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    'must be kebab-case: lowercase letters and digits separated by single hyphens',
  );

/** Axis values and defaults may start with a digit (e.g. "2xl"), unlike other identifiers. */
const axisValue = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'must be lowercase letters and digits separated by single hyphens',
  );

const axisSchema = z.strictObject({
  values: z.array(axisValue).min(1),
  default: axisValue,
});

const slotSchema = z.strictObject({
  element: z
    .string()
    .regex(/^[a-z][a-z0-9-]*$/, 'must be an HTML element name')
    .default('span'),
  optional: z.boolean().default(false),
});

const excludedSchema = z.strictObject({ excluded: z.string().min(1) });

const targetHintsSchema = z.union([
  excludedSchema,
  z
    .record(z.string(), z.unknown())
    .refine(
      (o) => !Object.hasOwn(o, 'excluded'),
      'excluded must be a non-empty string',
    ),
]);

export const manifestSchema = z.strictObject({
  $schema: z.string().optional(),
  name: identifier,
  displayName: z.string().min(1),
  description: z.string().optional(),
  axes: z.record(identifier, axisSchema).default({}),
  states: z.array(identifier).default([]),
  slots: z.record(identifier, slotSchema).default({}),
  preview: z.record(z.string(), z.string()).default({}),
  baseline: z.union([z.literal(false), z.array(z.string())]).optional(),
  targets: z.record(identifier, targetHintsSchema).default({}),
});

export type Manifest = Omit<
  z.infer<typeof manifestSchema>,
  '$schema' | 'targets'
> & {
  targets: ManifestTargets;
};

export const MANIFEST_SUFFIX = '.manifest.json';

/**
 * Flattens Zod issues into "path: message" strings, descending into invalid_union
 * branches so a failure inside every branch (e.g. a malformed `excluded`) is reported.
 */
function flattenIssues(
  issues: readonly z.core.$ZodIssue[],
  basePath: PropertyKey[] = [],
): string[] {
  const out: string[] = [];
  for (const issue of issues) {
    const path = [...basePath, ...issue.path];
    if (issue.code === 'invalid_union') {
      for (const branch of issue.errors) {
        out.push(...flattenIssues(branch, path));
      }
      continue;
    }
    out.push(`${path.join('.') || '(root)'}: ${issue.message}`);
  }
  return out;
}

/** Validates already-parsed JSON. `expectedName` is the component directory name. */
export function parseManifest(
  json: unknown,
  filePath: string,
  expectedName: string,
  diag: Diagnostics,
): Manifest | null {
  const location = { file: filePath, line: 1, column: 1 };
  const parsed = manifestSchema.safeParse(json);
  const problems: string[] = [];
  if (!parsed.success) {
    problems.push(...flattenIssues(parsed.error.issues));
  }
  if (parsed.success) {
    const m = parsed.data;
    for (const [axis, def] of Object.entries(m.axes)) {
      if (!def.values.includes(def.default)) {
        problems.push(
          `axes.${axis}.default: "${def.default}" is not one of [${def.values.join(', ')}]`,
        );
      }
      if (new Set(def.values).size !== def.values.length) {
        problems.push(`axes.${axis}.values: duplicate values`);
      }
    }
    const seen = new Set<string>();
    for (const s of m.states) {
      if (seen.has(s)) {
        problems.push(`states: duplicate state "${s}"`);
      }
      seen.add(s);
    }
    if (m.slots.root?.optional === true) {
      problems.push('slots.root.optional: the root slot cannot be optional');
    }
    if (Array.isArray(m.baseline)) {
      for (const p of m.baseline) {
        if (!Object.hasOwn(PROPERTY_TABLE, p)) {
          problems.push(`baseline: unknown property "${p}"`);
        }
      }
    }
  }
  if (problems.length > 0) {
    diag.add('DS-E020', problems.join('; '), location);
    return null;
  }
  const data = parsed.data!;
  if (data.name !== expectedName) {
    diag.add(
      'DS-E021',
      `manifest.name "${data.name}" does not match component directory "${expectedName}"`,
      location,
    );
    return null;
  }
  const { $schema: _schema, ...rest } = data;
  const rawSlots =
    json !== null && typeof json === 'object'
      ? (json as Record<string, unknown>).slots
      : undefined;
  const rawRoot =
    rawSlots !== null && typeof rawSlots === 'object'
      ? (rawSlots as Record<string, unknown>).root
      : undefined;
  const rawRootHasElement =
    rawRoot !== null &&
    typeof rawRoot === 'object' &&
    Object.hasOwn(rawRoot as Record<string, unknown>, 'element');
  // The generic slot schema defaults `element` to "span"; the root slot's default is "div"
  // unless the author wrote an explicit element. slots.root.optional is always false here
  // because a `true` value was already turned into a DS-E020 problem above.
  const root = rest.slots.root
    ? {
        element: rawRootHasElement ? rest.slots.root.element : 'div',
        optional: false,
      }
    : { element: 'div', optional: false };
  const otherSlots = Object.fromEntries(
    Object.entries(rest.slots).filter(([k]) => k !== 'root'),
  );
  return {
    ...rest,
    slots: { root, ...otherSlots },
    targets: rest.targets as ManifestTargets,
  };
}

export function loadManifest(
  filePath: string,
  expectedName: string,
  diag: Diagnostics,
): Manifest | null {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    diag.add('DS-E020', `not valid JSON: ${(err as Error).message}`, {
      file: filePath,
      line: 1,
      column: 1,
    });
    return null;
  }
  return parseManifest(json, filePath, expectedName, diag);
}

export function manifestJsonSchema(): Record<string, unknown> {
  return {
    ...z.toJSONSchema(manifestSchema, { target: 'draft-2020-12', io: 'input' }),
    $id: 'https://github.com/evoko/workplace-public-packages/packages/ds-compiler/schemas/manifest.schema.json',
    title: 'Design-system component manifest',
  };
}
