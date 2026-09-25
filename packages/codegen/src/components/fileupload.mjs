/**
 * SOLAR FileUpload, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drop zone with a Browse button (a SOLAR Button), and, once a file is chosen, its name with
 * replace and remove buttons (SOLAR Icon Buttons). A real file input on the web; in Flutter, which
 * has no file picker of its own, the files the app's picker chose. Filled follows the files (the
 * overlay's `derive`).
 */

import { dartField, dartParam } from '../shells/helpers.mjs';
import {
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';

const P = 'SolarFileUpload';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  if (tree.root?.join() !== 'label,field,helper')
    throw new Error(
      'FileUpload: its root does not hold its label, field and helper',
    );
  if (tree.field?.join() !== 'iconFile,fileName,button,iconButton,iconButton2')
    throw new Error(
      'FileUpload: its field does not hold its icon, name and buttons',
    );
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('FileUpload: its filled is not derived from its files');
};

export default {
  name: 'FileUpload',
  mui: {
    // The shell draws every layer itself, each with a class of its own; Browse, replace and remove
    // are SOLAR's buttons.
    slots: 'drawn',
    resets: drawnResets('FileUpload', {
      // The file's name takes the room the buttons leave, cut short where it runs out.
      [`& .${P}--fileName`]: {
        flex: '1 1 0%',
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      [`& .${P}-helper`]: { whiteSpace: 'normal' },
    }),
    // Hovered as its drop zone is, or while a file is dragged over it; focused as a button in it
    // is by the keyboard; filled, in error and disabled by the shell's classes.
    states: {
      default: null,
      hover: `&:has(.${P}--field:hover), &.${P}-dragging`,
      focus: `&:has(.${P}--field :focus-visible)`,
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
 * SOLAR FileUpload.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarFileUploadStyle\` and \`solarFileUploadCompose\` in \`@bwp-web/styles/mui\`: the
 * drop zone's fill, edge and focus ring by state, its file's ink, and the label and helper.
 *
 * A file to upload: its \`label\` above (a \`mandatory\` one is starred), its \`helper\` below (the
 * limits: "Max 10MB, .jpg .png"), which says what is wrong where it is in \`error\`. Browse opens the
 * browser's file picker, a real \`<input type="file">\` of its \`accept\`, \`multiple\` and \`name\`, and
 * a file dropped on the zone is taken as well. Chosen, the file's name shows, with replace and
 * remove buttons. \`onChange\` is called with the files; \`value\` controls them. The app checks sizes
 * and types, and sets \`error\`. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import { IconDelete, IconFile, IconRefresh } from '@bwp-web/assets';
import Box, { type BoxProps } from '@mui/material/Box';
import { useControlled } from '@mui/material/utils';
import { forwardRef, useId, useRef, useState, type ReactNode } from 'react';
import {
  solarFileUploadCompose,
  solarFileUploadStyle,
  type SolarFileUploadProps,
} from '@bwp-web/styles/mui';
import { Button } from './Button.js';
import { IconButton } from './IconButton.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface FileUploadProps
  extends SolarFileUploadProps,
    Omit<BoxProps, keyof SolarFileUploadProps | 'children' | 'onChange' | 'defaultValue' | 'ref'> {
  /** What it asks for, above it ("Upload a file"). */
  label?: ReactNode;
  /** Whether a file is required, which stars the label and makes the input required. */
  mandatory?: boolean;
  /** More about it, below (the limits); where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** The files chosen; controlled where given. */
  value?: File[];
  /** The files it starts with, where \`value\` does not say. */
  defaultValue?: File[];
  /** Called with the files as they are chosen, dropped or removed. */
  onChange?: (files: File[]) => void;
  /** The types it takes, as the file input's \`accept\` (".jpg,.png", "image/*"). */
  accept?: string;
  /** Whether it takes more than one file. */
  multiple?: boolean;
  /** The file input's name, for a form. */
  name?: string;
  /** What the zone says while no file is chosen. */
  placeholder?: string;
  /** Browse's words. */
  browseLabel?: string;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    value: valueProp,
    defaultValue,
    onChange,
    accept,
    multiple = false,
    name,
    placeholder = 'Select a file…',
    browseLabel = 'Browse',
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useControlled<File[]>({
    controlled: valueProp,
    default: defaultValue ?? [],
    name: 'FileUpload',
    state: 'value',
  });
  const [dragging, setDragging] = useState(false);
  const choose = (list: FileList | null) => {
    const chosen = Array.from(list ?? []).slice(0, multiple ? undefined : 1);
    if (!chosen.length) return;
    setFiles(chosen);
    onChange?.(chosen);
  };
  const browse = () => input.current?.click();
  const remove = () => {
    setFiles([]);
    onChange?.([]);
    if (input.current) input.current.value = '';
  };
  // Filled where it holds a file.
  const filled = files.length > 0;
  const look = { ${api.join(', ')}, filled };
  // Its Browse gives way to replace and remove once filled, and is disabled with it.
  const parts = solarFileUploadCompose(
    look,
    disabled ? 'disabled' : filled ? 'filled' : error ? 'error' : 'default',
  );
  return (
    <Box
      ref={ref}
      {...rest}
      className={
        [
          dragging ? '${P}-dragging' : null,
          filled ? '${P}-filled' : null,
          error ? '${P}-error' : null,
          disabled ? '${P}-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      style={style}
      sx={[solarFileUploadStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <input
        ref={input}
        id={id}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        name={name}
        required={mandatory}
        disabled={disabled}
        onChange={(event) => choose(event.target.files)}
      />
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE, slots: SLOTS,
        // A part left empty is not drawn.
        parts: {
          ...parts,
          label: { ...parts.label, present: label != null },
          mandatory: { ...parts.mandatory, present: mandatory },
          helper: { ...parts.helper, present: helper != null },
        },
        text: {
          uploadAFile: label,
          mandatory: <span aria-hidden>*</span>,
          fileName: filled ? files.map((f) => f.name).join(', ') : placeholder,
          helper,
        },
        icons: { iconFile: <IconFile /> },
        render: {
          // The drop zone takes a file dropped on it, as Browse does.
          field: (layer) => (
            <span
              {...layer}
              onDragOver={(event) => {
                if (disabled) return;
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (!disabled) choose(event.dataTransfer.files);
              }}
            />
          ),
          button: (layer) => (
            <span {...layer}>
              <Button variant="secondary" size="md" disabled={disabled} onClick={browse}>
                {browseLabel}
              </Button>
            </span>
          ),
          iconButton: (layer) => (
            <span {...layer}>
              <IconButton
                variant="secondary"
                size="md"
                shape="square"
                icon={<IconRefresh />}
                aria-label="Replace file"
                onClick={browse}
              />
            </span>
          ),
          iconButton2: (layer) => (
            <span {...layer}>
              <IconButton
                variant="secondary"
                size="md"
                shape="square"
                icon={<IconDelete />}
                aria-label="Remove file"
                onClick={remove}
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
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarFileUploadRecipe]: the drop zone's fill, edge and focus ring by state, its file's ink, and the label and helper, read cell by cell.`;
      const about = `A file to upload: its [label] above (a [mandatory] one is starred), its [helper] below (the limits: "Max 10MB, .jpg .png"), which says what is wrong where it is in [error]. Flutter has no file picker of its own, so the app's does the choosing: Browse and replace call [onBrowse], for the app to open one (the file_picker package, say) and give back what was chosen as [value], the files' names, which it shows, with replace and remove ([onRemove]) buttons. Drawn from Figma's layer tree with [SolarLayers]; its Browse is a SolarButton, and replace and remove are SolarIconButtons.`;
      return `/// SOLAR FileUpload.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/button.dart';
import '../generated/components/fileupload.dart';
import '../generated/components/icon_button.dart';
import '../generated/icons.dart';
import '../solar_icon.dart';
import '../solar_layers.dart';
import 'solar_button.dart';
import 'solar_icon_button.dart';
import 'solar_theme_of.dart';

class SolarFileUpload extends StatefulWidget {
  const SolarFileUpload({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('FileUpload', prop, def)},`).join('\n')}
    this.label,
    this.mandatory = false,
    this.helper,
    this.value = const [],
    required this.onBrowse,
    this.onRemove,
    this.placeholder = 'Select a file…',
    this.browseLabel = 'Browse',
    this.statesController,
  });

${api.map(([prop, def]) => dartField('FileUpload', prop, def)).join('\n')}

  /// What it asks for, above it ("Upload a file").
  final String? label;

  /// Whether a file is required, which stars the label.
  final bool mandatory;

  /// More about it, below (the limits); where it is in [error], what is wrong.
  final String? helper;

  /// The names of the files the app's picker chose.
  final List<String> value;

  /// Opens the app's file picker, from Browse or replace; null disables it.
  final VoidCallback? onBrowse;

  /// Removes the files chosen.
  final VoidCallback? onRemove;

  /// What the zone says while no file is chosen.
  final String placeholder;

  /// Browse's words.
  final String browseLabel;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarFileUpload> createState() => _SolarFileUploadState();
}

class _SolarFileUploadState extends State<SolarFileUpload> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  /// Hovered as its drop zone is, focused as a button in it is.
  final _states = WidgetStatesController();

  @override
  void dispose() {
    _states.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final label = widget.label;
    final helper = widget.helper;
    final enabled = !widget.disabled && widget.onBrowse != null;
    final forced = widget.statesController;
    // A SOLAR icon in the size and ink the button gives its icon.
    Widget icon(SolarVector vector) => Builder(
      builder: (context) {
        final theme = IconTheme.of(context);
        return SolarIcon(vector, size: theme.size, color: theme.color);
      },
    );
    return ListenableBuilder(
      listenable: Listenable.merge([_states, ?forced]),
      builder: (context, _) {
        final states = {..._states.value, ...?forced?.value};
        // Filled where it holds a file.
        final p = SolarFileUploadProps(
${api.map(([prop]) => `          ${prop}: widget.${prop},`).join('\n')}
          filled: widget.value.isNotEmpty,
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarFileUploadRecipe.lookup(c, p, states),
            dimension: (c) => SolarFileUploadRecipe.dimension(c, p, states),
            color: (c) => SolarFileUploadRecipe.color(t, c, p, states),
            shadow: (c) => SolarFileUploadRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarFileUploadRecipe.textStyle(t, c, p, states),
            // A part left empty is not drawn.
            present: (l) => switch (l) {
              'label' => label != null,
              'mandatory' => widget.mandatory,
              'helper' => helper != null,
              _ => SolarFileUploadRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: '${keyPrefixOf(spec.component)}',
          text: {
            'uploadAFile': ?label,
            'mandatory': '*',
            'fileName': widget.value.isEmpty
                ? widget.placeholder
                : widget.value.join(', '),
            'helper': ?helper,
          },
          truncates: const {'fileName'},
          wraps: const {'helper': TextAlign.start},
          icons: const {'iconFile': SolarIcons.fileOutline},
          composed: {
            'button': SolarButton(
              variant: SolarButtonVariant.secondary,
              size: SolarButtonSize.md,
              disabled: widget.disabled,
              onPressed: enabled ? widget.onBrowse : null,
              child: Text(widget.browseLabel),
            ),
            'iconButton': SolarIconButton(
              variant: SolarIconButtonVariant.secondary,
              size: SolarIconButtonSize.md,
              shape: SolarIconButtonShape.square,
              icon: icon(SolarIcons.refreshOutline),
              semanticLabel: 'Replace file',
              onPressed: enabled ? widget.onBrowse : null,
            ),
            'iconButton2': SolarIconButton(
              variant: SolarIconButtonVariant.secondary,
              size: SolarIconButtonSize.md,
              shape: SolarIconButtonShape.square,
              icon: icon(SolarIcons.deleteOutline),
              semanticLabel: 'Remove file',
              onPressed: widget.disabled ? null : widget.onRemove,
            ),
          },
          builders: {
            // The star is the label's mark, not words to read.
            'mandatory': (star) => ExcludeSemantics(child: star),
            // Hovered as a whole, and focused where a button in it has the keyboard's focus.
            'field': (field) => MouseRegion(
              onEnter: (_) => _states.update(WidgetState.hovered, true),
              onExit: (_) => _states.update(WidgetState.hovered, false),
              child: Focus(
                canRequestFocus: false,
                skipTraversal: true,
                onFocusChange: (on) => _states.update(WidgetState.focused, on),
                child: field,
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
