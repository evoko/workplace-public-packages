/**
 * SOLAR FAB, beyond its IR: where MUI draws each layer and marks each state, what the Flutter base
 * control's style reads. Its shells are files of their own, written by hand. One file per
 * component, so adding one edits nothing shared; `src/components/index.mjs` finds them.
 *
 * On Button's machinery: MUI's Button and Flutter's FilledButton, restyled by the recipe. Its type
 * is derived (the overlay's `derive`): an extended FAB is one with a label, so the shells set it
 * from whether they are given one.
 */

import { targetArea } from './shared/target.mjs';

export default {
  name: 'FAB',
  mui: {
    // `&` is the root; MUI renders the label in the root, the icon and spinner in its own slots.
    slots: {
      root: '&',
      label: '&',
      icon: '& .MuiButton-startIcon',
      spinner: '& .MuiButton-loadingIndicator',
    },
    resets: {
      // Not '0': MUI's sx reads a sizing value of 1 or less as a fraction.
      minWidth: 'auto',
      textTransform: 'none',
      // Figma draws the stroke inside the box, taking no room from the icon; CSS's border does,
      // so the icon keeps its size and overlaps the border's pixel, as Figma draws it.
      '& .MuiButton-startIcon': { margin: '0', flexShrink: '0' },
      '& .MuiButton-startIcon > svg': { width: '100%', height: '100%' },
      // A 44 × 44 target around the drawn button (shared/target.mjs).
      ...targetArea(),
    },
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      loading: '&.MuiButton-loading',
      disabled: '&.Mui-disabled:not(.MuiButton-loading)',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {
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
      foreground: 'label.color',
      textStyle: 'label.typography',
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
