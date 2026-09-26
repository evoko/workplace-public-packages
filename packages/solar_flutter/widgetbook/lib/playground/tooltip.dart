// Tooltip's Playground: its trigger is an "Open" button, which it describes; it shows on hover,
// long press or keyboard focus, as in an app, and hides as the pointer leaves or on Escape. The
// `open` extra forces it shown: the button's press, or the panel, sets it, and the builder gives
// the trigger the focus, which shows the tooltip at once; off, the focus goes and it hides. Escape
// clears `open`. The widget takes no `open` and tells no one when it shows or hides (reported), so
// a hover's showing does not reach `open`, and nothing is logged. Its size, position and words
// from their controls, its words shown by the `tooltipContent` toggle. As the web's
// (stories/playground/tooltip.tsx), where MUI's Tooltip tells the Playground and `open` follows a
// hover too.

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final tooltipPlayground = SolarPlaygroundBuilder(
  build: (p) => _TooltipPlayground(p: p),
);

class _TooltipPlayground extends StatefulWidget {
  const _TooltipPlayground({required this.p});

  final SolarPlayground p;

  @override
  State<_TooltipPlayground> createState() => _TooltipPlaygroundState();
}

class _TooltipPlaygroundState extends State<_TooltipPlayground> {
  final _trigger = FocusNode(debugLabel: 'Tooltip trigger');

  @override
  void initState() {
    super.initState();
    HardwareKeyboard.instance.addHandler(_key);
    _sync();
  }

  @override
  void didUpdateWidget(_TooltipPlayground old) {
    super.didUpdateWidget(old);
    _sync();
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_key);
    _trigger.dispose();
    super.dispose();
  }

  /// After this frame: the trigger focused while `open` holds, which shows the tooltip, and not
  /// once it clears.
  void _sync() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!mounted) return;
    final open = widget.p.flag('open');
    if (open && !_trigger.hasFocus) {
      _trigger.requestFocus();
    } else if (!open && _trigger.hasFocus) {
      _trigger.unfocus();
    }
  });

  /// Escape hides it (the widget's own), and clears `open`; the key goes on to the widget.
  bool _key(KeyEvent event) {
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.escape &&
        widget.p.flag('open')) {
      widget.p.set('open', false);
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    final words = p.text('content');
    final content = p.flag('tooltipContent');
    return SolarTooltip(
      size: p.choice('size', SolarTooltipSize.values),
      position: p.choice('position', SolarTooltipPosition.values),
      message: content ? words : '',
      child: SolarButton(
        focusNode: _trigger,
        onPressed: () => p.set('open', true),
        child: const Text('Open'),
      ),
    );
  }
}
