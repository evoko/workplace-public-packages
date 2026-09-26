// Autocomplete Open's Playground: an open Autocomplete, which Figma composes from an Autocomplete
// and a Dropdown Menu under it and the IR holds nothing of, so it is Autocomplete's Playground
// opened: it takes the focus as it is built, so its suggestions show for the `value` extra's words,
// which start at a query every sample suggestion matches (the widget suggests for words typed
// alone). A choice or a tap outside closes them, as the widget does. Figma's instance hides its
// label, helper and icons. As the web's (stories/playground/autocomplete-open.tsx).

import 'autocomplete.dart';
import 'playground.dart';

final autocompleteOpenPlayground = SolarPlaygroundBuilder(
  build: (p) => PlaygroundAutocomplete(p: p, autofocus: true),
);
