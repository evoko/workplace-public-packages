/**
 * SOLAR ProgressBar, beyond its IR: where MUI draws each layer, what the Flutter base control's
 * style reads. Its shells are files of their own, written by hand. One file per component, so
 * adding one edits nothing shared; `src/components/index.mjs` finds them.
 */

export default {
  name: 'ProgressBar',
  mui: {
    // The track is LinearProgress's root; the bar, which it draws and moves itself, its bar.
    slots: {
      root: '&',
      indicator: '& .MuiLinearProgress-bar',
    },
    // The bar's move to a new value is a functional transition, which SOLAR collapses where motion
    // is reduced (the motion chapter).
    resets: {
      display: 'block',
      '@media (prefers-reduced-motion: reduce)': {
        '& .MuiLinearProgress-bar': { transition: 'none' },
      },
    },
  },
  flutter: {
    // LinearProgressIndicator has one radius and one height for its track and its bar.
    shared: {
      'indicator.radius': 'root.radius',
      'indicator.height': 'root.height',
    },
  },
};
