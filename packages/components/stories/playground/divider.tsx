/**
 * Divider's Playground: its orientation and type; a labelled divider's words the `label` extra. A
 * divider fills what it separates, so it is drawn between two sample words, as in an app: a
 * horizontal one between two lines, as wide as the width box; a vertical one between two words on
 * a line, which stretches it to the line's height. Figma draws no vertical inset or labelled
 * divider, so a vertical divider is full, and the builder writes `full` back to `type`, so the
 * panel shows the divider the component draws (as Button Group's builder does its type).
 */

import { useEffect } from 'react';
import { Divider, type DividerProps } from '../../src/Divider.js';
import type { Playground, PlaygroundBuilder } from './types.js';

type DividerType = NonNullable<DividerProps['type']>;

function DividerPlayground({ p }: { p: Playground }) {
  const orientation =
    p.choice<NonNullable<DividerProps['orientation']>>('orientation');
  const wanted = p.choice<DividerType>('type');
  const vertical = orientation === 'vertical';
  const type: DividerType = vertical ? 'full' : wanted;
  useEffect(() => {
    if (type !== wanted) p.set('type', type);
    // `p` is rebuilt on every render; the type alone decides whether to write it back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, wanted]);
  const label = p.words('label');
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'row' : 'column',
      }}
    >
      <span>Text</span>
      {vertical ? (
        <Divider orientation="vertical" />
      ) : (
        <Divider orientation={orientation} type={type}>
          {type === 'with-label' ? label : undefined}
        </Divider>
      )}
      <span>Text</span>
    </div>
  );
}

export default {
  render: (p) => <DividerPlayground p={p} />,
} satisfies PlaygroundBuilder;
