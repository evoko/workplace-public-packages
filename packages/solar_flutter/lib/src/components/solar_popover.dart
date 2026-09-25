/// SOLAR Popover.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarPopoverRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarPopoverRecipe]: the bubble, its words'
/// text styles, and its tip's shape and place, read cell by cell.
///
/// An anchored overlay for rich content, as the description says, drawn from Figma's layer tree
/// with [SolarLayers]: its [title] and [body] in a bubble, and the caller's controls ([content])
/// under them, its tip pointing at its trigger ([child]) from the side [placement] names, top by
/// default. Drawn in an overlay over the trigger while [open]: a dialog named by its title, Escape
/// (wherever the focus is) and a tap outside it calling [onClose]. The focus moves into it only where it holds controls,
/// and back to where it was once it closes. Without a trigger it is the surface alone. For a
/// one-line hint use a [SolarTooltip]; for a list of actions a Dropdown.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

import '../generated/components/popover.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarPopover extends StatefulWidget {
  const SolarPopover({
    super.key,
    required this.title,
    this.body,
    this.content,
    this.size = SolarPopoverSize.md,
    this.placement = SolarPopoverPlacement.top,
    this.child,
    this.open = false,
    this.onClose,
  });

  /// Its title, which names it.
  final String title;

  /// Its words under the title.
  final String? body;

  /// The caller's controls, under its words; given, the focus moves into it.
  final Widget? content;

  final SolarPopoverSize size;
  final SolarPopoverPlacement placement;

  /// Its trigger, which its tip points at; without one, the surface alone is drawn.
  final Widget? child;

  /// Whether it shows, where it has a trigger.
  final bool open;

  /// Called to close it: Escape, a tap outside it.
  final VoidCallback? onClose;

  @override
  State<SolarPopover> createState() => _SolarPopoverState();
}

class _SolarPopoverState extends State<SolarPopover> {
  final _portal = OverlayPortalController();
  final _link = LayerLink();
  final _region = Object();
  FocusNode? _return;

  @override
  void initState() {
    super.initState();
    _follow();
  }

  @override
  void didUpdateWidget(SolarPopover old) {
    super.didUpdateWidget(old);
    if (old.open != widget.open || old.child != widget.child) _follow();
  }

  /// Shows or hides the overlay as [SolarPopover.open] says, once the frame is built.
  void _follow() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final show = widget.open && widget.child != null;
      if (show && !_portal.isShowing) {
        _return = FocusManager.instance.primaryFocus;
        _portal.show();
        HardwareKeyboard.instance.addHandler(_key);
      } else if (!show && _portal.isShowing) {
        _portal.hide();
        HardwareKeyboard.instance.removeHandler(_key);
        // Back where it was, where it moved into the popover.
        if (widget.content != null) _return?.requestFocus();
        _return = null;
      }
    });
  }

  void _close() => widget.onClose?.call();

  /// Escape closes it wherever the focus is, as on the web: the focus stays on its trigger where
  /// it holds no controls, and a trigger need not take the focus at all.
  bool _key(KeyEvent event) {
    if (event is! KeyDownEvent ||
        event.logicalKey != LogicalKeyboardKey.escape) {
      return false;
    }
    _close();
    return true;
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_key);
    super.dispose();
  }

  Widget _surface(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarPopoverProps(size: widget.size, placement: widget.placement);
    const states = <WidgetState>{};
    bool drawn(String l) => SolarPopoverRecipe.present(l, p, states);
    // The caller's controls follow its title and words, drawn by these layers.
    late final SolarLayers layers;
    Widget own(String layer) => Builder(builder: (_) => layers.layer(layer));
    layers = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarPopoverRecipe.lookup(c, p, states),
        dimension: (c) => SolarPopoverRecipe.dimension(c, p, states),
        color: (c) => SolarPopoverRecipe.color(t, c, p, states),
        shadow: (c) => SolarPopoverRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarPopoverRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          'body' => widget.body != null && drawn(l),
          _ => drawn(l),
        },
        glyph: (l) => SolarPopoverRecipe.glyph(l, p, states),
      ),
      tree: SolarPopoverRecipe.tree,
      keyPrefix: 'popover',
      text: {'title': widget.title, 'body': ?widget.body},
      wraps: const {'title': TextAlign.start, 'body': TextAlign.start},
      content: {
        'content': [
          own('title'),
          if (widget.body != null && drawn('body')) own('body'),
          ?widget.content,
        ],
      },
    );
    return Semantics(
      role: SemanticsRole.dialog,
      explicitChildNodes: true,
      label: widget.title,
      child: Material(
        type: MaterialType.transparency,
        child: layers.layer('root'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final child = widget.child;
    if (child == null) return _surface(context);
    // Its tip hangs from the bubble's square corner, at its start, so that corner meets the
    // trigger's.
    final (target, follower) = switch (widget.placement) {
      SolarPopoverPlacement.top => (Alignment.topLeft, Alignment.bottomLeft),
      SolarPopoverPlacement.bottom => (Alignment.bottomLeft, Alignment.topLeft),
      SolarPopoverPlacement.left => (Alignment.topLeft, Alignment.topRight),
      SolarPopoverPlacement.right => (Alignment.topRight, Alignment.topLeft),
    };
    return OverlayPortal(
      controller: _portal,
      overlayChildBuilder: (context) => CompositedTransformFollower(
        link: _link,
        targetAnchor: target,
        followerAnchor: follower,
        child: Align(
          alignment: follower,
          child: TapRegion(
            groupId: _region,
            onTapOutside: (_) => _close(),
            child: FocusScope(
              autofocus: widget.content != null,
              canRequestFocus: widget.content != null,
              child: _surface(context),
            ),
          ),
        ),
      ),
      // A tap on its trigger is not outside it.
      child: CompositedTransformTarget(
        link: _link,
        child: TapRegion(groupId: _region, child: child),
      ),
    );
  }
}
