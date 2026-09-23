/** Stand-ins the cases fill slots with: plain shapes that take the colour and size they are given. */

export const icon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M4 4h16v16H4z" fill="currentColor" />
  </svg>
);

/**
 * A stand-in for the counter a caller fills Button's slot with: centred in the box the recipe sizes,
 * as SOLAR's Counter fills it, rather than a bare number sitting at the top of it.
 */
export const counter = (
  <span
    style={{ display: 'inline-flex', alignItems: 'center', height: '100%' }}
  >
    3
  </span>
);
