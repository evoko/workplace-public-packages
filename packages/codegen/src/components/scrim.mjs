/**
 * SOLAR Scrim, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * The translucent layer behind a blocking surface: MUI's Backdrop on the web, its colour the
 * recipe's; the Dialog and the Drawer take it as their backdrop.
 */

export default {
  name: 'Scrim',
  mui: {
    // One layer, the Backdrop itself.
    slots: { root: '&' },
  },
  flutter: {},
};
