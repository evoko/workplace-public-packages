/**
 * SOLAR Tree Item, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One row of a tree, drawn by the shared layer helpers: its indent (a .Tree Indent of its depth), a
 * chevron that expands it, and a Checkbox, icons, a StatusIndicator, a Tag, a Counter and its two
 * actions as the caller gives them. Editing, its label is a text field, a rename; a keyboard-focused
 * row draws edit's edge and ring (owner decision 2026-09-24). The tree around it is the Tree
 * Navigation Panel pattern's, later.
 */

import {
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';

const P = 'SolarTreeItem';

const requireLayers = (spec) => {
  const want = [
    'treeIndent',
    'chevron',
    'chevronChevron',
    'iconChevronDown',
    'checkbox',
    'leadingIcon',
    'label',
    'status',
    'tag',
    'counter',
    'trailingIcon',
    'buttons',
    'iconMore',
    'iconPlus',
    'renameInput',
  ];
  for (const layer of want)
    if (!spec.layers[layer])
      throw new Error(`Tree Item: the IR has no ${layer} layer`);
  for (const prop of ['selected', 'expanded', 'edit'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Tree Item: the IR has no ${prop} prop`);
};

export default {
  name: 'Tree Item',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A row, no outline of the browser's own (its focus is edit's edge and ring); its buttons and
    // its rename field none of theirs; a caller's icons fill their slots; the words take what is
    // left, cut short. The chevron and the actions keep their own boxes as targets: 16px, 4px from
    // the next control, where two 44 × 44 targets would cover each other (as Number Input's side
    // stepper keeps Figma's size); the design review asks SOLAR.
    resets: drawnResets('Tree Item', {
      display: 'flex',
      outline: 'none',
      cursor: 'pointer',
      borderStyle: 'solid',
      [`& .${P}--chevron, & .${P}--iconMore, & .${P}--iconPlus`]: {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        color: 'inherit',
        cursor: 'pointer',
        flexShrink: '0',
      },
      [`& .${P}--iconMore > svg, & .${P}--iconPlus > svg, & .${P}-leadingIcon > svg, & .${P}-trailingIcon > svg`]:
        { display: 'block', width: '100%', height: '100%' },
      [`& .${P}--label`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      [`& .${P}--renameInput`]: {
        flex: '1 1 0%',
        minWidth: '0',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        outline: 'none',
      },
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it; editing by the shell's class.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&:focus-visible',
      edit: `&.${P}-edit`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'label',
    // How both take what Figma's slots show: the chevron by whether the row has children, the
    // checkbox by its checked state, the counter by its count; the actions are the shell's own,
    // drawn where the caller gives them their callbacks.
    slots: {
      chevron: 'expandable',
      checkbox: 'checked',
      counter: 'count',
      buttons: null,
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Tree Item.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarTreeItemStyle\` and \`solarTreeItemCompose\` in \`@bwp-web/styles/mui\`: the
 * row's fill, edge and ring by state, and its parts' ink.
 *
 * One row of a tree, announced as a tree item (selected, expanded, at its level), drawn from
 * Figma's layer tree (\`internal/layers.tsx\`): indented by its \`depth\` (0 to 10, 16px a level), a
 * chevron that expands and collapses it where it is \`expandable\` (a leaf keeps the chevron's room,
 * as its description says), and a checkbox (\`checked\`), icons either side, a \`status\`, a \`tag\` and
 * a \`count\` as the caller gives them. Its two actions, \`onMore\` and \`onAdd\`, show on hover and
 * while selected. A click, Enter or Space selects it (\`onSelect\`); the right and left arrows expand
 * and collapse it, and F2 asks to rename it (\`onRenameStart\`). \`edit\` draws its label as a text
 * field: Enter renames it (\`onRename\`), Escape cancels. A keyboard-focused row draws edit's edge and
 * ring, as its description says edit "doubles as the focus treatment". The tree around it, its
 * arrow keys across rows, is the caller's for now. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { IconChevronDown, IconChevronRight, IconMore, IconPlus } from '@bwp-web/assets';
import {
  forwardRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  solarTreeItemCompose,
  solarTreeItemStyle,
  type SolarStatusIndicatorProps,
  type SolarTreeIndentProps,
  type SolarTreeItemProps,
} from '@bwp-web/styles/mui';
import { Checkbox } from './Checkbox.js';
import { Counter } from './Counter.js';
import { StatusIndicator } from './StatusIndicator.js';
import { TreeIndent } from './TreeIndent.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface TreeItemProps
  extends SolarTreeItemProps,
    Omit<BoxProps, keyof SolarTreeItemProps | 'children' | 'onSelect' | 'ref'> {
  /** The row's words. */
  label: ReactNode;
  /** How deep in the tree it is, 0 to 10. */
  depth?: number;
  /** Whether it has children, which its chevron expands; a leaf keeps the chevron's room. */
  expandable?: boolean;
  /** Called with whether it is to be expanded, by its chevron or the arrow keys. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Called when it is chosen: a click, Enter or Space. */
  onSelect?: () => void;
  /** A checkbox before its words, checked or not; none where not given. */
  checked?: boolean;
  /** Called with the checkbox's new state. */
  onCheckedChange?: (checked: boolean) => void;
  /** An icon before the words, and one after. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** A status after the words, a SOLAR StatusIndicator of this type. */
  status?: SolarStatusIndicatorProps['type'];
  /** A SOLAR Tag after the words. */
  tag?: ReactNode;
  /** A count after the words, a SOLAR Counter; none at 0 or below. */
  count?: number;
  /** Its actions, shown on hover and while selected: more, and add. */
  onMore?: (event: MouseEvent<HTMLButtonElement>) => void;
  onAdd?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Called to rename it: F2. */
  onRenameStart?: () => void;
  /** Called with the new name, where it is being edited: Enter. */
  onRename?: (label: string) => void;
  /** Called where the edit is left: Escape. */
  onRenameCancel?: () => void;
  /** The words the rename starts from; the label's, where it is text. */
  renameValue?: string;
  /** Names for a screen reader: the chevron's, the actions', the rename field's. */
  expandLabel?: string;
  collapseLabel?: string;
  moreLabel?: string;
  addLabel?: string;
  renameLabel?: string;
}

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(function TreeItem(
  {
    selected = false,
    expanded = false,
    edit = false,
    label,
    depth = 0,
    expandable = true,
    onExpandedChange,
    onSelect,
    checked,
    onCheckedChange,
    leadingIcon,
    trailingIcon,
    status,
    tag,
    count,
    onMore,
    onAdd,
    onRenameStart,
    onRename,
    onRenameCancel,
    renameValue,
    expandLabel = 'Expand',
    collapseLabel = 'Collapse',
    moreLabel = 'More actions',
    addLabel = 'Add',
    renameLabel = 'Name',
    className,
    onKeyDown,
    sx,
    ...rest
  },
  ref,
) {
  // Which parts show depends on the row's state, the pointer's and the keyboard's among them.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const state = edit ? 'edit' : hovered ? 'hover' : focused ? 'focus' : 'default';
  const look = { selected, expanded, edit };
  const composed = solarTreeItemCompose(look, state);
  const [name, setName] = useState(renameValue ?? (typeof label === 'string' ? label : ''));
  // A slot is drawn where it is given; the actions where Figma shows them (on hover, while
  // selected) and they are given.
  const given = (layer: string, is: boolean) => ({ ...composed[layer], present: is });
  const shown = (layer: string, is: boolean) => given(layer, composed[layer]?.present !== false && is);
  const parts = {
    ...composed,
    checkbox: given('checkbox', checked !== undefined),
    leadingIcon: given('leadingIcon', leadingIcon != null),
    status: given('status', status !== undefined),
    tag: given('tag', tag != null),
    counter: given('counter', count !== undefined && count > 0),
    trailingIcon: given('trailingIcon', trailingIcon != null),
    buttons: shown('buttons', onMore !== undefined || onAdd !== undefined),
    iconMore: shown('iconMore', onMore !== undefined),
    iconPlus: shown('iconPlus', onAdd !== undefined),
  };
  const toggle = () => onExpandedChange?.(!expanded);
  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    const run: Record<string, (() => void) | undefined> = {
      Enter: onSelect,
      ' ': onSelect,
      ArrowRight: expandable && !expanded ? toggle : undefined,
      ArrowLeft: expandable && expanded ? toggle : undefined,
      F2: onRenameStart,
    };
    const action = run[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };
  const depthOf = String(Math.max(0, Math.min(10, depth))).padStart(2, '0') as SolarTreeIndentProps['depth'];
  return (
    <Box
      ref={ref}
      role="treeitem"
      aria-selected={selected}
      aria-expanded={expandable ? expanded : undefined}
      aria-level={depth + 1}
      tabIndex={0}
      {...rest}
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        rest.onClick?.(event);
        // A click on a control in the row (its checkbox, chevron, actions, rename field) is the
        // control's, not a choice of the row.
        const inner = (event.target as Element).closest('button, input, a, label');
        if (!edit && (inner === null || inner === event.currentTarget)) onSelect?.();
      }}
      onKeyDown={keys}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => {
        if (event.target === event.currentTarget)
          setFocused(event.currentTarget.matches(':focus-visible'));
      }}
      onBlur={(event) => {
        if (event.target === event.currentTarget) setFocused(false);
      }}
      className={[edit ? '${P}-edit' : null, className].filter(Boolean).join(' ') || undefined}
      sx={[solarTreeItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE, slots: SLOTS,
        parts,
        text: { label },
        icons: {
          chevronChevron: <IconChevronRight />,
          iconChevronDown: <IconChevronDown />,
          leadingIcon: <span>{leadingIcon}</span>,
          trailingIcon: <span>{trailingIcon}</span>,
        },
        render: {
          treeIndent: ({ className, style }) => (
            <span className={className} style={style}>
              <TreeIndent depth={depthOf} />
            </span>
          ),
          // The chevron expands it; a leaf keeps its room, the glyph not drawn.
          chevron: ({ className, style, children }) =>
            expandable ? (
              <button
                type="button"
                tabIndex={-1}
                className={className}
                style={style}
                aria-label={expanded ? collapseLabel : expandLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  toggle();
                }}
              >
                {children}
              </button>
            ) : (
              <span className={className} style={{ ...style, visibility: 'hidden' }} aria-hidden>
                {children}
              </span>
            ),
          checkbox: ({ className, style }) => (
            <span className={className} style={style}>
              <Checkbox
                checked={checked ?? false}
                onChange={(_, next) => onCheckedChange?.(next)}
                tabIndex={-1}
              />
            </span>
          ),
          status: ({ className, style }) => (
            <span className={className} style={style}>
              <StatusIndicator
                type={status}
                size={composed.status['variant.size'] as SolarStatusIndicatorProps['size']}
              />
            </span>
          ),
          tag: ({ className, style }) => (
            <span className={className} style={style}>
              {tag}
            </span>
          ),
          // The counter is a SOLAR Counter in the variant the recipe names for the row's state.
          counter: ({ className, style }) => (
            <span className={className} style={style}>
              <Counter
                count={count ?? 0}
                type={composed.counter['variant.type'] as never}
                disabled={composed.counter['variant.state'] === 'disabled'}
              />
            </span>
          ),
          iconMore: ({ className, style }) => (
            <button
              type="button"
              tabIndex={-1}
              className={className}
              style={style}
              aria-label={moreLabel}
              onClick={(event) => {
                event.stopPropagation();
                onMore?.(event);
              }}
            >
              <IconMore />
            </button>
          ),
          iconPlus: ({ className, style }) => (
            <button
              type="button"
              tabIndex={-1}
              className={className}
              style={style}
              aria-label={addLabel}
              onClick={(event) => {
                event.stopPropagation();
                onAdd?.(event);
              }}
            >
              <IconPlus />
            </button>
          ),
          // Editing, the words are a text field: Enter renames, Escape cancels.
          renameInput: ({ className, style }) => (
            <input
              className={className}
              style={style}
              aria-label={renameLabel}
              value={name}
              // eslint-disable-next-line jsx-a11y/no-autofocus -- a rename takes the focus as it starts, as a tree's inline edit does
              autoFocus
              onChange={(event) => setName(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === 'Enter') onRename?.(name);
                if (event.key === 'Escape') onRenameCancel?.();
              }}
            />
          ),
        },
      })}
    </Box>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const api = Object.entries(spec.api);
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarTreeItemRecipe]: the row's fill, edge and ring by state, and its parts' ink, read cell by cell.`;
      const about = `One row of a tree, drawn from Figma's layer tree with [SolarLayers], pressable and focusable, announced selected and expanded: indented by its [depth] (0 to 10, 16px a level), a chevron that expands and collapses it where it is [expandable] (a leaf keeps the chevron's room, as its description says), and a checkbox ([checked]), icons either side, a [status], a [tag] and a [count] as the caller gives them. Its two actions, [onMore] and [onAdd], show on hover and while selected. A tap, Enter or Space selects it ([onSelect]); the right and left arrows expand and collapse it. [edit] draws its label as a text field: submitting renames it ([onRename]), Escape cancels. A keyboard-focused row draws edit's edge and ring, as its description says edit "doubles as the focus treatment". The tree around it is the caller's for now.`;
      return `/// SOLAR Tree Item.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/statusindicator.dart';
import '../generated/components/tree_indent.dart';
import '../generated/components/tree_item.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_checkbox.dart';
import 'solar_counter.dart';
import 'solar_statusindicator.dart';
import 'solar_theme_of.dart';
import 'solar_tree_indent.dart';

class SolarTreeItem extends StatefulWidget {
  const SolarTreeItem({
    super.key,
${api.map(([prop, def]) => `    this.${prop} = ${def.default},`).join('\n')}
    required this.label,
    this.depth = 0,
    this.expandable = true,
    this.onExpandedChange,
    this.onSelect,
    this.checked,
    this.onCheckedChange,
    this.leadingIcon,
    this.trailingIcon,
    this.status,
    this.tag,
    this.count,
    this.onMore,
    this.onAdd,
    this.onRename,
    this.onRenameCancel,
    this.expandLabel = 'Expand',
    this.collapseLabel = 'Collapse',
    this.moreLabel = 'More actions',
    this.addLabel = 'Add',
    this.statesController,
  });

${api.map(([prop]) => `  final bool ${prop};`).join('\n')}

  /// The row's words.
  final String label;

  /// How deep in the tree it is, 0 to 10.
  final int depth;

  /// Whether it has children, which its chevron expands; a leaf keeps the chevron's room.
  final bool expandable;

  /// Called with whether it is to be expanded, by its chevron or the arrow keys.
  final ValueChanged<bool>? onExpandedChange;

  /// Called when it is chosen: a tap, Enter or Space.
  final VoidCallback? onSelect;

  /// A checkbox before its words, checked or not; none where null.
  final bool? checked;

  /// Called with the checkbox's new state.
  final ValueChanged<bool>? onCheckedChange;

  /// An icon before the words, and one after.
  final Widget? leadingIcon, trailingIcon;

  /// A status after the words, a SolarStatusIndicator of this type.
  final SolarStatusIndicatorType? status;

  /// A SolarTag after the words.
  final Widget? tag;

  /// A count after the words, a SolarCounter; none at 0 or below.
  final int? count;

  /// Its actions, shown on hover and while selected: more, and add.
  final VoidCallback? onMore, onAdd;

  /// Called with the new name, where it is being edited: submitting it.
  final ValueChanged<String>? onRename;

  /// Called where the edit is left: Escape.
  final VoidCallback? onRenameCancel;

  /// Names for a screen reader: the chevron's, and the actions'.
  final String expandLabel, collapseLabel, moreLabel, addLabel;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarTreeItem> createState() => _SolarTreeItemState();
}

class _SolarTreeItemState extends State<SolarTreeItem> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  late final _name = TextEditingController(text: widget.label);

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  void _toggle() => widget.onExpandedChange?.call(!widget.expanded);

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = SolarTreeItemProps(${api.map(([prop]) => `${prop}: w.${prop}`).join(', ')});
    Widget draw(Set<WidgetState> states) {
      String? look(String cell) => SolarTreeItemRecipe.lookup(cell, p, states);
      // A slot is drawn where it is given; the actions where Figma shows them (on hover, while
      // selected) and they are given; the rest as Figma shows them.
      bool present(String layer) {
        final shown = SolarTreeItemRecipe.present(layer, p, states);
        return switch (layer) {
          'checkbox' => w.checked != null,
          'leadingIcon' => w.leadingIcon != null,
          'status' => w.status != null,
          'tag' => w.tag != null,
          'counter' => w.count != null && w.count! > 0,
          'trailingIcon' => w.trailingIcon != null,
          'buttons' => shown && (w.onMore != null || w.onAdd != null),
          'iconMore' => shown && w.onMore != null,
          'iconPlus' => shown && w.onAdd != null,
          _ => shown,
        };
      }
      // Its own box is its target: the controls sit 4px apart, where two padded targets would
      // cover each other (a tap on More would reach Add's).
      Widget action(VoidCallback? onPressed, String label, Widget icon) =>
          SolarPressable(
            onPressed: onPressed,
            builder: (_, _) => Semantics(label: label, child: icon),
          );
      return SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: look,
          dimension: (c) => SolarTreeItemRecipe.dimension(c, p, states),
          color: (c) => SolarTreeItemRecipe.color(t, c, p, states),
          shadow: (c) => SolarTreeItemRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarTreeItemRecipe.textStyle(t, c, p, states),
          present: present,
          glyph: (_) => null,
        ),
        tree: _tree,
        keyPrefix: '${keyPrefixOf(spec.component)}',
        text: {'label': w.label},
        truncates: const {'label'},
        icons: const {
          'chevronChevron': SolarIcons.chevronRightOutline,
          'iconChevronDown': SolarIcons.chevronDownOutline,
          'iconMore': SolarIcons.moreOutline,
          'iconPlus': SolarIcons.plusOutline,
        },
        slots: {'leadingIcon': ?w.leadingIcon, 'trailingIcon': ?w.trailingIcon},
        composed: {
          'treeIndent': SolarTreeIndent(
            depth: SolarTreeIndentDepth.values[w.depth.clamp(0, 10)],
          ),
          if (w.checked != null)
            'checkbox': SolarCheckbox(
              checked: w.checked!,
              onChanged: w.onCheckedChange == null
                  ? null
                  : (v) => w.onCheckedChange!(v),
            ),
          if (w.status != null)
            'status': SolarStatusIndicator(
              type: w.status!,
              size: SolarStatusIndicatorSize.values.byName(
                look('status.variant.size')!.substring(2),
              ),
            ),
          if (w.tag != null) 'tag': w.tag!,
          // In a scope of its own: the row's hover is not the counter's, which the recipe names.
          if (w.count != null && w.count! > 0)
            'counter': SolarStatesScope(
              builder: (_, _) => SolarCounter(
                count: w.count!,
                disabled: look('counter.variant.state') == 'k:disabled',
              ),
            ),
        },
        // Editing, the words are a text field: submitting renames, Escape cancels.
        fields: {
          'renameInput': (style) => CallbackShortcuts(
            bindings: {
              const SingleActivator(LogicalKeyboardKey.escape): () =>
                  w.onRenameCancel?.call(),
            },
            child: TextField(
              controller: _name,
              autofocus: true,
              style: style,
              maxLines: 1,
              decoration: const InputDecoration.collapsed(hintText: null),
              onSubmitted: w.onRename,
            ),
          ),
        },
        builders: {
          // The chevron expands it; a leaf keeps its room, the glyph not drawn.
          'chevron': (layer) => w.expandable
              ? action(_toggle, w.expanded ? w.collapseLabel : w.expandLabel, layer)
              : ExcludeSemantics(child: Opacity(opacity: 0, child: layer)),
          'iconMore': (icon) => action(w.onMore, w.moreLabel, icon),
          'iconPlus': (icon) => action(w.onAdd, w.addLabel, icon),
        },
      ).layer('root');
    }

    // The row is the control: the arrows expand and collapse it.
    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.arrowRight): () {
          if (w.expandable && !w.expanded) _toggle();
        },
        const SingleActivator(LogicalKeyboardKey.arrowLeft): () {
          if (w.expandable && w.expanded) _toggle();
        },
      },
      child: Semantics(
        expanded: w.expandable ? w.expanded : null,
        child: SolarPressable(
          onPressed: w.edit ? null : (w.onSelect ?? () {}),
          statesController: w.statesController,
          selected: w.selected,
          builder: (_, states) => draw(states),
        ),
      ),
    );
  }
}
`;
    },
  },
};
