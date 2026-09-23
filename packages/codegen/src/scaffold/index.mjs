/**
 * Scaffolds a component's hand-owned shell, once.
 *
 * The line between generated and owned is the line between look and behaviour. The recipe --
 * what a component looks like -- regenerates from Figma on every `solar:codegen` and is never
 * edited. The shell -- props, slots, loading, accessibility -- is written here one time from the
 * IR and then belongs to developers: this refuses to overwrite it unless told to, so a behaviour
 * someone added is never clobbered by a design change. That is why this is its own command and
 * never part of `solar:codegen` or CI.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { packagesDir, repoRoot } from '../util/paths.mjs';

export const componentsSrc = join(packagesDir, 'components', 'src');
export const flutterLib = join(packagesDir, 'solar_flutter', 'lib');

/** The MUI prop each slot type becomes; a slot type with no entry here cannot be scaffolded. */
const MUI_SLOT_PROPS = { iconLeading: 'startIcon', iconTrailing: 'endIcon' };

/**
 * The React shell templates, by component. A template is a function of the IR, so prop and slot
 * names come from Figma rather than being retyped, but its structure is written for the one MUI
 * control it wraps.
 */
export const TEMPLATES = {
  Button: (spec) => {
    const api = Object.keys(spec.api);
    const slots = spec.slots;
    for (const required of ['iconLeading', 'iconTrailing', 'label', 'counter'])
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

  Spinner: (spec) => {
    const api = Object.keys(spec.api);
    return `/**
 * SOLAR Spinner.
 *
 * Scaffolded once by \`npm run solar:scaffold Spinner\` from spec/components/spinner.json, and owned
 * by developers from then on. Its look is the recipe, \`solarSpinnerStyle\` in
 * \`@bwp-web/styles/mui\`: the ring's size, its stroke width, and the track and indicator colours.
 *
 * It wraps MUI's CircularProgress, which supplies the motion and the progressbar role. A box takes
 * the recipe's size and the progress fills it, because MUI writes its own size prop as an inline
 * style the recipe could not override. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box from '@mui/material/Box';
import CircularProgress, {
  type CircularProgressProps,
} from '@mui/material/CircularProgress';
import { forwardRef } from 'react';
import { solarSpinnerStyle, type SolarSpinnerProps } from '@bwp-web/styles/mui';

export interface SpinnerProps
  extends SolarSpinnerProps,
    Omit<
      CircularProgressProps,
      | keyof SolarSpinnerProps
      | 'color'
      | 'thickness'
      | 'value'
      | 'enableTrackSlot'
      | 'disableShrink'
    > {}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { ${api.join(', ')}, sx, ...rest },
  ref,
) {
  return (
    <Box
      component="span"
      ref={ref}
      sx={[solarSpinnerStyle({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <CircularProgress {...rest} size="100%" enableTrackSlot color="inherit" />
    </Box>
  );
});
`;
  },
};

/** A Dart constructor parameter for one API prop, with the IR's default. */
function dartParam(component, prop, def) {
  if (def.type === 'boolean') return `this.${prop} = ${def.default}`;
  const id = def.default === 'default' ? '$default' : def.default;
  return `this.${prop} = Solar${component}${prop[0].toUpperCase()}${prop.slice(1)}.${id}`;
}

/** A Dart field for one API prop. */
function dartField(component, prop, def) {
  const type =
    def.type === 'boolean'
      ? 'bool'
      : `Solar${component}${prop[0].toUpperCase()}${prop.slice(1)}`;
  return `  final ${type} ${prop};`;
}

/**
 * The Flutter widget templates, by component: the same props as the React shell, from the same
 * IR, wrapping the Flutter control the overlay names, styled by the generated recipe.
 */
export const FLUTTER_TEMPLATES = {
  Button: (spec) => {
    const api = Object.entries(spec.api);
    for (const required of ['iconLeading', 'iconTrailing', 'label', 'counter'])
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

  /// A count shown after the label.
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
      if (iconLeading != null) iconLeading!,
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
      if (iconTrailing != null) iconTrailing!,
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

    Widget button = FilledButton(
      onPressed: disabled || busy ? null : onPressed,
      style: SolarButtonRecipe.style(t, p),
      focusNode: focusNode,
      autofocus: autofocus,
      statesController: statesController,
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
    );
    if (semanticLabel != null) {
      button = Semantics(label: semanticLabel, child: button);
    }
    return button;
  }
}
`;
  },

  Spinner: (spec) => {
    const api = Object.entries(spec.api);
    return `/// SOLAR Spinner.
///
/// Scaffolded once by \`npm run solar:scaffold -- --flutter Spinner\` from
/// spec/components/spinner.json, and owned by developers from then on. Its look is the recipe,
/// [SolarSpinnerRecipe]: the ring's size, its stroke width, and the track and indicator colours.
///
/// It wraps Flutter's CircularProgressIndicator, which supplies the motion and the semantics.
library;

import 'package:flutter/material.dart';

import '../generated/components/spinner.dart';
import 'solar_theme_of.dart';

class SolarSpinner extends StatelessWidget {
  const SolarSpinner({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('Spinner', prop, def)},`).join('\n')}
    this.semanticsLabel,
  });

${api.map(([prop, def]) => dartField('Spinner', prop, def)).join('\n')}

  /// What is loading, for a screen reader.
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSpinnerProps(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
    const rest = <WidgetState>{};
    return SizedBox.square(
      dimension: SolarSpinnerRecipe.dimension('spinnerRing.width', p, rest),
      child: CircularProgressIndicator(
        // The ring inside its box, as the web draws it.
        strokeAlign: CircularProgressIndicator.strokeAlignInside,
        strokeWidth: SolarSpinnerRecipe.dimension('indicator.borderWidth', p, rest)!,
        color: SolarSpinnerRecipe.color(t, 'indicator.borderColor', p, rest),
        backgroundColor: SolarSpinnerRecipe.color(t, 'track.borderColor', p, rest),
        semanticsLabel: semanticsLabel,
      ),
    );
  }
}
`;
  },
};

/** `Button` to `Button.tsx`. */
export const shellFileOf = (component) =>
  `${component.replace(/[^A-Za-z0-9]/g, '')}.tsx`;

/** `Button` to `solar_button.dart`. */
export const flutterFileOf = (component) =>
  `solar_${component.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.dart`;

/**
 * Writes the Flutter widget unless it exists, and exports it from the package library once.
 *
 * @returns {{status: 'written' | 'exists' | 'overwritten', file: string}}
 */
export function scaffoldFlutter(
  spec,
  { force = false, lib = flutterLib } = {},
) {
  const template = FLUTTER_TEMPLATES[spec.component];
  if (!template)
    throw new Error(`no Flutter widget template for ${spec.component}`);
  const dir = join(lib, 'src', 'components');
  const file = join(dir, flutterFileOf(spec.component));
  const existed = existsSync(file);
  const shown = relative(repoRoot, file);
  if (existed && !force) return { status: 'exists', file: shown };
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, template(spec));

  const library = join(lib, 'solar_flutter.dart');
  const line = `export 'src/components/${flutterFileOf(spec.component)}';`;
  const current = readFileSync(library, 'utf8');
  if (!current.includes(line)) {
    // Kept with the other exports, sorted, as \`dart format\` and the analyzer's directive ordering
    // expect.
    const lines = current.trimEnd().split('\n');
    const exports = lines.filter((l) => l.startsWith('export '));
    const first = lines.indexOf(exports[0]);
    const sorted = [...exports, line].sort();
    lines.splice(first, exports.length, ...sorted);
    writeFileSync(library, `${lines.join('\n')}\n`);
  }
  return { status: existed ? 'overwritten' : 'written', file: shown };
}

/**
 * Writes the shell unless it exists. Returns what happened, so the CLI can say it and a test can
 * assert it. Also adds the export to the package entry if it is missing, and nothing else there.
 *
 * @returns {{status: 'written' | 'exists' | 'overwritten', file: string}}
 */
export function scaffold(spec, { force = false, dir = componentsSrc } = {}) {
  const template = TEMPLATES[spec.component];
  if (!template) throw new Error(`no shell template for ${spec.component}`);
  const file = join(dir, shellFileOf(spec.component));
  const existed = existsSync(file);
  const shown = relative(repoRoot, file);
  if (existed && !force) return { status: 'exists', file: shown };
  writeFileSync(file, template(spec));

  const index = join(dir, 'index.ts');
  const line = `export * from './${shellFileOf(spec.component).replace(/\.tsx$/, '.js')}';`;
  const current = existsSync(index) ? readFileSync(index, 'utf8') : '';
  if (!current.includes(line)) {
    // An empty package's entry is `export {};`, which has nothing left to do once it exports.
    const kept = current.replace(/^export \{\};\s*$/m, '').trimEnd();
    writeFileSync(index, `${kept ? `${kept}\n` : ''}${line}\n`);
  }
  return { status: existed ? 'overwritten' : 'written', file: shown };
}
