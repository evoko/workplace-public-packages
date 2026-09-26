/**
 * Each component's Playground controls, from its IR: a select per axis, a toggle per boolean, a
 * colour for a colour the caller gives, and per slot a text field (words), an icon picker, a
 * show/hide toggle and the child's words (a composed component), or a toggle (content); then the
 * width of the box it sits in, then the component's own extras (extras.mjs). Storybook and
 * Widgetbook both draw these (their adapters), so the two show the same controls. Pure, and
 * dependency-free: it reads spec/ with Node's fs, and the descriptors (src/components/index.mjs,
 * Node and the generator's own modules alone), so it runs where no npm packages are installed.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DESCRIPTORS } from '../components/index.mjs';
import { specDir } from '../util/paths.mjs';
import { EXTRAS, EXTRA_KINDS, WORDS } from './extras.mjs';
import { ICON_NONE, ICON_SAMPLE, PLAYGROUND_VALUES } from './values.mjs';

export { ICON_NONE, ICON_SAMPLE } from './values.mjs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** The icon spec's icons, by stem (`chevron-right`), in its order. */
const loadIcons = () => readJson(join(specDir, 'icons.json')).icons;

/** Every SOLAR icon's stem (`chevron-right`), in the icon spec's order. */
export function iconNames() {
  return Object.keys(loadIcons());
}

/**
 * Every SOLAR icon's React component name, by stem (`io-device` → `IconIODevice`): the icon spec's
 * own `component`, which @bwp-web/assets exports, since a stem's PascalCase is not always it.
 */
export function iconComponents() {
  return Object.fromEntries(
    Object.entries(loadIcons()).map(([stem, icon]) => [stem, icon.component]),
  );
}

/** Every component IR, by its name. */
function loadSpecs() {
  const dir = join(specDir, 'components');
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((f) => readJson(join(dir, f)))
      .map((s) => [s.component, s]),
  );
}

/** A child component's main words: its `label` slot, or else its first text slot. */
function wordsOf(child) {
  const texts = Object.entries(child?.slots ?? {}).filter(
    ([, s]) => s.type === 'text',
  );
  return texts.find(([n]) => n === 'label') ?? texts[0] ?? null;
}

/**
 * Figma's icon placeholders: an instance of one stands for the caller's icon, so the Playground
 * starts it at the builder's sample instead.
 */
const PLACEHOLDERS = new Set(['None', 'Empty']);

/**
 * The icon Figma draws in a slot, by its stem, where its layer is an instance of an icon component
 * (`/Icon/Close`, `/Field/Icon/ChevronDown`, a second one `#2`) that is no placeholder; else null.
 */
function drawnIcon(slot, stemOf) {
  if (typeof slot.layer !== 'string') return null;
  const [kind, name] = slot.layer.replace(/#\d+$/, '').split('/').slice(-2);
  if (kind !== 'Icon' || PLACEHOLDERS.has(name)) return null;
  return stemOf.get(name) ?? null;
}

/**
 * A component's extras checked against the kinds the viewers draw, and against its IR's controls:
 * an extra may not take an IR control's name, since both viewers key a control by its name.
 */
function checkedExtras(component, extras, taken) {
  const seen = new Set(taken);
  return extras.map((extra) => {
    const where = `${component}: extra control "${extra.name}"`;
    if (typeof extra.name !== 'string' || extra.name === '')
      throw new Error(`${component}: an extra control has no name`);
    if (seen.has(extra.name))
      throw new Error(
        `${where} repeats a control's name; rename it in src/playground/extras.mjs`,
      );
    seen.add(extra.name);
    if (!EXTRA_KINDS.includes(extra.kind))
      throw new Error(
        `${where}: kind "${extra.kind}" is not one of ${EXTRA_KINDS.join(', ')}`,
      );
    const d = extra.default;
    const ok = {
      text: typeof d === 'string',
      boolean: typeof d === 'boolean',
      number: typeof d === 'number' && Number.isFinite(d),
      integer: Number.isInteger(d),
      select:
        Array.isArray(extra.options) &&
        extra.options.every((o) => typeof o === 'string') &&
        extra.options.includes(d),
    }[extra.kind];
    if (!ok)
      throw new Error(
        `${where}: default ${JSON.stringify(d)} does not fit a ${extra.kind} control` +
          (extra.kind === 'select' ? ' (it must be one of its options)' : ''),
      );
    if (
      (extra.min !== undefined && d < extra.min) ||
      (extra.max !== undefined && d > extra.max)
    )
      throw new Error(`${where}: default ${d} is outside its min and max`);
    return { ...extra };
  });
}

/**
 * A component's sample words (extras.mjs `WORDS`), checked against its IR: each names a text slot
 * for which Figma records no words, so an entry goes stale, and fails, once Figma records some or
 * the slot goes.
 */
function checkedWords(spec, words) {
  for (const name of Object.keys(words)) {
    const slot = spec.slots?.[name];
    const where = `${spec.component}: sample words for "${name}"`;
    if (slot?.type !== 'text')
      throw new Error(
        `${where}, which is no text slot; remove them from src/playground/extras.mjs`,
      );
    if (slot.default != null && slot.default !== '')
      throw new Error(
        `${where}, whose words Figma records; remove them from src/playground/extras.mjs`,
      );
    if (typeof words[name] !== 'string' || words[name] === '')
      throw new Error(`${where} are not words`);
  }
  return words;
}

/** An axis's control: a toggle, a colour, or a select of its values. */
function axisControl(component, name, axis) {
  if (axis.type === 'boolean')
    return { name, kind: 'boolean', default: axis.default };
  if (axis.type === 'color')
    return { name, kind: 'color', default: axis.default ?? null };
  if (axis.type !== undefined || !Array.isArray(axis.values))
    throw new Error(
      `${component}: axis "${name}" is neither a boolean, a colour nor a list of values; ` +
        'give src/playground/controls.mjs a control for it',
    );
  return { name, kind: 'select', default: axis.default, options: axis.values };
}

/**
 * One component's controls, in order: its API, its slots in the IR's order, its width, then its
 * extras (extras.mjs).
 *
 * @param {object} spec the component's IR
 * @param {Record<string, object>} specs every IR by name, for a child's words
 * @param {Map<string, string>} stemOf an icon's Figma name (`ChevronRight`) to its stem
 * @param {object[]} [extras] the component's own controls; EXTRAS' entry by default
 * @param {Record<string, string>} [words] sample words for a text slot Figma records none for, by
 *   slot; WORDS' entry by default
 * @param {Record<string, Record<string, string>>} [childWords] every component's sample words, for
 *   a child's words control where Figma records none for the child's text slot; WORDS by default
 */
export function controlsOf(
  spec,
  specs,
  stemOf,
  extras = EXTRAS[spec.component] ?? [],
  words = WORDS[spec.component] ?? {},
  childWords = WORDS,
) {
  const samples = checkedWords(spec, words);
  const controls = [];
  for (const [name, axis] of Object.entries(spec.api ?? {}))
    controls.push(axisControl(spec.component, name, axis));
  for (const [name, slot] of Object.entries(spec.slots ?? {})) {
    if (slot.type === 'text')
      controls.push({
        name,
        kind: 'text',
        default: slot.default || samples[name] || '',
        optional: Boolean(slot.optional),
      });
    else if (slot.type === 'icon')
      controls.push({
        name,
        kind: 'icon',
        default:
          slot.visible === false
            ? ICON_NONE
            : (drawnIcon(slot, stemOf) ?? ICON_SAMPLE),
      });
    else if (slot.type === 'component' || slot.type === 'instance') {
      controls.push({
        name,
        kind: 'child',
        default: slot.visible !== false,
        component: slot.component ?? null,
      });
      const words = slot.component ? wordsOf(specs[slot.component]) : null;
      // The child's words, or its sample words where Figma records none (a Tag's "Label").
      if (words)
        controls.push({
          name: `${name} ${words[0]}`,
          kind: 'childText',
          default:
            words[1].default || childWords[slot.component]?.[words[0]] || '',
          slot: name,
        });
    } else if (slot.type === 'content')
      controls.push({ name, kind: 'content', default: slot.visible !== false });
    else
      throw new Error(
        `${spec.component}: slot "${name}" is of type "${slot.type}", which no Playground ` +
          'control draws; give src/playground/controls.mjs a control for it',
      );
  }
  controls.push({ name: 'width', kind: 'width', default: 'auto' });
  return [
    ...controls,
    ...checkedExtras(
      spec.component,
      extras,
      controls.map((c) => c.name),
    ),
  ];
}

/** An icon's Figma name (`ChevronRight`) to its stem, from the icon spec's icons by stem. */
export const stemsOf = (icons) =>
  new Map(Object.entries(icons).map(([stem, icon]) => [icon.name, stem]));

/**
 * Every component with a Playground, by its name, in the descriptors' order. A component has one
 * where it has a story: every descriptor but one a chart library draws, so Autocomplete Open,
 * checked as Autocomplete's state, has one too. The one rule both the controls (componentControls)
 * and the builder registries (src/emit/playground.mjs) take the set from.
 */
export const playgroundNames = () =>
  DESCRIPTORS.filter((d) => !d.library).map((d) => d.name);

/**
 * Every component with a Playground (playgroundNames), by its name, with its controls, in the
 * descriptors' order. The one path both viewers' lists come from: playgroundData (Storybook, from
 * spec/ on disk) and the codegen's Widgetbook file (src/emit/playground.mjs, from the IRs and icon
 * spec the run has just built).
 *
 * @param {Record<string, object>} specs every IR by name
 * @param {Record<string, {name: string}>} icons the icon spec's icons, by stem
 */
export function componentControls(
  specs,
  icons,
  extras = EXTRAS,
  words = WORDS,
) {
  const stemOf = stemsOf(icons);
  const withPlayground = playgroundNames();
  const names = new Set(withPlayground);
  const orphans = [...Object.keys(extras), ...Object.keys(words)].filter(
    (n) => !names.has(n),
  );
  if (orphans.length)
    throw new Error(
      `src/playground/extras.mjs names ${orphans.map((n) => `"${n}"`).join(', ')}, ` +
        'which has no Playground (no such component, or one a chart library draws)',
    );
  return Object.fromEntries(
    withPlayground.map((name) => {
      const spec = specs[name];
      if (!spec)
        throw new Error(
          `${name}: no IR in spec/components; run npm run solar:codegen`,
        );
      return [
        name,
        controlsOf(
          spec,
          specs,
          stemOf,
          extras[name] ?? [],
          words[name] ?? {},
          words,
        ),
      ];
    }),
  );
}

/**
 * What PLAYGROUND serves Storybook (.storybook/main.ts), and the Playwright page and the unit tests
 * read the same way: every component with a Playground, with its controls; the icon stems the icon
 * controls offer; each icon's @bwp-web/assets component, by stem; and the fixed values (values.mjs).
 */
export function playgroundData() {
  const icons = loadIcons();
  return {
    components: componentControls(loadSpecs(), icons),
    icons: Object.keys(icons),
    iconComponents: iconComponents(),
    values: PLAYGROUND_VALUES,
  };
}
