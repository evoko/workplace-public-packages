import oracle from '../../../../../spec/verify/banner.json';
import { Banner, type BannerProps } from '../../../src/Banner.js';
import { Button, type ButtonProps } from '../../../src/Button.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string> };

/** The Button Figma draws at a layer, as the variant draws it. */
const button = (v: OracleVariant, layer: string) => {
  const b = (v.layers as Record<string, ChildLayer>)[layer]?.variant ?? {};
  return (
    <Button
      size={b.size as ButtonProps['size']}
      prio={b.prio as ButtonProps['prio']}
      danger={b.danger === 'true'}
    >
      Label
    </Button>
  );
};

// Every slot filled, so each look is measured: both Buttons as Figma draws them, the text action
// and the close button, with Figma's own words.
export default {
  oracle,
  render: (v) => (
    <Banner
      {...(v.props as Pick<BannerProps, 'type'>)}
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      primaryButton={button(v, 'primaryButton')}
      secondaryButton={button(v, 'secondaryButton')}
      action="Action"
      onAction={() => {}}
      onClose={() => {}}
    />
  ),
} satisfies VisualCase;
