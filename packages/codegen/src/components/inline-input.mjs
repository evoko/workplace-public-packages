/**
 * SOLAR Inline Input, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A value edited in place, which holds its mode (owner decision 2026-09-24): read, its words, with
 * an edit button on hover; editing, MUI's InputBase on the web and an undecorated TextField in
 * Flutter, with Confirm and Cancel. Filled is the edit mode with the focus off the input (the
 * overlay's `derive`).
 */

import { dartField, dartParam } from '../shells/helpers.mjs';
import { drawnResets, keyPrefixOf, treeOf, wrapDoc } from '../shells/drawn.mjs';

const P = 'SolarInlineInput';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  if (tree.root?.join() !== 'value,iconButton,frame1')
    throw new Error(
      'Inline Input: its root does not hold its value, edit button and actions',
    );
  if (tree.frame1?.join() !== 'confirm,cancel')
    throw new Error('Inline Input: its actions are not Confirm and Cancel');
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('Inline Input: its filled is not derived from its mode');
};

export default {
  name: 'Inline Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own; editing, its value is
    // MUI's InputBase.
    slots: 'drawn',
    resets: drawnResets('Inline Input', {
      // Read, a click anywhere edits it.
      cursor: 'text',
      [`&.${P}-editing, &.${P}-disabled`]: { cursor: 'default' },
      // Read, the words take the room the edit button leaves, cut short where they run out.
      [`& .${P}-value`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      // Editing, InputBase's own box around the input takes no part in the row's layout.
      [`& .${P}-words`]: { display: 'contents' },
      [`& .${P}-value.MuiInputBase-input`]: {
        height: 'auto',
        padding: '0',
        WebkitTextFillColor: 'currentcolor',
      },
      // The edit button shows while it is hovered, or has the keyboard's focus, as Figma draws it
      // hovered; it keeps its room, so the words do not move.
      [`& .${P}-iconButton`]: { visibility: 'hidden' },
      [`&:hover .${P}-iconButton, & .${P}-iconButton:focus-within`]: {
        visibility: 'visible',
      },
    }),
    // Hovered as it is; focused as its input is; filled (editing, the focus off the input), in
    // error and disabled by the shell's classes.
    states: {
      default: null,
      hover: '&:hover',
      focus: `&:has(.${P}-words.Mui-focused)`,
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Inline Input.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarInlineInputStyle\` and \`solarInlineInputCompose\` in \`@bwp-web/styles/mui\`:
 * its box by mode and state, and its words' ink.
 *
 * A value edited where it is shown (a name in a header, a cell): read, its \`value\` as text, with an
 * edit button on hover; a click, or the edit button, opens it for editing, MUI's InputBase with
 * Confirm and Cancel. Enter or Confirm calls \`onConfirm\` with what is typed, which may return false
 * to keep it open (a value it rejects, with \`error\` set); Esc or Cancel discards the edit
 * (\`onCancel\`). It holds its own mode, and \`defaultEditing\` starts it open. Its \`label\` names the
 * input and the edit button for a screen reader ("Edit name"). The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import { IconCheck, IconClose, IconEdit } from '@bwp-web/assets';
import Box, { type BoxProps } from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  solarInlineInputCompose,
  solarInlineInputStyle,
  type SolarInlineInputProps,
} from '@bwp-web/styles/mui';
import { IconButton } from './IconButton.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface InlineInputProps
  extends SolarInlineInputProps,
    Omit<BoxProps, keyof SolarInlineInputProps | 'children' | 'onChange' | 'ref'> {
  /** The value it shows, and edits. */
  value: string;
  /**
   * Called with what is typed when Enter or Confirm commits it; false keeps it open (a value the
   * caller rejects, with \`error\` set).
   */
  onConfirm: (value: string) => boolean | void;
  /** Called when Esc or Cancel discards the edit. */
  onCancel?: () => void;
  /** Whether it starts open for editing. */
  defaultEditing?: boolean;
  /** What it holds, for a screen reader: names the input, and the edit button ("Edit name"). */
  label?: string;
  /** What it shows while the input is empty. */
  placeholder?: string;
}

export const InlineInput = forwardRef<HTMLDivElement, InlineInputProps>(function InlineInput(
  {
    ${api.join(',\n    ')},
    value,
    onConfirm,
    onCancel,
    defaultEditing = false,
    label,
    placeholder,
    className,
    onClick,
    sx,
    ...rest
  },
  ref,
) {
  const [editing, setEditing] = useState(defaultEditing && !disabled);
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const edit = useRef<HTMLButtonElement>(null);
  // Where the user opened it, the focus goes to the input; where it closes, back to the edit button.
  const moveFocus = useRef<'input' | 'edit' | null>(null);
  useEffect(() => {
    if (moveFocus.current === 'input') input.current?.focus();
    if (moveFocus.current === 'edit') edit.current?.focus();
    moveFocus.current = null;
  }, [editing]);
  const begin = () => {
    if (disabled || editing) return;
    setDraft(value);
    moveFocus.current = 'input';
    setEditing(true);
  };
  const close = () => {
    setFocused(false);
    moveFocus.current = 'edit';
    setEditing(false);
  };
  const confirm = () => {
    if (onConfirm(draft) !== false) close();
  };
  const cancel = () => {
    setDraft(value);
    close();
    onCancel?.();
  };
  // Filled while it is open and the focus is off its input, on its buttons.
  const filled = editing && !focused;
  const look = { ${api.join(', ')}, filled };
  const parts = solarInlineInputCompose(look);
  return (
    <Box
      ref={ref}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        begin();
      }}
      className={
        [
          editing ? '${P}-editing' : null,
          filled ? '${P}-filled' : null,
          error ? '${P}-error' : null,
          disabled ? '${P}-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      sx={[solarInlineInputStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE,
        // Read, its words and the edit button; editing, the input and its actions.
        parts: {
          ...parts,
          iconButton: { ...parts.iconButton, present: !editing && !disabled },
          frame1: { ...parts.frame1, present: editing },
          confirm: { ...parts.confirm, present: editing },
          cancel: { ...parts.cancel, present: editing },
        },
        text: editing ? undefined : { value },
        render: {
          value: (layer) => (
            <InputBase
              className="${P}-words"
              inputRef={input}
              value={draft}
              placeholder={placeholder}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              error={error}
              inputProps={{
                className: layer.className,
                'aria-label': label,
                'aria-invalid': error || undefined,
                onKeyDown: (event) => {
                  if (event.key === 'Enter') confirm();
                  if (event.key === 'Escape') cancel();
                },
              }}
            />
          ),
          iconButton: (layer) => (
            <span {...layer}>
              <IconButton
                ref={edit}
                variant="tertiary"
                size="sm"
                shape="square"
                icon={<IconEdit />}
                aria-label={label ? \`Edit \${label}\` : 'Edit'}
                onClick={(event) => {
                  event.stopPropagation();
                  begin();
                }}
              />
            </span>
          ),
          confirm: (layer) => (
            <span {...layer}>
              <IconButton
                variant="tertiary"
                size="sm"
                shape="square"
                icon={<IconCheck />}
                aria-label="Confirm"
                onClick={confirm}
              />
            </span>
          ),
          cancel: (layer) => (
            <span {...layer}>
              <IconButton
                variant="tertiary"
                size="sm"
                shape="square"
                icon={<IconClose />}
                aria-label="Cancel"
                onClick={cancel}
              />
            </span>
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
      const api = Object.entries(spec.api);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarInlineInputRecipe]: its box by mode and state, and its words' ink, read cell by cell.`;
      const about = `A value edited where it is shown (a name in a header, a cell): read, its [value] as text, with an edit button on hover or focus; a tap, or the edit button, opens it for editing, an undecorated [TextField] with Confirm and Cancel, drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds its states). Enter or Confirm calls [onConfirm] with what is typed, which may return false to keep it open (a value it rejects, with [error] set); Esc or Cancel discards the edit ([onCancel]). It holds its own mode, and [defaultEditing] starts it open. Its [label] names the input and the edit button for a screen reader ("Edit name").`;
      return `/// SOLAR Inline Input.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/inline_input.dart';
import '../generated/components/icon_button.dart';
import '../generated/icons.dart';
import '../solar_field.dart';
import '../solar_icon.dart';
import '../solar_layers.dart';
import 'solar_icon_button.dart';
import 'solar_theme_of.dart';

class SolarInlineInput extends StatefulWidget {
  const SolarInlineInput({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('InlineInput', prop, def)},`).join('\n')}
    required this.value,
    required this.onConfirm,
    this.onCancel,
    this.defaultEditing = false,
    this.label,
    this.placeholder,
    this.statesController,
  });

${api.map(([prop, def]) => dartField('InlineInput', prop, def)).join('\n')}

  /// The value it shows, and edits.
  final String value;

  /// Called with what is typed when Enter or Confirm commits it; false keeps it open (a value the
  /// caller rejects, with [error] set).
  final bool? Function(String value) onConfirm;

  /// Called when Esc or Cancel discards the edit.
  final VoidCallback? onCancel;

  /// Whether it starts open for editing.
  final bool defaultEditing;

  /// What it holds, for a screen reader: names the input, and the edit button ("Edit name").
  final String? label;

  /// What it shows while the input is empty.
  final String? placeholder;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarInlineInput> createState() => _SolarInlineInputState();
}

class _SolarInlineInputState extends State<SolarInlineInput> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  late bool _editing = widget.defaultEditing && !widget.disabled;
  late final _draft = TextEditingController(text: widget.value);
  final _focus = FocusNode();
  final _edit = FocusNode();

  @override
  void initState() {
    super.initState();
    // The edit button shows while it has the focus, as while it is hovered.
    _edit.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _draft.dispose();
    _focus.dispose();
    _edit.dispose();
    super.dispose();
  }

  void _begin() {
    if (widget.disabled || _editing) return;
    _draft.text = widget.value;
    setState(() => _editing = true);
    _focus.requestFocus();
  }

  void _close() {
    setState(() => _editing = false);
    _edit.requestFocus();
  }

  void _confirm() {
    if (widget.onConfirm(_draft.text) != false) _close();
  }

  void _cancel() {
    _draft.text = widget.value;
    _close();
    widget.onCancel?.call();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final label = widget.label;
    Widget action(SolarVector icon, String name, VoidCallback onPressed, {FocusNode? focus}) =>
        SolarIconButton(
          variant: SolarIconButtonVariant.tertiary,
          size: SolarIconButtonSize.sm,
          shape: SolarIconButtonShape.square,
          // In the size and ink the button gives its icon.
          icon: Builder(
            builder: (context) {
              final theme = IconTheme.of(context);
              return SolarIcon(icon, size: theme.size, color: theme.color);
            },
          ),
          semanticLabel: name,
          focusNode: focus,
          onPressed: onPressed,
        );
    return SolarField(
      controller: _draft,
      focusNode: _focus,
      statesController: widget.statesController,
      builder: (context, field) {
        final states = field.states;
        final hovered = states.contains(WidgetState.hovered);
        // Filled while it is open and the focus is off its input, on its buttons.
        final p = SolarInlineInputProps(
${api.map(([prop]) => `          ${prop}: widget.${prop},`).join('\n')}
          filled: _editing && !states.contains(WidgetState.focused),
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarInlineInputRecipe.lookup(c, p, states),
            dimension: (c) => SolarInlineInputRecipe.dimension(c, p, states),
            color: (c) => SolarInlineInputRecipe.color(t, c, p, states),
            shadow: (c) => SolarInlineInputRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarInlineInputRecipe.textStyle(t, c, p, states),
            // Read, its words and the edit button; editing, the input and its actions.
            present: (l) => switch (l) {
              'iconButton' => !_editing && !widget.disabled,
              'frame1' || 'confirm' || 'cancel' => _editing,
              _ => SolarInlineInputRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: '${keyPrefixOf(spec.component)}',
          text: _editing ? const {} : {'value': widget.value},
          truncates: const {'value'},
          composed: {
            // The edit button shows while it is hovered or has the focus, keeping its room.
            'iconButton': Visibility.maintain(
              visible: hovered || _edit.hasFocus,
              child: action(
                SolarIcons.editOutline,
                label == null ? 'Edit' : 'Edit $label',
                _begin,
                focus: _edit,
              ),
            ),
            'confirm': action(SolarIcons.checkOutline, 'Confirm', _confirm),
            'cancel': action(SolarIcons.closeOutline, 'Cancel', _cancel),
          },
          fields: {
            if (_editing)
              'value': (style) => field.read(
                CallbackShortcuts(
                  bindings: {
                    const SingleActivator(LogicalKeyboardKey.escape): _cancel,
                  },
                  child: TextField(
                    controller: field.text,
                    focusNode: field.focus,
                    onSubmitted: (_) => _confirm(),
                    style: style,
                    maxLines: 1,
                    decoration: InputDecoration.collapsed(
                      hintText: widget.placeholder,
                      hintStyle: style,
                    ),
                  ),
                ),
                label: label,
              ),
          },
          builders: {
            // Read, a tap anywhere edits it; editing, it is hovered as a field is.
            'root': (layer) => _editing
                ? field.area(layer, enabled: true)
                : MouseRegion(
                    cursor: widget.disabled
                        ? MouseCursor.defer
                        : SystemMouseCursors.text,
                    child: field.area(
                      GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: widget.disabled ? null : _begin,
                        child: layer,
                      ),
                      enabled: false,
                    ),
                  ),
          },
        ).layer('root');
      },
    );
  }
}
`;
    },
  },
};
