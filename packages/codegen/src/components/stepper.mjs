/**
 * SOLAR Stepper, beyond its IR: where MUI draws each layer, and the two shell templates, rendered
 * into the shells by \`solar:codegen\` on every run. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn progress indicator of two to five steps, in four types, each part drawn in the layer
 * Figma draws for its status (a completed step's segment in the layer of Figma's completed one), so
 * any active step draws right. It takes the steps' labels and the active one's index (owner
 * decision 2026-09-24); completed steps are buttons where it has `onStepClick` (owner decision
 * 2026-09-24).
 */

import { drawnResets, keyPrefixOf, treeOf, wrapDoc } from '../shells/drawn.mjs';
import { classesOf } from '../util/classes.mjs';

const P = 'SolarStepper';

const requireLayers = (spec) => {
  const want = [
    'progress',
    'progressRectangle2',
    'steps',
    'stepsStep',
    'stepsStep2',
    'stepsStep3',
    'stepperIndicator',
    'stepperIndicator2',
    'stepperIndicator3',
    'frame',
    'frame2',
    'rectangle1',
    'rectangle2',
    'rectangle3',
    'rectangle4',
    'rectangle5',
    'stepCompleteHorizontal',
    'step',
    'step3',
    'step4',
    'step5',
  ];
  for (const layer of want)
    if (!spec.layers[layer])
      throw new Error(`Stepper: the IR has no ${layer} layer`);
  if (spec.api.type?.values?.join() !== 'line,with label,no label,line+text')
    throw new Error(
      'Stepper: its types are not line, with label, no label and line+text',
    );
};

export default {
  name: 'Stepper',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A list, none of a list's own look; a step's name is read, not drawn, where its type draws
    // no words.
    resets: drawnResets('Stepper', {
      display: 'flex',
      margin: '0',
      padding: '0',
      listStyle: 'none',
      [`& .${P}--steps`]: { margin: '0', padding: '0', listStyle: 'none' },
      [`& li`]: { display: 'flex' },
      [`& .${P}-name`]: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
      },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The steps are the caller's labels, which the shell draws; Figma's showStep booleans say how
  // many.
  api: {
    react: { step3: null, step4: null, step5: null },
    flutter: { step3: null, step4: null, step5: null },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Stepper.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarStepperStyle\` and \`solarStepperCompose\` in \`@bwp-web/styles/mui\`: each
 * type's bar, segments, lines and gaps.
 *
 * A linear flow's progress (a wizard, onboarding, a device's setup), in two to five \`steps\`: those
 * before \`activeStep\` (from 0) complete, it active, announced (\`aria-current="step"\`), those after
 * upcoming, and \`errorStep\` in error. Four types: round Steps over a progress bar (\`with label\`),
 * StepperIndicators joined by lines (\`no label\`), a bar of segments (\`line\`), and horizontal
 * Steps (\`line+text\`); where a type draws no words, each step's label is read, not drawn. Given
 * \`onStepClick\`, a completed Step is a button that goes back to it. The back and next buttons are
 * the Multi-step Wizard's, not the Stepper's. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, Fragment, type ReactNode } from 'react';
import {
  solarStepperCompose,
  solarStepperStyle,
  type SolarStepperProps,
} from '@bwp-web/styles/mui';
import { Step } from './Step.js';
import { StepperIndicator } from './StepperIndicator.js';

// Each layer's class, public or internal (the codegen's util/classes.mjs): a step's layers are its
// position's, chosen as the steps are drawn.
const CLASS: Record<string, string> = ${JSON.stringify(classesOf(spec))};

type Status = 'complete' | 'active' | 'upcoming' | 'error';

/** A step's status as its Stepper Indicator names it (Figma calls a complete step's circle completed). */
const INDICATOR = {
  complete: 'completed',
  active: 'active',
  upcoming: 'upcoming',
  error: 'error',
} as const;

export interface StepperProps
  extends SolarStepperProps,
    Omit<BoxProps, keyof SolarStepperProps | 'children' | 'ref'> {
  /** The steps' labels, two to five. */
  steps: ReactNode[];
  /** The active step, from 0; those before it are complete. */
  activeStep: number;
  /** A step in error, from 0. */
  errorStep?: number;
  /** Called with a completed step's index where one is chosen: completed Steps are buttons. */
  onStepClick?: (index: number) => void;
}

export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(
  { type = 'with label', steps, activeStep, errorStep, onStepClick, 'aria-label': label = 'Progress', sx, ...rest },
  ref,
) {
  const parts = solarStepperCompose({ type });
  const status = (i: number): Status =>
    i === errorStep ? 'error' : i < activeStep ? 'complete' : i === activeStep ? 'active' : 'upcoming';
  const n = steps.length;
  const cls = (layer: string, box = false) => \`\${CLASS[layer]}\${box ? ' ${P}-box' : ''}\`;
  const current = (i: number) => (i === activeStep ? ('step' as const) : undefined);
  const name = (i: number) => <span className="${P}-name">{steps[i]}</span>;
  const step = (i: number, round: boolean) => (
    <Step
      status={status(i)}
      type={round ? 'round' : 'horizontal'}
      label={steps[i]}
      number={i + 1}
      onClick={onStepClick && status(i) === 'complete' ? () => onStepClick(i) : undefined}
    />
  );
  const root = (children: ReactNode, list = true) => (
    <Box
      component={list ? 'ol' : 'div'}
      ref={ref}
      aria-label={label}
      {...rest}
      sx={[solarStepperStyle({ type }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  );
  // Each part in the layer Figma draws for its status, or at its place.
  const byStatus = (i: number, complete: string, active: string, upcoming: string) =>
    ({ complete, active, error: active, upcoming })[status(i)];

  if (type === 'with label') {
    const fill = n > 1 ? Math.min(Math.max(activeStep, 0), n - 1) / (n - 1) : 0;
    const top = parts.progress?.y;
    return root(
      <>
        <div
          aria-hidden
          className={cls('progress', true)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: typeof top === 'number' ? \`calc(\${top}px - var(--solar-placed-top, 0px))\` : undefined,
          }}
        >
          <div className={cls('progressRectangle2', true)} style={{ width: \`\${fill * 100}%\` }} />
        </div>
        <ol className={cls('steps', true)}>
          {steps.map((_, i) => (
            <li key={i} className={cls(byStatus(i, 'stepsStep', 'stepsStep2', 'stepsStep3'))} aria-current={current(i)}>
              {step(i, true)}
            </li>
          ))}
        </ol>
      </>,
      false,
    );
  }
  if (type === 'no label')
    return root(
      steps.map((_, i) => (
        <Fragment key={i}>
          {i > 0 ? <li aria-hidden className={cls(i - 1 < activeStep ? 'frame' : 'frame2', true)} /> : null}
          <li className={cls(byStatus(i, 'stepperIndicator', 'stepperIndicator2', 'stepperIndicator3'))} aria-current={current(i)}>
            <StepperIndicator
              number={i + 1}
              status={INDICATOR[status(i)]}
            />
            {name(i)}
          </li>
        </Fragment>
      )),
    );
  if (type === 'line')
    return root(
      steps.map((_, i) => (
        <li
          key={i}
          className={cls(i <= activeStep ? 'rectangle1' : \`rectangle\${i + 1}\`, true)}
          aria-current={current(i)}
        >
          {name(i)}
        </li>
      )),
    );
  return root(
    steps.map((_, i) => (
      <li
        key={i}
        className={cls(status(i) === 'complete' ? 'stepCompleteHorizontal' : (['step', 'step', 'step3', 'step4', 'step5'][i] ?? 'step5'))}
        aria-current={current(i)}
      >
        {step(i, false)}
      </li>
    )),
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarStepperRecipe]: each type's bar, segments, lines and gaps, read cell by cell.`;
      const about = `A linear flow's progress (a wizard, onboarding, a device's setup), in two to five [steps]: those before [activeStep] (from 0) complete, it active, those after upcoming, and [errorStep] in error. Four types: round Steps over a progress bar (with label), SolarStepperIndicators joined by lines (no label), a bar of segments (line), and horizontal Steps (line+text); where a type draws no words, each step's label is read, not drawn. Given [onStepClick], a completed Step is pressable, going back to it. The back and next buttons are the Multi-step Wizard's, not the Stepper's.`;
      return `/// SOLAR Stepper.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/step.dart';
import '../generated/components/stepper.dart';
import '../generated/components/stepper_indicator.dart';
import '../solar_layers.dart';
import 'solar_step.dart';
import 'solar_stepper_indicator.dart';
import 'solar_theme_of.dart';

class SolarStepper extends StatelessWidget {
  const SolarStepper({
    super.key,
    this.type = SolarStepperType.withLabel,
    required this.steps,
    required this.activeStep,
    this.errorStep,
    this.onStepClick,
  });

  final SolarStepperType type;

  /// The steps' labels, two to five.
  final List<String> steps;

  /// The active step, from 0; those before it are complete.
  final int activeStep;

  /// A step in error, from 0.
  final int? errorStep;

  /// Called with a completed step's index where one is chosen: completed Steps are pressable.
  final ValueChanged<int>? onStepClick;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  SolarStepStatus _status(int i) => i == errorStep
      ? SolarStepStatus.error
      : i < activeStep
      ? SolarStepStatus.complete
      : i == activeStep
      ? SolarStepStatus.active
      : SolarStepStatus.upcoming;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarStepperProps(type: type);
    const states = <WidgetState>{};
    final recipe = SolarLayerRecipe(
      lookup: (c) => SolarStepperRecipe.lookup(c, p, states),
      dimension: (c) => SolarStepperRecipe.dimension(c, p, states),
      color: (c) => SolarStepperRecipe.color(t, c, p, states),
      shadow: (c) => SolarStepperRecipe.shadow(t, c, p, states),
      textStyle: (c) => SolarStepperRecipe.textStyle(t, c, p, states),
      present: (_) => true,
      glyph: (_) => null,
    );
    SolarLayers layers({
      Map<String, Widget> composed = const {},
      Map<String, List<Widget>> content = const {},
    }) => SolarLayers(
      recipe: recipe,
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      composed: composed,
      content: content,
    );
    // Each part in the layer Figma draws for its status, or at its place.
    String byStatus(int i, String complete, String active, String upcoming) =>
        switch (_status(i)) {
          SolarStepStatus.complete => complete,
          SolarStepStatus.upcoming => upcoming,
          _ => active,
        };
    Widget step(int i, bool round) => SolarStep(
      status: _status(i),
      type: round ? SolarStepType.round : SolarStepType.horizontal,
      label: steps[i],
      number: i + 1,
      onPressed: onStepClick != null && _status(i) == SolarStepStatus.complete
          ? () => onStepClick!(i)
          : null,
    );
    // Where a type draws no words, a step's label is read.
    Widget named(int i, Widget drawn) => Semantics(
      label: steps[i],
      selected: i == activeStep,
      child: ExcludeSemantics(child: drawn),
    );
    Widget part(String layer, [Widget? child]) =>
        (child == null ? layers() : layers(composed: {layer: child})).layer(layer);
    final List<Widget> row;
    switch (type) {
      case SolarStepperType.withLabel:
        final n = steps.length;
        final fill = n > 1 ? activeStep.clamp(0, n - 1) / (n - 1) : 0.0;
        final bar = layers(
          content: {
            'progress': [
              FractionallySizedBox(
                alignment: AlignmentDirectional.centerStart,
                widthFactor: fill,
                child: part('progressRectangle2'),
              ),
            ],
          },
        ).layer('progress');
        row = [
          Stack(
            children: [
              Positioned(
                left: 0,
                right: 0,
                top: recipe.dimension('progress.y') ?? 0,
                child: ExcludeSemantics(child: bar),
              ),
              layers(
                content: {
                  // Each in a subtree of its own: steps of one status share a layer.
                  'steps': [
                    for (var i = 0; i < steps.length; i++)
                      KeyedSubtree(
                        key: ValueKey(i),
                        child: part(
                          byStatus(i, 'stepsStep', 'stepsStep2', 'stepsStep3'),
                          step(i, true),
                        ),
                      ),
                  ],
                },
              ).layer('steps'),
            ],
          ),
        ];
      case SolarStepperType.noLabel:
        row = [
          for (var i = 0; i < steps.length; i++) ...[
            if (i > 0)
              Expanded(
                child: ExcludeSemantics(
                  child: part(i - 1 < activeStep ? 'frame' : 'frame2'),
                ),
              ),
            named(
              i,
              part(
                byStatus(i, 'stepperIndicator', 'stepperIndicator2', 'stepperIndicator3'),
                SolarStepperIndicator(
                  number: i + 1,
                  status: switch (_status(i)) {
                    SolarStepStatus.complete => SolarStepperIndicatorStatus.completed,
                    SolarStepStatus.active => SolarStepperIndicatorStatus.active,
                    SolarStepStatus.upcoming => SolarStepperIndicatorStatus.upcoming,
                    SolarStepStatus.error => SolarStepperIndicatorStatus.error,
                  },
                ),
              ),
            ),
          ],
        ];
      case SolarStepperType.line:
        row = [
          for (var i = 0; i < steps.length; i++)
            Expanded(
              child: named(i, part(i <= activeStep ? 'rectangle1' : 'rectangle\${i + 1}')),
            ),
        ];
      case SolarStepperType.lineText:
        const places = ['step', 'step', 'step3', 'step4', 'step5'];
        row = [
          for (var i = 0; i < steps.length; i++)
            Expanded(
              child: part(
                _status(i) == SolarStepStatus.complete
                    ? 'stepCompleteHorizontal'
                    : places[i < places.length ? i : places.length - 1],
                step(i, false),
              ),
            ),
        ];
    }
    return layers(content: {'root': row}).layer('root');
  }
}
`;
    },
  },
};
