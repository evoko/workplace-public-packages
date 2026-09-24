/**
 * SOLAR DragHandle, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): six dots, focusable, pressed while held (the grab).
 * The drag itself is the caller's.
 */

import {
  drawnReact,
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
} from '../shells/drawn.mjs';
import { dartField, dartParam } from '../shells/helpers.mjs';
import { targetArea } from '../shells/target.mjs';

const requireApi = (spec) => {
  if (!spec.api.size) throw new Error('DragHandle: the IR has no size');
  if (spec.api.disabled?.type !== 'boolean')
    throw new Error('DragHandle: the IR has no disabled prop');
};

export default {
  name: 'DragHandle',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A grip says it can be picked up, and is held while it is; SOLAR's focus ring stands for the
    // browser's outline.
    resets: drawnResets('DragHandle', {
      cursor: 'grab',
      '&:active': { cursor: 'grabbing' },
      '&.SolarDragHandle-disabled': { cursor: 'default' },
      '&:focus-visible': { outline: 'none' },
      // A 44 × 44 target around the grip (shells/target.mjs).
      ...targetArea(),
    }),
    // Pressed while held by the pointer, or while the caller's drag says it is lifted.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active, &[aria-pressed="true"]',
      focus: '&:focus-visible',
      disabled: '&.SolarDragHandle-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireApi(spec);
      return drawnReact(spec, {
        look: 'the dots’ size and colour by state, and the grip’s padding and focus ring',
        about: `Bespoke: a grip, drawn from Figma’s layer tree (\`internal/layers.tsx\`), that marks a row
or card as one to reorder. It is focusable and announced as a drag handle, "Reorder" unless named
otherwise; it is not a button, and does nothing itself. The drag is the caller's: spread its drag
and drop library's handle props over it (they may set \`aria-pressed\` while it is lifted, which
draws it pressed), and give the list the keyboard's Space to lift, arrows to move, Space to drop.`,
        own: ["'aria-label': label = 'Reorder'", 'className'],
        attrs: `role="button"
aria-roledescription="drag handle"
aria-label={label}
aria-disabled={disabled || undefined}
tabIndex={disabled ? -1 : 0}
className={
  [disabled ? 'SolarDragHandle-disabled' : null, className].filter(Boolean).join(' ') ||
  undefined
}`,
      });
    },
    flutter: (spec) => {
      requireApi(spec);
      const api = Object.entries(spec.api);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarDragHandleRecipe]: the dots' size and colour by state, and the grip's padding and focus ring, read cell by cell.`;
      const about = `Bespoke: a grip, drawn from Figma's layer tree with [SolarLayers], that marks a row or card as one to reorder. It is focusable, hovered by the mouse, and pressed while a pointer holds it, which is the grab; it is not a button, and does nothing itself. The drag is the caller's: wrap it in the list's drag listener (a ReorderableDragStartListener), and give the list the keyboard's Space to lift, arrows to move, Space to drop.`;
      return `/// SOLAR DragHandle.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/draghandle.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_theme_of.dart';

class SolarDragHandle extends StatelessWidget {
  const SolarDragHandle({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('DragHandle', prop, def)},`).join('\n')}
    this.semanticLabel = 'Reorder',
    this.focusNode,
    this.statesController,
  });

${api.map(([prop, def]) => dartField('DragHandle', prop, def)).join('\n')}

  /// What it reorders, for a screen reader: "Reorder" unless it says more.
  final String semanticLabel;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// Its states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarDragHandleProps(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDragHandleRecipe.lookup(c, p, states),
        dimension: (c) => SolarDragHandleRecipe.dimension(c, p, states),
        color: (c) => SolarDragHandleRecipe.color(t, c, p, states),
        shadow: (c) => SolarDragHandleRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarDragHandleRecipe.textStyle(t, c, p, states),
        present: (l) => SolarDragHandleRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
    ).layer('root');
    return SolarStatesScope(
      controller: statesController,
      builder: (context, states) {
        final enabled = !disabled;
        void set(WidgetState state, bool on) => states.update(state, on);
        // Pressed by the pointer itself, not a tap, which would give way to the caller's drag.
        return Semantics(
          label: semanticLabel,
          enabled: enabled,
          child: SolarTarget(child: FocusableActionDetector(
            enabled: enabled,
            focusNode: focusNode,
            mouseCursor: enabled ? SystemMouseCursors.grab : MouseCursor.defer,
            onShowHoverHighlight: (on) => set(WidgetState.hovered, on),
            onShowFocusHighlight: (on) => set(WidgetState.focused, on),
            child: Listener(
              onPointerDown: enabled ? (_) => set(WidgetState.pressed, true) : null,
              onPointerUp: enabled ? (_) => set(WidgetState.pressed, false) : null,
              onPointerCancel: enabled ? (_) => set(WidgetState.pressed, false) : null,
              child: ListenableBuilder(
                listenable: states,
                builder: (context, _) => draw({...states.value}),
              ),
            ),
          )),
        );
      },
    );
  }
}
`;
    },
  },
};
