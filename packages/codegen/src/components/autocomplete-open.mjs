/**
 * SOLAR Autocomplete Open, beyond its IR: no component of its own, but an open Autocomplete (owner
 * decision 2026-09-24), checked as one. Its recipe gives the gap Autocomplete floats its
 * suggestions under its field by; its cases draw an Autocomplete open.
 */

export default {
  name: 'Autocomplete Open',
  checkedAs: 'Autocomplete',
  mui: {
    // The case marks the Autocomplete and its menu with their layers.
    slots: 'drawn',
  },
  flutter: {},
};
