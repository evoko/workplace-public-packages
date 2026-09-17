import { z } from 'zod';
import { PROPERTY_TABLE } from '../components/properties.js';
import { IDENTIFIER_PATTERN } from '../identifiers.js';

/** Every target id the manifest knows about, implemented or not. */
export const TARGET_IDS = ['tailwind', 'mui', 'flutter'] as const;
export type TargetId = (typeof TARGET_IDS)[number];

const propertyName = z
  .string()
  .refine(
    (p) => Object.hasOwn(PROPERTY_TABLE, p),
    'must be a property from the compiler property table',
  );

/** `targets.tailwind` hints. */
export const tailwindHintsSchema = z.strictObject({
  /** Properties the Tailwind output omits for this component (coverage reports `partial`). */
  ignore: z
    .array(propertyName)
    .min(1)
    .refine(
      (props) => new Set(props).size === props.length,
      'must not repeat a property',
    )
    .optional(),
});

/** Until their plugins land, mui and flutter accept any object, except a malformed `excluded`. */
const permissiveHints = z
  .record(z.string(), z.unknown())
  .refine(
    (o) => !Object.hasOwn(o, 'excluded'),
    'excluded must be a non-empty string',
  );

export const TARGET_HINT_SCHEMAS: Record<TargetId, z.ZodType> = {
  tailwind: tailwindHintsSchema,
  mui: permissiveHints,
  flutter: permissiveHints,
};

export const excludedSchema = z.strictObject({ excluded: z.string().min(1) });

function hintsOrExcluded(hints: z.ZodType): z.ZodType {
  return z.union([excludedSchema, hints]);
}

/** Unknown target ids are allowed and get the permissive shape, so a manifest can be written ahead of a plugin. */
export const targetsSchema = z
  .object(
    Object.fromEntries(
      TARGET_IDS.map((id) => [
        id,
        hintsOrExcluded(TARGET_HINT_SCHEMAS[id]).optional(),
      ]),
    ),
  )
  .catchall(hintsOrExcluded(permissiveHints))
  .superRefine((targets, ctx) => {
    for (const key of Object.keys(targets)) {
      if (!IDENTIFIER_PATTERN.test(key)) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: 'target id must be kebab-case',
        });
      }
    }
  });
