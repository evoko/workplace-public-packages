/**
 * What the cards' Playground builders share: a card's More menu, its sample actions each logged
 * with its words as it is chosen (`onSelect`, the item's callback), as an app's menu acts. As
 * Flutter's (widgetbook/lib/playground/cards.dart).
 */

import type { CardMoreItem } from '../../src/Card.js';
import { moreActions } from './samples.js';
import type { Playground } from './types.js';

export const moreItemsOf = (p: Playground): CardMoreItem[] =>
  moreActions.map((label) => ({
    label,
    onSelect: () => p.log('onSelect', label),
  }));
