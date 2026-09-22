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
