/** The property a token category is compared on, and the inline style of the sample that consumes the variable. */
export interface Sample {
  property: string;
  style: (variable: string) => string;
}

const BOX = 'display:block;width:48px;height:24px;';

export const SAMPLES: Record<string, Sample> = {
  color: {
    property: 'background-color',
    style: (v) => `${BOX}background-color:var(${v})`,
  },
  space: {
    property: 'width',
    style: (v) => `display:block;height:8px;width:var(${v})`,
  },
  size: {
    property: 'width',
    style: (v) => `display:block;height:8px;width:var(${v})`,
  },
  radius: {
    property: 'border-top-left-radius',
    style: (v) => `${BOX}border-top-left-radius:var(${v})`,
  },
  'border-width': {
    property: 'border-top-width',
    style: (v) => `${BOX}border-top-style:solid;border-top-width:var(${v})`,
  },
  'font-family': {
    property: 'font-family',
    style: (v) => `font-family:var(${v})`,
  },
  'font-size': { property: 'font-size', style: (v) => `font-size:var(${v})` },
  'font-weight': {
    property: 'font-weight',
    style: (v) => `font-weight:var(${v})`,
  },
  'line-height': {
    property: 'line-height',
    style: (v) => `font-size:16px;line-height:var(${v})`,
  },
  'letter-spacing': {
    property: 'letter-spacing',
    style: (v) => `font-size:16px;letter-spacing:var(${v})`,
  },
  shadow: {
    property: 'box-shadow',
    style: (v) => `${BOX}box-shadow:var(${v})`,
  },
  opacity: { property: 'opacity', style: (v) => `${BOX}opacity:var(${v})` },
  'z-index': {
    property: 'z-index',
    style: (v) => `${BOX}position:relative;z-index:var(${v})`,
  },
  duration: {
    property: 'transition-duration',
    style: (v) =>
      `${BOX}transition-property:opacity;transition-duration:var(${v})`,
  },
  easing: {
    property: 'transition-timing-function',
    style: (v) =>
      `${BOX}transition-property:opacity;transition-timing-function:var(${v})`,
  },
};
