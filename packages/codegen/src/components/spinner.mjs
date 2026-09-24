/**
 * SOLAR Spinner, beyond its IR: where MUI draws each layer and marks each state, what the Flutter
 * base control's style reads, and the two shell templates, run once by \`solar:scaffold\`. One file
 * per component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 */

import { dartField, dartParam } from '../scaffold/helpers.mjs';

export default {
  name: 'Spinner',
  mui: {
    // The shell sizes a box and lets CircularProgress fill it (size="100%"), since MUI writes the
    // size prop as an inline style no recipe rule could beat.
    slots: {
      root: '&',
      spinnerRing: '&',
      track: '& .MuiCircularProgress-track',
      indicator: '& .MuiCircularProgress-circle',
    },
    svgLayers: ['track', 'indicator'],
    // CircularProgress draws in a 44-unit viewBox scaled to its box, so a stroke width in CSS
    // pixels would scale with it; non-scaling-stroke keeps SOLAR's border width in screen pixels.
    // MUI fades its track to 12% of the indicator's colour; SOLAR's track has a colour of its own.
    resets: {
      display: 'inline-flex',
      '& .MuiCircularProgress-root': { display: 'block' },
      '& .MuiCircularProgress-track, & .MuiCircularProgress-circle': {
        vectorEffect: 'non-scaling-stroke',
      },
      '& .MuiCircularProgress-track': { opacity: '1' },
    },
  },
  flutter: {
    // CircularProgressIndicator has one strokeWidth for its track and its indicator.
    shared: { 'indicator.borderWidth': 'track.borderWidth' },
  },
  templates: {
    react: (spec) => {
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
      // MUI types it Ref<unknown>; the component's own ref, a <span>, comes from forwardRef.
      | 'ref'
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
    flutter: (spec) => {
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
  },
};
