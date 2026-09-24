import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

/// Marks what is inside a menu (a SolarDropdownMenu's rows): a row is announced as a menu item,
/// which Flutter allows only inside a menu, and takes the menu's size, as Figma draws its rows.
/// Outside one, a row is a button of its own size.
///
/// Hand written: the menus provide it, and the rows read it.
class SolarMenuScope extends InheritedWidget {
  /// Marks [child] as inside a menu of [size] (Figma's value, `sm` or `md`), or of none.
  const SolarMenuScope({super.key, this.size, required super.child});

  /// The menu's size, as Figma names it; null where the menu has none.
  final String? size;

  static SolarMenuScope? _of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<SolarMenuScope>();

  /// Whether [context] is inside a menu.
  static bool of(BuildContext context) => _of(context) != null;

  /// The menu's size around [context], as a row's own size enum, from its [values]; null outside a
  /// menu, or in one of no size.
  static T? sizeOf<T extends Enum>(BuildContext context, List<T> values) {
    final size = _of(context)?.size;
    if (size == null) return null;
    for (final v in values) {
      if (v.name == size) return v;
    }
    return null;
  }

  @override
  bool updateShouldNotify(SolarMenuScope oldWidget) => size != oldWidget.size;
}

/// ⚠️ Governance gap: the tallest a menu grows before its rows scroll, as Dropdown Menu's
/// description asks ("caps height at ~300px with internal scroll"), a raw value until SOLAR
/// publishes a variable for it (owner decision 2026-09-24: cap at 300, flagged). The web's twin is
/// `MENU_MAX_HEIGHT` in the codegen's `shells/menu.mjs`.
const double solarMenuMaxHeight = 300;

/// A menu's rows, as its content layer holds them: a column the arrow keys move the focus along
/// (Home and End to the first and last), scrolling past [maxHeight], as wide as its widest row, and
/// marked as inside a menu of [size] ([SolarMenuScope]), announced as a menu.
class SolarMenuList extends StatelessWidget {
  /// The rows, in order.
  const SolarMenuList({
    super.key,
    required this.children,
    this.size,
    this.maxHeight = solarMenuMaxHeight,
  });

  /// The rows and headings.
  final List<Widget> children;

  /// The menu's size, as Figma names it, which its rows take.
  final String? size;

  /// The tallest it grows before it scrolls.
  final double maxHeight;

  @override
  Widget build(BuildContext context) => SolarMenuScope(
    size: size,
    child: Semantics(
      role: SemanticsRole.menu,
      explicitChildNodes: true,
      child: Shortcuts(
        shortcuts: const {
          SingleActivator(LogicalKeyboardKey.arrowDown): NextFocusIntent(),
          SingleActivator(LogicalKeyboardKey.arrowUp): PreviousFocusIntent(),
        },
        child: FocusTraversalGroup(
          policy: OrderedTraversalPolicy(),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: maxHeight),
            // Its own scroll, not the page's: a floating menu sits in MenuAnchor's, which has one.
            child: SingleChildScrollView(
              primary: false,
              child: IntrinsicWidth(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: children,
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

/// A menu's surface, floating: opened by [builder]'s trigger through the [MenuController] it is
/// given (`controller.open()`, or `controller.open(position: …)` for a context menu at a point),
/// in Flutter's MenuAnchor, which brings the overlay, Escape and a tap outside to close it, and the
/// focus back. The anchor's own panel gives way to [menu], which draws the fill, edge and shadow.
class SolarMenuAnchor extends StatelessWidget {
  /// Floats [menu] from what [builder] builds.
  const SolarMenuAnchor({
    super.key,
    required this.menu,
    required this.builder,
    this.controller,
    this.onOpen,
    this.onClose,
  });

  /// The surface: a SolarDropdownMenu or a SolarContextMenu.
  final Widget menu;

  /// The trigger, given the controller that opens and closes the menu.
  final Widget Function(BuildContext context, MenuController controller)
  builder;

  /// The controller, where the caller keeps one.
  final MenuController? controller;

  /// Called when the menu opens, and when it closes.
  final VoidCallback? onOpen, onClose;

  @override
  Widget build(BuildContext context) => MenuAnchor(
    controller: controller,
    onOpen: onOpen,
    onClose: onClose,
    // The panel gives way to the surface, which draws the menu itself.
    style: const MenuStyle(
      backgroundColor: WidgetStatePropertyAll(Colors.transparent),
      shadowColor: WidgetStatePropertyAll(Colors.transparent),
      surfaceTintColor: WidgetStatePropertyAll(Colors.transparent),
      elevation: WidgetStatePropertyAll(0),
      padding: WidgetStatePropertyAll(EdgeInsets.zero),
    ),
    menuChildren: [_FocusFirst(child: menu)],
    builder: (context, controller, _) => builder(context, controller),
  );
}

/// Moves the focus to the first row of a menu as it opens, as the web's menu does, so the arrow
/// keys move from it and Escape, which the anchor hears from inside its menu, closes it.
class _FocusFirst extends StatefulWidget {
  const _FocusFirst({required this.child});

  final Widget child;

  @override
  State<_FocusFirst> createState() => _FocusFirstState();
}

class _FocusFirstState extends State<_FocusFirst> {
  final _scope = FocusScopeNode(debugLabel: 'SolarMenuAnchor');

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _scope.requestFocus();
      _scope.nextFocus();
    });
  }

  @override
  void dispose() {
    _scope.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      FocusScope(node: _scope, child: widget.child);
}
