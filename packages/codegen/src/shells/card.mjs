/**
 * The shells of SOLAR's cards: drawn on both from Figma's layers with the shared helpers, each
 * pressable where it is given something to do, as the card family is (owner decision 2026-09-25).
 * Pressable, a card's title is its button or link, stretched over the card on the web (its
 * `::after`), so the card's own controls stay reachable above it; in Flutter the whole card is the
 * button, and its controls are controls of their own inside it. A card with a More glyph draws
 * it as a button opening a menu of `moreItems` (the F6 Dropdown Menu). `loading` draws Figma's
 * placeholders, announced busy. Hovered and focused only where it is pressable.
 *
 * The templates are functions of the IR and of what the descriptor says of the card's props:
 * their layers, their words, whether Figma hides them at rest.
 */

import { dartEnumValue } from '../emit/flutter.mjs';
import { pascal } from '../util/naming.mjs';
import {
  dartFile,
  dartIcon,
  drawnResets,
  iconsOf,
  keyPrefixOf,
  reactIcon,
  treeOf,
  wrapDoc,
} from './drawn.mjs';
import { targetArea } from './target.mjs';

/** The More icon, as Figma draws it at a layer: the menu's button draws it. */
export function moreIconOf(spec, layer) {
  const name = spec.style[layer]?.base?.component?.keyword;
  if (!name?.startsWith('Icon/'))
    throw new Error(`${spec.component}: the IR draws no icon at ${layer}`);
  const icon = name.slice('Icon/'.length);
  return {
    react: `Icon${pascal(icon)}`,
    dart: `SolarIcons.${icon[0].toLowerCase()}${icon.slice(1)}Outline`,
  };
}

/**
 * What a card's elements need beyond the recipe: a block, its words wrapping, its title the
 * stretched action where it has one, and its More button with a 44 × 44 target.
 *
 * @param {string} name the component
 * @param {object} o
 * @param {string[]} [o.wrap] the text layers that wrap (a title, a description)
 * @param {string} [o.more] the More glyph's layer
 * @param {string[]} [o.icons] the icon slots' layers, whose icon fills them
 * @param {string[]} [o.fixed] the boxes Figma fixes, which never shrink beside long words
 * @param {object} [o.extra] more resets
 */
export function cardResets(
  name,
  { wrap = [], more, icons = [], fixed = [], extra = {} } = {},
) {
  const P = `Solar${pascal(name)}`;
  const all = (layers, tail = '') =>
    layers.map((l) => `& .${P}-${l}${tail}`).join(', ');
  return drawnResets(name, {
    display: 'flex',
    ...(wrap.length
      ? { [all(wrap)]: { whiteSpace: 'normal', minWidth: '0' } }
      : {}),
    ...(icons.length
      ? {
          [all(icons)]: { flexShrink: '0' },
          [all(icons, ' > svg')]: {
            display: 'block',
            width: '100%',
            height: '100%',
          },
        }
      : {}),
    // The title is the card's action where it has one: a bare button or link, whose hit area (its
    // ::after) is the whole card, from the card's own box (MUI's ButtonBase is positioned, which
    // it no longer is).
    [`& .${P}-press`]: {
      position: 'static',
      display: 'inline',
      padding: '0',
      margin: '0',
      font: 'inherit',
      color: 'inherit',
      textAlign: 'start',
      textDecoration: 'none',
      verticalAlign: 'baseline',
    },
    [`& .${P}-press::after`]: {
      content: '""',
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
    },
    // The card's own controls sit above the stretched action, as later positioned boxes do, so
    // each is its own target.
    [`& .${P}-box :is(a, button, input, select, textarea, [tabindex]):not(.${P}-press)`]:
      { position: 'relative' },
    // A name read and never seen: the loading action's, a colour's (Insight Row's severity bar).
    [`& .${P}-name`]: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
    },
    // What Figma fixes never gives way to the words beside it (a severity's tile).
    ...(fixed.length ? { [all(fixed)]: { flexShrink: '0' } } : {}),
    ...(more
      ? (() => {
          // The More menu's button draws its icon, with a 44 × 44 target (shells/target.mjs).
          const at = `& .${P}-${more}`;
          const target = targetArea(at);
          return {
            ...target,
            [at]: {
              ...target[at],
              flexShrink: '0',
              padding: '0',
              color: 'inherit',
            },
            [`${at} > svg`]: {
              display: 'block',
              width: '100%',
              height: '100%',
            },
          };
        })()
      : {}),
    ...extra,
  });
}

/**
 * A card's states: hovered and focused only where it is pressable, as Card's description says
 * ("clickable gates interaction-state visibility and the focus ring"): the pointer over it, the
 * keyboard on its title (MUI marks it focus-visible). Selected and disabled by the shell's classes.
 */
export function cardStates(name, { selected = false, loading = false } = {}) {
  const P = `Solar${pascal(name)}`;
  return {
    default: null,
    hover: `&.${P}-pressable:hover`,
    focus: `&:has(.${P}-press.Mui-focusVisible)`,
    ...(selected ? { selected: `&.${P}-selected` } : {}),
    // Loading, where Figma draws it as a state (Device Card's), by the shell's class.
    ...(loading ? { loading: `&.${P}-loading` } : {}),
    disabled: `&.${P}-disabled`,
  };
}

/**
 * One of a card's props, as both shells take it.
 *
 * @typedef {object} CardProp
 * @property {string} name the prop
 * @property {string} doc its doc comment's words
 * @property {'text'|'icon'|'slot'|'node'} kind drawn as the words of its text `layer`, as the icon
 *   or the caller's control (a Button) in its `layer`, or by the descriptor's own `render` (a Tag,
 *   a StatusIndicator)
 * @property {string} [layer] the layer it fills
 * @property {boolean} [required] the caller must give it (a title)
 * @property {boolean} [shown] Figma hides its layer at rest, a prop shows it (Card's icon): drawn
 *   whenever it is given
 * @property {string} [react] its React type, `ReactNode` by default
 * @property {string} [dart] its Dart type, `String` for a text and `Widget` otherwise
 * @property {'react'|'flutter'} [only] a prop of one platform's alone (React's children)
 * @property {string[]} [also] more layers a slot is drawn in, where a variant draws it there
 *   instead (Action Card's primary action, alone in its own place when done)
 */

const REACT_ITEM = `/** One action of a card's More menu. */
export interface CardMoreItem {
  /** Its words. */
  label: ReactNode;
  /** Called when it is chosen; the menu closes first. */
  onSelect: () => void;
  disabled?: boolean;
  /** An icon before its words. */
  icon?: ReactNode;
}
`;

const DART_ITEM = `/// One action of a card's More menu (a SolarCard's, and every card's with one).
class SolarCardMoreItem {
  const SolarCardMoreItem({
    required this.label,
    required this.onSelected,
    this.disabled = false,
    this.icon,
  });

  /// Its words.
  final String label;

  /// Called when it is chosen; the menu closes first.
  final VoidCallback onSelected;

  final bool disabled;

  /// An icon before its words.
  final Widget? icon;
}

`;

/** Every layer the card's props and More name, refused where the IR lacks one. */
function requireCardLayers(spec, o) {
  const layers = [
    o.title,
    ...[o.alsoTitle ?? []].flat(),
    ...o.props.flatMap((p) => [p.layer, ...(p.also ?? [])]).filter(Boolean),
    ...(o.more ? [o.more.layer] : []),
  ];
  for (const layer of layers)
    if (!spec.layers[layer])
      throw new Error(`${spec.component}: the IR has no ${layer} layer`);
}

const presentOf = (p, given) =>
  p.shown ? given : `composed.${p.layer}?.present !== false && ${given}`;

/**
 * The React shell of a card.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.look what the recipe holds, for the doc comment
 * @param {string} o.about the rest of the doc comment
 * @param {string} o.title the layer the title's words are drawn in: the stretched action
 * @param {CardProp[]} o.props the card's props beyond its IR's, the title first
 * @param {{layer: string, icon: {react: string}}} [o.more] the More glyph, a menu's button
 * @param {string[]} [o.statusless] the props under which it draws with no status (Card's loading
 *   and disabled, which Figma draws for no status alone)
 * @param {string} [o.status] the status axis, its value with no status
 * @param {string} [o.imports] more import lines
 * @param {string} [o.prelude] statements before the render, in `composed` and `look`
 * @param {string} [o.render] more `render` entries, a JSX object's members
 * @param {string} [o.content] the `content` entries, a JSX object's members
 * @param {string[]} [o.react] more names imported from React
 * @param {string} [o.alsoTitle] a second layer the title's words are drawn in, the action there
 *   too, where a variant draws them there instead (File Card's create tile's label)
 * @param {string} [o.timeElement] the text layer whose words are a time: drawn in a \`<time>\` of
 *   the \`dateTime\` prop's moment (Event Row's)
 * @param {Record<string, string>} [o.present] whether a layer is drawn, by the shell's own rule,
 *   an expression by layer (Interactive Card's chosen control); \`o.presentDart\` Flutter's
 * @param {boolean} [o.loadingState] \`loading\` is a state of Figma's, not an axis (Device Card's):
 *   the recipe is read in it, and the shell marks it with its class
 * @param {string} [o.selected] the prop that makes it the selected one of its set: a state the
 *   recipe draws, announced (\`aria-current\` on its action; selected in Flutter)
 */
export function cardReact(spec, o) {
  requireCardLayers(spec, o);
  const name = spec.component;
  const C = pascal(name);
  const P = `Solar${C}`;
  const api = Object.entries(spec.api);
  const loading = spec.api.loading ? 'loading' : null;
  const disabled = spec.api.disabled ? 'disabled' : null;
  const defaults = api.map(([prop, def]) =>
    def.type === 'boolean'
      ? `${prop} = ${def.default}`
      : `${prop} = '${def.default}'`,
  );
  const props = o.props.filter((p) => p.only !== 'flutter');
  const title = props[0];
  const statusless = (o.statusless ?? []).filter((p) => spec.api[p]);
  const lookEntries = api.map(([prop]) =>
    prop === o.status?.axis && statusless.length
      ? `${prop}: ${statusless.join(' || ')} ? ('${o.status.none}' as const) : ${prop}`
      : prop,
  );
  const text = [
    ...[o.alsoTitle ?? []].flat().map((l) => `${l}: titled`),
    ...props
      .filter((p) => p.kind === 'text')
      .map((p) =>
        p.layer === o.title
          ? `${p.layer}: titled`
          : p.layer === o.timeElement
            ? `${p.layer}: ${p.name} != null ? <time dateTime={dateTime}>{${p.name}}</time> : null`
            : p.name === p.layer
              ? p.name
              : `${p.layer}: ${p.name}`,
      ),
    ...props
      .filter((p) => p.kind === 'text')
      .flatMap((p) => (p.also ?? []).map((l) => `${l}: ${p.name}`)),
  ];
  // Figma's own icons (a Plus, a chevron), drawn as it draws them; the More is its menu's button.
  const own = iconsOf(spec).filter((i) => i.layer !== o.more?.layer);
  const icons = [
    ...own.map((i) => `${i.layer}: ${reactIcon(i, spec)}`),
    ...props
      .filter((p) => p.kind === 'icon' || p.kind === 'slot')
      .flatMap((p) =>
        [p.layer, ...(p.also ?? [])].map(
          (l) => `${l}: <span>{${p.name}}</span>`,
        ),
      ),
  ];
  const assets = [
    ...new Set([
      ...own.flatMap((i) =>
        i.byAxis
          ? Object.values(i.byAxis.values).map((x) => x.react)
          : [i.react],
      ),
      ...(o.more ? [o.more.icon.react] : []),
    ]),
  ].sort();
  const present = props
    .filter((p) => !p.required && p.layer)
    .flatMap((p) =>
      [p.layer, ...(p.also ?? [])].map(
        (l) =>
          `    ${l}: { ...composed.${l}, present: ${presentOf({ ...p, layer: l }, `${p.name} != null`)} },`,
      ),
    );
  if (o.more)
    present.push(
      `    ${o.more.layer}: { ...composed.${o.more.layer}, present: composed.${o.more.layer}?.present !== false && menu },`,
    );
  // Whether a layer is drawn, by the shell's own rule (Interactive Card's chosen control).
  for (const [layer, when] of Object.entries(o.present ?? {}))
    present.push(`    ${layer}: { ...composed.${layer}, present: ${when} },`);
  const moreButton = o.more
    ? `${o.more.layer}: (
              <ButtonBase
                ref={moreRef}
                disableRipple
                disabled={${disabled ?? 'false'}}
                aria-label={moreLabel}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                <${o.more.icon.react} />
              </ButtonBase>
            ),`
    : null;
  const react = [
    'forwardRef',
    ...(o.more ? ['useRef', 'useState'] : []),
    'type MouseEvent',
    'type ReactNode',
    ...(o.react ?? []),
  ];
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solar${C}Style\` and \`solar${C}Compose\` in \`@bwp-web/styles/mui\`: ${o.look}.`;
  const doc = (p) =>
    `  /** ${p.doc} */\n  ${p.name}${p.required ? '' : '?'}: ${p.react ?? 'ReactNode'};`;
  return `/**
 * SOLAR ${name}.
 *
${wrapDoc(header, ' * ')}
 *
${wrapDoc(`${o.about.trim()} Drawn from Figma's layer tree (\`internal/layers.tsx\`). The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
${assets.length ? `import { ${assets.join(', ')} } from '@bwp-web/assets';\n` : ''}import { ${react.join(', ')} } from 'react';
import {
  solar${C}Compose,
  solar${C}Style,
  type Solar${C}Props,
} from '@bwp-web/styles/mui';
${o.more ? `${o.definesMoreItem ? '' : "import type { CardMoreItem } from './Card.js';\n"}import { DropdownItem } from './DropdownItem.js';\nimport { DropdownMenu } from './DropdownMenu.js';\n` : ''}import { drawChildren${o.render ? ', type DrawnLayer' : ''} } from './internal/layers.js';
${o.imports ? `${o.imports.trim()}\n` : ''}
${o.definesMoreItem ? `${REACT_ITEM}\n` : ''}/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface ${C}Props
  extends Solar${C}Props,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<BoxProps, keyof Solar${C}Props | ${props.map((p) => `'${p.name}'`).join(' | ')} | 'onClick' | 'ref'> {
${props.map(doc).join('\n')}${
    o.more
      ? `
  /** The More menu's actions: a button opens them. */
  moreItems?: CardMoreItem[];
  /** The More button's accessible name. */
  moreLabel?: string;`
      : ''
  }
  /** Makes it pressable: its ${title.name} is a button that calls it. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Makes it pressable: its ${title.name} is a link here. */
  href?: string;
}

export const ${C} = forwardRef<HTMLDivElement, ${C}Props>(function ${C}(
  {
${[...defaults, ...props.map((p) => p.name), ...(o.more ? ['moreItems', "moreLabel = 'More actions'"] : []), 'onClick', 'href', 'className', 'sx', '...rest'].map((x) => `    ${x},`).join('\n')}
  },
  ref,
) {
${
  statusless.length
    ? `  // Figma draws a ${statusless.join(' card, and a ')} one, with no status: its look is the same for all.\n`
    : ''
}  const look = { ${lookEntries.join(', ')} };
  const composed = solar${C}Compose(look${o.loadingState ? ", loading ? 'loading' : 'default'" : ''});
${loading ? '  // Pressable while it loads too, as Figma draws a loading card hovered: its title, the action,\n  // is then its name alone.\n' : ''}  const pressable = (onClick != null || href != null)${disabled ? ' && !disabled' : ''};
${o.more ? '  const menu = moreItems != null && moreItems.length > 0;\n' : ''}${o.prelude ? `${o.prelude.trim().replace(/^/gm, '  ')}\n` : ''}  // A slot left empty is not drawn${props.some((p) => p.shown) ? ', and one Figma hides at rest is drawn where it is given' : ''}.
  const parts = {
    ...composed,
${present.join('\n')}
  };
${o.more ? '  const [open, setOpen] = useState(false);\n  const moreRef = useRef<HTMLButtonElement>(null);\n' : ''}  // Pressable, its ${title.name} is its action, stretched over the card.
  const titled = pressable ? (
    <ButtonBase
      className="${P}-press"
      disableRipple${
        o.selected
          ? `
      // The selected card is the current one of its set (the insight shown beside the list).
      aria-current={${o.selected} || undefined}`
          : ''
      }
      {...(href != null ? { href } : {})}
      onClick={onClick}
    >
      {${title.name}}
    </ButtonBase>
  ) : (
    ${title.name}
  );${
    loading
      ? `
  // Loading, where its title is not drawn (Card's; a Device Card's is), the action is drawn in
  // its place, its name alone.
  const waiting =
    pressable && loading && !${JSON.stringify([o.title, ...[o.alsoTitle ?? []].flat()])}.some((l) => composed[l]?.present !== false) ? (
      <ButtonBase
        className="${P}-press"
        disableRipple
        {...(href != null ? { href } : {})}
        onClick={onClick}
      >
        <span className="${P}-name">{${title.name}}</span>
      </ButtonBase>
    ) : null;`
      : ''
  }
  return (
    <>
      <Box
        ref={ref}${loading ? '\n        aria-busy={loading || undefined}' : ''}${disabled ? '\n        aria-disabled={disabled || undefined}' : ''}
        className={
          [pressable ? '${P}-pressable' : null, ${disabled ? `disabled ? '${P}-disabled' : null, ` : ''}${o.selected ? `${o.selected} ? '${P}-selected' : null, ` : ''}${o.loadingState ? `loading ? '${P}-loading' : null, ` : ''}className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...rest}
        sx={[solar${C}Style(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >${loading ? '\n        {waiting}' : ''}
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE,
          parts,
          text: { ${text.join(', ')} },${
            icons.length || moreButton
              ? `
          icons: {
${[...icons.map((i) => `            ${i},`), ...(moreButton ? [`            ${moreButton}`] : [])].join('\n')}
          },`
              : ''
          }${o.content ? `\n          content: {\n${o.content.trim().replace(/^/gm, '            ')}\n          },` : ''}${
            o.render
              ? `
          render: {
${o.render.trim().replace(/^/gm, '            ')}
          },`
              : ''
          }
        })}
      </Box>${
        o.more
          ? `
      {menu ? (
        <DropdownMenu anchorEl={moreRef.current} open={open} onClose={() => setOpen(false)}>
          {moreItems.map((item, i) => (
            <DropdownItem
              key={i}
              disabled={item.disabled}
              icon={item.icon}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      ) : null}`
          : ''
      }
    </>
  );
});
`;
}

/**
 * The Flutter widget of a card.
 *
 * @param {object} spec the IR
 * @param {object} o as cardReact's, and:
 * @param {string} [o.composed] the `composed` map's entries, in `p`, `t` and `states`
 * @param {string} [o.contentDart] the `content` map literal, in `figma` (the card's layers as
 *   Figma draws them, for a layer of them: `figma.layer('description')`)
 * @param {string} [o.wraps] the texts that wrap, a map literal's entries
 * @param {string} [o.imagesDart] the pictures boxes show, a map literal by layer (Launch Card's
 *   image), in its props
 * @param {string} [o.clips] the boxes whose content is cut to their corners, a set literal's
 *   entries (File Card's thumbnail)
 * @param {string} [o.importsDart] more import lines
 * @param {string} [o.fieldsDart] more fields, with their doc comments, and `o.paramsDart` theirs
 */
export function cardFlutter(spec, o) {
  requireCardLayers(spec, o);
  const name = spec.component;
  const C = pascal(name);
  const R = `Solar${C}Recipe`;
  const api = Object.entries(spec.api);
  const loading = spec.api.loading ? 'loading' : null;
  const disabled = spec.api.disabled ? 'disabled' : null;
  const props = o.props.filter((p) => p.only !== 'react');
  const title = props[0];
  const statusless = (o.statusless ?? []).filter((p) => spec.api[p]);
  const tree = Object.entries(treeOf(spec))
    .map(
      ([parent, kids]) =>
        `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
    )
    .join('\n');
  const dartType = (p) => p.dart ?? (p.kind === 'text' ? 'String' : 'Widget');
  // Whether one of the title's layers is drawn under these states (a Device Card's, loading).
  const titleDrawn = (states) =>
    `[${[o.title, ...[o.alsoTitle ?? []].flat()].map((l) => `'${l}'`).join(', ')}].any((l) => ${R}.present(l, p, ${states}))`;
  // Figma's own icons, and the More's, drawn as it draws them.
  const own = iconsOf(spec).filter((i) => i.layer !== o.more?.layer);
  const dartIcons = [
    ...own.map((i) => `'${i.layer}': ${dartIcon(i, spec)}`),
    ...(o.more ? [`'${o.more.layer}': ${o.more.icon.dart}`] : []),
  ];
  const enumOf = (prop) => `Solar${C}${pascal(prop)}`;
  const dartDefault = (prop, def) =>
    def.type === 'boolean'
      ? `${def.default}`
      : `${enumOf(prop)}.${dartEnumValue(def.default)}`;
  const propArgs = api.map(([prop]) =>
    prop === o.status?.axis && statusless.length
      ? `${prop}: ${statusless.join(' || ')} ? ${enumOf(prop)}.${dartEnumValue(o.status.none)} : ${prop}`
      : `${prop}: ${prop}`,
  );
  const text = [
    ...[o.alsoTitle ?? []].flat().map((l) => `'${l}': ${title.name}`),
    ...props
      .filter((p) => p.kind === 'text')
      .flatMap((p) =>
        [p.layer, ...(p.also ?? [])].map(
          (l) => `'${l}': ${p.required ? p.name : `?${p.name}`}`,
        ),
      ),
  ];
  const slots = props
    .filter((p) => p.kind === 'icon' || p.kind === 'slot')
    .flatMap((p) =>
      [p.layer, ...(p.also ?? [])].map((l) => `'${l}': ?${p.name}`),
    );
  const present = props
    .filter((p) => !p.required && p.layer)
    .flatMap((p) =>
      [p.layer, ...(p.also ?? [])].map((l) =>
        p.shown
          ? `          '${l}' => ${p.name} != null,`
          : `          '${l}' => ${p.name} != null && ${R}.present(l, p, states),`,
      ),
    );
  if (o.more)
    present.push(
      `          '${o.more.layer}' => onMore != null && ${R}.present(l, p, states),`,
    );
  for (const [layer, when] of Object.entries(o.presentDart ?? {}))
    present.push(`          '${layer}' => ${when},`);
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [${R}]: ${o.look}, read cell by cell.`;
  const about = o.about
    .replace(/`([a-zA-Z.]+)`/g, '[$1]')
    .replace(/\[onClick\] or \[href\]/g, '[onPressed]');
  const fieldDoc = (p) =>
    `  /// ${p.doc}\n  final ${dartType(p)}${p.required ? '' : '?'} ${p.name};`;
  const apiFields = api
    .map(([prop, def]) =>
      def.type === 'boolean'
        ? `  final bool ${prop};`
        : `  final ${enumOf(prop)} ${prop};`,
    )
    .join('\n\n');
  return `/// SOLAR ${name}.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(`${about.trim()} Drawn from Figma's layer tree with [SolarLayers]; pressable, the whole card is its button, named by its ${title.name}, and its own controls are controls of their own inside it.`, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/${dartFile(name)}';
${dartIcons.length ? "import '../generated/icons.dart';\n" : ''}import '../solar_layers.dart';
${o.more ? "import '../solar_menu.dart';\n" : ''}import '../solar_states.dart';
${o.more ? `import '../solar_target.dart';\n${o.definesMoreItem ? '' : "import 'solar_card.dart';\n"}import 'solar_dropdown_item.dart';\nimport 'solar_dropdown_menu.dart';\n` : ''}${o.importsDart ? `${o.importsDart.trim()}\n` : ''}import 'solar_theme_of.dart';

${o.definesMoreItem ? DART_ITEM : ''}class Solar${C} extends StatelessWidget {
  const Solar${C}({
    super.key,
${props
  .filter((p) => p.required)
  .map((p) => `    required this.${p.name},`)
  .join('\n')}
${api.map(([prop, def]) => `    this.${prop} = ${dartDefault(prop, def)},`).join('\n')}
${props
  .filter((p) => !p.required)
  .map((p) => `    this.${p.name},`)
  .join('\n')}
${o.paramsDart ? `${o.paramsDart.trim().replace(/^/gm, '    ')}\n` : ''}${o.more ? "    this.moreItems,\n    this.moreLabel = 'More actions',\n" : ''}    this.onPressed,
    this.statesController,
  });

${apiFields}

${props.map(fieldDoc).join('\n\n')}
${o.fieldsDart ? `\n${o.fieldsDart.trim().replace(/^/gm, '  ')}\n` : ''}${
    o.more
      ? `
  /// The More menu's actions: a button opens them.
  final List<SolarCardMoreItem>? moreItems;

  /// The More button's accessible name.
  final String moreLabel;
`
      : ''
  }
  /// Makes it pressable: the whole card is a button that calls it.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {${
    o.more
      ? `
    final rows = moreItems;
    if (rows == null || rows.isEmpty) return _card(context, null);
    // Its own menu, under the More button.
    return SolarMenuAnchor(
      menu: SolarDropdownMenu(
        children: [
          for (final item in rows)
            Builder(
              builder: (context) => SolarDropdownItem(
                label: item.label,
                icon: item.icon,
                disabled: item.disabled,
                onPressed: () {
                  MenuController.maybeOf(context)?.close();
                  item.onSelected();
                },
              ),
            ),
        ],
      ),
      builder: (context, controller) => _card(
        context,
        () => controller.isOpen ? controller.close() : controller.open(),
      ),
    );
  }

  Widget _card(BuildContext context, VoidCallback? onMore) {`
      : ''
  }
    final t = solarThemeOf(context);
${
  statusless.length
    ? `    // Figma draws a ${statusless.join(' card, and a ')} one, with no status: its look is the same for all.\n`
    : ''
}    ${propArgs.length ? 'final' : 'const'} p = Solar${C}Props(${propArgs.join(', ')});
${loading ? '    // Pressable while it loads too, as Figma draws a loading card hovered.\n' : ''}    final pressable = onPressed != null${disabled ? ' && !disabled' : ''};
    Widget draw(Set<WidgetState> states) {
      final recipe = SolarLayerRecipe(
        lookup: (c) => ${R}.lookup(c, p, states),
        dimension: (c) => ${R}.dimension(c, p, states),
        color: (c) => ${R}.color(t, c, p, states),
        shadow: (c) => ${R}.shadow(t, c, p, states),
        textStyle: (c) => ${R}.textStyle(t, c, p, states),
        // A slot left empty is not drawn${props.some((p) => p.shown) ? ', and one Figma hides at rest is drawn where it is given' : ''}.
        present: (l) => switch (l) {
${present.join('\n')}
          _ => ${R}.present(l, p, states),
        },
        glyph: (_) => null,
      );
      SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
        recipe: recipe,
        tree: _tree,
        keyPrefix: '${keyPrefixOf(name)}',
        text: {${text.join(', ')}},${o.wraps ? `\n        wraps: const {${o.wraps}},` : ''}${slots.length ? `\n        slots: {${slots.join(', ')}},` : ''}${dartIcons.length ? `\n        icons: ${own.some((i) => i.byAxis) ? '' : 'const '}{${dartIcons.join(', ')}},` : ''}
        content: content,${o.imagesDart ? `\n        images: ${o.imagesDart},` : ''}${o.truncates ? `\n        truncates: const {${o.truncates}},` : ''}${o.clips ? `\n        clips: const {${o.clips}},` : ''}${
          o.more || o.builders
            ? `
        builders: {${o.builders ? `\n${o.builders.trim().replace(/^/gm, '          ')}` : ''}${
          o.more
            ? `
          '${o.more.layer}': (glyph) => SolarTarget.inside(
            child: Semantics(
              // A node of its own, so the control keeps its name inside the card's.
              container: true,
              child: SolarPressable(
                onPressed: ${disabled ? 'disabled ? null : ' : ''}onMore,
                builder: (_, _) => Semantics(
                  label: moreLabel,
                  excludeSemantics: true,
                  child: glyph,
                ),
              ),
            ),
          ),`
            : ''
        }
        },`
            : ''
        }${o.composed ? `\n        composed: {\n${o.composed.trim().replace(/^/gm, '          ')}\n        },` : ''}
      );
${
  o.contentDart
    ? `${o.contentDart.includes('figma.') ? '      final figma = layers(const {});\n' : ''}      return layers(${o.contentDart.trim()}).layer('root');`
    : `      return layers(const {}).layer('root');`
}
    }

    final Widget mark = pressable
        ? SolarPressable(
            onPressed: onPressed,
            statesController: statesController,${o.selected ? `\n            selected: ${o.selected},` : ''}
            builder: (_, states) => ${
              loading
                ? `Semantics(
              // Loading, where its title is not drawn (Card's; a Device Card's is), the button is
              // named by it all the same.
              label: loading && !${titleDrawn('states')} ? ${title.name} : null,
              child: draw(${o.selected ? `{...states, if (${o.selected}) WidgetState.selected}` : 'states'}),
            )`
                : `draw(${o.selected ? `{...states, if (${o.selected}) WidgetState.selected}` : 'states'})`
            },
          )
        : draw({${[disabled ? 'if (disabled) WidgetState.disabled' : null, o.selected ? `if (${o.selected}) WidgetState.selected` : null].filter(Boolean).join(', ')}});
    return Semantics(
      container: true,${loading ? "\n      // Loading, it says so, as the web's aria-busy does.\n      label: loading ? 'Loading' : null," : ''}${disabled ? "\n      // Disabled, it says so, as the web's aria-disabled does.\n      enabled: disabled ? false : null," : ''}
      child: mark,
    );
  }
}
`;
}
