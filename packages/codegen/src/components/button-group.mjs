/**
 * SOLAR Button Group, beyond its IR: where MUI draws each layer and marks each state, what the
 * Flutter base control's style reads. Its shells are files of their own, written by hand. One file
 * per component, so adding one edits nothing shared; `src/components/index.mjs` finds them.
 */

export default {
  name: 'Button Group',
  mui: {
    // A flex box of the caller's Buttons. Figma draws example Buttons at three layers; whatever
    // the caller passes, each is a child of the box, so the three are styled together.
    slots: {
      root: '&',
      tertiaryCTA: '& > *',
      secondaryCTA: '& > *',
      button3: '& > *',
    },
    // The shell renders a Box, which is a block; Figma's auto layout is a flex box.
    resets: { display: 'flex' },
  },
  flutter: {},
};
