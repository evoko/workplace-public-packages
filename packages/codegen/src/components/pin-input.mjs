/**
 * SOLAR PIN Input, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A code of one digit per cell, `length` of them (owner decision 2026-09-24: 4 to 6), held by one
 * native input laid invisible over the cells. The cell the next digit goes in is drawn as Figma's
 * first, the one that takes the hover and the focus and shows the caret; the rest as Figma's rest.
 * Filled follows the code (the overlay's `derive`).
 */

import { dartField, dartParam } from '../shells/helpers.mjs';
import { drawnResets, keyPrefixOf, treeOf, wrapDoc } from '../shells/drawn.mjs';

const P = 'SolarPINInput';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  if (tree.root?.join() !== 'label,cells,helper,errorMessage')
    throw new Error(
      'PIN Input: its root does not hold its label, cells, helper and error',
    );
  if (tree.cells?.length !== 6)
    throw new Error('PIN Input: it does not draw six cells');
  if (tree.field?.join() !== 'placeholder,caret,digit')
    throw new Error(
      'PIN Input: its first cell does not hold a placeholder, caret and digit',
    );
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('PIN Input: its filled is not derived from its code');
};

export default {
  name: 'PIN Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the code is one native
    // input over the cells.
    slots: 'drawn',
    resets: drawnResets('PIN Input', {
      // The input holds the code, invisible over the cells, which a tap anywhere on them focuses.
      [`& .${P}-cells`]: { position: 'relative' },
      [`& .${P}-input`]: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '0',
        border: '0',
        opacity: '0',
        cursor: 'text',
        font: 'inherit',
      },
      [`& .${P}-input:disabled`]: { cursor: 'default' },
      [`& .${P}-helper, & .${P}-errorMessage`]: { whiteSpace: 'normal' },
    }),
    // Hovered as its cells are, focused as its input is; filled, in error and disabled by the
    // shell's classes.
    states: {
      default: null,
      hover: `&:has(.${P}-cells:hover)`,
      focus: `&:has(.${P}-input:focus)`,
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // A field's label is its `label`, as Text Input's is.
    label: 'label',
    // Flutter holds the code in its controller.
    flutter: { value: 'controller' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      const tree = treeOf(spec);
      return `/**
 * SOLAR PIN Input.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarPINInputStyle\` and \`solarPINInputCompose\` in \`@bwp-web/styles/mui\`: each
 * cell's fill, edge and focus ring by state, its digit's and placeholder's ink, and the label,
 * helper and error.
 *
 * A one-time code or a verification code, one digit per cell, \`length\` of them (4 to 6, six by
 * default): its \`label\` above (a \`mandatory\` one is starred), its \`helper\` below, and in \`error\`
 * its \`errorMessage\` there instead. One native input holds the code, invisible over the cells, so
 * typing moves on a cell, Backspace steps back, a paste fills every cell, and the phone offers the
 * code it was sent (\`autoComplete\` one-time-code, the numeric keyboard). The cell the next digit
 * goes in shows the focus and the caret. \`onChange\` is called with the digits, \`onComplete\` once
 * every cell holds one. For a password or free text, use a Password Input or a Text Input. The app
 * must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { useControlled } from '@mui/material/utils';
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  solarPINInputCompose,
  solarPINInputStyle,
  type SolarPINInputProps,
} from '@bwp-web/styles/mui';
import { drawChildren, drawLayer, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(tree)};

/** Figma's six cells, in its order: the first takes the hover, the focus and the caret. */
const CELLS = TREE.cells;

/** A cell's placeholder and digit, as Figma names them. */
const partsOf = (cell: string) => ({
  placeholder: TREE[cell].find((l) => l.startsWith('placeholder'))!,
  digit: TREE[cell].find((l) => l.startsWith('digit'))!,
});

export interface PINInputProps
  extends SolarPINInputProps,
    Omit<BoxProps, keyof SolarPINInputProps | 'children' | 'onChange' | 'defaultValue' | 'ref'> {
  /** What it asks for, above it. */
  label?: ReactNode;
  /** Whether it must be filled, which stars the label and makes the input required. */
  mandatory?: boolean;
  /** More about it, below. */
  helper?: ReactNode;
  /** What is wrong, below in the helper's place, where it is in \`error\`. */
  errorMessage?: ReactNode;
  /** How many digits the code has, 4 to 6. */
  length?: 4 | 5 | 6;
  /** The digits typed; controlled where given. */
  value?: string;
  /** The digits it starts with, where \`value\` does not say. */
  defaultValue?: string;
  /** Called with the digits as they change. */
  onChange?: (value: string) => void;
  /** Called with the code once every cell holds a digit. */
  onComplete?: (value: string) => void;
  /** What an empty cell shows, Figma's 0 by default. */
  placeholder?: string;
  /** Props for the native input (its \`name\` for a form, \`autoFocus\`). */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export const PINInput = forwardRef<HTMLDivElement, PINInputProps>(function PINInput(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    errorMessage,
    length = 6,
    value: valueProp,
    defaultValue,
    onChange,
    onComplete,
    placeholder = '0',
    inputProps,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const id = useId();
  const [value, setValue] = useControlled<string>({
    controlled: valueProp,
    default: defaultValue ?? '',
    name: 'PINInput',
    state: 'value',
  });
  const [focused, setFocused] = useState(false);
  // Filled where it holds its code.
  const filled = value.length > 0;
  const look = { ${api.join(', ')}, filled };
  // Its helper gives way to its error, in error.
  const parts = solarPINInputCompose(look, error ? 'error' : 'default');
  // The cell the next digit goes in is Figma's first; the others are Figma's rest, in order.
  const next = Math.min(value.length, length - 1);
  const others = CELLS.slice(1);
  const cells = Array.from({ length }, (_, i) => (i === next ? CELLS[0] : others.shift()!));
  const text: Record<string, ReactNode> = {};
  const present: Record<string, boolean> = {};
  cells.forEach((cell, i) => {
    const { placeholder: empty, digit } = partsOf(cell);
    const caret = cell === CELLS[0] && focused && !value[i];
    text[digit] = value[i] ?? '';
    text[empty] = placeholder;
    present[digit] = Boolean(value[i]);
    present[empty] = !value[i] && !caret;
    if (cell === CELLS[0]) {
      text.caret = '|';
      present.caret = caret;
    }
  });
  const drawing: LayerDrawing = {
    prefix: '${P}',
    tree: TREE,
    parts: {
      ...parts,
      ...Object.fromEntries(
        Object.entries(present).map(([layer, shown]) => [
          layer,
          { ...parts[layer], present: shown },
        ]),
      ),
      label: { ...parts.label, present: label != null },
      mandatory: { ...parts.mandatory, present: mandatory },
      helper: { ...parts.helper, present: parts.helper?.present !== false && helper != null },
      errorMessage: {
        ...parts.errorMessage,
        present: parts.errorMessage?.present !== false && errorMessage != null,
      },
    },
    text: {
      ...text,
      labelLabel: label,
      mandatory: <span aria-hidden>*</span>,
      errorMessage,
    },
  };
  const describedBy = error && errorMessage != null ? \`\${id}-error\` : helper != null ? \`\${id}-helper\` : undefined;
  return (
    <Box
      ref={ref}
      {...rest}
      className={
        [
          filled ? '${P}-filled' : null,
          error ? '${P}-error' : null,
          disabled ? '${P}-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      style={style}
      sx={[solarPINInputStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        ...drawing,
        content: {
          // Its cells, the next one Figma's first, and the input over them.
          cells: [
            ...cells.map((cell) => drawLayer(cell, drawing)),
            <input
              key="input"
              {...inputProps}
              id={id}
              className="${P}-input"
              value={value}
              maxLength={length}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              aria-invalid={error || undefined}
              aria-describedby={describedBy}
              required={mandatory}
              disabled={disabled}
              onFocus={(event) => {
                setFocused(true);
                inputProps?.onFocus?.(event);
              }}
              onBlur={(event) => {
                setFocused(false);
                inputProps?.onBlur?.(event);
              }}
              // The digits go in at the end, whatever the caret the browser keeps.
              onSelect={(event) => {
                const end = event.currentTarget.value.length;
                event.currentTarget.setSelectionRange(end, end);
              }}
              onChange={(event) => {
                const digits = event.target.value.replace(/\\D/g, '').slice(0, length);
                setValue(digits);
                onChange?.(digits);
                if (digits.length === length) onComplete?.(digits);
              }}
            />,
          ],
        },
        render: {
          label: (layer) => <label htmlFor={id} {...layer} />,
          helper: (layer) => (
            <span id={\`\${id}-helper\`} className={layer.className} style={layer.style}>
              {helper}
            </span>
          ),
          errorMessage: (layer) => (
            <span id={\`\${id}-error\`} className={layer.className} style={layer.style}>
              {errorMessage}
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
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarPINInputRecipe]: each cell's fill, edge and focus ring by state, its digit's and placeholder's ink, and the label, helper and error, read cell by cell.`;
      const about = `A one-time code or a verification code, one digit per cell, [length] of them (4 to 6, six by default): its [label] above (a [mandatory] one is starred), its [helper] below, and in [error] its [errorMessage] there instead. One [TextField] holds the code, invisible over the cells drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds it and its states), so typing moves on a cell, Backspace steps back, a paste fills every cell, and the phone offers the code it was sent (the one-time-code autofill, the numeric keyboard). The cell the next digit goes in shows the focus and the caret. [onChanged] is called with the digits, [onCompleted] once every cell holds one. It reads as one text field, named by its label.`;
      return `/// SOLAR PIN Input.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/pin_input.dart';
import '../solar_field.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarPINInput extends StatelessWidget {
  const SolarPINInput({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('PINInput', prop, def)},`).join('\n')}
    this.label,
    this.mandatory = false,
    this.helper,
    this.errorMessage,
    this.length = 6,
    this.controller,
    this.onChanged,
    this.onCompleted,
    this.placeholder = '0',
    this.autofocus = false,
    this.focusNode,
    this.statesController,
  }) : assert(length >= 4 && length <= 6, 'a PIN has 4 to 6 digits');

${api.map(([prop, def]) => dartField('PINInput', prop, def)).join('\n')}

  /// What it asks for, above it.
  final String? label;

  /// Whether it must be filled, which stars the label.
  final bool mandatory;

  /// More about it, below.
  final String? helper;

  /// What is wrong, below in the helper's place, where it is in [error].
  final String? errorMessage;

  /// How many digits the code has, 4 to 6.
  final int length;

  /// Its digits, where the caller keeps them; one of its own, empty, otherwise.
  final TextEditingController? controller;

  /// Called with the digits as they change.
  final ValueChanged<String>? onChanged;

  /// Called with the code once every cell holds a digit.
  final ValueChanged<String>? onCompleted;

  /// What an empty cell shows, Figma's 0 by default.
  final String placeholder;

  /// Whether it takes the focus when first built.
  final bool autofocus;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final label = this.label;
    final helper = this.helper;
    final errorMessage = this.errorMessage;
    final cellsOf = _tree['cells']!;
    return SolarField(
      controller: controller,
      focusNode: focusNode,
      statesController: statesController,
      builder: (context, field) {
        final states = field.states;
        final value = field.text.text;
        // Filled where it holds its code.
        final p = SolarPINInputProps(
${api.map(([prop]) => `          ${prop}: ${prop},`).join('\n')}
          filled: value.isNotEmpty,
        );
        // The cell the next digit goes in is Figma's first; the others are Figma's rest, in order.
        final next = value.length < length ? value.length : length - 1;
        final rest = cellsOf.skip(1).iterator;
        final cells = [
          for (var i = 0; i < length; i++)
            i == next ? cellsOf.first : (rest..moveNext()).current,
        ];
        final focused = states.contains(WidgetState.focused);
        final text = <String, String>{};
        final shown = <String, bool>{};
        for (final (i, cell) in cells.indexed) {
          final parts = _tree[cell]!;
          final digit = parts.firstWhere((l) => l.startsWith('digit'));
          final empty = parts.firstWhere((l) => l.startsWith('placeholder'));
          final has = i < value.length;
          final caret = cell == cellsOf.first && focused && !has;
          text[digit] = has ? value[i] : '';
          text[empty] = placeholder;
          shown[digit] = has;
          shown[empty] = !has && !caret;
          if (cell == cellsOf.first) {
            text['caret'] = '|';
            shown['caret'] = caret;
          }
        }
        SolarLayers draw({Map<String, List<Widget>> content = const {}}) =>
            SolarLayers(
              recipe: SolarLayerRecipe(
                lookup: (c) => SolarPINInputRecipe.lookup(c, p, states),
                dimension: (c) => SolarPINInputRecipe.dimension(c, p, states),
                color: (c) => SolarPINInputRecipe.color(t, c, p, states),
                shadow: (c) => SolarPINInputRecipe.shadow(t, c, p, states),
                textStyle: (c) => SolarPINInputRecipe.textStyle(t, c, p, states),
                // A part left empty is not drawn; the cells' parts are as the code fills them.
                present: (l) => switch (l) {
                  _ when shown.containsKey(l) => shown[l]!,
                  'label' => label != null,
                  'mandatory' => mandatory,
                  'helper' =>
                    helper != null && SolarPINInputRecipe.present(l, p, states),
                  'errorMessage' =>
                    errorMessage != null &&
                        SolarPINInputRecipe.present(l, p, states),
                  _ => SolarPINInputRecipe.present(l, p, states),
                },
                glyph: (_) => null,
              ),
              tree: _tree,
              keyPrefix: '${keyPrefixOf(spec.component)}',
              text: {
                ...text,
                'labelLabel': ?label,
                'mandatory': '*',
                'helper': ?helper,
                'errorMessage': ?errorMessage,
              },
              wraps: const {
                'helper': TextAlign.start,
                'errorMessage': TextAlign.start,
              },
              content: content,
              builders: {
                // A cell's words are as wide as the cell leaves them: Figma's 0 at 16px sits in a
                // 12px room, which a font's measure may pass by a hair.
                for (final cell in cellsOf)
                  for (final part in _tree[cell]!) part: (words) => Flexible(child: words),
                // The label, the helper and the error are read with the code, which they name.
                'label': (layer) => ExcludeSemantics(child: layer),
                'helper': (layer) => ExcludeSemantics(child: layer),
                'errorMessage': (layer) => ExcludeSemantics(child: layer),
                // The cells, with the input that holds the code invisible over them.
                'cells': (row) => field.area(
                  Stack(
                    children: [
                      ExcludeSemantics(child: row),
                      Positioned.fill(
                        child: Opacity(
                          opacity: 0,
                          // Unseen, and still read: the code's text field.
                          alwaysIncludeSemantics: true,
                          child: field.read(
                            TextField(
                              controller: field.text,
                              focusNode: field.focus,
                              enabled: !disabled,
                              autofocus: autofocus,
                              keyboardType: TextInputType.number,
                              autofillHints: const [AutofillHints.oneTimeCode],
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                LengthLimitingTextInputFormatter(length),
                              ],
                              onChanged: (digits) {
                                onChanged?.call(digits);
                                if (digits.length == length) {
                                  onCompleted?.call(digits);
                                }
                              },
                              showCursor: false,
                              enableInteractiveSelection: false,
                              decoration: const InputDecoration.collapsed(
                                hintText: null,
                              ),
                            ),
                            label: label,
                            hint: error ? errorMessage : helper,
                          ),
                        ),
                      ),
                    ],
                  ),
                  enabled: !disabled,
                ),
              },
            );
        final drawer = draw();
        return draw(
          content: {'cells': [for (final cell in cells) drawer.layer(cell)]},
        ).layer('root');
      },
    );
  }
}
`;
    },
  },
};
