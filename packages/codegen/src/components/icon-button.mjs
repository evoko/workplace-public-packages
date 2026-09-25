/**
 * SOLAR Icon Button, beyond its IR: where MUI draws each layer and marks each state, what the
 * Flutter base control's style reads. Its shells are files of their own, written by hand. One file
 * per component, so adding one edits nothing shared; `src/components/index.mjs` finds them.
 */

import { targetArea } from './shared/target.mjs';

export default {
  name: 'Icon Button',
  mui: {
    // MUI renders the icon as its children; the shell wraps it in a box the recipe sizes, as
    // Button's counter is, so the icon fills it. The loading indicator is MUI's slot, laid over the
    // icon.
    slots: {
      root: '&',
      icon: '& .SolarIconButton-icon',
      spinner: '& .MuiIconButton-loadingIndicator',
    },
    // MUI's icon button is a 24px glyph in a round, padded box, which the recipe replaces; the
    // SOLAR icon fills the box the recipe sizes for it.
    resets: {
      '& .SolarIconButton-icon': { display: 'inline-flex' },
      '& .SolarIconButton-icon > svg': { width: '100%', height: '100%' },
      // A 44 × 44 target around the drawn button (shared/target.mjs).
      ...targetArea(),
    },
    // MUI's IconButton marks its states as Button does, under its own name.
    states: {
      default: null,
      hover: '&:hover',
      // A toggle icon button switched on (Figma's active, added 2026-09-25): the shell marks it as
      // a toggle does, pressed in ARIA's sense, which a momentary press still draws over.
      active: '&[aria-pressed="true"]',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      loading: '&.MuiIconButton-loading',
      disabled: '&.Mui-disabled:not(.MuiIconButton-loading)',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
    restates: { loading: ['root.background'] },
  },
  flutter: {
    // No label, so no text style: the icon takes the foreground.
    style: {
      background: 'root.background',
      shadow: 'root.shadow',
      radius: 'root.radius',
      borderColor: 'root.borderColor',
      borderWidth: 'root.borderWidth',
      paddingTop: 'root.paddingTop',
      paddingRight: 'root.paddingRight',
      paddingBottom: 'root.paddingBottom',
      paddingLeft: 'root.paddingLeft',
      height: 'root.height',
      width: 'root.width',
      foreground: 'icon.color',
      iconColor: 'icon.color',
      iconSize: 'icon.width',
    },
  },
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own buttons: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
