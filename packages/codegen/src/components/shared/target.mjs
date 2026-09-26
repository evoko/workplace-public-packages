/**
 * The target a pointer or a finger has to hit: at least 44 × 44, WCAG's floor, around a control
 * drawn smaller (a 32px Button). SOLAR asks for it: "Drawn heights are the visible control; the
 * 44×44px hit area (size/target/min) is padded in code." `TARGET` is that variable, which SOLAR
 * added to Spatial on 2026-09-25 (it was the one raw target size here until then);
 * `solar_flutter`'s `solarTargetSize` is its Flutter twin, `SolarSize.targetMin`.
 *
 * The target takes no room: it is invisible, centred on the control, and the control's drawn box
 * is Figma's.
 */

export const TARGET = 'var(--solar-size-target-min)';

const reach = {
  top: '50%',
  left: '50%',
  width: `max(100%, ${TARGET})`,
  height: `max(100%, ${TARGET})`,
  transform: 'translate(-50%, -50%)',
};

/**
 * An invisible target around the element `selector` names (`&`, the root): a pseudo-element,
 * which a click lands on as on the element itself. `under` lays it beneath the element's own
 * content (a text field's input, which a pointer must still reach to place the caret), the element
 * then a stacking context of its own.
 *
 * `rules` are the element's own declarations (a native button's reset), written into the same
 * rule. Pass them here rather than as a key of their own beside the spread: an object literal
 * keeps only the last value of a key, so a reset and a target under one selector lose one or the
 * other (test/target.test.mjs checks every target).
 */
export function targetArea(selector = '&', { under = false, rules = {} } = {}) {
  return {
    [selector]: {
      ...rules,
      position: 'relative',
      ...(under ? { isolation: 'isolate' } : {}),
    },
    [`${selector}::after`]: {
      content: '""',
      position: 'absolute',
      ...reach,
      ...(under ? { zIndex: '-1' } : {}),
    },
  };
}

/**
 * A native <button> with none of the browser's own look, for a drawn component's action or close
 * button: its recipe draws its words or its icon. Pass it as a target's `rules`.
 */
export const BUTTON_RESET = {
  appearance: 'none',
  border: '0',
  padding: '0',
  margin: '0',
  background: 'none',
  cursor: 'pointer',
};

/**
 * A native input made the target (Checkbox's, Radio's and Toggle's, invisible over the control):
 * a click on it is the input's own.
 */
export function targetInput(selector) {
  return { [selector]: reach };
}
