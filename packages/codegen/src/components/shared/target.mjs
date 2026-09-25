/**
 * The target a pointer or a finger has to hit: at least 44 × 44, WCAG's floor, around a control
 * drawn smaller (a 32px Button). SOLAR asks for it, and publishes no variable for it: "Drawn heights
 * are the visible control; the 44×44px WCAG hit area is padded in code (no target-size variable
 * exists yet)."
 *
 * ⚠️ Governance gap: `TARGET` is the one raw target size in the web recipes, here, until SOLAR
 * publishes a target-size variable, which then replaces it. The design review asks for it.
 * `solar_flutter`'s `solarTargetSize` is its Flutter twin.
 *
 * The target takes no room: it is invisible, centred on the control, and the control's drawn box
 * is Figma's.
 */

export const TARGET = '44px';

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
 */
export function targetArea(selector = '&', { under = false } = {}) {
  return {
    [selector]: {
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
 * A native input made the target (Checkbox's, Radio's and Toggle's, invisible over the control):
 * a click on it is the input's own.
 */
export function targetInput(selector) {
  return { [selector]: reach };
}
