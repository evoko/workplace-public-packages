import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { z } from 'zod';
import type { Diagnostics, SourceLocation } from '../../errors.js';
import { stableStringify } from '../../ir/serialize.js';
import { CATALOGS_DIR } from '../../paths.js';
import type { PluginContext } from '../plugin.js';
import { MUI_PACKAGE } from './framework.js';
import { MUI_ID } from './hints.js';

export const CATALOG_FILE = `${MUI_ID}.json`;
export const CATALOG_AT: SourceLocation = {
  file: `${CATALOGS_DIR}/${CATALOG_FILE}`,
  line: 1,
  column: 1,
};

export function catalogPathFor(rootDir: string): string {
  return join(rootDir, CATALOGS_DIR, CATALOG_FILE);
}

/** One flattened CSS rule MUI emitted, relative to the rendered element: `&` is the root, `& .MuiButton-startIcon` a slot. */
export interface MuiCatalogRule {
  /** `@media` params (`(hover: hover)`), or null at the top level. */
  media: string | null;
  selector: string;
  /** Property (as emitted, kebab-case, vendor prefixes and shorthands intact) to value text. */
  declarations: Record<string, string>;
}

/** The rules captured for one full assignment of the design system's axes. */
export interface MuiCatalogRender {
  axes: Record<string, string>;
  rules: MuiCatalogRule[];
}

export type MuiCatalogScalar = string | number | boolean;

export interface MuiCatalogProp {
  /** `union`: an `OverridableStringUnion` prop; `other`: anything else. */
  kind: 'union' | 'other';
  /** The declared type text, for messages and the children check. */
  type: string;
  /** The `@default` JSDoc value without quotes, or null. */
  default: string | null;
  /** `union` only: MUI's default members and the overrides interface to augment. */
  values?: string[];
  overrides?: string;
}

/** Facts about one MUI component, independent of the design system. */
export interface MuiFrameworkComponent {
  themeKey: string;
  /** `<camel>Classes` keys to class names: `startIcon` → `MuiButton-startIcon`. */
  classes: Record<string, string>;
  /** Every own prop (including ButtonBase's when the component extends it). */
  props: Record<string, MuiCatalogProp>;
}

/**
 * Facts learned by rendering a component bare (no explicit props) under a
 * theme carrying only this mapping's own `defaultProps`. They depend on the
 * mapping, not on the MUI component in the abstract: a clickable Chip's
 * root is a `ButtonBase`, a plain Chip's is not, even though both map onto
 * the same MUI `Chip`.
 */
export interface MuiProbeFacts {
  /** The actual DOM tag of the root (Typography's types default to `span`, but it renders `<p>` for `variant="body1"`). */
  rootElement: string;
  /** Whether the root carries `MuiButtonBase-root` (relevant for parity ripple props on a component that does not declare them itself). */
  buttonBase: boolean;
}

/** What was rendered for one design-system component. */
export interface MuiCatalogComponent extends MuiProbeFacts {
  component: string;
  axisMap: Record<string, string>;
  slotMap: Record<string, string>;
  defaultProps: Record<string, MuiCatalogScalar>;
  renders: MuiCatalogRender[];
}

export interface MuiCatalog {
  generated: string;
  framework: { name: typeof MUI_PACKAGE; version: string };
  frameworkComponents: Record<string, MuiFrameworkComponent>;
  /** By design-system component name. */
  components: Record<string, MuiCatalogComponent>;
}

const scalar = z.union([z.string(), z.number(), z.boolean()]);
const stringRecord = z.record(z.string(), z.string());

export const muiCatalogSchema = z.strictObject({
  generated: z.string(),
  framework: z.strictObject({
    name: z.literal(MUI_PACKAGE),
    version: z.string().regex(/^\d+\.\d+\.\d+/),
  }),
  frameworkComponents: z.record(
    z.string(),
    z.strictObject({
      themeKey: z.string(),
      classes: stringRecord,
      props: z.record(
        z.string(),
        z.strictObject({
          kind: z.enum(['union', 'other']),
          type: z.string(),
          default: z.string().nullable(),
          values: z.array(z.string()).optional(),
          overrides: z.string().optional(),
        }),
      ),
    }),
  ),
  components: z.record(
    z.string(),
    z.strictObject({
      component: z.string(),
      axisMap: stringRecord,
      slotMap: stringRecord,
      defaultProps: z.record(z.string(), scalar),
      rootElement: z.string(),
      buttonBase: z.boolean(),
      renders: z.array(
        z.strictObject({
          axes: stringRecord,
          rules: z.array(
            z.strictObject({
              media: z.string().nullable(),
              selector: z.string(),
              declarations: stringRecord,
            }),
          ),
        }),
      ),
    }),
  ),
});

export function catalogHeaderText(
  compilerVersion: string,
  muiVersion: string,
): string {
  return `Captured by @bwp-web/ds-compiler ${compilerVersion} for target mui from ${MUI_PACKAGE} ${muiVersion}. Do not edit; run bwp-ds capture-defaults --target mui.`;
}

/**
 * Resolves and reads `@mui/material/package.json` with `req`. Shared by
 * `installedMuiVersion` (a throwaway `require`, just for the version) and
 * the capture runtime (which also needs `muiDir` to read `.d.ts` files and
 * load components from the same resolved package).
 */
export function resolveMuiPackage(
  req: NodeJS.Require,
): { version: string; muiDir: string } | null {
  try {
    const pkgFile = req.resolve(`${MUI_PACKAGE}/package.json`);
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8')) as {
      version?: unknown;
    };
    return typeof pkg.version === 'string'
      ? { version: pkg.version, muiDir: dirname(pkgFile) }
      : null;
  } catch {
    return null;
  }
}

/** The `@mui/material` version resolvable from `outDir` (the target package), or null. */
export function installedMuiVersion(outDir: string): string | null {
  const req = createRequire(join(outDir, 'resolve.cjs'));
  return resolveMuiPackage(req)?.version ?? null;
}

/**
 * Reads `catalogs/mui.json`. Absent file: null, no diagnostic (the model
 * reports DS-E086 only when a mapped component needs it). Invalid JSON or
 * shape: DS-E086 and null. Version differing from the installed
 * `@mui/material`: DS-E086 and null, or DS-W004 with
 * `allowCatalogMismatch`. Unresolvable `@mui/material`: DS-W004.
 */
export function loadMuiCatalog(
  ctx: PluginContext,
  diag: Diagnostics,
): MuiCatalog | null {
  const path = catalogPathFor(ctx.rootDir);
  if (!existsSync(path)) {
    return null;
  }
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: ${CATALOG_AT.file} could not be read: ${(err as Error).message}`,
      CATALOG_AT,
    );
    return null;
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: ${CATALOG_AT.file} is not valid JSON: ${(err as Error).message}`,
      CATALOG_AT,
    );
    return null;
  }
  const checked = muiCatalogSchema.safeParse(json);
  if (!checked.success) {
    const issues = checked.error.issues
      .map(
        (i) => `${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`,
      )
      .join('; ');
    diag.add(
      'DS-E086',
      `mui: ${CATALOG_AT.file} does not match the catalog schema: ${issues}`,
      CATALOG_AT,
    );
    return null;
  }
  const catalog = checked.data as MuiCatalog;
  const installed = installedMuiVersion(ctx.outDir);
  if (installed === null) {
    diag.add(
      'DS-W004',
      `mui: ${MUI_PACKAGE} could not be resolved from ${ctx.outDir}; the catalog's version ${catalog.framework.version} is unverified`,
      CATALOG_AT,
    );
  } else if (installed !== catalog.framework.version) {
    const text = `mui: catalog captured from ${MUI_PACKAGE} ${catalog.framework.version} but ${installed} is installed`;
    if (ctx.allowCatalogMismatch) {
      diag.add(
        'DS-W004',
        `${text}; accepted by --allow-catalog-mismatch`,
        CATALOG_AT,
      );
    } else {
      diag.add(
        'DS-E086',
        `${text}; run bwp-ds capture-defaults --target mui`,
        CATALOG_AT,
      );
      return null;
    }
  }
  return catalog;
}

/** The render for exactly these axis values, or null. */
export function findRender(
  component: MuiCatalogComponent,
  axes: Record<string, string>,
): MuiCatalogRender | null {
  const key = stableStringify(axes);
  return component.renders.find((r) => stableStringify(r.axes) === key) ?? null;
}
