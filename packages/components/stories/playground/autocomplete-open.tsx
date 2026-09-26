/**
 * Autocomplete Open's Playground: an open Autocomplete, which Figma composes from an Autocomplete
 * and a Dropdown Menu under it and the IR holds nothing of, so it is Autocomplete's Playground held
 * open: its suggestions always shown (a choice or Escape does not close them), the words the
 * `value` extra, starting at a query every sample suggestion matches. Figma's instance hides its
 * label, helper and icons.
 */

import { playgroundAutocomplete } from './autocomplete.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => playgroundAutocomplete(p, { open: true }),
} satisfies PlaygroundBuilder;
