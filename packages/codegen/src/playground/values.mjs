/**
 * The Playground's fixed values, which both viewers' adapters use: served to Storybook in
 * `virtual:solar`'s PLAYGROUND (`values`), and written into Widgetbook's generated
 * `controls.dart` as constants (src/emit/playground.mjs). Dependency-free, so the derivation, the
 * emitter and their tests share them without reading anything.
 */

/**
 * An icon control's two values that are no icon: the slot hidden, and the builder's own sample
 * icon. An underscore keeps them apart from every stem (the SOLAR set has icons named `none` and
 * `empty`), and keeps them among the characters Storybook keeps in its URL (`[a-zA-Z0-9 _-]`), as
 * does the solid style's suffix (`chevron-right solid`), so a Playground's state survives a reload
 * or a shared link.
 */
export const ICON_NONE = '_none';
export const ICON_SAMPLE = '_sample';
export const ICON_SOLID = ' solid';

/**
 * The width box's choices, in pixels, or `auto`: the viewer's layout around the component, not a
 * component's design, so no token holds them.
 */
export const WIDTHS = ['auto', '120', '200', '320', '480', '640'];

/** How many callbacks the event log keeps, newest first. */
export const LOG_LENGTH = 5;

/** Every fixed value, as PLAYGROUND serves them to the web adapter. */
export const PLAYGROUND_VALUES = {
  iconNone: ICON_NONE,
  iconSample: ICON_SAMPLE,
  iconSolid: ICON_SOLID,
  widths: WIDTHS,
  logLength: LOG_LENGTH,
};
