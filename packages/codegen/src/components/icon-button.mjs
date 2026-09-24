/**
 * SOLAR Icon Button, beyond its IR: where MUI draws each layer and marks each state, what the Flutter
 * base control's style reads, and the two shell templates, run once by \`solar:scaffold\`. One file
 * per component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 */

import { dartField, dartParam } from '../scaffold/helpers.mjs';

export default {
  name: 'Icon Button',
  mui: {
    // MUI renders the icon as its children; the shell wraps it in a box the recipe sizes, as
    // Button's counter is, so the icon fills it. The loading indicator is MUI's slot, laid over the
    // icon.
    slots: {
      root: '&',
      icon: '& .SolarIconButton-icon',
      spinner: '& .MuiIconButton-loadingIndicator',
    },
    // MUI's icon button is a 24px glyph in a round, padded box, which the recipe replaces; the
    // SOLAR icon fills the box the recipe sizes for it.
    resets: {
      '& .SolarIconButton-icon': { display: 'inline-flex' },
      '& .SolarIconButton-icon > svg': { width: '100%', height: '100%' },
    },
    // MUI's IconButton marks its states as Button does, under its own name.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      loading: '&.MuiIconButton-loading',
      disabled: '&.Mui-disabled:not(.MuiIconButton-loading)',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
    restates: { loading: ['root.background'] },
  },
  flutter: {
    // No label, so no text style: the icon takes the foreground.
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
      foreground: 'icon.color',
      iconColor: 'icon.color',
      iconSize: 'icon.width',
    },
  },
  templates: {
    react: (spec) => {
      const api = Object.keys(spec.api);
      if (spec.slots.icon?.type !== 'icon')
        throw new Error('Icon Button: the IR has no icon slot');
      return `/**
 * SOLAR Icon Button.
 *
 * Scaffolded once by \`npm run solar:scaffold "Icon Button"\` from spec/components/icon-button.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, \`solarIconButtonStyle\` in \`@bwp-web/styles/mui\`, which regenerates from Figma on
 * every \`solar:codegen\`. This file is behaviour: the props, the icon, loading, and accessibility.
 *
 * It wraps MUI's IconButton, which supplies focus handling, keyboard activation, the disabled and
 * loading states and their classes; the recipe restyles it. The app must load
 * \`@bwp-web/styles/tokens.css\`, since every recipe value is a \`var(--solar-*)\`.
 */

import MuiIconButton, {
  type IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';
import { forwardRef, type ReactNode } from 'react';
import {
  solarIconButtonCompose,
  solarIconButtonStyle,
  type SolarIconButtonProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { Spinner } from './Spinner.js';

interface IconButtonBase
  extends SolarIconButtonProps,
    Omit<
      MuiIconButtonProps,
      | keyof SolarIconButtonProps
      | 'color'
      | 'edge'
      | 'children'
      | 'loadingIndicator'
      | 'aria-label'
      | 'aria-labelledby'
    > {
  /** The icon, which is the whole of what the button says. */
  icon: ReactNode;
}

/**
 * An icon alone is not a name (SOLAR, and WCAG 4.1.2), so an icon button takes an \`aria-label\` or
 * an \`aria-labelledby\`, and the types refuse one with neither.
 */
export type IconButtonProps = IconButtonBase &
  (
    | { 'aria-label': string; 'aria-labelledby'?: string }
    | { 'aria-label'?: string; 'aria-labelledby': string }
  );

// Through globalThis, because \`process\` exists only where a bundler or Node provides it, and a
// browser library should not need Node's types to say so.
const DEV =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !==
  'production';

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
${api.map((p) => `    ${p},`).join('\n')}
    icon,
    sx,
    ...rest
  },
  ref,
) {
  // For JavaScript callers, whom the types do not reach.
  if (DEV && !rest['aria-label'] && !rest['aria-labelledby'])
    // eslint-disable-next-line no-console -- a development-only accessibility warning, on purpose
    console.warn('SOLAR Icon Button: it needs an aria-label or aria-labelledby.');

  // Disabled wins over loading, as in Figma's state order, so a disabled button shows no spinner.
  const busy = Boolean(loading && !disabled);
  const props = { ${api.join(', ')} };
  // What the loading state draws: which Spinner (Figma picks its size and style per variant; its
  // \`style\` axis is the Spinner's \`variant\` prop), and whether the icon stays.
  const whileLoading = solarIconButtonCompose(props, 'loading');
  const spinner = whileLoading.spinner;
  const showsIcon = !busy || whileLoading.icon.present !== false;

  return (
    <MuiIconButton
      ref={ref}
      {...rest}
      disabled={disabled}
      loading={busy}
      loadingIndicator={
        <Spinner
          size={spinner['variant.size'] as SolarSpinnerSize}
          variant={spinner['variant.style'] as SolarSpinnerVariant}
        />
      }
      // SOLAR's states have their own colours; MUI's ripple would paint over them.
      disableRipple
      sx={[solarIconButtonStyle(props), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {showsIcon && <span className="SolarIconButton-icon">{icon}</span>}
    </MuiIconButton>
  );
});
`;
    },
    flutter: (spec) => {
      const api = Object.entries(spec.api);
      if (spec.slots.icon?.type !== 'icon')
        throw new Error('Icon Button: the IR has no icon slot');
      return `/// SOLAR Icon Button.
///
/// Scaffolded once by \`npm run solar:scaffold -- --flutter "Icon Button"\` from
/// spec/components/icon-button.json, and owned by developers from then on: change it freely. What
/// it looks like is not here. That is the recipe, [SolarIconButtonRecipe], which regenerates from
/// Figma on every \`solar:codegen\`. This file is behaviour: the props, the icon, loading and
/// accessibility, with the same props as the React IconButton.
///
/// It wraps Flutter's IconButton, which supplies focus, keyboard activation, hover and press;
/// [SolarIconButtonRecipe.style] restyles it.
library;

import 'package:flutter/material.dart';

import '../generated/components/icon_button.dart';
import '../generated/components/spinner.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarIconButton extends StatelessWidget {
  const SolarIconButton({
    super.key,
    required this.onPressed,
    required this.icon,
    required this.semanticLabel,
${api.map(([prop, def]) => `    ${dartParam('IconButton', prop, def)},`).join('\n')}
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  });

  /// Called when the button is tapped; null disables it, as for any Flutter button.
  final VoidCallback? onPressed;

  /// The icon, which is the whole of what the button says.
  final Widget icon;

  /// The accessible name. An icon alone is not a name, so it is required.
  final String semanticLabel;

${api.map(([prop, def]) => dartField('IconButton', prop, def)).join('\n')}

  final FocusNode? focusNode;
  final bool autofocus;
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Disabled wins over loading, as in Figma's state order, so a disabled button shows no spinner.
    final busy = loading && !disabled;
    final p = SolarIconButtonProps(
${api.map(([prop]) => `      ${prop}: ${prop === 'loading' ? 'busy' : prop},`).join('\n')}
    );
    const rest = <WidgetState>{};
    bool shows(String layer) => SolarIconButtonRecipe.present(layer, p, rest);

    // Merged, so the name and the button's own tap action are one node for a screen reader: a
    // Semantics label alone makes a second node, and the button inside it stays unnamed.
    final Widget button = IconButton(
        onPressed: disabled || busy ? null : onPressed,
        style: SolarIconButtonRecipe.style(t, p),
        focusNode: focusNode,
        autofocus: autofocus,
        statesController: statesController,
        icon: Stack(
          alignment: Alignment.center,
          children: [
            // Loading hides the icon but keeps its room, as Figma does, so the button does not
            // resize.
            Visibility(
              visible: shows('icon'),
              maintainSize: true,
              maintainAnimation: true,
              maintainState: true,
              child: icon,
            ),
            if (shows('spinner'))
              // Which Spinner, Figma picks per variant; its \`style\` axis is the Spinner's
              // \`variant\` prop.
              ExcludeSemantics(
                child: SolarSpinner(
                size: SolarSpinnerSize.values.byName(
                    SolarIconButtonRecipe.lookup('spinner.variant.size', p, rest)!
                        .substring(2)),
                variant: SolarSpinnerVariant.values.firstWhere((v) =>
                    'k:\${v.figma}' ==
                    SolarIconButtonRecipe.lookup('spinner.variant.style', p, rest)),
              ),
              ),
          ],
        ),
      );
    return MergeSemantics(
      child: Semantics(label: semanticLabel, child: button),
    );
  }
}
`;
    },
  },
};
