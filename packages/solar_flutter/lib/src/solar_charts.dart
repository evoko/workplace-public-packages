/// SOLAR's charts: drawn by fl_chart (decision), in SOLAR's chart theme, [SolarChartTheme],
/// generated from the chart IRs (Bar Chart, Line Chart, Donut Chart, Chart Axis, Chart Gridlines,
/// Bar), so nothing of their look is here. Series take the theme's series colours in order,
/// segments its segment colours; the axis, ticks, labels and gridlines are the theme's; the tooltip
/// is SOLAR's [SolarChartTooltip], shown over the touched point; several series are named in
/// SOLAR's [SolarDataLegend] under the chart.
///
/// Hand written, as SolarLayers is. Figma's charts are samples: the per-variant check does not
/// apply to a library's plot, which the theme's own test and the Widgetbook stories stand for.
library;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import 'components/solar_chart_tooltip.dart';
import 'components/solar_data_legend.dart';
import 'components/solar_theme_of.dart';
import 'generated/charts.dart';

/// One series: its name and its values, one per category.
class SolarChartSeries {
  const SolarChartSeries({required this.label, required this.data});

  final String label;
  final List<double?> data;
}

/// The theme for this context.
SolarChartTheme _theme(BuildContext context) =>
    SolarChartTheme(solarThemeOf(context));

/// The theme's colour for the series at [i], the palette repeating past its end.
Color _series(SolarChartTheme c, int i) => c.series[i % c.series.length];

/// The theme's axis: its line under and beside the plot, its ticks' labels.
FlBorderData _border(SolarChartTheme c) => FlBorderData(
  show: true,
  border: Border(
    left: BorderSide(color: c.axisLine, width: c.axisLineWidth),
    bottom: BorderSide(color: c.axisLine, width: c.axisLineWidth),
  ),
);

FlLine _gridLine(SolarChartTheme c) =>
    FlLine(color: c.gridLine, strokeWidth: c.gridLineWidth);

FlTitlesData _titles(
  SolarChartTheme c,
  List<String> categories, {
  bool categoriesLeft = false,
}) {
  Widget category(double v, TitleMeta meta) {
    final i = v.round();
    if (i < 0 || i >= categories.length || v != i) {
      return const SizedBox.shrink();
    }
    return SideTitleWidget(
      meta: meta,
      space: c.tickSize,
      child: Text(categories[i], style: c.axisLabel),
    );
  }

  Widget value(double v, TitleMeta meta) => SideTitleWidget(
    meta: meta,
    space: c.tickSize,
    child: Text(meta.formattedValue, style: c.axisLabel),
  );
  const none = AxisTitles(sideTitles: SideTitles(showTitles: false));
  final categoryTitles = AxisTitles(
    sideTitles: SideTitles(showTitles: true, getTitlesWidget: category),
  );
  final valueTitles = AxisTitles(
    sideTitles: SideTitles(
      showTitles: true,
      reservedSize: 40,
      getTitlesWidget: value,
    ),
  );
  return FlTitlesData(
    topTitles: none,
    rightTitles: none,
    bottomTitles: categoriesLeft ? valueTitles : categoryTitles,
    leftTitles: categoriesLeft ? categoryTitles : valueTitles,
  );
}

/// A chart with SOLAR's tooltip over the point last touched or hovered.
class _Tooltipped extends StatelessWidget {
  const _Tooltipped({required this.chart, required this.tip, required this.at});

  final Widget chart;
  final Widget? tip;
  final Offset? at;

  @override
  Widget build(BuildContext context) => Stack(
    clipBehavior: Clip.none,
    children: [
      chart,
      if (tip != null && at != null)
        Positioned(
          left: at!.dx,
          top: at!.dy,
          child: FractionalTranslation(
            translation: const Offset(-0.5, -1.1),
            child: IgnorePointer(child: tip),
          ),
        ),
    ],
  );
}

/// A legend of the series, where there are several.
Widget? _legend(SolarChartTheme c, List<SolarChartSeries> series) =>
    series.length < 2
    ? null
    : SolarDataLegend(
        items: [
          for (final (i, s) in series.indexed)
            SolarDataLegendItem(label: s.label, color: _series(c, i)),
        ],
      );

Widget _figure(String? label, Widget chart, Widget? legend) => Semantics(
  container: true,
  label: label,
  child: Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    spacing: 16,
    children: [chart, ?legend],
  ),
);

String _format(double? v) => v == null
    ? ''
    : v == v.roundToDouble()
    ? v.toStringAsFixed(0)
    : v.toString();

/// SOLAR Bar Chart: one series (simple) or several, grouped side by side or [stacked], as columns
/// ([horizontal] false) or rows.
class SolarBarChart extends StatefulWidget {
  const SolarBarChart({
    super.key,
    required this.categories,
    required this.series,
    this.horizontal = false,
    this.stacked = false,
    this.height = 320,
    this.semanticLabel,
  });

  /// The axis's values, one per bar or group ("Jan", "Feb"…).
  final List<String> categories;

  /// One series, or several.
  final List<SolarChartSeries> series;

  /// Rows rather than columns.
  final bool horizontal;

  /// Several series stacked into one bar each, rather than side by side.
  final bool stacked;

  /// The plot's height; it fills its width.
  final double height;

  /// What the chart shows, for a screen reader.
  final String? semanticLabel;

  @override
  State<SolarBarChart> createState() => _SolarBarChartState();
}

class _SolarBarChartState extends State<SolarBarChart> {
  int? _group;
  Offset? _at;

  @override
  Widget build(BuildContext context) {
    final c = _theme(context);
    final radius = BorderRadius.circular(c.barRadius);
    BarChartGroupData group(int i) {
      if (widget.stacked) {
        var from = 0.0;
        final items = <BarChartRodStackItem>[];
        for (final (j, s) in widget.series.indexed) {
          final to = from + (s.data[i] ?? 0);
          items.add(BarChartRodStackItem(from, to, _series(c, j)));
          from = to;
        }
        return BarChartGroupData(
          x: i,
          barRods: [
            BarChartRodData(
              toY: from,
              rodStackItems: items,
              borderRadius: radius,
              color: Colors.transparent,
            ),
          ],
        );
      }
      return BarChartGroupData(
        x: i,
        barRods: [
          for (final (j, s) in widget.series.indexed)
            BarChartRodData(
              toY: s.data[i] ?? 0,
              color: _series(c, j),
              borderRadius: radius,
            ),
        ],
      );
    }

    final chart = SizedBox(
      height: widget.height,
      child: BarChart(
        BarChartData(
          rotationQuarterTurns: widget.horizontal ? 1 : 0,
          barGroups: [
            for (var i = 0; i < widget.categories.length; i++) group(i),
          ],
          gridData: FlGridData(
            drawVerticalLine: false,
            getDrawingHorizontalLine: (_) => _gridLine(c),
          ),
          borderData: _border(c),
          titlesData: _titles(c, widget.categories),
          barTouchData: BarTouchData(
            handleBuiltInTouches: false,
            // A category's whole column, not its bar alone, as the web's axis tooltip.
            allowTouchBarBackDraw: true,
            touchExtraThreshold: const EdgeInsets.symmetric(horizontal: 16),
            touchCallback: (event, response) => setState(() {
              final spot = response?.spot;
              _group = event.isInterestedForInteractions
                  ? spot?.touchedBarGroupIndex
                  : null;
              _at = _group == null ? null : response?.touchLocation;
            }),
          ),
        ),
      ),
    );
    final tip = _group == null
        ? null
        : SolarChartTooltip(
            title: widget.categories[_group!],
            rows: [
              for (final (j, s) in widget.series.indexed)
                SolarChartTooltipRow(
                  label: widget.series.length > 1 ? s.label : null,
                  value: _format(s.data[_group!]),
                  color: _series(c, j),
                ),
            ],
          );
    return _figure(
      widget.semanticLabel,
      _Tooltipped(chart: chart, tip: tip, at: _at),
      _legend(c, widget.series),
    );
  }
}

/// SOLAR Line Chart: one series or several, each a line, with no point markers (Figma draws none
/// yet).
class SolarLineChart extends StatefulWidget {
  const SolarLineChart({
    super.key,
    required this.categories,
    required this.series,
    this.height = 240,
    this.semanticLabel,
  });

  /// The axis's values, one per point ("Jan", "Feb"…).
  final List<String> categories;

  /// One series or several.
  final List<SolarChartSeries> series;

  /// The plot's height; it fills its width.
  final double height;

  /// What the chart shows, for a screen reader.
  final String? semanticLabel;

  @override
  State<SolarLineChart> createState() => _SolarLineChartState();
}

class _SolarLineChartState extends State<SolarLineChart> {
  int? _point;
  Offset? _at;

  @override
  Widget build(BuildContext context) {
    final c = _theme(context);
    final chart = SizedBox(
      height: widget.height,
      child: LineChart(
        LineChartData(
          lineBarsData: [
            for (final (j, s) in widget.series.indexed)
              LineChartBarData(
                spots: [
                  for (final (i, v) in s.data.indexed)
                    v == null ? FlSpot.nullSpot : FlSpot(i.toDouble(), v),
                ],
                color: _series(c, j),
                barWidth: c.lineWidth,
                dotData: const FlDotData(show: false),
              ),
          ],
          gridData: FlGridData(
            drawVerticalLine: false,
            getDrawingHorizontalLine: (_) => _gridLine(c),
          ),
          borderData: _border(c),
          titlesData: _titles(c, widget.categories),
          lineTouchData: LineTouchData(
            handleBuiltInTouches: false,
            touchCallback: (event, response) => setState(() {
              final spots = response?.lineBarSpots;
              _point = event.isInterestedForInteractions && spots != null
                  ? spots.first.spotIndex
                  : null;
              _at = _point == null ? null : response?.touchLocation;
            }),
          ),
        ),
      ),
    );
    final tip = _point == null
        ? null
        : SolarChartTooltip(
            title: widget.categories[_point!],
            rows: [
              for (final (j, s) in widget.series.indexed)
                SolarChartTooltipRow(
                  label: widget.series.length > 1 ? s.label : null,
                  value: _format(s.data[_point!]),
                  color: _series(c, j),
                ),
            ],
          );
    return _figure(
      widget.semanticLabel,
      _Tooltipped(chart: chart, tip: tip, at: _at),
      _legend(c, widget.series),
    );
  }
}

/// One part of the whole: its name and its value.
class SolarDonutSegment {
  const SolarDonutSegment({required this.label, required this.value});

  final String label;
  final double value;
}

/// SOLAR Donut Chart: the parts of a whole in a ring, Figma's hole in it, the caller's [total] and
/// [totalLabel] in its centre where given.
class SolarDonutChart extends StatefulWidget {
  const SolarDonutChart({
    super.key,
    required this.segments,
    this.total,
    this.totalLabel,
    this.size = 200,
    this.semanticLabel,
  });

  final List<SolarDonutSegment> segments;

  /// The total in the centre ("100"), where given.
  final String? total;

  /// The words under the total ("Total").
  final String? totalLabel;

  /// Its size.
  final double size;

  /// What the chart shows, for a screen reader.
  final String? semanticLabel;

  @override
  State<SolarDonutChart> createState() => _SolarDonutChartState();
}

class _SolarDonutChartState extends State<SolarDonutChart> {
  int? _segment;
  Offset? _at;

  @override
  Widget build(BuildContext context) {
    final c = _theme(context);
    final outer = widget.size / 2;
    final inner = outer * c.donutInner;
    final chart = SizedBox.square(
      dimension: widget.size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          PieChart(
            PieChartData(
              centerSpaceRadius: inner,
              sectionsSpace: 0,
              startDegreeOffset: -90,
              sections: [
                for (final (i, s) in widget.segments.indexed)
                  PieChartSectionData(
                    value: s.value,
                    color: c.segments[i % c.segments.length],
                    radius: outer - inner,
                    showTitle: false,
                  ),
              ],
              pieTouchData: PieTouchData(
                touchCallback: (event, response) => setState(() {
                  final touched = response?.touchedSection;
                  _segment =
                      event.isInterestedForInteractions &&
                          touched != null &&
                          touched.touchedSectionIndex >= 0
                      ? touched.touchedSectionIndex
                      : null;
                  _at = _segment == null ? null : response?.touchLocation;
                }),
              ),
            ),
          ),
          if (widget.total != null)
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(widget.total!, style: c.donutValue),
                if (widget.totalLabel != null)
                  Text(widget.totalLabel!, style: c.donutLabel),
              ],
            ),
        ],
      ),
    );
    final tip = _segment == null
        ? null
        : SolarChartTooltip(
            title: widget.segments[_segment!].label,
            rows: [
              SolarChartTooltipRow(
                value: _format(widget.segments[_segment!].value),
                color: c.segments[_segment! % c.segments.length],
              ),
            ],
          );
    return _figure(
      widget.semanticLabel,
      _Tooltipped(chart: chart, tip: tip, at: _at),
      null,
    );
  }
}
