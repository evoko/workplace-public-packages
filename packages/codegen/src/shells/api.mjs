/**
 * How each platform's component reaches what the IR names: every prop, every slot, and the props a
 * derived axis follows from. Shared concepts, native spellings (docs/engineering/architecture.md,
 * "Two libraries, one contract", level 3): the IR is Figma's contract, and each
 * platform reaches every part of it its own way, which the descriptor declares in its `api` table
 * where it is not the IR's own name.
 *
 *   api: {
 *     react:   { <IR name>: <member> },
 *     flutter: { <IR name>: <member> },
 *   }
 *
 * A member is the name of the prop or parameter that reaches it (`label: 'title'`, a card's words;
 * `value: 'controller'`, a Flutter field's text), `{ not: '<member>' }` where the member is the
 * prop's negation (a Flutter field's `enabled`, its `disabled`), `{ group: '<Widget>' }` where a group the
 * platform provides decides it and the component takes no parameter for it (a Flutter Radio's
 * `checked`, its RadioGroup's), or null where the shell fills it itself from other members (Tree
 * Item's buttons, from their callbacks).
 *
 * Without an entry, a prop or slot is reached by its own name, but for each platform's
 * conventions: the label slot is React's `children` and Flutter's `child` (a drawn component's
 * `label`, the words it draws), or `label` beside a slot of content, which is the children on
 * both, as is a slot MUI styles as one of the root's children (`& > *`, Button Group's Buttons).
 * The component-parity test proves each member is on the shell.
 */

import { table } from '../components/index.mjs';
import { MUI_SLOTS } from '../emit/mui-component.mjs';

const API = table('api', 'react');
const API_FLUTTER = table('api', 'flutter');

/** A slot that only holds other slots (Text Area's footer): shown by them, no member of its own. */
export function holdsSlots(spec, slot) {
  const layer = Object.keys(spec.layers).find(
    (l) => spec.layers[l].path === spec.slots[slot].layer,
  );
  const kids = Object.keys(spec.layers).filter(
    (l) => spec.layers[l].parent === layer,
  );
  return kids.length > 0 && kids.every((k) => k in spec.slots);
}

/** Each platform's own convention for a slot, where the descriptor declares none. */
function conventional(spec, slot, platform) {
  const content = Object.values(spec.slots).some((s) => s.type === 'content');
  if (spec.slots[slot]?.type === 'content') return 'children';
  if (slot === 'label') {
    if (content) return 'label';
    if (platform === 'react') return 'children';
    return MUI_SLOTS[spec.component] === 'drawn' ? 'label' : 'child';
  }
  if (MUI_SLOTS[spec.component]?.[slot] === '& > *') return 'children';
  return slot;
}

/**
 * Every IR name a platform's component must reach, and how: its props, its slots (but one that
 * holds only slots), and the props its derived axes follow from.
 *
 * @param {object} spec the component's IR
 * @param {{react?: object, flutter?: object}} [given] a mapping in place of the descriptor's (a
 *   test's)
 * @returns {{react: Record<string, Member>, flutter: Record<string, Member>}} where a Member is
 *   `string | {not: string} | {group: string} | null`
 */
export function apiOf(spec, given) {
  const out = { react: {}, flutter: {} };
  const declared = {
    react: (given ? given.react : API[spec.component]) ?? {},
    flutter: (given ? given.flutter : API_FLUTTER[spec.component]) ?? {},
  };
  const derived = Object.values(spec.derived ?? {}).flatMap((d) =>
    d.when.flatMap((w) => w.props ?? []),
  );
  const names = [
    ...Object.keys(spec.api).map((n) => [n, 'prop']),
    ...Object.keys(spec.slots)
      .filter((s) => !holdsSlots(spec, s))
      .map((n) => [n, 'slot']),
    ...derived.map((n) => [n, 'prop']),
  ];
  for (const platform of ['react', 'flutter'])
    for (const [name, kind] of names) {
      if (name in out[platform]) continue;
      out[platform][name] =
        name in declared[platform]
          ? declared[platform][name]
          : kind === 'slot'
            ? conventional(spec, name, platform)
            : name;
    }
  // A declared name the IR does not have is a stale entry, as a stale overlay rule is.
  for (const platform of ['react', 'flutter'])
    for (const name of Object.keys(declared[platform]))
      if (!(name in out[platform]))
        throw new Error(
          `src/components: ${spec.component}'s api.${platform}.${name} maps what its IR does not name`,
        );
  return out;
}

/**
 * The IR names a platform's shell does not reach through its mapping: a member the shell does not
 * take (nor its `on<Member>` callback, which shows a slot such as Banner's close button), or, for
 * a group's, a parameter the shell takes anyway or a group it never names.
 *
 * @param {Record<string, string | {not: string} | {group: string} | null>} mapping one
 *   platform's, from apiOf
 * @param {string[]} members what the shell takes: its destructured props, its parameters
 * @param {string} source the shell, for the group it names
 */
export function unreached(mapping, members, source) {
  const has = new Set(members);
  return Object.entries(mapping)
    .filter(([name, member]) => {
      if (member === null) return false;
      if (typeof member === 'object' && 'not' in member)
        return !has.has(member.not);
      if (typeof member === 'object')
        return has.has(name) || !source.includes(member.group);
      const on = `on${member[0].toUpperCase()}${member.slice(1)}`;
      return !has.has(member) && !has.has(on);
    })
    .map(([name, member]) => `${name} (${JSON.stringify(member)})`);
}
