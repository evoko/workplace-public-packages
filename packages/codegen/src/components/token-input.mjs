/**
 * SOLAR Token Input, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, run once by \`solar:scaffold\`. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A field of entries it holds (owner decision 2026-09-24), each a SOLAR Tag, those past
 * \`maxVisible\` counted by a SOLAR Counter, and an input for the next: MUI's InputBase on the web,
 * an undecorated TextField in Flutter. Filled follows the entries and active the draft (the
 * overlay's `derive`).
 */

import { dartField, dartParam } from '../scaffold/helpers.mjs';
import { keyPrefixOf, treeOf, wrapDoc } from '../scaffold/drawn.mjs';
import { fieldResets } from '../scaffold/field.mjs';

const P = 'SolarTokenInput';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'helper'],
    label: ['labelLabel', 'mandatory'],
    field: ['tags', 'counter'],
    tags: ['addItems', 'tag', 'tag2'],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `Token Input: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
  for (const axis of ['filled', 'active'])
    if (spec.derived?.[axis]?.type !== 'boolean')
      throw new Error(`Token Input: its ${axis} is not derived`);
};

export default {
  name: 'Token Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the tokens are SOLAR Tags,
    // the input MUI's InputBase, in the field's row of tags.
    slots: 'drawn',
    resets: fieldResets('Token Input', {
      input: 'addItems',
      more: {
        // InputBase's own box around the input takes no part in the row's layout.
        [`& .${P}-words`]: { display: 'contents' },
        // The input takes the room the tokens leave, never less than a few characters.
        [`& .${P}-addItems.MuiInputBase-input`]: { minWidth: '4ch' },
        // The tokens keep their size; the row cuts off what does not fit (maxVisible counts it).
        [`& .${P}-tags`]: { minWidth: '0', overflow: 'hidden' },
        [`& .${P}-tags > *`]: { flexShrink: '0' },
      },
    }),
    // Hovered as the field is, and focused as the InputBase in it is; active (typing), filled,
    // read-only, in error and disabled by the shell's classes.
    states: {
      default: null,
      hover: `&:has(.${P}-field:hover)`,
      focus: `&:has(.${P}-field .Mui-focused)`,
      active: `&.${P}-active`,
      filled: `&.${P}-filled`,
      readonly: `&.${P}-readonly`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // A field's label is its `label`, as Text Input's is.
    label: 'label',
    // Flutter holds the draft in its controller.
    flutter: { inputValue: 'controller' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Token Input.
 *
 * Scaffolded once by \`npm run solar:scaffold "Token Input"\` from spec/components/token-input.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, \`solarTokenInputStyle\` and \`solarTokenInputCompose\` in \`@bwp-web/styles/mui\`: the
 * field's fill, edge and focus ring by state, the draft's ink, and the label and helper.
 *
 * A field of entries (tags, recipients, keywords): its \`label\` above (a \`mandatory\` one is starred),
 * its \`helper\` below, which says what is wrong where it is in \`error\`. It holds its entries,
 * \`value\` or \`defaultValue\`, each drawn as a SOLAR Tag with a close button that removes it; Enter
 * adds what is typed, and Backspace in the empty input removes the last. \`maxVisible\` draws that
 * many, and counts the rest in a SOLAR Counter. \`onChange\` is called with the entries,
 * \`onInputChange\` with the draft. Read-only, the entries are shown and cannot be changed. The app
 * must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import InputBase, { type InputBaseComponentProps } from '@mui/material/InputBase';
import { useControlled } from '@mui/material/utils';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarTokenInputCompose,
  solarTokenInputStyle,
  type SolarTokenInputProps,
} from '@bwp-web/styles/mui';
import { Counter } from './Counter.js';
import { drawChildren } from './internal/layers.js';
import { Tag, type TagProps } from './Tag.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface TokenInputProps
  extends SolarTokenInputProps,
    Omit<BoxProps, keyof SolarTokenInputProps | 'children' | 'onChange' | 'defaultValue' | 'ref'> {
  /** What it asks for, above it. */
  label?: ReactNode;
  /** Whether it must be filled, which stars the label. */
  mandatory?: boolean;
  /** More about it, below; where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** Its entries; controlled where given. */
  value?: string[];
  /** The entries it starts with, where \`value\` does not say. */
  defaultValue?: string[];
  /** Called with the entries as they change. */
  onChange?: (value: string[]) => void;
  /** What is typed, the next entry; controlled where given. */
  inputValue?: string;
  /** Called with what is typed as it changes. */
  onInputChange?: (inputValue: string) => void;
  /** What the input shows while there are no entries ("Add items…"). */
  placeholder?: string;
  /** How many entries are drawn; the rest are counted. All of them by default. */
  maxVisible?: number;
  /** More props for the Tag of each entry (a title, a test id). */
  getTagProps?: (entry: string, index: number) => Partial<TagProps> & Record<string, unknown>;
  /** Props for the native input (its name for a screen reader, where no label says it). */
  inputProps?: InputBaseComponentProps;
}

export const TokenInput = forwardRef<HTMLDivElement, TokenInputProps>(function TokenInput(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    value: valueProp,
    defaultValue,
    onChange,
    inputValue: inputProp,
    onInputChange,
    placeholder,
    maxVisible = Infinity,
    getTagProps,
    inputProps,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const id = useId();
  const [value, setValue] = useControlled<string[]>({
    controlled: valueProp,
    default: defaultValue ?? [],
    name: 'TokenInput',
    state: 'value',
  });
  const [draft, setDraft] = useControlled<string>({
    controlled: inputProp,
    default: '',
    name: 'TokenInput',
    state: 'inputValue',
  });
  const changes = !readonly && !disabled;
  const commit = (next: string[]) => {
    setValue(next);
    onChange?.(next);
  };
  const type = (text: string) => {
    setDraft(text);
    onInputChange?.(text);
  };
  // Filled where it holds entries; active where a draft is being typed.
  const filled = value.length > 0;
  const active = draft !== '';
  const look = { ${api.join(', ')}, filled, active };
  const parts = solarTokenInputCompose(look);
  const shown = value.slice(0, maxVisible);
  const hidden = value.length - shown.length;
  return (
    <Box
      ref={ref}
      {...rest}
      className={
        [
          active ? '${P}-active' : null,
          filled ? '${P}-filled' : null,
          readonly ? '${P}-readonly' : null,
          error ? '${P}-error' : null,
          disabled ? '${P}-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      style={style}
      sx={[solarTokenInputStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE,
        // A part left empty is not drawn; the count shows where entries are left out.
        parts: {
          ...parts,
          label: { ...parts.label, present: label != null },
          mandatory: { ...parts.mandatory, present: mandatory },
          helper: { ...parts.helper, present: helper != null },
          counter: { ...parts.counter, present: hidden > 0 },
        },
        text: { labelLabel: label, mandatory: <span aria-hidden>*</span> },
        // The entries, each a SOLAR Tag, and the input for the next, in Figma's row of tags.
        content: {
          tags: [
            ...shown.map((entry, i) => (
              <Tag
                key={\`\${i}:\${entry}\`}
                status="neutral"
                onClose={changes ? () => commit(value.filter((_, at) => at !== i)) : undefined}
                {...getTagProps?.(entry, i)}
              >
                {entry}
              </Tag>
            )),
            readonly ? null : (
              <InputBase
                key="input"
                className="${P}-words"
                value={draft}
                placeholder={filled ? undefined : placeholder}
                onChange={(event) => type(event.target.value)}
                disabled={disabled}
                error={error}
                inputProps={{
                  'aria-label': typeof label === 'string' ? label : undefined,
                  ...inputProps,
                  className: ['${P}-addItems', inputProps?.className].filter(Boolean).join(' '),
                  'aria-describedby': helper != null ? \`\${id}-helper\` : undefined,
                  onKeyDown: (event) => {
                    inputProps?.onKeyDown?.(event);
                    const text = draft.trim();
                    if (event.key === 'Enter' && text) {
                      event.preventDefault();
                      commit([...value, text]);
                      type('');
                    }
                    if (event.key === 'Backspace' && draft === '' && value.length)
                      commit(value.slice(0, -1));
                  },
                }}
              />
            ),
          ],
        },
        render: {
          // A SOLAR Counter of the entries left out.
          counter: (layer) => (
            <span {...layer}>
              <Counter count={hidden} />
            </span>
          ),
          helper: (layer) => (
            <span id={\`\${id}-helper\`} className={layer.className} style={layer.style}>
              {helper}
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
      const header = `Scaffolded once by \`npm run solar:scaffold -- --flutter "Token Input"\` from spec/components/token-input.json, and owned by developers from then on: change it freely. What it looks like is not here. That is the recipe, [SolarTokenInputRecipe]: the field's fill, edge and focus ring by state, the draft's ink, and the label and helper, read cell by cell.`;
      const about = `A field of entries (tags, recipients, keywords): its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error]. Its [value] is drawn as SolarTags, each with a close button that removes it; the keyboard's action adds what is typed, and Backspace in the empty input removes the last. [maxVisible] draws that many, and counts the rest in a SolarCounter. [onChanged] is called with the entries. The draft is an undecorated [TextField] in the field drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds it and its states). Read-only, the entries are shown and cannot be changed.`;
      return `/// SOLAR Token Input.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/tag.dart';
import '../generated/components/token_input.dart';
import '../solar_field.dart';
import '../solar_layers.dart';
import 'solar_counter.dart';
import 'solar_tag.dart';
import 'solar_theme_of.dart';

class SolarTokenInput extends StatelessWidget {
  const SolarTokenInput({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('TokenInput', prop, def)},`).join('\n')}
    this.label,
    this.mandatory = false,
    this.helper,
    required this.value,
    this.onChanged,
    this.controller,
    this.placeholder,
    this.maxVisible,
    this.focusNode,
    this.statesController,
  });

${api.map(([prop, def]) => dartField('TokenInput', prop, def)).join('\n')}

  /// What it asks for, above it.
  final String? label;

  /// Whether it must be filled, which stars the label.
  final bool mandatory;

  /// More about it, below; where it is in [error], what is wrong.
  final String? helper;

  /// Its entries.
  final List<String> value;

  /// Called with the entries as they change; null, it cannot change them.
  final ValueChanged<List<String>>? onChanged;

  /// What is typed, the next entry, where the caller keeps it.
  final TextEditingController? controller;

  /// What the input shows while there are no entries ("Add items…").
  final String? placeholder;

  /// How many entries are drawn; the rest are counted. All of them where null.
  final int? maxVisible;

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
    final changes = !readonly && !disabled && onChanged != null;
    final shown = value.take(maxVisible ?? value.length).toList();
    final hidden = value.length - shown.length;
    return SolarField(
      controller: controller,
      focusNode: focusNode,
      statesController: statesController,
      builder: (context, field) {
        final states = field.states;
        // Filled where it holds entries; active where a draft is being typed.
        final p = SolarTokenInputProps(
${api.map(([prop]) => `          ${prop}: ${prop},`).join('\n')}
          filled: value.isNotEmpty,
          active: field.text.text.isNotEmpty,
        );
        final style = SolarTokenInputRecipe.textStyle(
          t,
          'addItems.typography',
          p,
          states,
        )?.copyWith(color: SolarTokenInputRecipe.color(t, 'addItems.color', p, states));
        void add() {
          final text = field.text.text.trim();
          if (text.isEmpty || !changes) return;
          onChanged!([...value, text]);
          field.text.clear();
        }

        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarTokenInputRecipe.lookup(c, p, states),
            dimension: (c) => SolarTokenInputRecipe.dimension(c, p, states),
            color: (c) => SolarTokenInputRecipe.color(t, c, p, states),
            shadow: (c) => SolarTokenInputRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarTokenInputRecipe.textStyle(t, c, p, states),
            // A part left empty is not drawn; the count shows where entries are left out.
            present: (l) => switch (l) {
              'label' => label != null,
              'mandatory' => mandatory,
              'helper' => helper != null,
              'counter' => hidden > 0,
              _ => SolarTokenInputRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: '${keyPrefixOf(spec.component)}',
          text: {'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper},
          wraps: const {'helper': TextAlign.start},
          // The entries, each a SOLAR Tag, and the input for the next, in Figma's row of tags.
          content: {
            'tags': [
              for (final (i, entry) in shown.indexed)
                SolarTag(
                  status: SolarTagStatus.neutral,
                  label: entry,
                  onClose: changes
                      ? () => onChanged!([...value]..removeAt(i))
                      : null,
                ),
              if (!readonly)
                Expanded(
                  child: KeyedSubtree(
                    key: const Key('${keyPrefixOf(spec.component)}.addItems'),
                    child: field.read(
                      Focus(
                        // Backspace in the empty input removes the last entry.
                        onKeyEvent: (_, event) {
                          if (event is KeyDownEvent &&
                              event.logicalKey == LogicalKeyboardKey.backspace &&
                              field.text.text.isEmpty &&
                              value.isNotEmpty &&
                              changes) {
                            onChanged!(value.sublist(0, value.length - 1));
                            return KeyEventResult.handled;
                          }
                          return KeyEventResult.ignored;
                        },
                        child: TextField(
                          controller: field.text,
                          focusNode: field.focus,
                          enabled: !disabled,
                          onSubmitted: (_) => add(),
                          textInputAction: TextInputAction.done,
                          style: style,
                          maxLines: 1,
                          decoration: InputDecoration.collapsed(
                            hintText: value.isEmpty ? placeholder : null,
                            hintStyle: style,
                          ),
                        ),
                      ),
                      label: label,
                      hint: helper,
                    ),
                  ),
                ),
            ],
          },
          // A SOLAR Counter of the entries left out.
          composed: {'counter': SolarCounter(count: hidden)},
          builders: {
            // The label and the helper are read with the input, which they name and describe.
            'label': (layer) => ExcludeSemantics(child: layer),
            'helper': (layer) => ExcludeSemantics(child: layer),
            'field': (layer) => field.area(layer, enabled: !disabled && !readonly),
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
