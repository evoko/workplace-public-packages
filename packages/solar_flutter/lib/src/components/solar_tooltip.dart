/// SOLAR Tooltip.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTooltipRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTooltipRecipe]: the bubble, its words'
/// text style, and its arrow's shape and place, read cell by cell.
///
/// A brief label shown on hover, long press or keyboard focus, as the description says, drawn from
/// Figma's layer tree with [SolarLayers]: its [message] in a bubble, its arrow pointing at its
/// trigger ([child]) from the side [position] names, top by default; [size] sm for an icon button's
/// label, md for a few words. Drawn in an overlay over the trigger (owner decision 2026-09-25:
/// Flutter's Tooltip draws no arrow), after a hover delay (motion.duration.slow, the nearest to the
/// description's ~500ms), Escape hiding it; it never takes the focus, and a screen reader reads it
/// as the trigger's tooltip. Without a trigger, it is the bubble alone. For interactive content use
/// a Popover.
library;

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/tooltip.dart';
import '../generated/tokens.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTooltip extends StatefulWidget {
  const SolarTooltip({
    super.key,
    required this.message,
    this.size = SolarTooltipSize.sm,
    this.position = SolarTooltipPosition.top,
    this.child,
  });

  /// Its words: one line (sm), or about ten words (md).
  final String message;

  final SolarTooltipSize size;
  final SolarTooltipPosition position;

  /// Its trigger, which it describes; without one, the bubble alone is drawn.
  final Widget? child;

  @override
  State<SolarTooltip> createState() => _SolarTooltipState();
}

class _SolarTooltipState extends State<SolarTooltip> {
  final _portal = OverlayPortalController();
  final _link = LayerLink();
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _show({Duration after = Duration.zero}) {
    _timer?.cancel();
    _timer = Timer(after, () {
      if (mounted && !_portal.isShowing) _portal.show();
    });
  }

  void _hide() {
    _timer?.cancel();
    if (_portal.isShowing) _portal.hide();
  }

  Widget _bubble(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTooltipProps(size: widget.size, position: widget.position);
    const states = <WidgetState>{};
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTooltipRecipe.lookup(c, p, states),
        dimension: (c) => SolarTooltipRecipe.dimension(c, p, states),
        color: (c) => SolarTooltipRecipe.color(t, c, p, states),
        shadow: (c) => SolarTooltipRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTooltipRecipe.textStyle(t, c, p, states),
        present: (l) => SolarTooltipRecipe.present(l, p, states),
        glyph: (l) => SolarTooltipRecipe.glyph(l, p, states),
      ),
      tree: SolarTooltipRecipe.tree,
      keyPrefix: 'tooltip',
      text: {'content': widget.message},
    ).layer('root');
  }

  @override
  Widget build(BuildContext context) {
    final child = widget.child;
    if (child == null) return _bubble(context);
    final p = SolarTooltipProps(size: widget.size, position: widget.position);
    const states = <WidgetState>{};
    // The arrow reaches past the bubble to its trigger: the bubble floats that far off it.
    double reach(String cell) =>
        SolarTooltipRecipe.dimension('arrow.$cell', p, states) ?? 0;
    final (target, follower, offset) = switch (widget.position) {
      SolarTooltipPosition.top => (
        Alignment.topCenter,
        Alignment.bottomCenter,
        Offset(0, -reach('height')),
      ),
      SolarTooltipPosition.bottom => (
        Alignment.bottomCenter,
        Alignment.topCenter,
        Offset(0, reach('height')),
      ),
      SolarTooltipPosition.right => (
        Alignment.centerRight,
        Alignment.centerLeft,
        Offset(reach('width'), 0),
      ),
      SolarTooltipPosition.left => (
        Alignment.centerLeft,
        Alignment.centerRight,
        Offset(-reach('width'), 0),
      ),
    };
    return OverlayPortal(
      controller: _portal,
      overlayChildBuilder: (context) => CompositedTransformFollower(
        link: _link,
        targetAnchor: target,
        followerAnchor: follower,
        offset: offset,
        child: Align(
          alignment: follower,
          child: IgnorePointer(
            child: ExcludeSemantics(child: _bubble(context)),
          ),
        ),
      ),
      child: CompositedTransformTarget(
        link: _link,
        child: Semantics(
          tooltip: widget.message,
          child: CallbackShortcuts(
            bindings: {const SingleActivator(LogicalKeyboardKey.escape): _hide},
            child: Focus(
              canRequestFocus: false,
              skipTraversal: true,
              onFocusChange: (focused) => focused ? _show() : _hide(),
              child: MouseRegion(
                onEnter: (_) => _show(after: SolarMotion.durationSlow),
                onExit: (_) => _hide(),
                child: GestureDetector(
                  behavior: HitTestBehavior.translucent,
                  onLongPress: _show,
                  onLongPressEnd: (_) => _hide(),
                  child: child,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
