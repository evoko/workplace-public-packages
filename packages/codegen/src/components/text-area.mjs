/**
 * SOLAR Text Area, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A field of many lines (shells/field.mjs): the label above, the footer below (the helper and
 * the count), and between them the field, MUI's InputBase, multiline, on the web and an
 * undecorated TextField in Flutter, with the caller's Icon Buttons pinned in its bottom corners.
 */

import { treeOf, treeConsts } from '../shells/drawn.mjs';
import { fieldFlutter, fieldResets, fieldStates } from '../shells/field.mjs';

const P = 'SolarTextArea';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'footer'],
    label: ['labelLabel', 'mandatory'],
    field: ['enterText', 'cta', 'attachment'],
    footer: ['helper', 'charCount'],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `Text Area: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
  for (const slot of [
    'label',
    'mandatory',
    'cta',
    'attachment',
    'helper',
    'charCount',
  ])
    if (!spec.slots[slot])
      throw new Error(`Text Area: the IR has no ${slot} slot`);
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('Text Area: its filled is not derived from its value');
};

export default {
  name: 'Text Area',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, multiline, and its words the InputBase's textarea, which fills the field.
    slots: 'drawn',
    resets: fieldResets('Text Area', {
      input: 'enterText',
      more: {
        [`& .${P}--enterText.MuiInputBase-input`]: { minHeight: '0' },
      },
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Text Area', ['filled', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A field's label is its `label`, as Text Input's is.
  // Flutter holds a field's value in its controller.
  api: {
    react: { label: 'label' },
    flutter: { value: 'controller' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Text Area.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarTextAreaStyle\` and \`solarTextAreaCompose\` in \`@bwp-web/styles/mui\`: the
 * field's fill, edge and focus ring by state, its words' ink, the label and the footer.
 *
 * Text of many lines (descriptions, notes, feedback): its \`label\` above (a \`mandatory\` one is
 * starred, and the textarea required), its \`helper\` below, which says what is wrong where it is in
 * \`error\`, beside the count of characters (\`charCount\`, against \`maxLength\` where given). The field
 * is MUI's InputBase, multiline, a native textarea its height, whose words scroll within it; every
 * InputBase prop but its adornments and rows reaches it. \`cta\` (a send or save IconButton, primary
 * at sm) and \`attachment\` (an attach IconButton, secondary at sm) sit in its bottom corners. It is
 * drawn filled where it holds a value. For one line use a Text Input. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box from '@mui/material/Box';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { useControlled } from '@mui/material/utils';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarTextAreaCompose,
  solarTextAreaStyle,
  type SolarTextAreaProps,
} from '@bwp-web/styles/mui';
import { drawChildren, drawLayer, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface TextAreaProps
  extends SolarTextAreaProps,
    Omit<
      InputBaseProps,
      | keyof SolarTextAreaProps
      | 'size'
      | 'color'
      | 'fullWidth'
      | 'margin'
      | 'multiline'
      | 'rows'
      | 'minRows'
      | 'maxRows'
      | 'startAdornment'
      | 'endAdornment'
      | 'required'
      | 'ref'
    > {
  /** What it asks for, above it. */
  label?: ReactNode;
  /** Whether it must be filled, which stars the label and makes the textarea required. */
  mandatory?: boolean;
  /** More about it, below; where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** Whether it counts its characters, below at the end: against \`maxLength\` where given. */
  charCount?: boolean;
  /** The most characters it takes, which the count shows. */
  maxLength?: number;
  /** The field's action, in its bottom right: an IconButton, primary at sm (send, save). */
  cta?: ReactNode;
  /** An attachment's button, in its bottom left: an IconButton, secondary at sm. */
  attachment?: ReactNode;
}

export const TextArea = forwardRef<HTMLDivElement, TextAreaProps>(function TextArea(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    charCount = false,
    maxLength,
    cta,
    attachment,
    id: idProp,
    value: valueProp,
    defaultValue,
    onChange,
    inputProps,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const own = useId();
  const id = idProp ?? own;
  const [value, setValue] = useControlled<unknown>({
    controlled: valueProp,
    default: defaultValue ?? '',
    name: 'TextArea',
    state: 'value',
  });
  const words = value == null ? '' : String(value);
  // Filled where it holds a value: its words are then the value's, not the placeholder's.
  const filled = words !== '';
  const look = { ${api.join(', ')}, filled };
  const parts = solarTextAreaCompose(look);
  const drawing: LayerDrawing = {
    prefix: '${P}',
    tree: TREE, slots: SLOTS,
    // A part left empty is not drawn; the footer is where either of its parts is.
    parts: {
      ...parts,
      label: { ...parts.label, present: label != null },
      mandatory: { ...parts.mandatory, present: mandatory },
      cta: { ...parts.cta, present: cta != null },
      attachment: { ...parts.attachment, present: attachment != null },
      footer: { ...parts.footer, present: helper != null || charCount },
      helper: { ...parts.helper, present: helper != null },
      charCount: { ...parts.charCount, present: charCount },
    },
    text: {
      labelLabel: label,
      mandatory: <span aria-hidden>*</span>,
      charCount: maxLength != null ? \`\${words.length}/\${maxLength}\` : \`\${words.length}\`,
    },
    render: {
      label: (layer) => <label htmlFor={id} {...layer} />,
      // The field is MUI's InputBase, its textarea its words, its buttons pinned in its corners.
      field: (layer) => (
        <InputBase
          {...rest}
          className={layer.className}
          style={layer.style}
          id={id}
          multiline
          rows={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange?.(event);
          }}
          disabled={disabled}
          error={error}
          required={mandatory}
          endAdornment={
            <>
              {drawLayer('cta', drawing)}
              {drawLayer('attachment', drawing)}
            </>
          }
          inputProps={{
            ...inputProps,
            maxLength,
            className: ['${P}--enterText', inputProps?.className].filter(Boolean).join(' '),
            'aria-describedby': helper != null ? \`\${id}-helper\` : undefined,
          }}
        />
      ),
      cta: (layer) => <span {...layer}>{cta}</span>,
      attachment: (layer) => <span {...layer}>{attachment}</span>,
      helper: (layer) => (
        <span id={\`\${id}-helper\`} className={layer.className} style={layer.style}>
          {helper}
        </span>
      ),
    },
  };
  return (
    <Box
      ref={ref}
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
      sx={[solarTextAreaStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', drawing)}
    </Box>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return fieldFlutter(spec, {
        look: "the field's fill, edge and focus ring by state, its words' ink, the label and the footer",
        about: `Text of many lines (descriptions, notes, feedback): its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error], beside the count of characters ([charCount], against [maxLength] where given). The words are a [TextField], undecorated and the field's height, whose lines scroll within it, drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds its words and states); a tap anywhere in the field focuses them. [cta] (a send or save SolarIconButton, primary at sm) and [attachment] (an attach one, secondary at sm) sit in its bottom corners. It is drawn filled where its [controller] holds text, and hovered and focused as the field is. It reads as one text field, named by its label and described by its helper. For one line use a SolarTextInput.`,
        words: 'enterText',
        params: `this.label,
this.mandatory = false,
this.helper,
this.charCount = false,
this.maxLength,
this.cta,
this.attachment,`,
        fields: `/// What it asks for, above it.
final String? label;

/// Whether it must be filled, which stars the label.
final bool mandatory;

/// More about it, below; where it is in [error], what is wrong.
final String? helper;

/// Whether it counts its characters, below at the end: against [maxLength] where given.
final bool charCount;

/// The most characters it takes, which the count shows.
final int? maxLength;

/// The field's action, in its bottom right: a SolarIconButton, primary at sm (send, save).
final Widget? cta;

/// An attachment's button, in its bottom left: a SolarIconButton, secondary at sm.
final Widget? attachment;`,
        name: 'label',
        hint: 'helper',
        unread: ['label', 'footer'],
        present: {
          label: 'label != null',
          mandatory: 'mandatory',
          cta: 'cta != null',
          attachment: 'attachment != null',
          footer: 'helper != null || charCount',
          helper: 'helper != null',
          charCount: 'charCount',
        },
        prelude: `final words = field.text.text;`,
        text: `{
  'labelLabel': ?label,
  'mandatory': '*',
  'helper': ?helper,
  'charCount': maxLength == null ? '\${words.length}' : '\${words.length}/$maxLength',
}`,
        // The caller's Icon Buttons, pinned in the field's corners, at their own size.
        slots: "{'cta': ?cta, 'attachment': ?attachment}",
        wraps: "const {'helper': TextAlign.start}",
        textField: `keyboardType: TextInputType.multiline,
maxLength: maxLength,
buildCounter: (_, {required currentLength, required isFocused, maxLength}) => null,
maxLines: null,
expands: true,
textAlignVertical: TextAlignVertical.top,`,
      });
    },
  },
};
