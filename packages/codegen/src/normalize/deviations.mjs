// Deliberate departures from what the Figma data says, each with a reason. These are reported
// in spec/deviations.md for SOLAR governance. docs/ is never edited to accommodate them.

// The CSS keywords, as their equivalent cubic beziers. Flutter has no keyword easings, so the
// bezier form is the only representation both platforms can share.
const EASING_BEZIERS = {
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  'ease-both': [0.42, 0, 0.58, 1],
};

export const DEVIATIONS = [
  {
    token: 'motion.ease.both',
    figmaValue: 'ease-both',
    reason:
      'ease-both is not a valid CSS timing function. The intended curve is ease-in-out, emitted as its cubic bezier so CSS and Flutter share one definition.',
    raise: 'Ask SOLAR to rename the value to ease-in-out.',
  },
  {
    token: 'type.font-weight.*',
    figmaValue: 'Figma style names such as Semi Bold',
    reason:
      'The Figma value is the type style name, which is not a valid CSS font-weight. The numeric weight is carried by the token name, so that is what is emitted; the style name is kept in $extensions for font loading.',
    raise: null,
  },
];

// The icon corpus has its own defects. They are a separate export because DEVIATIONS is the
// lookup applyDeviation walks per token value, and these are not token values: buildIconSpec
// records them when the catalog actually triggers them. The record shape is the same, so both
// sets render as rows of the one spec/deviations.md table.
export const ICON_DEVIATIONS = [
  {
    token: 'icon.phone',
    figmaValue: 'two components named Icon/Phone',
    reason:
      'Icon/Phone exists on both the Communication and the Audio & DSP page, so the Figma name is not unique. Component names are derived from the file stem instead, which makes the Audio & DSP one IconPhoneAudioDsp.',
    raise: 'Ask SOLAR to rename one of the two Icon/Phone components.',
  },
  {
    token: 'icon.support',
    figmaValue: 'two solid variants, no outline',
    reason:
      'Icon/Support has its solid drawing in both variant slots and no outline, so there is no outline geometry to emit. The outline falls back to the solid one, so the component still renders rather than leaving a hole every consumer has to branch on.',
    raise: 'Ask SOLAR to draw the missing outline variant of Icon/Support.',
  },
  {
    token: 'icon.zone',
    figmaValue: '0 0 24 25',
    reason:
      'The outline of Icon/Zone is drawn 1px off the 24 grid. Its viewBox is carried verbatim so the geometry stays correct; cropping it to 24 would shift the drawing.',
    raise: 'Ask SOLAR to redraw the Icon/Zone outline on the 24 grid.',
  },
  {
    token: 'logo.os-logo.teams',
    figmaValue: '12 gradient fills and 7 fill-opacity attributes',
    reason:
      'The Teams mark is drawn with radial and linear gradients and per-path opacity, neither of which the vector IR represents. It ships as its raw SVG source instead of as paths, so each target decides for itself how to render it.',
    raise: 'Ask SOLAR whether a flat-colour Teams mark exists.',
  },
];

/**
 * @returns {{value: unknown, deviation: null | {token: string, figmaValue: unknown, reason: string}}}
 */
export function applyDeviation(entry, type) {
  const { doc, value } = entry;

  if (type === 'cubicBezier') {
    const bezier = EASING_BEZIERS[value];
    if (!bezier) throw new Error(`unknown easing keyword for ${doc}: ${value}`);
    const defect = DEVIATIONS.find((d) => d.token === doc);
    return {
      value: bezier,
      deviation: defect ? { ...defect } : null,
    };
  }

  if (type === 'fontWeight') {
    const weight = Number(doc.split('.').pop());
    if (!Number.isInteger(weight))
      throw new Error(`cannot read a numeric weight from ${doc}`);
    const rule = DEVIATIONS.find((d) => d.token === 'type.font-weight.*');
    return {
      value: weight,
      deviation: { ...rule, token: doc, figmaValue: value },
    };
  }

  return { value, deviation: null };
}
