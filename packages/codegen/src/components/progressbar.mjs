/**
 * SOLAR ProgressBar, beyond its IR: where MUI draws each layer, what the Flutter base control's
 * style reads, and the two shell templates, rendered into the shells by \`solar:codegen\` on every
 * run. One file per component, so adding one edits nothing shared; \`src/components/index.mjs\`
 * finds them.
 */

import { dartField, dartParam } from '../shells/helpers.mjs';

export default {
  name: 'ProgressBar',
  mui: {
    // The track is LinearProgress's root; the bar, which it draws and moves itself, its bar.
    slots: {
      root: '&',
      indicator: '& .MuiLinearProgress-bar',
    },
    // The bar's move to a new value is a functional transition, which SOLAR collapses where motion
    // is reduced (the motion chapter).
    resets: {
      display: 'block',
      '@media (prefers-reduced-motion: reduce)': {
        '& .MuiLinearProgress-bar': { transition: 'none' },
      },
    },
  },
  flutter: {
    // LinearProgressIndicator has one radius and one height for its track and its bar.
    shared: {
      'indicator.radius': 'root.radius',
      'indicator.height': 'root.height',
    },
  },
  templates: {
    react: (spec) => {
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR ProgressBar.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarProgressBarStyle\` in \`@bwp-web/styles/mui\`: the track's colour and height,
 * and the bar's colour by feedback.
 *
 * It wraps MUI's determinate LinearProgress, which draws the bar at \`value\` (0 to 100) and
 * supplies the progressbar role: name it (\`aria-label\`), and say the number beside it, as SOLAR
 * asks. It fills its container. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import LinearProgress, {
  type LinearProgressProps,
} from '@mui/material/LinearProgress';
import { forwardRef } from 'react';
import {
  solarProgressBarStyle,
  type SolarProgressBarProps,
} from '@bwp-web/styles/mui';

export interface ProgressBarProps
  extends SolarProgressBarProps,
    Omit<
      LinearProgressProps,
      | keyof SolarProgressBarProps
      | 'variant'
      | 'color'
      | 'value'
      | 'valueBuffer'
      // MUI types it Ref<unknown>; the component's own ref, a <span>, comes from forwardRef.
      | 'ref'
    > {
  /** How far along, from 0 to 100. */
  value: number;
}

export const ProgressBar = forwardRef<HTMLSpanElement, ProgressBarProps>(
  function ProgressBar({ ${api.join(', ')}, value, sx, ...rest }, ref) {
    return (
      <LinearProgress
        ref={ref}
        {...rest}
        variant="determinate"
        value={value}
        sx={[solarProgressBarStyle({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);
`;
    },
    flutter: (spec) => {
      const api = Object.entries(spec.api);
      return `/// SOLAR ProgressBar.
///
/// Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
/// solar:codegen\`: change the template there, never this file. What it looks like is not here. That
/// is the recipe, [SolarProgressBarRecipe]: the track's colour and height, and the bar's colour by
/// feedback.
///
/// It wraps Flutter's determinate LinearProgressIndicator, which draws the bar at [value] (0 to 1)
/// and supplies the semantics: name it ([semanticsLabel]), and say the number beside it, as SOLAR
/// asks. It fills the width it is given.
library;

import 'package:flutter/material.dart';

import '../generated/components/progressbar.dart';
import 'solar_theme_of.dart';

class SolarProgressBar extends StatelessWidget {
  const SolarProgressBar({
    super.key,
    required this.value,
${api.map(([prop, def]) => `    ${dartParam('ProgressBar', prop, def)},`).join('\n')}
    this.semanticsLabel,
  });

  /// How far along, from 0 to 1, as for any Flutter progress indicator.
  final double value;

${api.map(([prop, def]) => dartField('ProgressBar', prop, def)).join('\n')}

  /// What is in progress, for a screen reader.
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarProgressBarProps(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
    const rest = <WidgetState>{};
    return LinearProgressIndicator(
      value: value,
      minHeight: SolarProgressBarRecipe.dimension('root.height', p, rest),
      backgroundColor: SolarProgressBarRecipe.color(t, 'root.background', p, rest),
      color: SolarProgressBarRecipe.color(t, 'indicator.background', p, rest),
      borderRadius: BorderRadius.circular(
        SolarProgressBarRecipe.dimension('root.radius', p, rest)!,
      ),
      semanticsLabel: semanticsLabel,
    );
  }
}
`;
    },
  },
};
