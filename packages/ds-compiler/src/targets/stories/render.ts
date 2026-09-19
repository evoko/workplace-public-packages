import { codeUnitCompare } from '../../sources.js';
import { quoteTs, renderTsLiteral } from '../mui/render-ts.js';
import type {
  ComponentSpec,
  StoriesConfig,
  StoriesModel,
  TokenSpec,
} from './spec.js';

export function storiesHeader(generated: string): string {
  return `// ${generated}`;
}

/** `font-family` to `Font Family`. */
export function categoryTitle(category: string): string {
  return category
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function renderStoriesConfig(
  generated: string,
  config: StoriesConfig,
): string {
  return [
    storiesHeader(generated),
    '',
    "import type { StoriesConfig } from '../harness';",
    '',
    `export const storiesConfig: StoriesConfig = ${renderTsLiteral(config)};`,
    '',
  ].join('\n');
}

function union(values: readonly string[]): string {
  return values.map(quoteTs).join(' | ');
}

/**
 * The `<Export …>` JSX for the MUI cell of one row. Manifest-derived text
 * (slot content, the label) is never written as a raw JSX attribute string
 * or text node — JSX string-literal attributes and text nodes do not
 * interpret backslash escapes, so a value containing `"` or `\` would
 * produce syntactically invalid or mismeaning JSX. Instead every such value
 * becomes a JS expression container holding a `quoteTs`-escaped string
 * literal (`prop={'value'}`, `{'value'}`), which is unambiguous regardless
 * of content.
 */
function muiRenderJsx(spec: ComponentSpec): string[] {
  const mui = spec.mui!;
  const attrs: string[] = [];
  for (const axis of spec.axes) {
    attrs.push(
      `${mui.axisProps[axis.name]}={row.axes.${axis.name} as ${union(axis.values)}}`,
    );
  }
  for (const state of spec.states) {
    if (state.kind === 'attribute') {
      attrs.push(`${state.muiProp}={row.state === ${quoteTs(state.name)}}`);
    }
  }
  for (const slot of spec.slots) {
    attrs.push(`${mui.slotProps[slot.name]}={${quoteTs(slot.content)}}`);
  }
  const open = `<${spec.exportName}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  if (mui.children === null) {
    return [`    render: (row: CompareRow) => ${open} />,`];
  }
  if (mui.children !== 'children') {
    attrs.push(`${mui.children}={${quoteTs(spec.label)}}`);
    return [
      `    render: (row: CompareRow) => <${spec.exportName} ${attrs.join(' ')} />,`,
    ];
  }
  return [
    '    render: (row: CompareRow) => (',
    `      ${open}>`,
    `        {${quoteTs(spec.label)}}`,
    `      </${spec.exportName}>`,
    '    ),',
  ];
}

export function renderComponentStory(
  generated: string,
  spec: ComponentSpec,
  config: StoriesConfig,
): string {
  const lines: string[] = [
    storiesHeader(generated),
    '',
    "import type { Meta, StoryObj } from '@storybook/react-vite';",
  ];
  if (spec.mui) {
    // `spec.mui` is only set when this component is mapped for mui, which
    // requires `targets.stories.options.muiPackage` (see `buildStoriesModel`
    // in `./spec.js`), so `config.muiPackage` is guaranteed to be set here.
    lines.push(
      `import { ${spec.exportName}, ${config.muiThemeFactory} } from ${quoteTs(config.muiPackage!)};`,
    );
    lines.push(
      "import { CompareGrid, parityPlay, type CompareRow, type CompareSpec } from '../../harness';",
    );
  } else {
    lines.push(
      "import { CompareGrid, parityPlay, type CompareSpec } from '../../harness';",
    );
  }
  lines.push("import { storiesConfig } from '../config';", '');
  lines.push('const spec: CompareSpec = {');
  lines.push(`  name: ${quoteTs(spec.name)},`);
  lines.push(`  displayName: ${quoteTs(spec.displayName)},`);
  lines.push(`  rootElement: ${quoteTs(spec.rootElement)},`);
  lines.push(`  axes: ${renderTsLiteral(spec.axes, 1)},`);
  if (spec.states.length === 0) {
    lines.push('  states: [],');
  } else {
    lines.push('  states: [');
    for (const s of spec.states) {
      lines.push(
        s.kind === 'attribute'
          ? `    { name: ${quoteTs(s.name)}, kind: 'attribute', attributes: ${inlineRecord(s.attributes)}, muiProp: ${quoteTs(s.muiProp)} },`
          : `    { name: ${quoteTs(s.name)}, kind: ${quoteTs(s.kind)} },`,
      );
    }
    lines.push('  ],');
  }
  lines.push(
    `  slots: [${spec.slots.map((s) => `{ name: ${quoteTs(s.name)}, element: ${quoteTs(s.element)}, content: ${quoteTs(s.content)} }`).join(', ')}],`,
  );
  lines.push(`  label: ${quoteTs(spec.label)},`);
  lines.push(
    `  labelSlot: ${spec.labelSlot === null ? 'null' : quoteTs(spec.labelSlot)},`,
  );
  lines.push(`  labelElement: ${quoteTs(spec.labelElement)},`);
  lines.push(`  tailwind: ${spec.tailwind},`);
  if (spec.mui) {
    lines.push('  mui: {');
    lines.push(`    rootClass: ${quoteTs(spec.mui.rootClass)},`);
    lines.push(`    slotClasses: ${inlineRecord(spec.mui.slotClasses)},`);
    lines.push(`    theme: ${config.muiThemeFactory}(),`);
    lines.push(...muiRenderJsx(spec));
    lines.push('  },');
  } else {
    lines.push('  mui: null,');
  }
  lines.push('};', '');
  lines.push('const meta: Meta = {');
  // Title-cased from the component's kebab-case `name`, not the manifest's
  // free-form `displayName`: two components can share a `displayName` (a
  // fixture has "pill" and "tag" both named "X"), which would collide into
  // the same Storybook section.
  lines.push(`  title: ${quoteTs(`Styles/${categoryTitle(spec.name)}`)},`);
  lines.push("  parameters: { layout: 'padded' },");
  lines.push('};', '', 'export default meta;', '');
  lines.push('export const Compare: StoryObj = {');
  lines.push(
    '  render: (_args, context) => <CompareGrid spec={spec} config={storiesConfig} targets={context.globals.dsTargets} />,',
  );
  lines.push('  play: (context) => parityPlay(context, spec, storiesConfig),');
  lines.push('};', '');
  return lines.join('\n');
}

function inlineRecord(record: Record<string, string>): string {
  const entries = Object.keys(record).sort(codeUnitCompare);
  if (entries.length === 0) {
    return '{}';
  }
  return `{ ${entries.map((k) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : quoteTs(k)}: ${quoteTs(record[k])}`).join(', ')} }`;
}

export function renderFoundationsStory(
  generated: string,
  category: string,
  tokens: TokenSpec[],
): string {
  return [
    storiesHeader(generated),
    '',
    "import type { Meta, StoryObj } from '@storybook/react-vite';",
    "import { TokenGrid, tokenParityPlay, type TokenSpec } from '../../harness';",
    "import { storiesConfig } from '../config';",
    '',
    `export const tokens: TokenSpec[] = ${renderTsLiteral(tokens)};`,
    '',
    'const meta: Meta = {',
    `  title: ${quoteTs(`Foundations/${categoryTitle(category)}`)},`,
    "  parameters: { layout: 'padded' },",
    '};',
    '',
    'export default meta;',
    '',
    'export const Compare: StoryObj = {',
    `  render: () => <TokenGrid category=${JSON.stringify(category)} tokens={tokens} config={storiesConfig} />,`,
    `  play: (context) => tokenParityPlay(context, tokens, ${quoteTs(category)}, storiesConfig),`,
    '};',
    '',
  ].join('\n');
}

export function renderAll(
  generated: string,
  model: StoriesModel,
): { path: string; contents: string }[] {
  return [
    {
      path: 'config.ts',
      contents: renderStoriesConfig(generated, model.config),
    },
    ...model.components.map((c) => ({
      path: `styles/${c.name}.stories.tsx`,
      contents: renderComponentStory(generated, c, model.config),
    })),
    ...model.config.tokenCategories.map((category) => ({
      path: `foundations/${category}.stories.tsx`,
      contents: renderFoundationsStory(
        generated,
        category,
        model.tokens[category]!,
      ),
    })),
  ];
}
