/**
 * One oracle variant drawn, its state forced: what the Variants page draws in each tile (solar.tsx)
 * and the workbench's Inspect dialog draws large (workbench/preview.tsx), so the two cannot differ.
 * The component comes from its visual-check case (test/visual/cases/), the state's marking from
 * the codegen's state selectors, which the host passes in: Storybook's from `virtual:solar`
 * (solar.tsx's `VariantStage`), a test page's from its build (test/visual/build.mjs), since only
 * Storybook serves that module.
 */

import { useLayoutEffect, useRef, type HTMLAttributes, type Ref } from 'react';
import { CASES } from '../test/visual/cases/index.js';

/** The element a variant is drawn in: its props, and a ref to it. */
export type StageProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
  inert?: boolean;
};

/**
 * How a platform state is forced: a pseudo-class through the pseudo-states addon, which rewrites
 * `:hover` into a class a wrapper can set, or the class MUI sets for the state (Button's focus is
 * `Mui-focusVisible`), put on the control. A pressed control is hovered too, as a pointer pressing
 * it is.
 */
export function forcing(selector: string | null | undefined, state: string) {
  const pseudo = /^&:(hover|active|focus-visible|focus)\b/.exec(
    selector ?? '',
  )?.[1];
  const cls = /^&\.([\w-]+)/.exec(selector ?? '')?.[1];
  const wrapper = [
    ...(state === 'pressed' ? ['pseudo-hover-all'] : []),
    ...(pseudo ? [`pseudo-${pseudo}-all`] : []),
  ].join(' ');
  return { wrapper, cls };
}

/**
 * The component's oracle variant `index`, drawn through its case in an element whose first child is
 * the component's root, its state forced as `states` (the component's state selectors) marks it.
 */
export function DrawnVariant({
  component,
  index,
  states,
  ref,
  className,
  ...stage
}: StageProps & {
  component: string;
  index: number;
  states: Record<string, string | null> | undefined;
}) {
  const c = CASES[component];
  if (!c) throw new Error(`${component}: no case in test/visual/cases/`);
  const v = c.oracle.variants[index];
  if (!v) throw new Error(`${component}: no variant ${index}`);
  const { wrapper, cls } = forcing(states?.[v.state], v.state);
  const at = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (cls) at.current?.firstElementChild?.classList.add(cls);
  });
  const both = (el: HTMLDivElement | null) => {
    at.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
  };
  return (
    <div
      ref={both}
      className={[wrapper, className].filter(Boolean).join(' ') || undefined}
      {...stage}
    >
      {c.render(v)}
    </div>
  );
}
