/**
 * SOLAR Option Row, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn row (`src/shells/drawn.mjs`) around a SOLAR Checkbox, Radio or Toggle, which the whole
 * row names and targets: a <label> on the web; in Flutter a row that taps its control, hovers it,
 * and merges their semantics.
 */

import { drawnResets, keyPrefixOf, treeOf, wrapDoc } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  if (!spec.api.control?.values?.includes('toggle'))
    throw new Error('Option Row: the IR has no control axis with toggle');
  for (const layer of ['control', 'toggle', 'label', 'supportingText'])
    if (!spec.layers[layer])
      throw new Error(`Option Row: the IR has no ${layer} layer`);
};

const P = 'SolarOptionRow';

export default {
  name: 'Option Row',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the row is a <label>.
    slots: 'drawn',
    // A block, as a row spans its column; its words wrap, as the description says a long one does.
    resets: drawnResets('Option Row', {
      display: 'flex',
      cursor: 'pointer',
      [`& .${P}-label, & .${P}-supportingText`]: { whiteSpace: 'normal' },
      [`& .${P}-control, & .${P}-toggle`]: { flexShrink: '0' },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Option Row.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarOptionRowStyle\` and \`solarOptionRowCompose\` in \`@bwp-web/styles/mui\`: the
 * row's padding and gap, and its words' text styles.
 *
 * A selection control and its words: a <label> around a SOLAR Checkbox (\`control="checkbox"\`, one
 * of a set, independent), Radio (\`"radio"\`, one of a group: inside MUI's RadioGroup, with a
 * \`value\`) or Toggle (\`"toggle"\`, a setting that applies at once), drawn from Figma's layer tree
 * (\`internal/layers.tsx\`). The whole row is the target and the control's name; its
 * \`supportingText\` describes it. The control's states are its own (\`checked\`, \`mixed\`,
 * \`disabled\`), and hovering the row hovers it. One control a row; for a large tappable choice
 * with an icon, use an Option Card. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, useId, type ChangeEvent, type ReactNode } from 'react';
import {
  solarOptionRowCompose,
  solarOptionRowStyle,
  type SolarOptionRowProps,
} from '@bwp-web/styles/mui';
import { Checkbox } from './Checkbox.js';
import { drawChildren } from './internal/layers.js';
import { Radio } from './Radio.js';
import { Toggle } from './Toggle.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface OptionRowProps
  extends SolarOptionRowProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps<'label'>, keyof SolarOptionRowProps | 'children' | 'onChange' | 'ref'> {
  /** The choice's words, which name the control. */
  children: ReactNode;
  /** A second line that says more, describing the control. */
  supportingText?: ReactNode;
  /** Whether the control is on: checked, or a Toggle selected. A Radio in a RadioGroup follows the group. */
  checked?: boolean;
  /** Whether it starts on, where \`checked\` does not say (a Checkbox or a Toggle). */
  defaultChecked?: boolean;
  /** A Checkbox's partly checked state, for a parent of rows partly checked. */
  mixed?: boolean;
  disabled?: boolean;
  /** Called with the value a click asks for. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  /** The value a form sends, and a Radio's in its group. */
  value?: string;
  /** The form field's name. */
  name?: string;
}

export const OptionRow = forwardRef<HTMLLabelElement, OptionRowProps>(function OptionRow(
  {
    control,
    children,
    supportingText,
    checked,
    defaultChecked,
    mixed,
    disabled,
    onChange,
    value,
    name,
    className,
    sx,
    ...rest
  },
  ref,
) {
  const look = { control };
  const composed = solarOptionRowCompose(look);
  // A slot left empty is not drawn.
  const parts = {
    ...composed,
    supportingText: { ...composed.supportingText, present: supportingText != null },
  };
  const described = useId();
  const describedBy = supportingText != null ? described : undefined;
  const own = { disabled, name, value };
  const box = ({ className: cls, style }: { className: string; style?: object }) => (
    <span className={cls} style={style}>
      {control === 'radio' ? (
        <Radio
          {...own}
          checked={checked}
          onChange={onChange}
          slotProps={{ input: { 'aria-describedby': describedBy } }}
        />
      ) : (
        <Checkbox
          {...own}
          checked={checked}
          defaultChecked={defaultChecked}
          mixed={mixed}
          onChange={onChange}
          slotProps={{ input: { 'aria-describedby': describedBy } }}
        />
      )}
    </span>
  );
  return (
    <Box
      component="label"
      ref={ref}
      {...rest}
      // Its control takes its hover (the controls' recipes read the scope).
      className={['SolarStatesScope', className].filter(Boolean).join(' ')}
      sx={[solarOptionRowStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE,
        parts,
        // The words name the control; the second line describes it, and so is left out of its
        // name.
        text: {
          label: children,
          supportingText: (
            <span id={described} aria-hidden>
              {supportingText}
            </span>
          ),
        },
        render: {
          control: box,
          toggle: ({ className: cls, style }) => (
            <span className={cls} style={style}>
              <Toggle
                {...own}
                selected={checked}
                defaultSelected={defaultChecked}
                onChange={onChange}
                slotProps={{ input: { 'aria-describedby': describedBy } }}
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
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarOptionRowRecipe]: the row's padding and gap, and its words' text styles, read cell by cell.`;
      const about = `A selection control and its words, drawn from Figma's layer tree with [SolarLayers]: a SolarCheckbox ([SolarOptionRowControl.checkbox], one of a set, independent), SolarRadio ([SolarOptionRowControl.radio], one of a group: under a [RadioGroup] of [T], with a [value]) or SolarToggle ([SolarOptionRowControl.toggle], a setting that applies at once). The whole row is the target: a tap on it is the control's, hovering it hovers the control, and the words name it, the [supportingText] said after. The control's states are its own ([checked], [mixed], [disabled]). One control a row; for a large tappable choice with an icon, use an Option Card.`;
      return `/// SOLAR Option Row.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/option_row.dart';
import '../solar_layers.dart';
import 'solar_checkbox.dart';
import 'solar_radio.dart';
import 'solar_theme_of.dart';
import 'solar_toggle.dart';

class SolarOptionRow<T> extends StatefulWidget {
  const SolarOptionRow({
    super.key,
    this.control = SolarOptionRowControl.checkbox,
    required this.label,
    this.supportingText,
    this.checked = false,
    this.mixed = false,
    this.disabled = false,
    this.onChanged,
    this.value,
  });

  final SolarOptionRowControl control;

  /// The choice's words, which name the control.
  final String label;

  /// A second line that says more, read after the words.
  final String? supportingText;

  /// Whether a checkbox is checked, or a toggle on; a radio follows its group.
  final bool checked;

  /// A checkbox's partly checked state, for a parent of rows partly checked.
  final bool mixed;

  final bool disabled;

  /// Called with the value a tap asks for, for a checkbox or a toggle; null disables it. A radio's
  /// group is told instead.
  final ValueChanged<bool>? onChanged;

  /// A radio's value in its group.
  final T? value;

  @override
  State<SolarOptionRow<T>> createState() => _SolarOptionRowState<T>();
}

class _SolarOptionRowState<T> extends State<SolarOptionRow<T>> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  /// The row's hover, which the control draws beside its own.
  final _hover = WidgetStatesController();

  @override
  void dispose() {
    _hover.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = SolarOptionRowProps(control: w.control);
    const states = <WidgetState>{};
    final group = RadioGroup.maybeOf<T>(context);
    // What a tap on the row does: the control's own change.
    final VoidCallback? tap = w.disabled
        ? null
        : switch (w.control) {
            SolarOptionRowControl.radio =>
              group == null || w.value is! T
                  ? null
                  : () => group.onChanged(w.value as T),
            _ => w.onChanged == null ? null : () => w.onChanged!(!w.checked),
          };
    final drawn = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarOptionRowRecipe.lookup(c, p, states),
        dimension: (c) => SolarOptionRowRecipe.dimension(c, p, states),
        color: (c) => SolarOptionRowRecipe.color(t, c, p, states),
        shadow: (c) => SolarOptionRowRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarOptionRowRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => l == 'supportingText'
            ? w.supportingText != null
            : SolarOptionRowRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      text: {'label': w.label, 'supportingText': ?w.supportingText},
      wraps: const {'label': TextAlign.start, 'supportingText': TextAlign.start},
      composed: {
        'control': w.control == SolarOptionRowControl.radio
            ? SolarRadio<T>(
                value: w.value as T,
                disabled: w.disabled,
                statesController: _hover,
              )
            : SolarCheckbox(
                checked: w.checked,
                mixed: w.mixed,
                disabled: w.disabled,
                onChanged: w.onChanged,
                statesController: _hover,
              ),
        'toggle': SolarToggle(
          selected: w.checked,
          disabled: w.disabled,
          onChanged: w.onChanged,
          statesController: _hover,
        ),
      },
    ).layer('root');
    // The words name the control, and the row is its target.
    return MergeSemantics(
      child: MouseRegion(
        cursor: tap == null ? MouseCursor.defer : SystemMouseCursors.click,
        onEnter: (_) => _hover.update(WidgetState.hovered, true),
        onExit: (_) => _hover.update(WidgetState.hovered, false),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: tap,
          child: drawn,
        ),
      ),
    );
  }
}
`;
    },
  },
};
