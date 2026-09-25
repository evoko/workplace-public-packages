import oracle from '../../../../../spec/verify/button-group.json';
import { Button, type ButtonProps } from '../../../src/Button.js';
import {
  ButtonGroup,
  type ButtonGroupLayout,
} from '../../../src/ButtonGroup.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = {
  hidden?: boolean;
  component?: string;
  variant?: Record<string, string>;
};

/**
 * The Buttons Figma draws in the variant, in its order, each marked with its layer: every one
 * shown, and every one a prop shows though Figma hides it at rest (the tertiary). A Button's Figma
 * `prio` is its `variant` prop.
 */
function children(v: OracleVariant) {
  const layers = (v as OracleVariant & { layers: Record<string, ChildLayer> })
    .layers;
  const rest = oracle.variants[0].layers as Record<string, ChildLayer>;
  return Object.entries(layers)
    .filter(
      ([name, l]) =>
        l.component === 'Button' &&
        (!l.hidden || (name in oracle.slots && rest[name]?.hidden)),
    )
    .map(([name, l]) => (
      <Button
        key={name}
        data-layer={name}
        size={l.variant?.size as ButtonProps['size']}
        prio={l.variant?.prio as ButtonProps['prio']}
        danger={l.variant?.danger === 'true'}
      >
        Label
      </Button>
    ));
}

/** The oracle's props as the layout the types allow: Figma draws no vertical full-width group. */
function layout(v: OracleVariant): ButtonGroupLayout {
  const p = v.props as {
    orientation?: string;
    type?: 'regular' | 'full-width';
  };
  return p.orientation === 'vertical'
    ? { orientation: 'vertical' }
    : { orientation: 'horizontal', type: p.type };
}

export default {
  oracle,
  render: (v) => <ButtonGroup {...layout(v)}>{children(v)}</ButtonGroup>,
} satisfies VisualCase;
