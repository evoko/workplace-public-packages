import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

/// Whether a semantics node, or one under it, has the role.
bool hasRole(SemanticsNode node, SemanticsRole role) {
  if (node.getSemanticsData().role == role) return true;
  var found = false;
  node.visitChildren((c) {
    found = hasRole(c, role);
    return !found;
  });
  return found;
}

/// A button that shows [show] over the page when tapped.
Widget opener(void Function(BuildContext) show) => Builder(
  builder: (context) =>
      TextButton(onPressed: () => show(context), child: const Text('Open')),
);

void main() {
  group('showSolarDialog', () {
    testWidgets('shows a dialog over the Scrim, its close button closing it', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        opener(
          (context) => showSolarDialog<void>(
            context: context,
            builder: (context) => SolarDialog(
              title: 'Rename room',
              onClose: () => Navigator.of(context).pop(),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      expect(find.byType(SolarDialog), findsOneWidget);
      final dialog = tester.getSemantics(find.byType(SolarDialog));
      expect(hasRole(dialog, SemanticsRole.dialog), isTrue);
      await tester.tap(find.bySemanticsLabel('Close'));
      await tester.pumpAndSettle();
      expect(find.byType(SolarDialog), findsNothing);
      handle.dispose();
    });

    testWidgets('draws its close button only where it can close', (
      tester,
    ) async {
      await pump(tester, const SolarDialog(title: 'Rename room'));
      expect(find.byType(SolarIconButton), findsNothing);
      await pump(tester, SolarDialog(title: 'Rename room', onClose: () {}));
      expect(find.byType(SolarIconButton), findsOneWidget);
    });
  });

  testWidgets(
    'SolarConfirmationDialog is an alert dialog, its buttons its own',
    (tester) async {
      final handle = tester.ensureSemantics();
      var confirmed = 0;
      var cancelled = 0;
      await pump(
        tester,
        SolarConfirmationDialog(
          title: 'Are you sure?',
          onConfirm: () => confirmed++,
          onCancel: () => cancelled++,
        ),
      );
      final root = tester.getSemantics(find.byType(SolarConfirmationDialog));
      expect(hasRole(root, SemanticsRole.alertDialog), isTrue);
      await tester.tap(find.text('Continue'));
      await tester.tap(find.text('Cancel'));
      expect((confirmed, cancelled), (1, 1));
      handle.dispose();
    },
  );

  testWidgets('showSolarDrawer slides a drawer in, the Scrim closing it', (
    tester,
  ) async {
    await pump(
      tester,
      opener(
        (context) => showSolarDrawer<void>(
          context: context,
          builder: (_) => const SolarDrawer(title: 'Filters'),
        ),
      ),
    );
    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();
    expect(find.byType(SolarDrawer), findsOneWidget);
    // At the page's right edge.
    expect(
      tester.getRect(find.byType(SolarDrawer)).right,
      tester.getSize(find.byType(MaterialApp)).width,
    );
    await tester.tapAt(const Offset(10, 10));
    await tester.pumpAndSettle();
    expect(find.byType(SolarDrawer), findsNothing);
  });

  group('SolarTooltip', () {
    testWidgets('shows on a long press, and hides once it ends', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarTooltip(message: 'Copy link', child: Text('Copy')),
      );
      expect(find.text('Copy link'), findsNothing);
      final gesture = await tester.startGesture(
        tester.getCenter(find.text('Copy')),
      );
      await tester.pump(kLongPressTimeout + const Duration(milliseconds: 50));
      expect(find.text('Copy link'), findsOneWidget);
      await gesture.up();
      await tester.pump();
      expect(find.text('Copy link'), findsNothing);
    });

    testWidgets('names its trigger’s tooltip for a screen reader', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarTooltip(message: 'Copy link', child: Text('Copy')),
      );
      expect(
        tester.getSemantics(find.text('Copy')),
        isSemantics(tooltip: 'Copy link'),
      );
      handle.dispose();
    });
  });

  group('SolarPopover', () {
    Widget popover({required bool open, VoidCallback? onClose}) => SolarPopover(
      title: 'Share',
      body: 'Anyone with the link can view.',
      open: open,
      onClose: onClose,
      child: const Text('Trigger'),
    );

    testWidgets('shows over its trigger while open', (tester) async {
      await pump(tester, popover(open: false));
      await tester.pump();
      expect(find.text('Share'), findsNothing);
      await pump(tester, popover(open: true));
      await tester.pump();
      expect(find.text('Share'), findsOneWidget);
      // Its tip hangs from its bottom corner at the trigger's top left (placement top).
      final trigger = tester.getRect(find.text('Trigger'));
      final surface = tester.getRect(
        find.byKey(const Key('popover.root')).first,
      );
      expect(surface.bottomLeft, trigger.topLeft);
    });

    testWidgets(
      'asks to close on Escape and on a tap outside, not on its trigger',
      (tester) async {
        var closed = 0;
        await pump(tester, popover(open: true, onClose: () => closed++));
        await tester.pump();
        await tester.tap(find.text('Trigger'));
        expect(closed, 0);
        await tester.tapAt(const Offset(5, 5));
        expect(closed, 1);
        await tester.tap(find.text('Trigger'));
        await tester.sendKeyEvent(LogicalKeyboardKey.escape);
        expect(closed, 2);
      },
    );
  });

  group('SolarCoachmark', () {
    testWidgets(
      'is a dialog that is not modal, named by its title, announced',
      (tester) async {
        final handle = tester.ensureSemantics();
        await pump(tester, const SolarCoachmark(title: 'Rooms'));
        final card = tester.getSemantics(find.byType(SolarCoachmark));
        expect(hasRole(card, SemanticsRole.dialog), isTrue);
        expect(
          tester.getSemantics(find.byType(SolarCoachmark)),
          isSemantics(isLiveRegion: true, label: 'Rooms'),
        );
        handle.dispose();
      },
    );

    testWidgets('takes the focus when it shows, and ends the tour on Escape', (
      tester,
    ) async {
      var ended = 0;
      await pump(
        tester,
        SolarCoachmark(
          title: 'Rooms',
          open: true,
          onClose: () => ended++,
          child: const Text('Target'),
        ),
      );
      await tester.pump();
      await tester.pump();
      expect(find.text('Rooms'), findsOneWidget);
      expect(FocusManager.instance.primaryFocus?.debugLabel, 'SolarCoachmark');
      // Wherever the focus has gone since.
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      expect(ended, 1);
      await tester.tap(find.bySemanticsLabel('Close'));
      expect(ended, 2);
    });
  });
}
