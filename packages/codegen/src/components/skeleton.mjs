/**
 * SOLAR Skeleton, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * MUI's Skeleton on the web; bespoke in Flutter, which has none, drawn by the shared layer helpers
 * inside a pulse.
 */

export default {
  name: 'Skeleton',
  mui: {
    slots: { root: '&' },
    // MUI's own fill, a translucent grey, is the recipe's colour instead (backgroundColor); its
    // rectangular variant draws no radius of its own. Its pulse is decorative motion, which SOLAR
    // removes entirely where motion is reduced (the motion chapter).
    resets: {
      display: 'block',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
  },
  flutter: {},
};
