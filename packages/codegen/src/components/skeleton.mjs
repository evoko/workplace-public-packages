/**
 * SOLAR Skeleton, beyond its IR: where MUI draws each layer, and the two shell templates, run once
 * by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * MUI's Skeleton on the web; bespoke in Flutter, which has none, drawn by the shared layer helpers
 * inside a pulse.
 */

import { dartField, dartParam } from '../scaffold/helpers.mjs';
import { treeOf } from '../scaffold/drawn.mjs';

const requireAxes = (spec) => {
  for (const axis of ['type', 'size'])
    if (!spec.api[axis]) throw new Error(`Skeleton: the IR has no ${axis}`);
};

export default {
  name: 'Skeleton',
  mui: {
    slots: { root: '&' },
    // MUI's own fill, a translucent grey, is the recipe's colour instead (backgroundColor); its
    // rectangular variant draws no radius of its own. Its pulse is decorative motion, which SOLAR
    // removes entirely where motion is reduced (the motion chapter).
    resets: {
      display: 'block',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireAxes(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Skeleton.
 *
 * Scaffolded once by \`npm run solar:scaffold Skeleton\` from spec/components/skeleton.json, and
 * owned by developers from then on: change it freely. What it looks like is not here. That is the
 * recipe, \`solarSkeletonStyle\` in \`@bwp-web/styles/mui\`: each type's size and radius, and its
 * colour.
 *
 * It wraps MUI's Skeleton, always its rectangular variant (its text variant scales the box to 60%
 * of its height), which supplies the pulse, removed where motion is reduced. Figma's sizes are the
 * content's, for the three sizes; \`width\` and \`height\` take the real content's. Decorative: mark
 * the region loading with \`aria-busy\`. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MuiSkeleton, { type SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton';
import { forwardRef } from 'react';
import { solarSkeletonStyle, type SolarSkeletonProps } from '@bwp-web/styles/mui';

export interface SkeletonProps
  extends SolarSkeletonProps,
    Omit<
      MuiSkeletonProps,
      | keyof SolarSkeletonProps
      | 'variant'
      | 'animation'
      // MUI types it Ref<unknown>; the component's own ref, a <span>, comes from forwardRef.
      | 'ref'
    > {}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { ${api.join(', ')}, sx, ...rest },
  ref,
) {
  return (
    <MuiSkeleton
      ref={ref}
      aria-hidden
      {...rest}
      variant="rectangular"
      animation="pulse"
      sx={[solarSkeletonStyle({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
});
`;
    },
    flutter: (spec) => {
      requireAxes(spec);
      const api = Object.entries(spec.api);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([p, kids]) =>
            `    '${p}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      return `/// SOLAR Skeleton.
///
/// Scaffolded once by \`npm run solar:scaffold -- --flutter Skeleton\` from
/// spec/components/skeleton.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarSkeletonRecipe]: each type's size and radius,
/// and its colour, read cell by cell.
///
/// Bespoke: Flutter has no skeleton. It is drawn with [SolarLayers], and pulses as the web's MUI
/// Skeleton does, fading to 40% and back over [SolarMotion.durationSlower] each way; not at all
/// where the platform asks for no animation, as SOLAR removes decorative motion. Figma's sizes are
/// the content's, for the three sizes; [width] and [height] take the real content's. Decorative:
/// excluded from semantics, so mark the region loading.
library;

import 'package:flutter/material.dart';

import '../generated/components/skeleton.dart';
import '../generated/tokens.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarSkeleton extends StatefulWidget {
  const SolarSkeleton({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('Skeleton', prop, def)},`).join('\n')}
    this.width,
    this.height,
  });

${api.map(([prop, def]) => dartField('Skeleton', prop, def)).join('\n')}

  /// The real content's width, where it is known; otherwise Figma's for the type and size.
  final double? width;

  /// The real content's height, where it is known.
  final double? height;

  @override
  State<SolarSkeleton> createState() => _SolarSkeletonState();
}

class _SolarSkeletonState extends State<SolarSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: SolarMotion.durationSlower,
  );

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      _pulse.value = 0;
      _pulse.stop();
    } else if (!_pulse.isAnimating) {
      _pulse.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSkeletonProps(${api.map(([prop]) => `${prop}: widget.${prop}`).join(', ')});
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSkeletonRecipe.lookup(c, p, states),
        dimension: (c) => switch (c) {
          'root.width' when widget.width != null => widget.width,
          'root.height' when widget.height != null => widget.height,
          _ => SolarSkeletonRecipe.dimension(c, p, states),
        },
        color: (c) => SolarSkeletonRecipe.color(t, c, p, states),
        shadow: (c) => SolarSkeletonRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSkeletonRecipe.textStyle(t, c, p, states),
        present: (l) => SolarSkeletonRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'skeleton',
    ).layer('root');
    return ExcludeSemantics(
      child: FadeTransition(
        opacity: _pulse.drive(
          Tween<double>(begin: 1, end: 0.4).chain(
            CurveTween(curve: SolarMotion.easeBoth),
          ),
        ),
        child: mark,
      ),
    );
  }
}
`;
    },
  },
};
