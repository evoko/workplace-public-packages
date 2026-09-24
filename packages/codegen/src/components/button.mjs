/**
 * SOLAR Button, beyond its IR: where MUI draws each layer and marks each state, what the Flutter
 * base control's style reads, and the two shell templates, run once by \`solar:scaffold\`. One file
 * per component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 */

import { dartField, dartParam, MUI_SLOT_PROPS } from '../scaffold/helpers.mjs';

export default {
  name: 'Button',
  mui: {
    // `&` is the root element; MUI renders the label text in the root, and the icons and spinner in
    // its own named slots.
    slots: {
      root: '&',
      label: '&',
      iconLeading: '& .MuiButton-startIcon',
      iconTrailing: '& .MuiButton-endIcon',
      spinner: '& .MuiButton-loadingIndicator',
      // Not an MUI slot: the shell renders the counter itself, with this class (task 7).
      counter: '& .SolarButton-counter',
    },
    resets: {
      // Not '0': MUI's sx reads a sizing value of 1 or less as a fraction, so '0' becomes '0%'.
      minWidth: 'auto',
      textTransform: 'none',
      '& .MuiButton-startIcon': { margin: '0' },
      '& .MuiButton-endIcon': { margin: '0' },
      '& .MuiButton-startIcon > svg, & .MuiButton-endIcon > svg': {
        width: '100%',
        height: '100%',
      },
    },
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      // MUI marks focus with a class only for keyboard focus (focus-visible).
      focus: '&.Mui-focusVisible',
      loading: '&.MuiButton-loading',
      // MUI disables a loading button too, so a loading one carries Mui-disabled as well; without
      // the :not it would draw in the disabled colours. A button both disabled and loading is
      // disabled: the shell does not pass loading to MUI then.
      disabled: '&.Mui-disabled:not(.MuiButton-loading)',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {
    style: {
      background: 'root.background',
      shadow: 'root.shadow',
      radius: 'root.radius',
      borderColor: 'root.borderColor',
      borderWidth: 'root.borderWidth',
      paddingTop: 'root.paddingTop',
      paddingRight: 'root.paddingRight',
      paddingBottom: 'root.paddingBottom',
      paddingLeft: 'root.paddingLeft',
      height: 'root.height',
      width: 'root.width',
      foreground: 'label.color',
      textStyle: 'label.typography',
      iconColor: 'iconLeading.color',
      iconSize: 'iconLeading.width',
    },
    shared: {
      'iconLeading.color': 'iconTrailing.color',
      'iconLeading.width': 'iconTrailing.width',
    },
  },
  templates: {
    react: (spec) => {
      const api = Object.keys(spec.api);
      const slots = spec.slots;
      for (const required of [
        'iconLeading',
        'iconTrailing',
        'label',
        'counter',
      ])
        if (!slots[required])
          throw new Error(`Button: the IR has no ${required} slot`);
      for (const [name] of Object.entries(MUI_SLOT_PROPS))
        if (slots[name].type !== 'icon')
          throw new Error(`Button: ${name} is not an icon slot`);

      return `/**
 * SOLAR Button.
 *
 * Scaffolded once by \`npm run solar:scaffold Button\` from spec/components/button.json, and owned
 * by developers from then on: change it freely. What it looks like is not here. That is the recipe,
 * \`solarButtonStyle\` in \`@bwp-web/styles/mui\`, which regenerates from Figma on every
 * \`solar:codegen\`, so a design change reaches this component without anyone touching this file.
 * This file is behaviour: the props, the slots, loading, and accessibility.
 *
 * It wraps MUI's Button, which supplies focus handling, keyboard activation, the disabled and
 * loading states and their classes; the recipe restyles it. The app must load
 * \`@bwp-web/styles/tokens.css\`, since every recipe value is a \`var(--solar-*)\`.
 */

import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { forwardRef, type ReactNode } from 'react';
import {
  solarButtonCompose,
  solarButtonStyle,
  type SolarButtonProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { Spinner } from './Spinner.js';

export interface ButtonProps
  extends SolarButtonProps,
    Omit<
      MuiButtonProps,
      keyof SolarButtonProps | 'color' | 'startIcon' | 'endIcon' | 'disableElevation'
    > {
  /** The icon before the label. It reinforces the action: a bin beside "Delete". */
  iconLeading?: ReactNode;
  /** The icon after the label. It indicates direction: an arrow beside "Continue". */
  iconTrailing?: ReactNode;
  /** A count shown after the label. */
  counter?: ReactNode;
}

// Through globalThis, because \`process\` exists only where a bundler or Node provides it, and a
// browser library should not need Node's types to say so.
const DEV =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !==
  'production';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
${api.map((p) => `    ${p},`).join('\n')}
    iconLeading,
    iconTrailing,
    counter,
    children,
    sx,
    ...rest
  },
  ref,
) {
  // SOLAR: an icon-only button always needs an accessible name.
  if (DEV && !children && !rest['aria-label'] && !rest['aria-labelledby'])
    // eslint-disable-next-line no-console -- a development-only accessibility warning, on purpose
    console.warn('SOLAR Button: an icon-only button needs an aria-label.');

  // Which Spinner the loading state shows -- Figma picks its size and style per Button variant.
  // Figma's \`style\` axis is the Spinner's \`variant\` prop.
  const spinner = solarButtonCompose({ ${api.join(', ')} }, 'loading').spinner;

  return (
    <MuiButton
      ref={ref}
      {...rest}
      disabled={disabled}
      // Disabled wins over loading, as in Figma's state order, so a disabled button shows no spinner.
      loading={loading && !disabled}
      startIcon={iconLeading}
      endIcon={iconTrailing}
      loadingIndicator={
        <Spinner
          size={spinner['variant.size'] as SolarSpinnerSize}
          variant={spinner['variant.style'] as SolarSpinnerVariant}
        />
      }
      // SOLAR's states have their own colours; MUI's ripple would paint over them. MUI draws
      // elevation only for its contained variant, so its own variant is pinned to text: an app
      // theme defaulting Buttons to contained cannot bring Material's shadows back.
      // (disableElevation would not do: it writes box-shadow none on hover and press, over
      // SOLAR's control shadow.)
      variant="text"
      disableRipple
      sx={[
        solarButtonStyle({ ${api.join(', ')} }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      {counter != null && <span className="SolarButton-counter">{counter}</span>}
    </MuiButton>
  );
});
`;
    },
    flutter: (spec) => {
      const api = Object.entries(spec.api);
      for (const required of [
        'iconLeading',
        'iconTrailing',
        'label',
        'counter',
      ])
        if (!spec.slots[required])
          throw new Error(`Button: the IR has no ${required} slot`);
      return `/// SOLAR Button.
///
/// Scaffolded once by \`npm run solar:scaffold -- --flutter Button\` from spec/components/button.json,
/// and owned by developers from then on: change it freely. What it looks like is not here. That is
/// the recipe, [SolarButtonRecipe], which regenerates from Figma on every \`solar:codegen\`. This
/// file is behaviour: the props, the slots, loading and accessibility, with the same props as the
/// React Button.
///
/// It wraps Flutter's FilledButton, which supplies focus, keyboard activation, hover and press;
/// [SolarButtonRecipe.style] restyles it.
library;

import 'package:flutter/material.dart';

import '../generated/components/button.dart';
import '../generated/components/spinner.dart';
import '../solar_states.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarButton extends StatelessWidget {
  const SolarButton({
    super.key,
    required this.onPressed,
    this.child,
${api.map(([prop, def]) => `    ${dartParam('Button', prop, def)},`).join('\n')}
    this.iconLeading,
    this.iconTrailing,
    this.counter,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  }) : assert(child != null || semanticLabel != null,
            'SOLAR Button: an icon-only button needs a semanticLabel.');

  /// Called when the button is tapped; null disables it, as for any Flutter button.
  final VoidCallback? onPressed;

  /// The label.
  final Widget? child;

${api.map(([prop, def]) => dartField('Button', prop, def)).join('\n')}

  /// The icon before the label. It reinforces the action: a bin beside "Delete".
  final Widget? iconLeading;

  /// The icon after the label. It indicates direction: an arrow beside "Continue".
  final Widget? iconTrailing;

  /// A count shown after the label: a \`SolarCounter\`, which takes the button's states.
  final Widget? counter;

  /// The accessible name, required when there is no label.
  final String? semanticLabel;

  final FocusNode? focusNode;
  final bool autofocus;
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Disabled wins over loading, as in Figma's state order, so a disabled button shows no spinner.
    final busy = loading && !disabled;
    final p = SolarButtonProps(
${api.map(([prop]) => `      ${prop}: ${prop === 'loading' ? 'busy' : prop},`).join('\n')}
    );
    const rest = <WidgetState>{};
    bool shows(String layer) => SolarButtonRecipe.present(layer, p, rest);
    final gap = SolarButtonRecipe.dimension('root.gap', p, rest) ?? 0;

    final parts = <Widget>[
      ?iconLeading,
      // Loading hides the label but keeps its room, as Figma does, so the button does not resize;
      // a screen reader still reads it.
      if (child != null)
        Visibility(
          visible: shows('label'),
          maintainSize: true,
          maintainAnimation: true,
          maintainState: true,
          maintainSemantics: true,
          child: child!,
        ),
      // The counter's height is the recipe's; the badge inside it is the caller's.
      if (counter != null)
        SizedBox(
          height: SolarButtonRecipe.dimension('counter.height', p, rest),
          child: Center(widthFactor: 1, child: counter),
        ),
      ?iconTrailing,
    ];
    final content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final (i, part) in parts.indexed) ...[
          if (i > 0) SizedBox(width: gap),
          part,
        ],
      ],
    );

    // The button's states are shared with what it holds, so a Counter in it follows its hover,
    // press and disabled colours, as Figma draws it (SolarStatesScope).
    Widget button = SolarStatesScope(
      controller: statesController,
      builder: (context, states) => FilledButton(
      onPressed: disabled || busy ? null : onPressed,
      style: SolarButtonRecipe.style(t, p),
      focusNode: focusNode,
      autofocus: autofocus,
      statesController: states,
      child: Stack(
        alignment: Alignment.center,
        children: [
          content,
          if (shows('spinner'))
            // Which Spinner, Figma picks per Button variant; its \`style\` axis is the Spinner's
            // \`variant\` prop.
            ExcludeSemantics(
              child: SolarSpinner(
                size: SolarSpinnerSize.values.byName(
                    SolarButtonRecipe.lookup('spinner.variant.size', p, rest)!
                        .substring(2)),
                variant: SolarSpinnerVariant.values.firstWhere((v) =>
                    'k:\${v.figma}' ==
                    SolarButtonRecipe.lookup('spinner.variant.style', p, rest)),
              ),
            ),
        ],
      ),
    ),
    );
    if (semanticLabel != null) {
      // Merged, so the name and the button's own tap action are one node for a screen reader: a
      // Semantics label alone makes a second node, and the button inside it stays unnamed.
      button = MergeSemantics(
        child: Semantics(label: semanticLabel, child: button),
      );
    }
    return button;
  }
}
`;
    },
  },
};
