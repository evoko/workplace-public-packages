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

const ignoreList = z
  .array(propertyName)
  .min(1)
  .refine(
    (props) => new Set(props).size === props.length,
    'must not repeat a property',
  )
  .optional();

/** `targets.tailwind` hints. */
export const tailwindHintsSchema = z.strictObject({
  /** Properties the Tailwind output omits for this component (coverage reports `partial`). */
  ignore: ignoreList,
});

const muiPropName = z
  .string()
  .regex(/^[a-zA-Z][A-Za-z0-9]*$/, 'must be an MUI prop or class key');
const muiComponentName = z
  .string()
  .regex(
    /^[A-Z][A-Za-z0-9]*$/,
    'must be the PascalCase export name of an MUI component (e.g. Button)',
  );
const dsName = z.string().regex(IDENTIFIER_PATTERN, 'must be kebab-case');
const jsonScalar = z.union([z.string(), z.number(), z.boolean()]);

/**
 * `targets.mui` hints. `{}` generates an own React component. `component`
 * maps the design-system component onto that MUI component: `axisMap`
 * (axis → MUI prop, every axis), `slotMap` (slot → MUI class key such as
 * `startIcon`, every non-root slot), `defaultProps` (extra MUI props). The
 * catalog (`bwp-ds capture-defaults --target mui`) validates the names.
 */
export const muiHintsSchema = z
  .strictObject({
    ignore: ignoreList,
    component: muiComponentName.optional(),
    axisMap: z.record(dsName, muiPropName).optional(),
    slotMap: z.record(dsName, muiPropName).optional(),
    defaultProps: z.record(muiPropName, jsonScalar).optional(),
  })
  .superRefine((hints, ctx) => {
    if (hints.component !== undefined) {
      return;
    }
    for (const key of ['axisMap', 'slotMap', 'defaultProps'] as const) {
      if (hints[key] !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: 'requires "component"',
        });
      }
    }
  });

/** Until its plugin lands, flutter accepts any object, except a malformed `excluded`. */
const permissiveHints = z
  .record(z.string(), z.unknown())
  .refine(
    (o) => !Object.hasOwn(o, 'excluded'),
    'excluded must be a non-empty string',
  );

export const TARGET_HINT_SCHEMAS: Record<TargetId, z.ZodType> = {
  tailwind: tailwindHintsSchema,
  mui: muiHintsSchema,
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
