/**
 * SOLAR BackButton, beyond its IR: where MUI draws each layer and marks each state, what the
 * Flutter base control's style reads, and the two shell templates, rendered into the shells by
 * \`solar:codegen\` on every run. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * On Button's machinery: a tertiary button, its arrow SOLAR's ArrowLeft icon, drawn by the shells,
 * and its label optional ("Back" by default).
 */

import { dartField, dartParam } from '../shells/helpers.mjs';
import { targetArea } from '../shells/target.mjs';

const requireLayers = (spec) => {
  if (!spec.layers.iconArrowLeft)
    throw new Error('BackButton: the IR has no arrow');
  if (!spec.slots.label)
    throw new Error('BackButton: the IR has no label slot');
};

export default {
  name: 'BackButton',
  mui: {
    slots: {
      root: '&',
      label: '&',
      iconArrowLeft: '& .MuiButton-startIcon',
      spinner: '& .MuiButton-loadingIndicator',
    },
    resets: {
      // Not '0': MUI's sx reads a sizing value of 1 or less as a fraction.
      minWidth: 'auto',
      textTransform: 'none',
      '& .MuiButton-startIcon': { margin: '0', flexShrink: '0' },
      '& .MuiButton-startIcon > svg': { width: '100%', height: '100%' },
      // A 44 × 44 target around the drawn button (shells/target.mjs).
      ...targetArea(),
    },
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      loading: '&.MuiButton-loading',
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
      iconColor: 'iconArrowLeft.color',
      iconSize: 'iconArrowLeft.width',
    },
  },
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own buttons: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR BackButton.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarBackButtonStyle\` in \`@bwp-web/styles/mui\`: its sizes, its colours by state,
 * its shadow and focus ring.
 *
 * Back to the previous view or a parent: one per view, top left. It wraps MUI's Button, which
 * supplies focus, keyboard activation, and the disabled and loading states, with SOLAR's
 * ArrowLeft icon. The label is "Back" by default; give the destination where it helps ("Back to
 * Devices"), or \`{null}\` for the arrow alone, which is then named "Back". Pass \`href\` to
 * make it a link. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { IconArrowLeft } from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarBackButtonCompose,
  solarBackButtonStyle,
  type SolarBackButtonProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { Spinner } from './Spinner.js';

export interface BackButtonProps
  extends SolarBackButtonProps,
    Omit<
      MuiButtonProps,
      | keyof SolarBackButtonProps
      | 'color'
      | 'variant'
      | 'startIcon'
      | 'endIcon'
      | 'disableElevation'
      | 'children'
    > {
  /** Where it goes back to: "Back" by default, or null for the arrow alone. */
  children?: ReactNode;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  function BackButton({ ${api.join(', ')}, children = 'Back', sx, ...rest }, ref) {
    const busy = Boolean(loading && !disabled);
    // What the loading state hides, keeping its room, and the Spinner it shows, as Figma picks it.
    const parts = solarBackButtonCompose({ ${api.join(', ')} }, busy ? 'loading' : 'default');
    const spinner = solarBackButtonCompose({ ${api.join(', ')} }, 'loading').spinner;
    return (
      <MuiButton
        // Its own recipe, not the SOLAR theme's for a stock MUI one (spec/overlay/mui-theme.yaml).
        data-solar=""
        ref={ref}
        aria-label={children == null ? 'Back' : undefined}
        {...rest}
        disabled={disabled}
        loading={busy}
        startIcon={<IconArrowLeft />}
        loadingIndicator={
          <Spinner
            size={spinner['variant.size'] as SolarSpinnerSize}
            variant={spinner['variant.style'] as SolarSpinnerVariant}
          />
        }
        // SOLAR's states have their own colours; MUI's ripple and elevation would paint over them.
        variant="text"
        disableRipple
        sx={[
          solarBackButtonStyle({ ${api.join(', ')} }),
          parts.iconArrowLeft?.present === false
            ? { '& .MuiButton-startIcon': { visibility: 'hidden' } }
            : null,
          // Under the loading class the recipe's own colour rule is, so this one, later, wins.
          parts.label?.present === false
            ? { '&.MuiButton-loading': { color: 'transparent' } }
            : null,
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </MuiButton>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const api = Object.entries(spec.api);
      return `/// SOLAR BackButton.
///
/// Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
/// solar:codegen\`: change the template there, never this file. What it looks like is not here. That
/// is the recipe, [SolarBackButtonRecipe]: its sizes, its colours by state, its shadow and focus
/// ring.
///
/// Back to the previous view or a parent: one per view, top left. It wraps Flutter's FilledButton,
/// as SolarButton does, with SOLAR's ArrowLeft icon. Its label, the [child], is 'Back' by default;
/// give the destination where it helps ('Back to Devices'), or null for the arrow alone, which is
/// then named by [semanticLabel].
library;

import 'package:flutter/material.dart';

import '../generated/components/backbutton.dart';
import '../generated/components/spinner.dart';
import '../generated/icons.dart';
import '../solar_icon.dart';
import '../solar_button_themes.dart';
import '../solar_own_size.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarBackButton extends StatelessWidget {
  const SolarBackButton({
    super.key,
    required this.onPressed,
    this.child = const Text('Back'),
    this.semanticLabel = 'Back',
${api
  .filter(([prop]) => prop !== 'disabled')
  .map(([prop, def]) => `    ${dartParam('BackButton', prop, def)},`)
  .join('\n')}
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  });

  /// Called when it is tapped; null disables it, as for any Flutter button.
  final VoidCallback? onPressed;

  /// Where it goes back to: 'Back' by default; null for the arrow alone.
  final Widget? child;

  /// The arrow alone's accessible name.
  final String semanticLabel;

${api
  .filter(([prop]) => prop !== 'disabled')
  .map(([prop, def]) => dartField('BackButton', prop, def))
  .join('\n')}

  final FocusNode? focusNode;
  final bool autofocus;
  final WidgetStatesController? statesController;

  /// Whether it is disabled: by a null [onPressed], as Flutter's own buttons are, not a parameter of
  /// its own.
  bool get disabled => onPressed == null;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Disabled wins over loading, as in Figma's state order.
    final busy = loading && !disabled;
    final p = SolarBackButtonProps(
${api.map(([prop]) => `      ${prop}: ${prop === 'loading' ? 'busy' : prop},`).join('\n')}
    );
    const rest = <WidgetState>{};
    bool shows(String layer) => SolarBackButtonRecipe.present(layer, p, rest);
    final gap = SolarBackButtonRecipe.dimension('root.gap', p, rest) ?? 0;
    // Loading hides the arrow and the label but keeps their room, so the button does not resize.
    Widget kept(String layer, Widget child) => Visibility(
          visible: shows(layer),
          maintainSize: true,
          maintainAnimation: true,
          maintainState: true,
          maintainSemantics: true,
          child: child,
        );
    final content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        kept(
          'iconArrowLeft',
          const _Arrow(key: Key('iconArrowLeft')),
        ),
        if (child != null) ...[SizedBox(width: gap), kept('label', child!)],
      ],
    );

    Widget button = FilledButton(
      onPressed: disabled || busy ? null : onPressed,
      // The recipe, under the app's SolarBackButtonThemeData where its theme has one.
        style: SolarBackButtonThemeData.styled(context, SolarBackButtonRecipe.style(t, p)),
      focusNode: focusNode,
      autofocus: autofocus,
      statesController: statesController,
      child: Stack(
        alignment: Alignment.center,
        children: [
          content,
          if (shows('spinner'))
            ExcludeSemantics(
              child: SolarSpinner(
                size: SolarSpinnerSize.values.byName(
                    SolarBackButtonRecipe.lookup('spinner.variant.size', p, rest)!
                        .substring(2)),
                variant: SolarSpinnerVariant.values.firstWhere((v) =>
                    'k:\${v.figma}' ==
                    SolarBackButtonRecipe.lookup('spinner.variant.style', p, rest)),
              ),
            ),
        ],
      ),
    );
    if (child == null) {
      button = MergeSemantics(
        child: Semantics(label: semanticLabel, child: button),
      );
    }
    // Its own size wherever it is put, as Figma draws it, not the width a ListView forces on a
    // Flutter button (owner decision 2026-09-25); a parent that shares its row gives SolarFill.
    return SolarOwnSize(child: button);
  }
}

/// SOLAR's ArrowLeft, in the colour and size the button's icon theme gives it.
class _Arrow extends StatelessWidget {
  const _Arrow({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = IconTheme.of(context);
    return SolarIcon(
      SolarIcons.arrowLeftOutline,
      size: theme.size,
      color: theme.color,
    );
  }
}
`;
    },
  },
};
