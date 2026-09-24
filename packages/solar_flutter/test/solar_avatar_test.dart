import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

const light = SolarColors.light;

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

BoxDecoration face(WidgetTester tester) =>
    tester
            .widget<Container>(
              find
                  .descendant(
                    of: find.byKey(const Key('avatar.root')),
                    matching: find.byType(Container),
                  )
                  .first,
            )
            .decoration!
        as BoxDecoration;

void main() {
  group('SolarAvatar', () {
    testWidgets(
      'is SOLAR’s neutral avatar without a colour, named by the name',
      (tester) async {
        final handle = tester.ensureSemantics();
        await pump(tester, const SolarAvatar(name: 'Dana Scully'));
        expect(find.text('DS'), findsOneWidget);
        expect(face(tester).color, light.surfaceFeedbackNeutralSubtle);
        expect(
          tester.getSemantics(find.bySemanticsLabel('Dana Scully')),
          matchesSemantics(label: 'Dana Scully', isImage: true),
        );
        handle.dispose();
      },
    );

    testWidgets('takes any colour, its initials in that hue at AA', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarAvatar(name: 'Dana Scully', color: Color(0xff410001)),
      );
      expect(face(tester).color, const Color(0xff410001));
      expect(
        tester.widget<Text>(find.text('DS')).style!.color,
        const Color.fromARGB(255, 255, 224, 219),
      );
    });

    testWidgets('a logo is a rounded square, its picture whole', (
      tester,
    ) async {
      await pump(
        tester,
        SolarAvatar(
          name: 'Biamp',
          type: SolarAvatarType.logo,
          size: SolarAvatarSize.md,
          image: MemoryImage(kTransparentImage),
        ),
      );
      expect(find.text('BI'), findsNothing);
      expect(face(tester).image!.fit, BoxFit.contain);
    });
  });
}

/// One transparent pixel.
final kTransparentImage = Uint8List.fromList(const [
  0x89,
  0x50,
  0x4E,
  0x47,
  0x0D,
  0x0A,
  0x1A,
  0x0A,
  0x00,
  0x00,
  0x00,
  0x0D,
  0x49,
  0x48,
  0x44,
  0x52,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x08,
  0x06,
  0x00,
  0x00,
  0x00,
  0x1F,
  0x15,
  0xC4,
  0x89,
  0x00,
  0x00,
  0x00,
  0x0A,
  0x49,
  0x44,
  0x41,
  0x54,
  0x78,
  0x9C,
  0x63,
  0x00,
  0x01,
  0x00,
  0x00,
  0x05,
  0x00,
  0x01,
  0x0D,
  0x0A,
  0x2D,
  0xB4,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4E,
  0x44,
  0xAE,
  0x42,
  0x60,
  0x82,
]);
