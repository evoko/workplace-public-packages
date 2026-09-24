// Widgetbook for solar_flutter: a viewer for the generated widgets, built from the same oracles and
// the same variant builders the Flutter visual checks use (spec/verify/, test/visual/builders/),
// so a widget shows here as soon as it has a builder and the viewer cannot drift from what is
// checked. See README.md.

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:widgetbook/widgetbook.dart';

import 'package:solar_flutter_variants/solar_flutter_variants.dart';

/// Every oracle the app was built with, by component: spec/verify/, copied in as assets/verify/.
Future<Map<String, Map<String, dynamic>>> loadOracles() async {
  final manifest = await AssetManifest.loadFromAssetBundle(rootBundle);
  final oracles = <String, Map<String, dynamic>>{};
  for (final key in manifest.listAssets()) {
    if (!key.startsWith('assets/verify/') || !key.endsWith('.json')) continue;
    final o =
        jsonDecode(await rootBundle.loadString(key)) as Map<String, dynamic>;
    oracles[o['component'] as String] = o;
  }
  return oracles;
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(SolarWidgetbook(oracles: await loadOracles()));
}

/// Light and Dark are theme reassignment, as in an app: the widgets read the SolarTheme installed
/// here, and none knows which is showing.
ThemeData solarTheme(SolarTheme t, Brightness brightness) => ThemeData(
  brightness: brightness,
  scaffoldBackgroundColor: t.colors.surfaceBackground,
  extensions: [t],
);

class SolarWidgetbook extends StatelessWidget {
  const SolarWidgetbook({super.key, required this.oracles});

  final Map<String, Map<String, dynamic>> oracles;

  @override
  Widget build(BuildContext context) {
    final names = oracles.keys.toList()..sort();
    return Widgetbook.material(
      addons: [
        MaterialThemeAddon(
          themes: [
            WidgetbookTheme(
              name: 'Light',
              data: solarTheme(SolarTheme.light, Brightness.light),
            ),
            WidgetbookTheme(
              name: 'Dark',
              data: solarTheme(SolarTheme.dark, Brightness.dark),
            ),
          ],
        ),
      ],
      directories: [
        WidgetbookFolder(
          name: 'SOLAR',
          isInitiallyExpanded: true,
          children: [
            for (final name in names)
              WidgetbookComponent(
                name: name,
                useCases: [
                  WidgetbookUseCase(
                    name: 'Playground',
                    builder: (context) =>
                        playground(context, name, oracles[name]!),
                  ),
                  WidgetbookUseCase(
                    name: 'Variants',
                    builder: (context) =>
                        Variants(component: name, oracle: oracles[name]!),
                  ),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

List<Map<String, dynamic>> variantsOf(Map<String, dynamic> oracle) =>
    (oracle['variants'] as List).cast<Map<String, dynamic>>();

VariantBuilder builderOf(String component) {
  final b = builders[component];
  if (b == null) {
    throw StateError(
      '$component has an oracle and no builder in test/visual/builders/',
    );
  }
  return b;
}

/// One set of props, with a knob per prop: each prop's values are the ones Figma draws, the first
/// variant's (the default) selected. Hover, press and focus it to see its states.
Widget playground(
  BuildContext context,
  String component,
  Map<String, dynamic> oracle,
) {
  final variants = variantsOf(oracle);
  final rest = variants.first['props'] as Map<String, dynamic>;
  final props = <String, dynamic>{};
  for (final MapEntry(key: prop, value: initial) in rest.entries) {
    if (initial is bool) {
      props[prop] = context.knobs.boolean(label: prop, initialValue: initial);
    } else {
      // A colour the caller gives (Avatar's) is only in the variants that draw one.
      final options = <String>{
        for (final v in variants)
          if ((v['props'] as Map<String, dynamic>)[prop] case final String s) s,
      }.toList();
      props[prop] = context.knobs.object.dropdown<String>(
        label: prop,
        options: options,
        initialOption: initial as String,
      );
    }
  }
  return Center(
    child: _Tile(
      build: builderOf(component),
      // The resting variant's layers too, for a builder that draws what Figma nests (Button Group's
      // Buttons).
      variant: {
        'props': props,
        'state': 'default',
        'layers': variants.first['layers'],
      },
      oracle: oracle,
    ),
  );
}

/// Every variant Figma draws, labelled with Figma's name, its platform state forced through the
/// widget's states controller.
class Variants extends StatelessWidget {
  const Variants({super.key, required this.component, required this.oracle});

  final String component;
  final Map<String, dynamic> oracle;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).extension<SolarTheme>()!;
    final caption = TextStyle(
      color: t.colors.textSecondary,
      fontSize: SolarFont.fontSize11,
    );
    return SingleChildScrollView(
      padding: const EdgeInsets.all(SolarInset.md),
      child: Wrap(
        spacing: SolarInset.md,
        runSpacing: SolarInset.md,
        children: [
          for (final v in variantsOf(oracle))
            SizedBox(
              width: 220,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border.all(color: t.colors.borderSubtle),
                  borderRadius: BorderRadius.circular(SolarRadius.container),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(SolarInset.sm),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // A wide widget (a Button Group) is scaled down to the tile, keeping its
                      // proportions; a tall one grows the tile.
                      ConstrainedBox(
                        constraints: const BoxConstraints(minHeight: 56),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: _Tile(
                              key: ValueKey(v['figma']),
                              build: builderOf(component),
                              variant: v,
                              oracle: oracle,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: SolarInset.xs),
                      Text(v['figma'] as String, style: caption),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// One widget in one variant, with a states controller of its own holding the variant's platform
/// state (a pressed one hovered too).
class _Tile extends StatefulWidget {
  const _Tile({
    super.key,
    required this.build,
    required this.variant,
    required this.oracle,
  });

  final VariantBuilder build;
  final Map<String, dynamic> variant;
  final Map<String, dynamic> oracle;

  @override
  State<_Tile> createState() => _TileState();
}

class _TileState extends State<_Tile> {
  late final states = WidgetStatesController(
    statesFor(widget.variant['state'] as String?),
  );

  @override
  void dispose() {
    states.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      widget.build(widget.variant, states, widget.oracle);
}
