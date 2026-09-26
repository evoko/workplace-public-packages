// Widgetbook for solar_flutter: a viewer for the generated widgets. Each one's Variants are built
// from the same oracles and the same variant builders the Flutter visual checks use (spec/verify/,
// variants/), so the viewer cannot drift from what is checked; its Playground is its hand-written
// builder (playground/), live and two-way with the generated controls. See README.md.

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:widgetbook/widgetbook.dart';

import 'package:solar_flutter_variants/solar_flutter_variants.dart';

import 'playground/adapter.dart';
import 'playground/playground.dart';
import 'playground/registry.dart';

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

/// Each component's approval circle (🟢 🟡 🔴), written by scripts/widgetbook.mjs beside the
/// oracles; none where it wrote none.
Future<Map<String, String>> loadCircles() async {
  try {
    final text = await rootBundle.loadString('assets/verify/approvals.status');
    return (jsonDecode(text) as Map<String, dynamic>).cast<String, String>();
  } catch (_) {
    return const {};
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    SolarWidgetbook(oracles: await loadOracles(), circles: await loadCircles()),
  );
}

/// Light and Dark are theme reassignment, as in an app: the widgets read the SolarTheme installed
/// here, and none knows which is showing.
ThemeData solarTheme(SolarTheme t, Brightness brightness) => ThemeData(
  brightness: brightness,
  scaffoldBackgroundColor: t.colors.surfaceBackground,
  extensions: [t],
);

class SolarWidgetbook extends StatelessWidget {
  const SolarWidgetbook({
    super.key,
    required this.oracles,
    this.circles = const {},
  });

  final Map<String, Map<String, dynamic>> oracles;
  final Map<String, String> circles;

  @override
  Widget build(BuildContext context) {
    // A component a chart library draws has an oracle and no builder: its charts are below.
    final names = oracles.keys.where(builders.containsKey).toList()..sort();
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
                name: circles[name] == null ? name : '${circles[name]} $name',
                useCases: [
                  // The two-way Playground, from the component's builder (playground/).
                  WidgetbookUseCase(
                    name: 'Playground',
                    builder: (context) =>
                        solarPlayground(context, name, playgroundOf(name)),
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
        // Drawn by fl_chart in SOLAR's chart theme, with Figma's sample data, for the eye: the
        // per-variant check does not apply to a library's plot.
        WidgetbookFolder(
          name: 'SOLAR charts',
          children: [
            WidgetbookComponent(
              name: 'Charts',
              useCases: [
                for (final (name, chart) in chartSamples)
                  WidgetbookUseCase(
                    name: name,
                    builder: (context) => Padding(
                      padding: const EdgeInsets.all(24),
                      child: SizedBox(width: 600, child: chart),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

/// Figma's sample charts: its six months, its two series, its donut's shares.
final chartSamples = <(String, Widget)>[
  (
    'Bar Chart, simple',
    const SolarBarChart(
      categories: _months,
      series: [
        SolarChartSeries(
          label: 'Series A',
          data: [146, 190, 110, 220, 163, 134],
        ),
      ],
    ),
  ),
  (
    'Bar Chart, grouped',
    const SolarBarChart(
      categories: _months,
      series: [
        SolarChartSeries(
          label: 'Series A',
          data: [146, 190, 110, 220, 163, 134],
        ),
        SolarChartSeries(
          label: 'Series B',
          data: [96, 140, 160, 120, 190, 150],
        ),
      ],
    ),
  ),
  (
    'Bar Chart, stacked',
    const SolarBarChart(
      categories: _months,
      stacked: true,
      series: [
        SolarChartSeries(label: 'Series A', data: [60, 80, 40, 90, 70, 50]),
        SolarChartSeries(label: 'Series B', data: [40, 60, 70, 50, 80, 60]),
      ],
    ),
  ),
  (
    'Line Chart, multi',
    const SolarLineChart(
      categories: _months,
      series: [
        SolarChartSeries(label: 'Series A', data: [40, 62, 55, 78, 70, 90]),
        SolarChartSeries(label: 'Series B', data: [30, 35, 48, 42, 60, 58]),
      ],
    ),
  ),
  (
    'Donut Chart, with a total',
    const SolarDonutChart(
      total: '100',
      totalLabel: 'Total',
      segments: [
        SolarDonutSegment(label: 'Good', value: 60),
        SolarDonutSegment(label: 'Warning', value: 25),
        SolarDonutSegment(label: 'Bad', value: 15),
      ],
    ),
  ),
];

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

/// A component's Playground builder, from the generated registry (every component has one).
SolarPlaygroundBuilder playgroundOf(String component) {
  final b = playgroundBuilders[component];
  if (b == null) {
    throw StateError('$component has no Playground builder in lib/playground/');
  }
  return b;
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
                      _Excuses(
                        variant: v,
                        dark: Theme.of(context).brightness == Brightness.dark,
                      ),
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

/// What the oracle excuses in one variant, in the mode showing (Dark's own list where it differs
/// from Light's, the entries only Dark has marked): a badge with how many, and how many are still
/// open findings, and under it each excused cell with its decision's reason.
class _Excuses extends StatelessWidget {
  const _Excuses({required this.variant, required this.dark});

  final Map<String, dynamic> variant;
  final bool dark;

  List<Map<String, dynamic>> _list(Object? l) =>
      ((l as List?) ?? const []).cast<Map<String, dynamic>>();

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).extension<SolarTheme>()!;
    final light = _list(variant['excused']);
    final darkOwn = (variant['dark'] as Map<String, dynamic>?)?['excused'];
    final excused = dark && darkOwn != null ? _list(darkOwn) : light;
    if (excused.isEmpty) return const SizedBox.shrink();
    String key(Map<String, dynamic> e) =>
        '${e['layer']}.${e['property']}.${e['finding']}';
    final inLight = {for (final e in light) key(e)};
    final open = excused.where((e) => e['decision'] == null).length;
    final small = TextStyle(
      color: t.colors.textSecondary,
      fontSize: SolarFont.fontSize10,
    );
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        childrenPadding: EdgeInsets.zero,
        dense: true,
        title: Align(
          alignment: Alignment.centerLeft,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: open > 0
                  ? t.colors.surfaceFeedbackWarningSubtle
                  : t.colors.surfaceMuted,
              borderRadius: BorderRadius.circular(SolarRadius.pill),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: SolarInset.xs),
              child: Text(
                open > 0
                    ? '$open open of ${excused.length} excused'
                    : '${excused.length} excused, all decided',
                style: small.copyWith(
                  color: open > 0
                      ? t.colors.textFeedbackWarning
                      : t.colors.textSecondary,
                ),
              ),
            ),
          ),
        ),
        children: [
          for (final e in excused)
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                '${e['layer']}.${e['property']}'
                '${dark && !inLight.contains(key(e)) ? ' (Dark only)' : ''}: '
                'Figma ${jsonEncode(e['figma'])}. '
                '${e['decision'] != null ? '${e['decision']}: ${e['reason'] ?? e['finding']}' : 'Open: ${e['finding']}'}',
                style: small,
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
