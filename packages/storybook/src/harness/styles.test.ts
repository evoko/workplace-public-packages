import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { hostScoped } from './styles';

// `TARGET_CSS` is built from `?inline` imports, which Vite only resolves in
// the browser project (the Tailwind entry additionally needs PostCSS), so the
// unit test reads the CSS package's real stylesheet from disk and covers the
// compiled Tailwind shapes with literals.
const CSS_PACKAGE = fileURLToPath(
  new URL('../../../styles-css/dist/styles.css', import.meta.url),
);

function readCssPackage(): string {
  try {
    return readFileSync(CSS_PACKAGE, 'utf8');
  } catch (error) {
    throw new Error(
      `${CSS_PACKAGE} is missing; run \`npm run build -w @bwp-web/styles-css\` first`,
      { cause: error },
    );
  }
}

const cssPackage = readCssPackage();

describe('hostScoped', () => {
  it('leaves no :root rule in the real CSS package stylesheet', () => {
    expect(cssPackage).toContain(':root');
    const scoped = hostScoped(cssPackage);
    expect(scoped).not.toContain(':root');
    expect(scoped).toContain(":host([data-bwp-theme='dark'])");
  });

  it('leaves component rules untouched', () => {
    expect(hostScoped(cssPackage)).toContain('.bwp-button');
  });

  it('rewrites every selector shape the targets emit', () => {
    expect(hostScoped(':root { --a: 1 }')).toBe(':host { --a: 1 }');
    expect(hostScoped(":root[data-x='dark'] {}")).toBe(
      ":host([data-x='dark']) {}",
    );
    expect(hostScoped(':root[data-x="dark"] {}')).toBe(
      ':host([data-x="dark"]) {}',
    );
    // Tailwind's compiled `@theme` block; the duplicate `:host` is harmless.
    expect(hostScoped(':root, :host {}')).toBe(':host, :host {}');
    expect(hostScoped('.bwp-button { color: red }')).toBe(
      '.bwp-button { color: red }',
    );
  });
});
