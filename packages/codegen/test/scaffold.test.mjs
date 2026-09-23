import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as stage from '../src/stages/components.mjs';
import { scaffold, TEMPLATES } from '../src/scaffold/index.mjs';

const button = stage
  .build()
  .built.find((b) => b.spec.component === 'Button').spec;
const shell = TEMPLATES.Button(button);

const scratch = [];
afterAll(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});
const fresh = () => {
  const dir = mkdtempSync(join(tmpdir(), 'solar-scaffold-'));
  scratch.push(dir);
  writeFileSync(join(dir, 'index.ts'), 'export {};\n');
  return dir;
};

describe('scaffold', () => {
  it('writes the shell once, and never over a file a developer owns', () => {
    const dir = fresh();
    expect(scaffold(button, { dir }).status).toBe('written');
    const file = join(dir, 'Button.tsx');
    writeFileSync(
      file,
      readFileSync(file, 'utf8') + '\n// a behaviour someone added\n',
    );
    expect(scaffold(button, { dir }).status).toBe('exists');
    expect(readFileSync(file, 'utf8')).toContain(
      '// a behaviour someone added',
    );
  });

  it('overwrites only when forced', () => {
    const dir = fresh();
    scaffold(button, { dir });
    writeFileSync(join(dir, 'Button.tsx'), '// edited');
    expect(scaffold(button, { dir, force: true }).status).toBe('overwritten');
    expect(readFileSync(join(dir, 'Button.tsx'), 'utf8')).toBe(shell);
  });

  it('exports the shell from the package entry, once, keeping what is there', () => {
    const dir = fresh();
    writeFileSync(join(dir, 'index.ts'), "export * from './Other.js';\n");
    scaffold(button, { dir });
    scaffold(button, { dir, force: true });
    expect(readFileSync(join(dir, 'index.ts'), 'utf8')).toBe(
      "export * from './Other.js';\nexport * from './Button.js';\n",
    );
    const empty = fresh();
    scaffold(button, { dir: empty });
    expect(readFileSync(join(empty, 'index.ts'), 'utf8')).toBe(
      "export * from './Button.js';\n",
    );
  });

  it('refuses a component with no template, rather than writing something generic', () => {
    expect(() =>
      scaffold({ ...button, component: 'Tabs' }, { dir: fresh() }),
    ).toThrow(/no shell template for Tabs/);
  });
});

describe('the Button shell', () => {
  it('takes its look from the recipe and holds no design value itself', () => {
    expect(shell).toContain("from '@bwp-web/styles/mui'");
    expect(shell).toContain('solarButtonStyle(');
    // The code, not the comments, which explain where the values come from.
    const code = shell
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(code).not.toMatch(/\d+px|var\(--solar/);
  });

  it('takes its props from the IR, so a renamed axis reaches it', () => {
    for (const prop of Object.keys(button.api))
      expect(shell).toContain(`    ${prop},`);
    expect(shell).toContain(
      'solarButtonStyle({ size, variant, disabled, loading, danger })',
    );
  });
});
