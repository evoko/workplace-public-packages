import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 600, child: child)),
    ),
  ),
);

const _months = ['Jan', 'Feb', 'Mar'];

void main() {
  group('SolarSparkline', () {
    test(
      'scales a series into its box, first to last, the highest at its top',
      () {
        expect(sparklinePoints([0, 10, 5], const Size(80, 24)), const [
          Offset(0, 24),
          Offset(40, 0),
          Offset(80, 12),
        ]);
        expect(
          sparklinePoints([3, 3], const Size(80, 24)).first,
          const Offset(0, 12),
        );
      },
    );

    test('takes its trend from its data', () {
      expect(sparklineTrendOf([1, 2, 3]), SolarSparklineTrend.up);
      expect(sparklineTrendOf([3, 1]), SolarSparklineTrend.down);
      expect(sparklineTrendOf([2, 5, 2]), SolarSparklineTrend.flat);
    });

    testWidgets('draws the data’s line, named as an image', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarSparkline(data: [1, 4, 9], semanticLabel: 'Revenue'),
      );
      expect(
        tester.getSemantics(find.byType(SolarSparkline)),
        isSemantics(label: 'Revenue', isImage: true),
      );
      expect(
        find.descendant(
          of: find.byType(SolarSparkline),
          matching: find.byType(CustomPaint),
        ),
        findsWidgets,
      );
      handle.dispose();
    });
  });

  testWidgets('SolarChartTheme reads the app’s SolarTheme, as the recipes do', (
    tester,
  ) async {
    late SolarChartTheme theme;
    await pump(
      tester,
      Builder(
        builder: (context) {
          theme = const SolarChartTheme(SolarTheme.light);
          return const SizedBox();
        },
      ),
    );
    final c = SolarTheme.light.colors;
    expect(theme.series.first, c.dataCategory06Strong);
    expect(theme.series[1], c.dataCategory02Strong);
    expect(theme.segments.first, c.dataCategory01Strong);
    expect(theme.lineWidth, SolarBorder.strong);
    expect(theme.gridLine, c.borderSubtle);
    expect(theme.donutInner, closeTo(0.6, 1e-4));
  });

  group('SolarBarChart and SolarLineChart', () {
    testWidgets(
      'draw their series in the theme’s colours, a legend for several',
      (tester) async {
        await pump(
          tester,
          const SolarBarChart(
            categories: _months,
            series: [
              SolarChartSeries(label: 'Rooms', data: [1, 2, 3]),
              SolarChartSeries(label: 'Devices', data: [3, 2, 1]),
            ],
          ),
        );
        final bars = tester.widget<BarChart>(find.byType(BarChart)).data;
        const c = SolarChartTheme(SolarTheme.light);
        expect(bars.barGroups.first.barRods.first.color, c.series[0]);
        expect(bars.barGroups.first.barRods[1].color, c.series[1]);
        expect(find.byType(SolarDataLegend), findsOneWidget);
        await pump(
          tester,
          const SolarLineChart(
            categories: _months,
            series: [
              SolarChartSeries(label: 'Rooms', data: [1, 2, 3]),
            ],
          ),
        );
        final line = tester.widget<LineChart>(find.byType(LineChart)).data;
        expect(line.lineBarsData.single.barWidth, c.lineWidth);
        expect(line.lineBarsData.single.dotData.show, isFalse);
        // One series is not named in a legend.
        expect(find.byType(SolarDataLegend), findsNothing);
      },
    );

    testWidgets('show SOLAR’s tooltip over the bar a pointer is on', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarBarChart(
          categories: _months,
          series: [
            SolarChartSeries(label: 'Rooms', data: [30, 30, 30]),
          ],
        ),
      );
      // Once fl_chart has grown its bars in.
      await tester.pumpAndSettle();
      expect(find.byType(SolarChartTooltip), findsNothing);
      final chart = tester.getRect(find.byType(BarChart));
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await mouse.addPointer(location: chart.topLeft);
      // The middle bar: the value axis's labels take the plot's first 40.
      await mouse.moveTo(
        Offset(chart.left + 40 + (chart.width - 40) / 2, chart.center.dy),
      );
      await tester.pump();
      expect(find.byType(SolarChartTooltip), findsOneWidget);
      expect(find.text('30'), findsWidgets);
      await mouse.removePointer();
    });
  });

  testWidgets('SolarDonutChart shows its total in its centre, in the theme', (
    tester,
  ) async {
    await pump(
      tester,
      const SolarDonutChart(
        total: '100',
        totalLabel: 'Total',
        segments: [
          SolarDonutSegment(label: 'Good', value: 60),
          SolarDonutSegment(label: 'Bad', value: 40),
        ],
      ),
    );
    final pie = tester.widget<PieChart>(find.byType(PieChart)).data;
    const c = SolarChartTheme(SolarTheme.light);
    expect(pie.sections.first.color, c.segments[0]);
    expect(pie.centerSpaceRadius, closeTo(100 * c.donutInner, 1e-6));
    expect(find.text('100'), findsOneWidget);
    expect(find.text('Total'), findsOneWidget);
  });

  testWidgets('SolarBarStack splits its length by the segments’ shares', (
    tester,
  ) async {
    await pump(
      tester,
      const SizedBox(
        width: 32,
        height: 80,
        child: SolarBarStack(
          segments: [
            SolarBarStackSegment(
              value: 3,
              color: SolarBarColor.feedbackDangerStrong,
            ),
            SolarBarStackSegment(
              value: 1,
              color: SolarBarColor.feedbackNeutralSubtle,
            ),
          ],
        ),
      ),
    );
    final bars = tester.widgetList<SolarBar>(find.byType(SolarBar)).toList();
    expect(bars, hasLength(2));
    final first = tester.getSize(find.byType(SolarBar).first).height;
    final second = tester.getSize(find.byType(SolarBar).last).height;
    expect(first / second, closeTo(3, 0.1));
  });
}
