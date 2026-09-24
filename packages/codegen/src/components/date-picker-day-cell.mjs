/**
 * SOLAR Date Picker Day Cell, beyond its IR: where MUI draws each layer and marks each state, and
 * the two shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): one day of Date Picker Open's grid, a grid cell the
 * grid moves the focus to, pressable.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const P = 'SolarDatePickerDayCell';

const requireLayers = (spec) => {
  if (spec.layers.day?.type !== 'TEXT')
    throw new Error('Date Picker Day Cell: the IR has no day text');
  if (!spec.api.rangeRole)
    throw new Error('Date Picker Day Cell: no rangeRole');
};

export default {
  name: 'Date Picker Day Cell',
  address: 'inputs/Day Cell',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Date Picker Day Cell', {
      cursor: 'pointer',
      outline: 'none',
      [`&.${P}-disabled`]: { cursor: 'default' },
    }),
    // Hovered and focused as a user reaches it; today, selected and the rest by the shell's
    // classes. Selected comes after today, so a selected today takes the selected ink on its fill,
    // and keeps today's edge, as the description says ("today wins for the marker, selected wins
    // for the fill"); disabled beats all.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&:focus-visible',
      today: `&.${P}-today`,
      selected: `&.${P}-selected`,
      filled: `&.${P}-filled`,
      error: `&.${P}-error`,
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // The day's figure is the React child, and Flutter's label, a String, as a drawn one's is.
    slots: { day: { react: 'children', flutter: 'label' } },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const flags = ['today', 'selected', 'filled', 'error', 'disabled'];
      return drawnReact(spec, {
        look: 'the day’s fill, edge and ink by state and range role',
        about: `Bespoke: one day of a DatePickerOpen's grid, drawn from Figma's layer tree
(\`internal/layers.tsx\`) as a grid cell, which the grid gives the focus to with the arrow keys (a
roving \`tabIndex\`), announced selected, as today's date, or disabled. Its words are the day of the
month; name it with the whole date (\`aria-label\`). \`rangeRole\` draws its part of a range as Figma
draws one, though the pickers choose one date for now.`,
        element: 'div',
        refType: 'HTMLDivElement',
        react: ['type ReactNode'],
        props: `/** The day of the month. */
children: ReactNode;`,
        own: ['children', 'className', 'onClick'],
        attrs: `role="gridcell"
aria-selected={selected ?? false}
aria-current={today ? 'date' : undefined}
aria-disabled={disabled || undefined}
onClick={disabled ? undefined : onClick}
className={
  [
${flags.map((f) => `    ${f} ? '${P}-${f}' : null,`).join('\n')}
    className,
  ]
    .filter(Boolean)
    .join(' ') || undefined
}`,
        text: '{ day: children }',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the day’s fill, edge and ink by state and range role, read cell by cell',
        about: `Bespoke: one day of a SolarDatePickerOpen's grid, drawn from Figma's layer tree with
[SolarLayers], pressable and focusable, announced selected, and named by [semanticLabel], the
whole date. Its words are the day of the month. [rangeRole] draws its part of a range as Figma
draws one, though the pickers choose one date for now.`,
        params: `required this.label,
required this.onPressed,
this.semanticLabel,
this.focusNode,`,
        fields: `/// The day of the month.
final String label;

/// Called when it is chosen; null draws it as it is, not pressable.
final VoidCallback? onPressed;

/// The whole date, for a screen reader.
final String? semanticLabel;

/// Its focus, which the grid moves with the arrow keys.
final FocusNode? focusNode;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: 'selected: selected,',
          focusNode: 'focusNode',
          // The days touch, 4px apart, as a menu's rows do: a day's box is its target (owner
          // decision 2026-09-24 for rows), as on the web, where it has no padded one either.
          target: false,
        },
        // Named by the whole date, which the day's figure would repeat.
        builders:
          "{if (semanticLabel != null) 'day': (layer) => ExcludeSemantics(child: layer)}",
        text: "{'day': label}",
        wrap: `semanticLabel == null
        ? mark
        : Semantics(label: semanticLabel, child: mark)`,
      });
    },
  },
};
