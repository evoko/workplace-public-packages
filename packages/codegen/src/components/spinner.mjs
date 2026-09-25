/**
 * SOLAR Spinner, beyond its IR: where MUI draws each layer and marks each state, what the Flutter
 * base control's style reads. Its shells are files of their own, written by hand. One file per
 * component, so adding one edits nothing shared; `src/components/index.mjs` finds them.
 */

export default {
  name: 'Spinner',
  mui: {
    // The shell sizes a box and lets CircularProgress fill it (size="100%"), since MUI writes the
    // size prop as an inline style no recipe rule could beat.
    slots: {
      root: '&',
      spinnerRing: '&',
      track: '& .MuiCircularProgress-track',
      indicator: '& .MuiCircularProgress-circle',
    },
    svgLayers: ['track', 'indicator'],
    // CircularProgress draws in a 44-unit viewBox scaled to its box, so a stroke width in CSS
    // pixels would scale with it; non-scaling-stroke keeps SOLAR's border width in screen pixels.
    // MUI fades its track to 12% of the indicator's colour; SOLAR's track has a colour of its own.
    resets: {
      display: 'inline-flex',
      '& .MuiCircularProgress-root': { display: 'block' },
      '& .MuiCircularProgress-track, & .MuiCircularProgress-circle': {
        vectorEffect: 'non-scaling-stroke',
      },
      '& .MuiCircularProgress-track': { opacity: '1' },
    },
  },
  flutter: {
    // CircularProgressIndicator has one strokeWidth for its track and its indicator.
    shared: { 'indicator.borderWidth': 'track.borderWidth' },
  },
};
