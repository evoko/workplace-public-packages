/// An overlay's Playground wiring, the same for every overlay shown as a route (the dialogs, the
/// Drawer and the Scrim): an "Open" button, as an app's trigger would be, that sets the `open`
/// extra (packages/codegen/src/playground/extras.mjs); the overlay's route, pushed while `open`
/// holds and following the controls while it shows; and `close`, for the overlay's own ways of
/// closing, which clears `open` and logs the callback that closed it. As the web's `overlayOf`
/// (stories/playground/overlay.tsx).
library;

import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// Closes the overlay from one of its own callbacks, logging that callback ([event], `onClose`
/// unless named, and its [detail]).
typedef PlaygroundClose = void Function([String event, Object? detail]);

/// Shows an overlay's route and completes when it is popped: `showSolarDialog`, `showSolarDrawer`.
typedef PlaygroundShow = Future<Object?> Function({
  required BuildContext context,
  required WidgetBuilder builder,
});

/// The trigger, and the route [show] pushes while the `open` control holds: pushed when it turns
/// true, popped when it turns false (the panel, Reset, or [PlaygroundClose]). The route is built
/// once, so it listens to a notifier each rebuild of the Playground ticks, to follow the controls
/// while it is open. Where the route closes itself (Escape, a tap on the Scrim), `open` is cleared
/// and [dismissEvent] logged (`onClose`, or the overlay's own name for it: a Confirmation Dialog's
/// `onCancel`); where the Playground goes while it is open (the tester leaves the use case), the
/// route goes with it.
class PlaygroundRoute extends StatefulWidget {
  const PlaygroundRoute({
    super.key,
    required this.p,
    required this.show,
    required this.overlay,
    this.dismissEvent = 'onClose',
  });

  final SolarPlayground p;

  /// The callback logged where the route closes itself: the one the overlay's own dismissal calls.
  final String dismissEvent;

  /// Shows the route: the overlay's own show function.
  final PlaygroundShow show;

  /// The overlay, built in the route's [BuildContext], with its way of closing.
  final Widget Function(BuildContext context, PlaygroundClose close) overlay;

  @override
  State<PlaygroundRoute> createState() => _PlaygroundRouteState();
}

class _PlaygroundRouteState extends State<PlaygroundRoute> {
  final _changed = ValueNotifier(0);

  /// The shown route's own context, to pop it; null while it is closed.
  BuildContext? _route;

  /// Whether the route is shown or being shown, so a second sync does not push another.
  bool _shown = false;

  /// Whether [_close] closed it, so the route's end logs nothing more.
  bool _closed = false;

  bool get _open => widget.p.flag('open');

  @override
  void initState() {
    super.initState();
    _sync();
  }

  @override
  void didUpdateWidget(PlaygroundRoute old) {
    super.didUpdateWidget(old);
    _sync();
  }

  @override
  void dispose() {
    // The route is outside this subtree and outlives it: pop it after this frame, since the
    // navigator may not change while the tree is being torn down, then drop the notifier it
    // listens to.
    final changed = _changed;
    if (!_shown) {
      changed.dispose();
    } else {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final route = _route;
        if (route != null && route.mounted) Navigator.of(route).pop();
        changed.dispose();
      });
      WidgetsBinding.instance.scheduleFrame();
    }
    super.dispose();
  }

  /// After this frame, since the route is outside this subtree: follow the controls, and open or
  /// close the route where `open` changed.
  void _sync() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!mounted) return;
    _changed.value++;
    final open = _open;
    if (open && !_shown) {
      _show();
    } else if (!open) {
      final route = _route;
      if (route == null) return;
      _route = null;
      Navigator.of(route).pop();
    }
  });

  Future<void> _show() async {
    _shown = true;
    _closed = false;
    await widget.show(
      context: context,
      builder: (route) {
        _route = route;
        return ValueListenableBuilder(
          valueListenable: _changed,
          builder: (_, _, _) => widget.overlay(route, _close),
        );
      },
    );
    _shown = false;
    _route = null;
    // Closed by the route itself (Escape, the Scrim), not by the panel or [_close].
    if (mounted && !_closed && _open) {
      widget.p.set('open', false);
      widget.p.log(widget.dismissEvent);
    }
  }

  void _close([String event = 'onClose', Object? detail]) {
    if (_closed) return;
    _closed = true;
    widget.p.set('open', false);
    widget.p.log(event, detail);
    if (_route case final route? when route.mounted) {
      _route = null;
      Navigator.of(route).pop();
    }
  }

  @override
  Widget build(BuildContext context) => SolarButton(
    onPressed: () => widget.p.set('open', true),
    child: const Text('Open'),
  );
}

/// A menu's Playground wiring, the same for every menu that floats from its trigger (Dropdown Menu,
/// Context Menu): the "Open" button, and the menu under it in a SolarMenuAnchor, opened while the
/// `open` control holds and closed when it turns false (the panel, Reset, or [PlaygroundClose]).
/// Where the menu closes itself (Escape, a tap outside), `open` is cleared and `onClose` logged. As
/// the web's `overlayOf` with the menu floating under the trigger.
class PlaygroundMenu extends StatefulWidget {
  const PlaygroundMenu({super.key, required this.p, required this.menu});

  final SolarPlayground p;

  /// The menu (a SolarDropdownMenu, a SolarContextMenu), with its way of closing.
  final Widget Function(PlaygroundClose close) menu;

  @override
  State<PlaygroundMenu> createState() => _PlaygroundMenuState();
}

class _PlaygroundMenuState extends State<PlaygroundMenu> {
  final _controller = MenuController();

  /// Whether the Playground closed it (the panel, or [_close]), so its closing logs nothing more.
  bool _closing = false;

  @override
  void initState() {
    super.initState();
    _sync();
  }

  @override
  void didUpdateWidget(PlaygroundMenu old) {
    super.didUpdateWidget(old);
    _sync();
  }

  /// After this frame, since the menu is in the overlay: open or close it where `open` changed.
  void _sync() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!mounted) return;
    final open = widget.p.flag('open');
    if (open && !_controller.isOpen) {
      _controller.open();
    } else if (!open && _controller.isOpen) {
      _closing = true;
      _controller.close();
    }
  });

  void _close([String event = 'onClose', Object? detail]) {
    widget.p.set('open', false);
    widget.p.log(event, detail);
    if (_controller.isOpen) {
      _closing = true;
      _controller.close();
    }
  }

  /// The menu closed: by itself (Escape, a tap outside) unless the Playground closed it.
  void _closed() {
    if (_closing) {
      _closing = false;
      return;
    }
    if (mounted && widget.p.flag('open')) {
      widget.p.set('open', false);
      widget.p.log('onClose');
    }
  }

  @override
  Widget build(BuildContext context) => SolarMenuAnchor(
    controller: _controller,
    onClose: _closed,
    menu: widget.menu(_close),
    builder: (context, _) => SolarButton(
      onPressed: () => widget.p.set('open', true),
      child: const Text('Open'),
    ),
  );
}
