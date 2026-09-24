import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as stage from '../src/stages/components.mjs';
import {
  FLUTTER_TEMPLATES,
  scaffold,
  scaffoldFlutter,
  scaffoldStory,
  storiesDir,
  storyFileOf,
  storyTemplate,
  TEMPLATES,
} from '../src/scaffold/index.mjs';
import { mkdirSync } from 'node:fs';

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

  it('leaves the package entry alone: its list of components is generated (solar:codegen)', () => {
    const dir = fresh();
    writeFileSync(join(dir, 'index.ts'), "export * from './Other.js';\n");
    scaffold(button, { dir });
    expect(readFileSync(join(dir, 'index.ts'), 'utf8')).toBe(
      "export * from './Other.js';\n",
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

describe('scaffoldFlutter', () => {
  const freshLib = () => {
    const lib = mkdtempSync(join(tmpdir(), 'solar-flutter-'));
    scratch.push(lib);
    mkdirSync(join(lib, 'src'), { recursive: true });
    writeFileSync(
      join(lib, 'solar_flutter.dart'),
      "library;\n\nexport 'src/generated/tokens.dart';\nexport 'src/solar_icon.dart';\n",
    );
    return lib;
  };

  it('writes the widget once, and leaves the library alone: its list is generated', () => {
    const lib = freshLib();
    const before = readFileSync(join(lib, 'solar_flutter.dart'), 'utf8');
    expect(scaffoldFlutter(button, { lib }).status).toBe('written');
    expect(scaffoldFlutter(button, { lib }).status).toBe('exists');
    expect(readFileSync(join(lib, 'solar_flutter.dart'), 'utf8')).toBe(before);
  });

  it('gives the widget the IR’s props and slots, and no design value', () => {
    const widget = FLUTTER_TEMPLATES.Button(button);
    for (const prop of Object.keys(button.api))
      expect(widget).toMatch(new RegExp(`this\\.${prop} = `));
    for (const slot of ['iconLeading', 'iconTrailing', 'counter'])
      expect(widget).toContain(`this.${slot},`);
    expect(widget).toContain('style: SolarButtonRecipe.style(t, p)');
    const code = widget.replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(
      /Color\(0x|Colors\.(?!transparent)|EdgeInsets|fontSize|(width|height|size):\s*\d/,
    );
  });

  it('refuses a component with no widget template', () => {
    expect(() =>
      scaffoldFlutter({ ...button, component: 'Tabs' }, { lib: freshLib() }),
    ).toThrow(/no Flutter widget template for Tabs/);
  });
});

describe('scaffoldStory', () => {
  it('writes a story file that names the component, once', () => {
    const dir = fresh();
    expect(scaffoldStory(button, { dir }).status).toBe('written');
    const file = join(dir, 'Button.stories.tsx');
    expect(readFileSync(file, 'utf8')).toBe(storyTemplate('Button'));
    writeFileSync(file, '// mine\n');
    expect(scaffoldStory(button, { dir }).status).toBe('exists');
    expect(readFileSync(file, 'utf8')).toBe('// mine\n');
    expect(storyFileOf('Icon Button')).toBe('IconButton.stories.tsx');
  });

  it('has written one for every generated component', () => {
    for (const component of stage.NAMES) {
      const story = readFileSync(
        join(storiesDir, storyFileOf(component)),
        'utf8',
      );
      expect(story, component).toContain(`title: 'SOLAR/${component}'`);
    }
  });
});
