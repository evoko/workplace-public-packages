import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import {
  catalogHeaderText,
  catalogPathFor,
  findRender,
  installedMuiVersion,
  loadMuiCatalog,
  muiCatalogSchema,
} from '../src/targets/mui/catalog.js';
import { FX_CATALOG, catalogFile } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

/** The real styles-mui output directory: `@mui/material` resolves from here through the workspace install. */
const REAL_OUT_DIR = fileURLToPath(
  new URL('../../styles-mui/src/generated/', import.meta.url),
);

function ctxFor(root: string, allow = false) {
  const { config } = twBuild(root);
  return { ...twContext(root, config), allowCatalogMismatch: allow };
}

describe('mui catalog', () => {
  it('is absent without diagnostics when the file does not exist', () => {
    const root = twRoot();
    const diag = new Diagnostics();
    expect(loadMuiCatalog(ctxFor(root), diag)).toBeNull();
    expect(diag.items).toEqual([]);
    expect(catalogPathFor(root)).toBe(join(root, 'catalogs', 'mui.json'));
  });

  it('accepts the fixture and warns DS-W004 when @mui/material cannot be resolved from the outDir', () => {
    const root = twRoot(catalogFile());
    const diag = new Diagnostics();
    const catalog = loadMuiCatalog(ctxFor(root), diag);
    expect(catalog?.framework.version).toBe('9.4.0');
    expect(diag.errors).toEqual([]);
    expect(diag.warnings.map((w) => w.code)).toEqual(['DS-W004']);
    expect(diag.warnings[0].message).toContain('unverified');
    expect(muiCatalogSchema.safeParse(FX_CATALOG).success).toBe(true);
  });

  it('rejects invalid JSON and a wrong shape with DS-E086', () => {
    const bad = twRoot({ 'catalogs/mui.json': '{ nope' });
    const diag = new Diagnostics();
    expect(loadMuiCatalog(ctxFor(bad), diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].location?.file).toBe('catalogs/mui.json');

    const wrong = twRoot({
      'catalogs/mui.json': JSON.stringify({ ...FX_CATALOG, components: 3 }),
    });
    const diag2 = new Diagnostics();
    expect(loadMuiCatalog(ctxFor(wrong), diag2)).toBeNull();
    expect(diag2.errors[0].message).toContain(
      'does not match the catalog schema',
    );
  });

  it('resolves the installed @mui/material from the real styles-mui outDir', () => {
    expect(installedMuiVersion(REAL_OUT_DIR)).toMatch(/^\d+\.\d+\.\d+/);
    expect(installedMuiVersion('/nonexistent/dir')).toBeNull();
  });

  it('accepts the fixture cleanly against the real installed @mui/material', () => {
    const root = twRoot(catalogFile());
    const diag = new Diagnostics();
    const catalog = loadMuiCatalog(
      { ...ctxFor(root), outDir: REAL_OUT_DIR },
      diag,
    );
    expect(catalog).not.toBeNull();
    expect(diag.items).toEqual([]);
  });

  it('renders the catalog header text', () => {
    expect(catalogHeaderText('1.2.3', '9.4.0')).toContain('9.4.0');
    expect(catalogHeaderText('1.2.3', '9.4.0')).toContain('1.2.3');
  });

  it('fails DS-E086 on a version mismatch unless --allow-catalog-mismatch makes it DS-W004', () => {
    const root = twRoot(
      catalogFile({
        ...FX_CATALOG,
        framework: { name: '@mui/material', version: '0.0.1' },
      }),
    );
    const strict = { ...ctxFor(root), outDir: REAL_OUT_DIR };
    const diag = new Diagnostics();
    expect(loadMuiCatalog(strict, diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(diag.errors[0].message).toMatch(
      /captured from @mui\/material 0\.0\.1 but 9\.4\.\d+ is installed/,
    );

    const lenient = { ...ctxFor(root, true), outDir: REAL_OUT_DIR };
    const diag2 = new Diagnostics();
    expect(loadMuiCatalog(lenient, diag2)).not.toBeNull();
    expect(diag2.errors).toEqual([]);
    expect(diag2.warnings.map((w) => w.code)).toEqual(['DS-W004']);
  });

  it('finds a render by exact axes', () => {
    const btn = FX_CATALOG.components.btn;
    expect(findRender(btn, { tone: 'loud' })?.axes).toEqual({ tone: 'loud' });
    expect(findRender(btn, { tone: 'shout' })).toBeNull();
    expect(findRender(btn, {})).toBeNull();
  });
});
