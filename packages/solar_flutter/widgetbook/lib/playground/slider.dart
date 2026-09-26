// Slider's Playground: disabled, filled and error from their controls; its value the `value` extra
// in percent (the widget takes 0 to 1), which dragging the handle or an arrow key sets, in whole
// percent as the web's steps, a move within one percent setting and logging nothing, as the web's
// fires nothing; a drag's start and end are logged too. Named "Volume". It fills its container, the
// width box. As the web's (stories/playground/slider.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final sliderPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final disabled = p.flag('disabled');
    final value = p.whole('value');
    int percent(double v) => (v * 100).round();
    return SolarSlider(
      value: value / 100,
      disabled: disabled,
      filled: p.flag('filled'),
      error: p.flag('error'),
      onChanged: disabled
          ? null
          : (v) {
              if (percent(v) == value) return;
              p.set('value', percent(v));
              p.log('onChanged', percent(v));
            },
      onChangeStart: (v) => p.log('onChangeStart', percent(v)),
      onChangeEnd: (v) => p.log('onChangeEnd', percent(v)),
      semanticLabel: 'Volume',
    );
  },
);
