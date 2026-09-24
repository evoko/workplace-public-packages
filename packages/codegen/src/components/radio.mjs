/**
 * SOLAR Radio, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * MUI's Radio on the web and Flutter's RawRadio, each checked by its group, the ring and dot drawn
 * inside by the shared layer helpers.
 */

import { drawnResets, treeOf, wrapDoc } from '../shells/drawn.mjs';
import { targetInput } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const prop of ['checked', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Radio: the IR has no ${prop} prop`);
  if (!spec.layers.icon) throw new Error('Radio: the IR has no icon layer');
};

export default {
  name: 'Radio',
  mui: {
    // The shell draws every layer itself, inside MUI's root, each with a class of its own.
    slots: 'drawn',
    // MUI's root is the ring: its padding and round hover halo give way to the recipe's, and its
    // native input, invisible, covers the ring.
    resets: drawnResets('Radio', {
      padding: '0',
      // The input is the target, 44 × 44 around the ring (shells/target.mjs).
      ...targetInput('& input'),
    }),
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {
    // Its RadioGroup checks it, by its value, as it checks Flutter's own Radio.
    groupDecides: ['checked'],
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Radio.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarRadioStyle\` and \`solarRadioCompose\` in \`@bwp-web/styles/mui\`: the ring's
 * fill and edge by state, and the dot, Figma's own outline.
 *
 * One choice of a group, committed on click: put two to five in MUI's RadioGroup, which checks the
 * one whose \`value\` is its own and names them all, and gives each a label (MUI's
 * FormControlLabel, or a <label>). A radio alone is a bug, SOLAR says; \`checked\` checks one
 * outside a group. It wraps MUI's Radio, a native input, with its ring and dot drawn from Figma's
 * layer tree (\`internal/layers.tsx\`). The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MuiRadio, { type RadioProps as MuiRadioProps } from '@mui/material/Radio';
import { useRadioGroup } from '@mui/material/RadioGroup';
import { forwardRef, type ReactNode } from 'react';
import {
  solarRadioCompose,
  solarRadioStyle,
  type SolarRadioProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

/** The dot, as MUI's icon: MUI hands the icon a size, which the dot does not take. */
function Marks({ children }: { children: ReactNode; fontSize?: unknown }) {
  return <>{children}</>;
}

export interface RadioProps
  extends SolarRadioProps,
    Omit<
      MuiRadioProps,
      keyof SolarRadioProps | 'icon' | 'checkedIcon' | 'color' | 'size' | 'ref'
    > {}

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { checked: checkedProp, disabled = false, value, sx, ...rest },
  ref,
) {
  const group = useRadioGroup();
  // As MUI decides it: the prop where given, and otherwise whether its group holds its value.
  const checked =
    checkedProp ??
    (group?.value != null && value != null && String(group.value) === String(value));
  const look = { checked, disabled };
  // Hover and focus draw the dot as at rest; a disabled radio draws Figma's own outline of it.
  const marks = (
    <Marks>
      {drawChildren('root', {
        prefix: 'SolarRadio',
        tree: TREE,
        parts: solarRadioCompose(look, disabled ? 'disabled' : 'default'),
      })}
    </Marks>
  );
  return (
    <MuiRadio
      ref={ref}
      {...rest}
      value={value}
      checked={checkedProp}
      disabled={disabled}
      disableRipple
      icon={marks}
      checkedIcon={marks}
      sx={[solarRadioStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    />
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
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarRadioRecipe]: the ring's fill and edge by state, and the dot, Figma's own outline, read cell by cell.`;
      const about = `One choice of a group, committed on tap: put two to five under a [RadioGroup], which checks the one whose [value] is its own, calls its onChanged with the value tapped, and moves between them with the arrow keys, as it does Flutter's own Radio. A radio alone is a bug, SOLAR says; outside a group it is drawn unchecked and does nothing. Built on [RawRadio], with its ring and dot drawn from Figma's layer tree with [SolarLayers]. Name it with [semanticLabel], or a label beside it.`;
      return `/// SOLAR Radio.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/radio.dart';
import '../solar_layers.dart';
import '../solar_target.dart';
import 'solar_theme_of.dart';

class SolarRadio<T> extends StatefulWidget {
  const SolarRadio({
    super.key,
    required this.value,
    this.disabled = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  });

  /// The value it stands for: its group checks it where the group's value is this.
  final T value;

  final bool disabled;

  /// What it chooses, for a screen reader, where no label beside it says so.
  final String? semanticLabel;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// Whether it takes the focus when first built.
  final bool autofocus;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarRadio<T>> createState() => _SolarRadioState<T>();
}

class _SolarRadioState<T> extends State<SolarRadio<T>> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  FocusNode? _own;

  FocusNode get _focus => widget.focusNode ?? (_own ??= FocusNode());

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final group = RadioGroup.maybeOf<T>(context);
    final enabled = !widget.disabled && group != null;
    final p = SolarRadioProps(
      checked: group != null && group.groupValue == widget.value,
      disabled: !enabled,
    );
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarRadioRecipe.lookup(c, p, states),
        dimension: (c) => SolarRadioRecipe.dimension(c, p, states),
        color: (c) => SolarRadioRecipe.color(t, c, p, states),
        shadow: (c) => SolarRadioRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarRadioRecipe.textStyle(t, c, p, states),
        present: (l) => SolarRadioRecipe.present(l, p, states),
        glyph: (l) => SolarRadioRecipe.glyph(l, p, states),
      ),
      tree: _tree,
      keyPrefix: 'radio',
    ).layer('root');
    final forced = widget.statesController;
    final radio = SolarTarget(child: RawRadio<T>(
      value: widget.value,
      mouseCursor: WidgetStateMouseCursor.clickable,
      toggleable: false,
      focusNode: _focus,
      autofocus: widget.autofocus,
      groupRegistry: group,
      enabled: enabled,
      builder: (context, state) => forced == null
          ? draw(state.states)
          : ListenableBuilder(
              listenable: forced,
              builder: (_, _) => draw({...state.states, ...forced.value}),
            ),
    ));
    return widget.semanticLabel == null
        ? radio
        : Semantics(label: widget.semanticLabel, child: radio);
  }
}
`;
    },
  },
};
