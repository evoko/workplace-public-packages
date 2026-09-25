/**
 * SOLAR Button, beyond its IR: where MUI draws each layer and marks each state, what the Flutter
 * base control's style reads. Its shells are files of their own, written by hand. One file per
 * component, so adding one edits nothing shared; `src/components/index.mjs` finds them.
 */

import { targetArea } from './shared/target.mjs';

export default {
  name: 'Button',
  mui: {
    // `&` is the root element; MUI renders the label text in the root, and the icons and spinner in
    // its own named slots.
    slots: {
      root: '&',
      label: '&',
      iconLeading: '& .MuiButton-startIcon',
      iconTrailing: '& .MuiButton-endIcon',
      spinner: '& .MuiButton-loadingIndicator',
      // Not an MUI slot: the shell renders the counter itself, with this class (task 7).
      counter: '& .SolarButton-counter',
    },
    resets: {
      // Not '0': MUI's sx reads a sizing value of 1 or less as a fraction, so '0' becomes '0%'.
      minWidth: 'auto',
      textTransform: 'none',
      '& .MuiButton-startIcon': { margin: '0' },
      '& .MuiButton-endIcon': { margin: '0' },
      '& .MuiButton-startIcon > svg, & .MuiButton-endIcon > svg': {
        width: '100%',
        height: '100%',
      },
      // A 44 × 44 target around the drawn button (shared/target.mjs).
      ...targetArea(),
    },
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      // MUI marks focus with a class only for keyboard focus (focus-visible).
      focus: '&.Mui-focusVisible',
      loading: '&.MuiButton-loading',
      // MUI disables a loading button too, so a loading one carries Mui-disabled as well; without
      // the :not it would draw in the disabled colours. A button both disabled and loading is
      // disabled: the shell does not pass loading to MUI then.
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
      iconColor: 'iconLeading.color',
      iconSize: 'iconLeading.width',
    },
    shared: {
      'iconLeading.color': 'iconTrailing.color',
      'iconLeading.width': 'iconTrailing.width',
    },
  },
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own buttons: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
