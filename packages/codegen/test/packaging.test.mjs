import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packagesDir } from '../src/util/paths.mjs';

// `import '@bwp-web/styles/tokens.css'` exists only for its side effect. A package that declares
// `"sideEffects": false` tells the bundler every import of it can be dropped when nothing is used
// from it, and webpack in production mode does exactly that, silently: the stylesheet vanishes
// from the build and every --solar-* variable is undefined. esbuild keeps CSS regardless, which is
// why nothing noticed. So every stylesheet a package exports must be named in its sideEffects.
const PUBLISHED = ['styles', 'assets', 'components', 'canvas'];

const read = (pkg) =>
  JSON.parse(readFileSync(join(packagesDir, pkg, 'package.json'), 'utf8'));

/** sideEffects globs as used by bundlers: a pattern without a slash matches the basename. */
const matches = (glob, path) => {
  const re = new RegExp(
    `^${glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '[^/]*')}$`,
  );
  return re.test(glob.includes('/') ? path : path.split('/').pop());
};

const exportTargets = (exports) =>
  typeof exports === 'string'
    ? [exports]
    : Object.values(exports ?? {}).flatMap(exportTargets);

describe('published packages', () => {
  for (const pkg of PUBLISHED) {
    it(`${pkg}: every exported stylesheet survives tree shaking`, () => {
      const { exports, sideEffects } = read(pkg);
      for (const target of exportTargets(exports).filter((t) =>
        t.endsWith('.css'),
      )) {
        const kept =
          sideEffects === true ||
          (Array.isArray(sideEffects) &&
            sideEffects.some((g) => matches(g, target)));
        expect(kept, `${target} is not listed in sideEffects`).toBe(true);
      }
    });
  }

  it('the check applies: styles does export a stylesheet', () => {
    expect(exportTargets(read('styles').exports)).toContain(
      './dist/tokens.css',
    );
  });
});
