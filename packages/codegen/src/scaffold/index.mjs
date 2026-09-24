/**
 * Scaffolds a component's hand-owned shell, once.
 *
 * The line between generated and owned is the line between look and behaviour. The recipe --
 * what a component looks like -- regenerates from Figma on every `solar:codegen` and is never
 * edited. The shell -- props, slots, loading, accessibility -- is written here one time from the
 * IR and then belongs to developers: this refuses to overwrite it unless told to, so a behaviour
 * someone added is never clobbered by a design change. That is why this is its own command and
 * never part of `solar:codegen` or CI.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DESCRIPTORS } from '../components/index.mjs';
import { packagesDir, repoRoot } from '../util/paths.mjs';

export const componentsSrc = join(packagesDir, 'components', 'src');
export const storiesDir = join(packagesDir, 'components', 'stories');
export const flutterLib = join(packagesDir, 'solar_flutter', 'lib');

/**
 * The React shell templates, by component, from each component's descriptor (src/components/). A
 * template is a function of the IR, so prop and slot names come from Figma rather than being
 * retyped, but its structure is written for the one MUI control it wraps.
 */
export const TEMPLATES = Object.fromEntries(
  DESCRIPTORS.filter((d) => d.templates?.react).map((d) => [
    d.name,
    d.templates.react,
  ]),
);

/**
 * The Flutter widget templates, by component, from each component's descriptor: the same props as
 * the React shell, from the same IR, wrapping the Flutter control the overlay names, styled by the
 * generated recipe.
 */
export const FLUTTER_TEMPLATES = Object.fromEntries(
  DESCRIPTORS.filter((d) => d.templates?.flutter).map((d) => [
    d.name,
    d.templates.flutter,
  ]),
);

/** `Button` to `Button.tsx`. */
export const shellFileOf = (component) =>
  `${component.replace(/[^A-Za-z0-9]/g, '')}.tsx`;

/** `Button` to `solar_button.dart`. */
export const flutterFileOf = (component) =>
  `solar_${component.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.dart`;

/**
 * Writes the Flutter widget unless it exists. The package library exports it through
 * `src/components/components.dart`, which `solar:codegen` writes from the component list.
 *
 * @returns {{status: 'written' | 'exists' | 'overwritten', file: string}}
 */
export function scaffoldFlutter(
  spec,
  { force = false, lib = flutterLib } = {},
) {
  const template = FLUTTER_TEMPLATES[spec.component];
  if (!template)
    throw new Error(`no Flutter widget template for ${spec.component}`);
  const dir = join(lib, 'src', 'components');
  const file = join(dir, flutterFileOf(spec.component));
  const existed = existsSync(file);
  const shown = relative(repoRoot, file);
  if (existed && !force) return { status: 'exists', file: shown };
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, template(spec));
  return { status: existed ? 'overwritten' : 'written', file: shown };
}

/**
 * A component's Storybook file. Its stories are generic (`stories/solar.tsx`, from the component's
 * visual case and IR), so the file only names the component; Storybook reads a story file
 * statically, which is why its default export is an object literal rather than a call.
 */
export const storyTemplate = (component) => {
  // On one line where it fits the repository's 80 columns, and otherwise as Prettier wraps it.
  const line = `export default { title: 'SOLAR/${component}', ...meta('${component}') } satisfies Meta;`;
  const meta =
    line.length <= 80
      ? line
      : `export default {
  title: 'SOLAR/${component}',
  ...meta('${component}'),
} satisfies Meta;`;
  return `import type { Meta, StoryObj } from '@storybook/react-vite';
import { meta, playground, variants } from './solar.js';

// Storybook reads a story file statically, so the default export is an object literal here.
${meta}
export const Playground: StoryObj = playground('${component}');
export const Variants: StoryObj = variants('${component}');
`;
};

/** \`Button\` to \`Button.stories.tsx\`. */
export const storyFileOf = (component) =>
  shellFileOf(component).replace(/\.tsx$/, '.stories.tsx');

/**
 * Writes the component's story file unless it exists; like the shell, it is then hand-owned.
 *
 * @returns {{status: 'written' | 'exists' | 'overwritten', file: string}}
 */
export function scaffoldStory(spec, { force = false, dir = storiesDir } = {}) {
  const file = join(dir, storyFileOf(spec.component));
  const existed = existsSync(file);
  const shown = relative(repoRoot, file);
  if (existed && !force) return { status: 'exists', file: shown };
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, storyTemplate(spec.component));
  return { status: existed ? 'overwritten' : 'written', file: shown };
}

/**
 * Writes the shell unless it exists. Returns what happened, so the CLI can say it and a test can
 * assert it. The package entry exports it through `components.generated.ts`, which `solar:codegen`
 * writes from the component list.
 *
 * @returns {{status: 'written' | 'exists' | 'overwritten', file: string}}
 */
export function scaffold(spec, { force = false, dir = componentsSrc } = {}) {
  const template = TEMPLATES[spec.component];
  if (!template) throw new Error(`no shell template for ${spec.component}`);
  const file = join(dir, shellFileOf(spec.component));
  const existed = existsSync(file);
  const shown = relative(repoRoot, file);
  if (existed && !force) return { status: 'exists', file: shown };
  writeFileSync(file, template(spec));
  return { status: existed ? 'overwritten' : 'written', file: shown };
}
