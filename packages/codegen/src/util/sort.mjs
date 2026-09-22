/**
 * Code-unit ordering, for anything whose order reaches a generated file.
 *
 * `String.prototype.localeCompare` sorts by the ICU data built into the running Node, which
 * differs between Node builds and platforms: it ignores punctuation at the primary strength, so
 * `color.border.inverse` and `colorborder` can order differently on two machines. CI regenerates
 * every target and fails on any difference, so a comparator that depends on the environment
 * would make that check report a change nobody made. Code units are the same everywhere.
 */
export const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
