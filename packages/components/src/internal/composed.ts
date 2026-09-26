/**
 * The variant a parent's recipe composes a child in, where the child is the caller's own element:
 * a Button's `counter` is whatever node the app passes, and Figma draws the Counter in it in a type
 * of the Button's (`inverted` in a primary Button, `regular` in the others). The Button provides
 * the type its recipe names around its counter, and a Counter whose own `type` is not given takes
 * it, so `<Counter count={3} />` in a Button is drawn as Figma draws it without the app repeating
 * the recipe. An explicit `type` still wins. Flutter does the same with an InheritedWidget
 * (`SolarCounterTypeScope`).
 *
 * Hand written and internal.
 */

import { createContext, useContext } from 'react';
import type { SolarCounterType } from '@bwp-web/styles/mui';

/** The Counter type the parent around it composes; undefined outside one. */
export const CounterTypeContext = createContext<SolarCounterType | undefined>(
  undefined,
);

/** The Counter type the parent around a Counter composes it in, or undefined. */
export const useComposedCounterType = () => useContext(CounterTypeContext);
