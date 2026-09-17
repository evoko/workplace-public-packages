import { describe, expect, it } from 'vitest';
import { serializeIR } from '../src/ir/serialize.js';
import type { DesignIR } from '../src/ir/types.js';
import {
  ignoredForTailwind,
  isMappedForTailwind,
} from '../src/targets/tailwind/hints.js';
import {
  generateTailwind,
  renderComponents,
  renderTheme,
  tailwindHeader,
} from '../src/targets/tailwind/render.js';
import {
  TW_CONFIG,
  TW_FILES,
  body,
  twBuild,
  twContext,
  twRoot,
} from './tailwind-fixture.js';

const EXPECTED_THEME = `@theme static {
  --color-fx-neutral-900: #111111;
  --color-fx-text-default: var(--color-fx-neutral-900);
  --font-fx-body: 'Open Sans', Arial, sans-serif;
  --shadow-fx-focus: 0px 0px 0px 2px var(--color-fx-neutral-900);
  --spacing-fx-2: 8px;
}

:root[data-fx-theme="dark"] {
  --color-fx-text-default: #ffffff;
}
`;

const EXPECTED_COMPONENTS = `@layer components {
  .fx-chip {
    color: var(--color-fx-text-default);
    display: inline-flex;
    font-family: var(--font-fx-body);
    padding-bottom: var(--spacing-fx-2);
    padding-left: var(--spacing-fx-2);
    padding-right: var(--spacing-fx-2);
    padding-top: var(--spacing-fx-2);
  }

  .fx-chip:hover {
    box-shadow: var(--shadow-fx-focus);
  }

  .fx-chip:disabled {
    opacity: 0.4;
  }

  .fx-chip[data-tone="loud"] {
    min-width: 44px;
  }

  .fx-chip .fx-chip__icon {
    width: 20px;
  }

  .fx-tag {
    display: inline-block;
  }
}
`;

describe('tailwind generation', () => {
  const root = twRoot();
  const { ir, config } = twBuild(root);
  const ctx = twContext(root, config);

  it('renders the theme with namespaced variables, aliases, and a mode block', () => {
    const theme = renderTheme(ir, ctx);
    expect(theme.split('\n')[0]).toBe(tailwindHeader(ir, ctx));
    expect(theme.split('\n')[0]).toContain('0.0.0-test');
    expect(theme.split('\n')[0]).toContain(ir.meta.sourceHash);
    expect(body(theme)).toBe(EXPECTED_THEME);
  });

  it('renders components in cascade order, sorted declarations, and drops ignored, excluded, and empty rules', () => {
    expect(body(renderComponents(ir, ctx))).toBe(EXPECTED_COMPONENTS);
  });

  it('renders disabled by root element', () => {
    const divRoot = twRoot({
      'src/components/tag/tag.css':
        '.fx-tag {\n  display: inline-block;\n}\n.fx-tag[aria-disabled="true"] {\n  display: none;\n}\n',
    });
    const built = twBuild(divRoot);
    expect(
      renderComponents(built.ir, twContext(divRoot, built.config)),
    ).toContain('.fx-tag[aria-disabled="true"] {');
  });

  it('produces three files deterministically', () => {
    const a = generateTailwind(ir, ctx);
    const b = generateTailwind(twBuild(root).ir, ctx);
    expect(a.map((f) => f.path)).toEqual([
      'components.css',
      'index.css',
      'theme.css',
    ]);
    expect(a).toEqual(b);
    const index = a.find((f) => f.path === 'index.css')!;
    expect(body(index.contents)).toBe(
      "@import './theme.css';\n@import './components.css';\n",
    );
  });

  it('refuses two tokens that map to one variable name', () => {
    const clash = twRoot({
      'ds.config.json': TW_CONFIG.replace(
        '"prefix": "fx"',
        '"prefix": "weight"',
      ),
      'src/tokens/color.css':
        ':root {\n  --weight-color-neutral-900: #111111;\n}\n',
      'src/tokens/space.css': ':root {\n  --weight-space-2: 8px;\n}\n',
      'src/tokens/shadow.css':
        ':root {\n  --weight-shadow-focus: 0 0 0 2px #111111;\n}\n',
      'src/tokens/font-family.css':
        ':root {\n  --weight-font-family-weight-x: serif;\n}\n',
      'src/tokens/font-weight.css':
        ':root {\n  --weight-font-weight-x: 600;\n}\n',
      'src/components/chip/chip.css':
        '.weight-chip {\n  display: inline-flex;\n}\n',
      'src/components/tag/tag.css':
        '.weight-tag {\n  display: inline-block;\n}\n',
      'src/components/pill/pill.css':
        '.weight-pill {\n  display: inline-block;\n}\n',
    });
    const built = twBuild(clash);
    expect(() => renderTheme(built.ir, twContext(clash, built.config))).toThrow(
      /both map to the Tailwind variable --font-weight-weight-x/,
    );
    expect(() => renderTheme(built.ir, twContext(clash, built.config))).toThrow(
      /--weight-font-family-weight-x/,
    );
  });

  it('reads mapping and ignore hints', () => {
    expect(isMappedForTailwind(ir.components.chip)).toBe(true);
    expect(isMappedForTailwind(ir.components.pill)).toBe(false);
    expect([...ignoredForTailwind(ir.components.tag)]).toEqual(['opacity']);
    expect(ignoredForTailwind(ir.components.chip).size).toBe(0);
  });

  it('is byte-identical from the serialized IR and orders axes alphabetically', () => {
    const axesRoot = twRoot({
      'src/components/chip/chip.manifest.json': JSON.stringify({
        displayName: 'Chip',
        baseline: false,
        name: 'chip',
        axes: {
          tone: { values: ['quiet', 'loud'], default: 'quiet' },
          size: { values: ['sm', 'md'], default: 'md' },
        },
        states: ['hover', 'disabled'],
        slots: { root: { element: 'button' }, icon: { element: 'span' } },
        targets: { tailwind: {} },
      }),
      'src/components/chip/chip.css': `${TW_FILES['src/components/chip/chip.css']}.fx-chip[data-tone="loud"][data-size="sm"] {\n  min-height: 32px;\n}\n`,
    });
    const built = twBuild(axesRoot);
    const axesCtx = twContext(axesRoot, built.config);
    const fromSource = generateTailwind(built.ir, axesCtx);
    const fromSerialized = generateTailwind(
      JSON.parse(serializeIR(built.ir)) as DesignIR,
      axesCtx,
    );
    expect(fromSerialized).toEqual(fromSource);
    const components = fromSource.find((f) => f.path === 'components.css')!;
    expect(components.contents).toContain(
      '.fx-chip[data-size="sm"][data-tone="loud"] {',
    );
  });

  it('renders a very small number without exponential notation', () => {
    const tinyRoot = twRoot({
      'src/components/chip/chip.css': TW_FILES[
        'src/components/chip/chip.css'
      ].replace('opacity: 0.4;', 'opacity: 0.0000001;'),
    });
    const built = twBuild(tinyRoot);
    const tinyCtx = twContext(tinyRoot, built.config);
    expect(renderComponents(built.ir, tinyCtx)).toContain(
      'opacity: 0.0000001;',
    );
  });

  it('renders an empty layer with no blank line when nothing is mapped', () => {
    const emptyRoot = twRoot({
      'src/components/chip/chip.manifest.json': JSON.stringify({
        displayName: 'Chip',
        baseline: false,
        name: 'chip',
        axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
        states: ['hover', 'disabled'],
        slots: { root: { element: 'button' }, icon: { element: 'span' } },
        targets: { tailwind: { excluded: 'not mapped in this test' } },
      }),
      'src/components/tag/tag.manifest.json': JSON.stringify({
        displayName: 'X',
        baseline: false,
        name: 'tag',
        states: ['disabled'],
        targets: { tailwind: { excluded: 'not mapped in this test' } },
      }),
    });
    const built = twBuild(emptyRoot);
    const emptyCtx = twContext(emptyRoot, built.config);
    expect(body(renderComponents(built.ir, emptyCtx))).toBe(
      '@layer components {\n}\n',
    );
  });
});
