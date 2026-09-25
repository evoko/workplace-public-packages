/**
 * SOLAR Avatar, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * Its colour is the caller's, any colour (design team, 2026-09-24): the overlay's `caller` rules
 * make it a prop, the background it is, and the initials' ink derived from it by the shells' ink
 * rule (`internal/ink.ts`, `solar_ink.dart`, owner decision 2026-09-24).
 */

export default {
  name: 'Avatar',
  mui: {
    // MUI renders its children in the root; the shell wraps the initials in a span of their own,
    // so where a type hides them they are not there.
    slots: { root: '&', initials: '& .SolarAvatar--initials' },
    // MUI's Avatar is content-box, 40px, 1.25rem and grey by default; SOLAR's draws its border
    // inside the box it sizes, and the recipe gives the rest.
    resets: { boxSizing: 'border-box' },
  },
  flutter: {},
};
