/**
 * SOLAR ListItem, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One row of a List: MUI's ListItemButton on the web, drawn and pressable in Flutter, its icon or
 * avatar, words and trailing icon drawn by the shared layer helpers. Its type follows from what it
 * is given (an avatar), and in a List it takes the list's compactness, as Figma draws its rows.
 */

import { drawnFlutter, drawnResets, treeOf } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  for (const slot of ['icon', 'helper', 'trailing', 'avatar'])
    if (!spec.slots[slot])
      throw new Error(`ListItem: the IR has no ${slot} slot`);
  if (spec.derived?.type === undefined)
    throw new Error('ListItem: its type is not derived from its content');
};

const P = 'SolarListItem';

export default {
  name: 'ListItem',
  mui: {
    // The shell draws every layer itself, inside MUI's ListItemButton, each with a class of its own.
    slots: 'drawn',
    // ListItemButton's own look gives way to the recipe's: its faded disabled row (the recipe draws
    // Figma's) and its focus fill (Figma's focus is a ring). A row spans its list; its icons and
    // avatar keep their size, and a caller's icon fills its slot.
    resets: drawnResets('ListItem', {
      display: 'flex',
      '&.Mui-focusVisible': { backgroundColor: 'transparent' },
      '&.Mui-disabled': { opacity: '1' },
      [`& .${P}-icon, & .${P}-trailing, & .${P}-avatar`]: { flexShrink: '0' },
      [`& .${P}-icon > svg, & .${P}-trailing > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      [`& .${P}-helper`]: { whiteSpace: 'normal' },
    }),
    // Figma draws the focus, a ring. A selected row keeps its fill under the pointer, and a
    // disabled one beats all; each is a class the shell sets, as MUI's own selected fill is not
    // the recipe's.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      selected: `&.${P}-selected`,
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR ListItem.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarListItemStyle\` and \`solarListItemCompose\` in \`@bwp-web/styles/mui\`: the
 * row's fill and focus ring by state, its padding, compact or not, and its words' and icons' ink.
 *
 * One row of a List, which a user chooses: MUI's ListItemButton, a button (\`component="a"\` and an
 * \`href\` for navigation), its words, a second line (\`helper\`), an \`icon\` or an \`avatar\` (a
 * SOLAR Avatar, which makes it an avatar row) before them and a \`trailing\` icon (a chevron) after,
 * drawn from Figma's layer tree (\`internal/layers.tsx\`). One trailing element, never two, SOLAR
 * says. A selected row is announced as the current one, or as selected where the list is a listbox
 * (\`role="option"\`). In a List it takes the list's compactness. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import ListItemButton, {
  type ListItemButtonProps,
} from '@mui/material/ListItemButton';
import { forwardRef, type ReactNode } from 'react';
import {
  solarListItemCompose,
  solarListItemStyle,
  type SolarListItemProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { useListCompact } from './List.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface ListItemProps
  extends SolarListItemProps,
    Omit<
      ListItemButtonProps,
      | keyof SolarListItemProps
      | 'children'
      | 'dense'
      | 'divider'
      | 'disableGutters'
      | 'alignItems'
      | 'ref'
    > {
  /** The row's words. */
  children: ReactNode;
  /** A second line under the words, quieter. */
  helper?: ReactNode;
  /** An icon before the words. */
  icon?: ReactNode;
  /** A SOLAR Avatar before the words, in place of an icon: an avatar row. */
  avatar?: ReactNode;
  /** An icon after the words: a chevron, where the row opens something. */
  trailing?: ReactNode;
  /** Where the row goes, with \`component="a"\`. */
  href?: string;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(function ListItem(
  {
    selected = false,
    disabled = false,
    compact: compactProp,
    children,
    helper,
    icon,
    avatar,
    trailing,
    role,
    className,
    sx,
    ...rest
  },
  ref,
) {
  // In a List, the list's compactness, as Figma draws its rows; its type from what it is given.
  const compact = useListCompact() ?? compactProp;
  const look = {
    selected,
    disabled,
    compact,
    type: avatar != null ? ('avatar' as const) : ('icon' as const),
  };
  const composed = solarListItemCompose(look);
  // A slot left empty is not drawn.
  const parts = {
    ...composed,
    icon: { ...composed.icon, present: avatar == null && icon != null },
    avatar: { ...composed.avatar, present: avatar != null },
    helper: { ...composed.helper, present: helper != null },
    trailing: { ...composed.trailing, present: trailing != null },
  };
  return (
    <ListItemButton
      ref={ref}
      // ButtonBase's own role, a button, where the caller gives none.
      {...(role ? { role } : {})}
      aria-selected={role === 'option' ? selected : undefined}
      aria-current={role !== 'option' && selected ? true : undefined}
      {...rest}
      disabled={disabled}
      disableRipple
      className={[selected ? '${P}-selected' : null, className].filter(Boolean).join(' ') || undefined}
      sx={[solarListItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE,
        parts,
        text: { label: children, helper },
        render: {
          avatar: ({ className: cls, style }) => (
            <span className={cls} style={style}>
              {avatar}
            </span>
          ),
        },
        icons: {
          icon: <span>{icon}</span>,
          trailing: <span>{trailing}</span>,
        },
      })}
    </ListItemButton>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the row’s fill and focus ring by state, its padding, compact or not, and its words’ and icons’ ink, read cell by cell',
        about: `Bespoke: one row of a SolarList, which a user chooses, drawn from Figma's layer tree with
[SolarLayers], pressable, and announced as a button, selected where it is. Its words, a second
line ([helper]), an [icon] or an [avatar] (a SolarAvatar, which makes it an avatar row) before
them and a [trailing] icon (a chevron) after. One trailing element, never two, SOLAR says. In a
SolarList it takes the list's compactness.`,
        params: `required this.label,
required this.onPressed,
this.helper,
this.icon,
this.avatar,
this.trailing,`,
        fields: `/// The row's words.
final String label;

/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;

/// A second line under the words, quieter.
final String? helper;

/// An icon before the words.
final Widget? icon;

/// A SolarAvatar before the words, in place of an icon: an avatar row.
final Widget? avatar;

/// An icon after the words: a chevron, where the row opens something.
final Widget? trailing;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: 'selected: selected,',
        },
        // A row with nothing to do is drawn disabled; in a list, it takes the list's compactness;
        // its type follows from what it is given.
        values: {
          disabled: 'disabled || onPressed == null',
          compact: 'SolarListScope.compactOf(context) ?? compact',
          type: 'avatar != null ? SolarListItemType.avatar : SolarListItemType.icon',
        },
        text: "{'label': label, 'helper': ?helper}",
        slots: "{'icon': ?icon, 'trailing': ?trailing}",
        // The avatar is a component, not an icon: drawn as the caller gives it.
        composed: "{'avatar': ?avatar}",
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'icon' => avatar == null && icon != null,
          'avatar' => avatar != null,
          'helper' => helper != null,
          'trailing' => trailing != null,
          _ => ${recipe},
        }`,
        imports: "import '../solar_list.dart';",
      });
    },
  },
};
