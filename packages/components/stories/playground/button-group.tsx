/**
 * Button Group's Playground: its Buttons as Figma lays them out, the primary Button always, the
 * secondary and tertiary where their controls show them, each with its words (the primary's are
 * Figma's, "Label", since the IR gives it no slot); horizontally the primary last, vertically
 * first, as Figma draws both. A full-width group's Buttons are `lg`, as Figma draws them and the
 * README composes a dialog's actions; a regular group's the Button's default. Figma draws no
 * vertical full-width group, so a vertical group is regular, and the builder writes `regular` back
 * to `type`, so the panel shows the group the component draws. Each click is logged with the
 * Button's layer name.
 */

import { useEffect } from 'react';
import { Button, type ButtonProps } from '../../src/Button.js';
import { ButtonGroup, type ButtonGroupLayout } from '../../src/ButtonGroup.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function ButtonGroupPlayground({ p }: { p: Playground }) {
  const orientation = p.choice<'horizontal' | 'vertical'>('orientation');
  const wanted = p.choice<'regular' | 'full-width'>('type');
  const vertical = orientation === 'vertical';
  const type = vertical ? 'regular' : wanted;
  useEffect(() => {
    if (type !== wanted) p.set('type', type);
    // `p` is rebuilt on every render; the type alone decides whether to write it back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, wanted]);
  const tertiary = p.child('tertiaryCTA');
  const secondary = p.child('secondaryCTA');
  const size: ButtonProps['size'] = type === 'full-width' ? 'lg' : undefined;
  const button = (
    layer: string,
    prio: NonNullable<ButtonProps['prio']>,
    label: string | undefined,
  ) => (
    <Button
      key={layer}
      size={size}
      prio={prio}
      aria-label={label ? undefined : 'Label'}
      onClick={() => p.log('onClick', layer)}
    >
      {label || undefined}
    </Button>
  );
  const buttons = [
    tertiary.shown ? button('tertiaryCTA', 'tertiary', tertiary.text) : null,
    secondary.shown
      ? button('secondaryCTA', 'secondary', secondary.text)
      : null,
    button('button3', 'primary', 'Label'),
  ];
  const layout: ButtonGroupLayout = vertical
    ? { orientation: 'vertical' }
    : { orientation: 'horizontal', type };
  return (
    <ButtonGroup {...layout}>
      {vertical ? buttons.reverse() : buttons}
    </ButtonGroup>
  );
}

export default {
  render: (p) => <ButtonGroupPlayground p={p} />,
} satisfies PlaygroundBuilder;
