/**
 * SOLAR Card, beyond its IR: where MUI draws each layer and marks each state. Its shells are files
 * of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * The raised surface of the card family, drawn from Figma's layers with the shared helpers: its
 * title and helper, an icon, the content (Figma's description, then the caller's children), a
 * SOLAR Tag in the status's look, and a More menu. Pressable where it is given something to do
 * (owner decision 2026-09-25): its title is the button or link, stretched over the card, so the
 * More menu and the content's own controls stay reachable above it. Loading, it draws Figma's
 * placeholders.
 */

import { cardResets, cardStates } from './shared/card.mjs';

export default {
  name: 'Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shared/card.mjs).
    slots: 'drawn',
    resets: cardResets('Card', {
      // The words wrap, as a card's title and content do; Figma's hug one line.
      wrap: ['titleTitle', 'description'],
      more: 'more',
      icons: ['icon'],
      extra: { '& .SolarCard-content': { display: 'flex' } },
    }),
    states: cardStates('Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { more: 'moreItems' },
    flutter: { more: 'moreItems' },
  },
};
