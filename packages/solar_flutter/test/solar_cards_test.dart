import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// [child] in the light theme, as wide as a card in a list is.
Future<void> pump(WidgetTester tester, Widget child, {double width = 360}) =>
    tester.pumpWidget(
      MaterialApp(
        theme: ThemeData(extensions: const [SolarTheme.light]),
        home: Scaffold(
          body: Center(
            child: SizedBox(width: width, child: child),
          ),
        ),
      ),
    );

/// The node whose words include the line [words]: a mark (a StatusIndicator, a severity bar)
/// announces its word inside the node of the card it is in.
Finder announcing(String words) =>
    find.bySemanticsLabel(RegExp('(^|\n)${RegExp.escape(words)}(\n|\$)'));

/// The layer [name] of a component, by its key.
Finder layer(String name) => find.byKey(Key(name));

/// [what], inside the layer [name].
Finder inLayer(String name, Finder what) =>
    find.descendant(of: layer(name), matching: what);

/// A More menu of two actions, telling [chosen] of each choice.
List<SolarCardMoreItem> more(List<String> chosen) => [
  SolarCardMoreItem(label: 'Rename', onSelected: () => chosen.add('rename')),
  SolarCardMoreItem(label: 'Delete', onSelected: () => chosen.add('delete')),
];

/// Opens the More menu, chooses [label] and lets the menu close.
Future<void> choose(WidgetTester tester, String label) async {
  await tester.tap(find.bySemanticsLabel('More actions'));
  await tester.pumpAndSettle();
  await tester.tap(find.text(label));
  await tester.pumpAndSettle();
}

/// A slot's content, found by its key.
Widget slot(String key) =>
    SizedBox.square(key: Key(key), dimension: 16, child: Text(key));

/// One transparent pixel.
final kTransparentImage = Uint8List.fromList(const [
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, //
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
  0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
]);

void main() {
  group('SolarCard', () {
    testWidgets('without onPressed, is not a button', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarCard(title: 'Rooms'));
      expect(
        tester.getSemantics(find.bySemanticsLabel('Rooms')),
        isSemantics(label: 'Rooms', isButton: false),
      );
      handle.dispose();
    });

    testWidgets('with onPressed, is a button named by its title', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarCard(
          title: 'Rooms',
          description: 'Every room',
          onPressed: () => pressed++,
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel(RegExp('^Rooms'))),
        isSemantics(isButton: true, isEnabled: true, hasTapAction: true),
      );
      // The whole card is its hit area, its description too.
      await tester.tap(find.text('Every room'));
      await tester.tap(find.text('Rooms'));
      expect(pressed, 2);
      handle.dispose();
    });

    testWidgets('disabled, calls nothing and is not announced as enabled', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarCard(title: 'Rooms', disabled: true, onPressed: () => pressed++),
      );
      await tester.tap(find.text('Rooms'), warnIfMissed: false);
      expect(pressed, 0);
      expect(
        tester.getSemantics(find.bySemanticsLabel('Rooms')),
        isSemantics(hasTapAction: false, isEnabled: false),
      );
      handle.dispose();
    });

    testWidgets('loading, says so, draws no title and is still pressed', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarCard(
          title: 'Rooms',
          description: 'Every room',
          loading: true,
          onPressed: () => pressed++,
        ),
      );
      expect(find.text('Rooms'), findsNothing);
      expect(find.text('Every room'), findsNothing);
      final node = tester.getSemantics(
        find.bySemanticsLabel(RegExp('Loading')),
      );
      expect(node.label, contains('Rooms'));
      expect(node, isSemantics(isButton: true, hasTapAction: true));
      await tester.tap(find.byType(SolarCard));
      expect(pressed, 1);
      handle.dispose();
    });

    testWidgets('its More button opens a menu whose choice closes it', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      final chosen = <String>[];
      var pressed = 0;
      await pump(
        tester,
        SolarCard(
          title: 'Rooms',
          moreItems: more(chosen),
          onPressed: () => pressed++,
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('More actions')),
        isSemantics(isButton: true, hasTapAction: true),
      );
      expect(find.text('Rename'), findsNothing);
      await choose(tester, 'Delete');
      expect(chosen, ['delete']);
      // The menu is closed, and the tap on More was More's, not the card's.
      expect(find.text('Rename'), findsNothing);
      expect(pressed, 0);
      handle.dispose();
    });

    testWidgets('a disabled More item is not chosen', (tester) async {
      final chosen = <String>[];
      await pump(
        tester,
        SolarCard(
          title: 'Rooms',
          moreItems: [
            SolarCardMoreItem(
              label: 'Delete',
              disabled: true,
              onSelected: () => chosen.add('delete'),
            ),
          ],
        ),
      );
      await tester.tap(find.bySemanticsLabel('More actions'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Delete'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(chosen, isEmpty);
    });

    testWidgets('disabled, is announced disabled', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarCard(title: 'Rooms', disabled: true, onPressed: () {}),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Rooms')),
        isSemantics(hasEnabledState: true, isEnabled: false),
      );
      handle.dispose();
    });

    testWidgets('draws no More button without moreItems', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarCard(title: 'Rooms', moreItems: []));
      expect(find.bySemanticsLabel('More actions'), findsNothing);
      handle.dispose();
    });

    testWidgets('draws its tag only where it is given', (tester) async {
      await pump(tester, const SolarCard(title: 'Rooms'));
      expect(find.byType(SolarTag), findsNothing);
      await pump(
        tester,
        const SolarCard(
          title: 'Rooms',
          status: SolarCardStatus.success,
          tag: 'Online',
        ),
      );
      expect(inLayer('card.tag', find.text('Online')), findsOneWidget);
    });

    testWidgets('draws its description, then its children, in the content', (
      tester,
    ) async {
      await pump(
        tester,
        SolarCard(
          title: 'Rooms',
          description: 'Every room',
          icon: slot('icon'),
          helper: '12',
          children: [slot('child')],
        ),
      );
      expect(inLayer('card.content', find.text('Every room')), findsOneWidget);
      expect(inLayer('card.content', layer('child')), findsOneWidget);
      expect(
        tester.getTopLeft(find.text('Every room')).dy,
        lessThan(tester.getTopLeft(layer('child')).dy),
      );
      expect(inLayer('card.icon', layer('icon')), findsOneWidget);
      expect(inLayer('card.helper', find.text('12')), findsOneWidget);
    });
  });

  group('SolarContainer', () {
    testWidgets('draws its children in its content', (tester) async {
      for (final type in SolarContainerType.values) {
        await pump(
          tester,
          SolarContainer(type: type, children: [slot('a'), slot('b')]),
        );
        expect(inLayer('container.content', layer('a')), findsOneWidget);
        expect(inLayer('container.content', layer('b')), findsOneWidget);
      }
    });
  });

  group('SolarSplitDropdown', () {
    testWidgets('draws its top and its lower strip, the top above', (
      tester,
    ) async {
      await pump(
        tester,
        SolarSplitDropdown(top: slot('top'), lower: slot('lower')),
      );
      expect(inLayer('splitDropdown.topContent', layer('top')), findsOneWidget);
      expect(
        inLayer('splitDropdown.lowerContent', layer('lower')),
        findsOneWidget,
      );
      expect(
        tester.getTopLeft(layer('top')).dy,
        lessThan(tester.getTopLeft(layer('lower')).dy),
      );
    });
  });

  group('SolarStatusCard', () {
    testWidgets('its indicator is named by the status, capitalised', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarStatusCard(title: 'Uptime', value: '99%'));
      expect(announcing('Success'), findsOneWidget);
      expect(find.text('Uptime'), findsOneWidget);
      expect(find.text('99%'), findsOneWidget);
      await pump(
        tester,
        const SolarStatusCard(
          title: 'Uptime',
          value: '99%',
          status: SolarStatusCardStatus.danger,
        ),
      );
      expect(announcing('Danger'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('statusLabel names its indicator', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarStatusCard(
          title: 'Uptime',
          value: '99%',
          statusLabel: 'Healthy',
        ),
      );
      expect(announcing('Healthy'), findsOneWidget);
      expect(announcing('Success'), findsNothing);
      handle.dispose();
    });

    testWidgets('loading, says so and draws no title', (tester) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarStatusCard(
          title: 'Uptime',
          value: '99%',
          loading: true,
          onPressed: () => pressed++,
        ),
      );
      expect(find.text('Uptime'), findsNothing);
      final node = tester.getSemantics(
        find.bySemanticsLabel(RegExp('Loading')),
      );
      expect(node.label, contains('Uptime'));
      await tester.tap(find.byType(SolarStatusCard));
      expect(pressed, 1);
      handle.dispose();
    });

    testWidgets('its More menu calls the action chosen', (tester) async {
      final chosen = <String>[];
      await pump(
        tester,
        SolarStatusCard(title: 'Uptime', value: '99%', moreItems: more(chosen)),
      );
      await choose(tester, 'Rename');
      expect(chosen, ['rename']);
      expect(find.text('Delete'), findsNothing);
    });
  });

  group('SolarInsightCard', () {
    testWidgets('its indicator is named by the severity, or severityLabel', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarInsightCard(
          title: 'Firmware',
          severity: SolarInsightCardSeverity.info,
        ),
      );
      expect(announcing('Info'), findsOneWidget);
      await pump(
        tester,
        const SolarInsightCard(
          title: 'Firmware',
          severity: SolarInsightCardSeverity.warning,
          severityLabel: 'Outdated',
        ),
      );
      expect(announcing('Outdated'), findsOneWidget);
      expect(announcing('Warning'), findsNothing);
      handle.dispose();
    });

    testWidgets('selected, is announced selected', (tester) async {
      final handle = tester.ensureSemantics();
      Future<void> card({required bool selected}) => pump(
        tester,
        SolarInsightCard(
          title: 'Firmware',
          selected: selected,
          onPressed: () {},
        ),
      );
      await card(selected: true);
      expect(
        tester.getSemantics(announcing('Firmware')),
        isSemantics(isButton: true, isSelected: true),
      );
      await card(selected: false);
      expect(
        tester.getSemantics(announcing('Firmware')),
        isSemantics(isButton: true, isSelected: false),
      );
      handle.dispose();
    });

    testWidgets('loading, says so and draws no title or description', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarInsightCard(
          title: 'Firmware',
          description: 'Two devices',
          loading: true,
          onPressed: () {},
        ),
      );
      expect(find.text('Firmware'), findsNothing);
      expect(find.text('Two devices'), findsNothing);
      expect(find.bySemanticsLabel(RegExp('Loading')), findsOneWidget);
      handle.dispose();
    });

    testWidgets('its More menu calls the action chosen', (tester) async {
      final chosen = <String>[];
      await pump(
        tester,
        SolarInsightCard(title: 'Firmware', moreItems: more(chosen)),
      );
      await choose(tester, 'Delete');
      expect(chosen, ['delete']);
    });
  });

  group('SolarInsightCardSmall', () {
    testWidgets('its indicator is named by the severity', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarInsightCardSmall(
          title: 'Firmware',
          description: 'Two devices',
          severity: SolarInsightCardSmallSeverity.danger,
        ),
      );
      expect(announcing('Danger'), findsOneWidget);
      expect(find.text('Two devices'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('pressable, a tap calls onPressed', (tester) async {
      var pressed = 0;
      await pump(
        tester,
        SolarInsightCardSmall(title: 'Firmware', onPressed: () => pressed++),
      );
      await tester.tap(find.text('Firmware'));
      expect(pressed, 1);
    });

    testWidgets('loading, says so and draws no title', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarInsightCardSmall(title: 'Firmware', loading: true),
      );
      expect(find.text('Firmware'), findsNothing);
      expect(find.bySemanticsLabel(RegExp('Loading')), findsOneWidget);
      handle.dispose();
    });
  });

  group('SolarInsightRow', () {
    testWidgets('its severity bar is named by the severity', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarInsightRow(
          title: 'Firmware',
          severity: SolarInsightRowSeverity.warning,
        ),
      );
      expect(announcing('Warning'), findsOneWidget);
      await pump(
        tester,
        const SolarInsightRow(title: 'Firmware', severityLabel: 'Healthy'),
      );
      expect(announcing('Healthy'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('draws its meta and its action slot', (tester) async {
      await pump(
        tester,
        SolarInsightRow(
          title: 'Firmware',
          meta: '2 min ago',
          action: slot('go'),
        ),
      );
      expect(
        inLayer('insightRow.title', find.text('Firmware')),
        findsOneWidget,
      );
      expect(
        inLayer('insightRow.meta', find.text('2 min ago')),
        findsOneWidget,
      );
      expect(inLayer('insightRow.action', layer('go')), findsOneWidget);
      await pump(tester, const SolarInsightRow(title: 'Firmware'));
      expect(layer('insightRow.action'), findsNothing);
      expect(layer('insightRow.meta'), findsNothing);
    });

    testWidgets('pressable, a tap calls onPressed', (tester) async {
      var pressed = 0;
      await pump(
        tester,
        SolarInsightRow(title: 'Firmware', onPressed: () => pressed++),
      );
      await tester.tap(find.text('Firmware'));
      expect(pressed, 1);
    });
  });

  group('SolarExpandableCard', () {
    testWidgets('its header is a button announced expanded or collapsed', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      for (final expanded in [false, true]) {
        await pump(
          tester,
          SolarExpandableCard(
            title: 'Details',
            expanded: expanded,
            onExpandedChanged: (_) {},
          ),
        );
        expect(
          tester.getSemantics(find.text('Details')),
          isSemantics(
            isButton: true,
            hasExpandedState: true,
            isExpanded: expanded,
            hasTapAction: true,
          ),
        );
      }
      handle.dispose();
    });

    testWidgets('a tap on its header asks for the opposite', (tester) async {
      final asked = <bool>[];
      await pump(
        tester,
        SolarExpandableCard(title: 'Details', onExpandedChanged: asked.add),
      );
      await tester.tap(find.text('Details'));
      await pump(
        tester,
        SolarExpandableCard(
          title: 'Details',
          expanded: true,
          onExpandedChanged: asked.add,
        ),
      );
      await tester.tap(find.text('Details'));
      expect(asked, [true, false]);
    });

    testWidgets('draws its content only expanded', (tester) async {
      Widget card({required bool expanded}) => SolarExpandableCard(
        title: 'Details',
        expanded: expanded,
        description: 'More words',
        children: [slot('child')],
      );
      await pump(tester, card(expanded: false));
      expect(find.text('More words'), findsNothing);
      expect(layer('child'), findsNothing);
      await pump(tester, card(expanded: true));
      expect(
        inLayer('expandableCard.content', find.text('More words')),
        findsOneWidget,
      );
      expect(inLayer('expandableCard.content', layer('child')), findsOneWidget);
    });
  });

  group('SolarAccordion', () {
    testWidgets('its header is a button announced expanded or collapsed', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      for (final expanded in [false, true]) {
        await pump(
          tester,
          SolarAccordion(
            title: 'Details',
            expanded: expanded,
            onExpandedChanged: (_) {},
          ),
        );
        expect(
          tester.getSemantics(find.text('Details')),
          isSemantics(
            isButton: true,
            hasExpandedState: true,
            isExpanded: expanded,
            hasTapAction: true,
          ),
        );
      }
      handle.dispose();
    });

    testWidgets('a tap on its header asks for the opposite', (tester) async {
      final asked = <bool>[];
      Widget item({required bool expanded}) => SolarAccordion(
        title: 'Details',
        expanded: expanded,
        onExpandedChanged: asked.add,
      );
      await pump(tester, item(expanded: false));
      await tester.tap(find.text('Details'));
      await pump(tester, item(expanded: true));
      await tester.tap(find.text('Details'));
      expect(asked, [true, false]);
    });

    testWidgets('disabled, a tap asks for nothing', (tester) async {
      final handle = tester.ensureSemantics();
      final asked = <bool>[];
      await pump(
        tester,
        SolarAccordion(
          title: 'Details',
          disabled: true,
          onExpandedChanged: asked.add,
        ),
      );
      await tester.tap(find.text('Details'), warnIfMissed: false);
      expect(asked, isEmpty);
      expect(
        tester.getSemantics(find.text('Details')),
        isSemantics(isButton: true, isEnabled: false, hasTapAction: false),
      );
      handle.dispose();
    });

    testWidgets('draws its content only expanded, its chevron turned up', (
      tester,
    ) async {
      Widget item({required bool expanded}) => SolarAccordion(
        title: 'Details',
        expanded: expanded,
        description: 'More words',
        children: [slot('child')],
      );

      /// The turns drawn around a chevron.
      Iterable<Transform> turns(String chevron) => tester.widgetList(
        find.ancestor(of: layer(chevron), matching: find.byType(Transform)),
      );
      await pump(tester, item(expanded: false));
      expect(find.text('More words'), findsNothing);
      expect(layer('child'), findsNothing);
      expect(turns('accordion.iconChevronDown'), isEmpty);
      await pump(tester, item(expanded: true));
      expect(
        inLayer('accordion.content', find.text('More words')),
        findsOneWidget,
      );
      expect(inLayer('accordion.content', layer('child')), findsOneWidget);
      final turned = turns('accordionHeader.iconChevronDown');
      expect(turned, hasLength(1));
      // Turned by half a turn: x is flipped.
      expect(turned.single.transform.entry(0, 0), closeTo(-1, 1e-9));
    });
  });

  group('SolarEventRow', () {
    testWidgets('draws its title, product, meta, timestamp and leading', (
      tester,
    ) async {
      await pump(
        tester,
        SolarEventRow(
          title: 'Device offline',
          product: 'Tesira',
          meta: 'Room 4',
          timestamp: '10:24',
          leading: slot('lead'),
        ),
      );
      expect(inLayer('eventRow.title', find.text('Device offline')), findsOne);
      expect(inLayer('eventRow.productTag', find.text('Tesira')), findsOne);
      expect(inLayer('eventRow.metaText', find.text('Room 4')), findsOne);
      expect(inLayer('eventRow.timestamp', find.text('10:24')), findsOne);
      expect(inLayer('eventRow.leading', layer('lead')), findsOneWidget);
    });

    testWidgets('draws no slot left empty', (tester) async {
      await pump(tester, const SolarEventRow(title: 'Device offline'));
      for (final name in ['leading', 'productTag', 'metaText', 'timestamp']) {
        expect(layer('eventRow.$name'), findsNothing, reason: name);
      }
    });

    testWidgets('pressable, a tap calls onPressed; More opens its menu', (
      tester,
    ) async {
      final chosen = <String>[];
      var pressed = 0;
      await pump(
        tester,
        SolarEventRow(
          title: 'Device offline',
          moreItems: more(chosen),
          onPressed: () => pressed++,
        ),
      );
      await tester.tap(find.text('Device offline'));
      expect(pressed, 1);
      await choose(tester, 'Rename');
      expect(chosen, ['rename']);
      expect(pressed, 1);
    });
  });

  group('SolarOptionCard', () {
    testWidgets('pressable, is a button named by its label', (tester) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarOptionCard(label: 'Add room', onPressed: () => pressed++),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Add room')),
        isSemantics(isButton: true, hasTapAction: true),
      );
      await tester.tap(find.byType(SolarOptionCard));
      expect(pressed, 1);
      handle.dispose();
    });

    testWidgets('selected, is announced selected', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarOptionCard(label: 'Add room', selected: true, onPressed: () {}),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Add room')),
        isSemantics(isSelected: true),
      );
      handle.dispose();
    });

    testWidgets('without onPressed, is not a button', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarOptionCard(label: 'Add room'));
      expect(
        tester.getSemantics(find.bySemanticsLabel('Add room')),
        isSemantics(isButton: false),
      );
      handle.dispose();
    });
  });

  group('SolarFileCard', () {
    testWidgets('a file draws its title and meta in its footer', (
      tester,
    ) async {
      await pump(
        tester,
        SolarFileCard(title: 'Plan.pdf', meta: '2 MB', fileIcon: slot('pdf')),
      );
      expect(inLayer('fileCard.footer', find.text('Plan.pdf')), findsOne);
      expect(inLayer('fileCard.footer', find.text('2 MB')), findsOne);
      expect(inLayer('fileCard.thumbnail', layer('pdf')), findsOneWidget);
      expect(layer('fileCard.label'), findsNothing);
    });

    testWidgets('create draws its title in the label layer', (tester) async {
      await pump(
        tester,
        const SolarFileCard(title: 'New file', type: SolarFileCardType.create),
      );
      expect(inLayer('fileCard.label', find.text('New file')), findsOne);
      expect(find.text('New file'), findsOneWidget);
      expect(layer('fileCard.footer'), findsNothing);
    });

    testWidgets('a thumbnail takes the place of the file icon', (tester) async {
      await pump(
        tester,
        SolarFileCard(
          title: 'Plan.pdf',
          fileIcon: slot('pdf'),
          thumbnail: slot('thumb'),
        ),
      );
      expect(inLayer('fileCard.thumbnail', layer('thumb')), findsOneWidget);
      expect(layer('pdf'), findsNothing);
    });

    testWidgets('pressable, is a button; More opens its menu', (tester) async {
      final handle = tester.ensureSemantics();
      final chosen = <String>[];
      var pressed = 0;
      await pump(
        tester,
        SolarFileCard(
          title: 'Plan.pdf',
          moreItems: more(chosen),
          onPressed: () => pressed++,
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel(RegExp('^Plan.pdf'))),
        isSemantics(isButton: true, hasTapAction: true),
      );
      await tester.tap(find.text('Plan.pdf'));
      await choose(tester, 'Delete');
      expect(pressed, 1);
      expect(chosen, ['delete']);
      handle.dispose();
    });
  });

  group('SolarImageCard', () {
    Widget card(
      List<bool> asked, {
      bool selected = false,
      bool filled = true,
      VoidCallback? onPressed,
    }) => SolarImageCard(
      title: 'Lobby',
      subtitle: 'Floor 1',
      filled: filled,
      selected: selected,
      image: MemoryImage(kTransparentImage),
      onSelectedChanged: asked.add,
      onPressed: onPressed,
    );

    testWidgets('its checkbox is hidden at rest and shown selected', (
      tester,
    ) async {
      await pump(tester, card([]));
      expect(find.byType(SolarCheckbox), findsNothing);
      await pump(tester, card([], selected: true));
      expect(inLayer('imageCard.image', find.byType(SolarCheckbox)), findsOne);
    });

    testWidgets('its checkbox shows while the pointer is on it', (
      tester,
    ) async {
      await pump(tester, card([]));
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await mouse.addPointer(location: Offset.zero);
      addTearDown(mouse.removePointer);
      await mouse.moveTo(tester.getCenter(find.byType(SolarImageCard)));
      await tester.pump();
      expect(find.byType(SolarCheckbox), findsOneWidget);
      await mouse.moveTo(Offset.zero);
      await tester.pump();
      expect(find.byType(SolarCheckbox), findsNothing);
    });

    testWidgets('its checkbox shows while the keyboard is in it', (
      tester,
    ) async {
      await pump(tester, card([], onPressed: () {}));
      expect(find.byType(SolarCheckbox), findsNothing);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(find.byType(SolarCheckbox), findsOneWidget);
    });

    testWidgets('its checkbox asks for the opposite selection', (tester) async {
      final handle = tester.ensureSemantics();
      final asked = <bool>[];
      var pressed = 0;
      await pump(
        tester,
        card(asked, selected: true, onPressed: () => pressed++),
      );
      // A control of its own inside the pressable tile, named by selectLabel.
      expect(
        tester.getSemantics(find.bySemanticsLabel('Select')),
        isSemantics(hasCheckedState: true, isChecked: true),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Lobby\nFloor 1')),
        isSemantics(isButton: true, isSelected: true),
      );
      await tester.tap(find.byType(SolarCheckbox));
      expect(asked, [false]);
      expect(pressed, 0);
      handle.dispose();
    });

    testWidgets('not filled, it cannot be selected', (tester) async {
      await pump(tester, card([], filled: false, selected: true));
      expect(find.byType(SolarCheckbox), findsNothing);
    });
  });

  group('SolarActionCard', () {
    testWidgets('at rest, draws its primary and secondary actions', (
      tester,
    ) async {
      await pump(
        tester,
        SolarActionCard(
          title: 'Set up',
          description: 'Two steps',
          primaryAction: slot('go'),
          secondaryAction: slot('later'),
        ),
      );
      expect(inLayer('actionCard.primaryCTA', layer('go')), findsOneWidget);
      expect(
        inLayer('actionCard.secondaryCTA', layer('later')),
        findsOneWidget,
      );
      expect(layer('actionCard.button'), findsNothing);
      expect(find.text('Two steps'), findsOneWidget);
    });

    testWidgets('done or danger, draws its primary action alone', (
      tester,
    ) async {
      for (final status in [
        SolarActionCardStatus.done,
        SolarActionCardStatus.danger,
      ]) {
        await pump(
          tester,
          SolarActionCard(
            title: 'Set up',
            status: status,
            primaryAction: slot('go'),
            secondaryAction: slot('later'),
          ),
        );
        expect(
          inLayer('actionCard.button', layer('go')),
          findsOneWidget,
          reason: status.name,
        );
        expect(layer('go'), findsOneWidget, reason: status.name);
        expect(layer('later'), findsNothing, reason: status.name);
      }
    });

    testWidgets('pressable, a tap calls onPressed; More opens its menu', (
      tester,
    ) async {
      final chosen = <String>[];
      var pressed = 0;
      await pump(
        tester,
        SolarActionCard(
          title: 'Set up',
          moreItems: more(chosen),
          onPressed: () => pressed++,
        ),
      );
      await tester.tap(find.text('Set up'));
      await choose(tester, 'Rename');
      expect(pressed, 1);
      expect(chosen, ['rename']);
    });
  });

  group('SolarInteractiveCard', () {
    Widget card(
      SolarInteractiveCardControl control, {
      bool selected = false,
      List<bool>? asked,
      bool? dragHandle,
    }) => SolarInteractiveCard(
      title: 'Lobby',
      control: control,
      selected: selected,
      dragHandle: dragHandle,
      onSelectedChanged: asked?.add,
    );

    testWidgets('draws exactly the control it is given', (tester) async {
      for (final control in SolarInteractiveCardControl.values) {
        await pump(tester, card(control));
        expect(
          find.byType(SolarCheckbox),
          control == SolarInteractiveCardControl.checkbox
              ? findsOneWidget
              : findsNothing,
          reason: control.name,
        );
        expect(
          find.byType(SolarRadio<bool>),
          control == SolarInteractiveCardControl.radio
              ? findsOneWidget
              : findsNothing,
          reason: control.name,
        );
        expect(
          find.byType(SolarToggle),
          control == SolarInteractiveCardControl.toggle
              ? findsOneWidget
              : findsNothing,
          reason: control.name,
        );
      }
    });

    testWidgets('each control asks for the selection, named by the title', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      final asked = <bool>[];
      await pump(
        tester,
        card(SolarInteractiveCardControl.checkbox, asked: asked),
      );
      await tester.tap(find.byType(SolarCheckbox));
      await pump(
        tester,
        card(SolarInteractiveCardControl.toggle, selected: true, asked: asked),
      );
      await tester.tap(find.byType(SolarToggle));
      await pump(tester, card(SolarInteractiveCardControl.radio, asked: asked));
      expect(find.bySemanticsLabel('Lobby'), findsWidgets);
      await tester.tap(find.byType(SolarRadio<bool>));
      expect(asked, [true, false, true]);
      handle.dispose();
    });

    testWidgets('draws its drag handle only where asked', (tester) async {
      await pump(tester, card(SolarInteractiveCardControl.none));
      expect(find.byType(SolarDragHandle), findsNothing);
      await pump(
        tester,
        card(SolarInteractiveCardControl.none, dragHandle: false),
      );
      expect(find.byType(SolarDragHandle), findsNothing);
      await pump(
        tester,
        card(SolarInteractiveCardControl.none, dragHandle: true),
      );
      expect(find.byType(SolarDragHandle), findsOneWidget);
    });

    testWidgets('draws its actions', (tester) async {
      await pump(
        tester,
        SolarInteractiveCard(title: 'Lobby', actions: [slot('edit')]),
      );
      expect(inLayer('interactiveCard.actions', layer('edit')), findsOne);
    });
  });

  group('SolarDeviceCard', () {
    testWidgets('one device and a batch draw their name in their own layer', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarDeviceCard(name: 'Tesira', details: 'Rack'),
      );
      expect(inLayer('deviceCard.contentName', find.text('Tesira')), findsOne);
      expect(find.text('Tesira'), findsOneWidget);
      expect(layer('deviceCard.headline'), findsNothing);
      await pump(
        tester,
        const SolarDeviceCard(
          name: 'Tesira',
          type: SolarDeviceCardType.batch,
          count: '12 devices',
        ),
      );
      expect(inLayer('deviceCard.headline', find.text('Tesira')), findsOne);
      expect(find.text('Tesira'), findsOneWidget);
      expect(layer('deviceCard.contentName'), findsNothing);
    });

    testWidgets('its tag takes tagStatus, success where none is given', (
      tester,
    ) async {
      SolarTag tag() => tester.widget<SolarTag>(find.byType(SolarTag));
      await pump(tester, const SolarDeviceCard(name: 'Tesira', tag: 'Online'));
      expect(tag().status, SolarTagStatus.success);
      expect(find.text('Online'), findsOneWidget);
      await pump(
        tester,
        const SolarDeviceCard(
          name: 'Tesira',
          tag: 'Offline',
          tagStatus: SolarTagStatus.danger,
        ),
      );
      expect(tag().status, SolarTagStatus.danger);
      await pump(tester, const SolarDeviceCard(name: 'Tesira'));
      expect(find.byType(SolarTag), findsNothing);
    });

    testWidgets('loading, says so, draws its name and is still pressed', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var pressed = 0;
      await pump(
        tester,
        SolarDeviceCard(
          name: 'Tesira',
          loading: true,
          onPressed: () => pressed++,
        ),
      );
      // Figma draws one device's name while it loads, a placeholder for its details.
      expect(inLayer('deviceCard.contentName', find.text('Tesira')), findsOne);
      expect(layer('deviceCard.contentSkeleton'), findsOneWidget);
      expect(
        tester.getSemantics(announcing('Loading')),
        isSemantics(isButton: true, hasTapAction: true),
      );
      await tester.tap(find.byType(SolarDeviceCard));
      expect(pressed, 1);
      handle.dispose();
    });

    testWidgets('loading, is named by its name once', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarDeviceCard(name: 'Tesira', loading: true, onPressed: () {}),
      );
      expect(
        tester.getSemantics(announcing('Loading')).label,
        'Loading\nTesira',
      );
      handle.dispose();
    });

    testWidgets('draws its action', (tester) async {
      await pump(tester, SolarDeviceCard(name: 'Tesira', action: slot('open')));
      expect(inLayer('deviceCard.button', layer('open')), findsOneWidget);
    });
  });

  group('SolarLaunchCard', () {
    testWidgets('with an image, draws the favourite on it', (tester) async {
      await pump(
        tester,
        SolarLaunchCard(
          name: 'Rooms',
          image: MemoryImage(kTransparentImage),
          favourite: slot('fav'),
        ),
      );
      expect(inLayer('launchCard.image', layer('fav')), findsOneWidget);
      expect(layer('launchCard.favouriteNoImage'), findsNothing);
    });

    testWidgets('without an image, draws the favourite beside the name', (
      tester,
    ) async {
      await pump(
        tester,
        SolarLaunchCard(name: 'Rooms', favourite: slot('fav')),
      );
      expect(inLayer('launchCard.headline', layer('fav')), findsOneWidget);
      expect(layer('launchCard.image'), findsNothing);
    });

    testWidgets('draws its body, tag and actions; a tap calls onPressed', (
      tester,
    ) async {
      var pressed = 0;
      await pump(
        tester,
        SolarLaunchCard(
          name: 'Rooms',
          body: 'Every room',
          tag: 'New',
          actions: slot('open'),
          onPressed: () => pressed++,
        ),
      );
      expect(find.text('Every room'), findsOneWidget);
      expect(inLayer('launchCard.tag', find.text('New')), findsOneWidget);
      expect(inLayer('launchCard.actions', layer('open')), findsOneWidget);
      await tester.tap(find.text('Rooms'));
      expect(pressed, 1);
    });
  });

  group('SolarLaunchCardFullScreen', () {
    // A page's width: Figma draws it 979 wide.
    const wide = 979.0;

    /// [child] on a desktop's page.
    Future<void> page(WidgetTester tester, Widget child) {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      return pump(tester, child, width: wide);
    }

    testWidgets('draws up to three features', (tester) async {
      for (final features in [
        <String>[],
        ['One'],
        ['One', 'Two'],
        ['One', 'Two', 'Three'],
      ]) {
        await page(
          tester,
          SolarLaunchCardFullScreen(
            name: 'Rooms',
            intro: 'Every room',
            features: features,
          ),
        );
        for (final (i, name) in ['feature', 'feature2', 'feature3'].indexed) {
          expect(
            layer('launchCardFullScreen.$name'),
            i < features.length ? findsOneWidget : findsNothing,
          );
        }
        for (final feature in features) {
          expect(find.text(feature), findsOneWidget);
        }
      }
    });

    testWidgets('more than three features asserts', (tester) async {
      await page(
        tester,
        const SolarLaunchCardFullScreen(
          name: 'Rooms',
          features: ['One', 'Two', 'Three', 'Four'],
        ),
      );
      expect(tester.takeException(), isAssertionError);
    });

    testWidgets('draws its app icon, favourite and action', (tester) async {
      await page(
        tester,
        SolarLaunchCardFullScreen(
          name: 'Rooms',
          appIcon: slot('app'),
          favourite: slot('fav'),
          action: slot('open'),
        ),
      );
      expect(inLayer('launchCardFullScreen.headline', layer('app')), findsOne);
      expect(inLayer('launchCardFullScreen.headline', layer('fav')), findsOne);
      expect(inLayer('launchCardFullScreen.action', layer('open')), findsOne);
      await page(tester, const SolarLaunchCardFullScreen(name: 'Rooms'));
      expect(layer('launchCardFullScreen.action'), findsNothing);
    });
  });
}
