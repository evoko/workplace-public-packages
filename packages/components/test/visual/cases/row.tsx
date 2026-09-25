import oracle from '../../../../../spec/verify/row.json';
import { ColumnItem } from '../../../src/ColumnItem.js';
import { Row, type RowProps } from '../../../src/Row.js';
import type { VisualCase } from './types.js';

// Each type, at rest and selected, with its select and expand cells and Figma's five cells, each
// its words: headers in the header row, data cells in the others.
export default {
  oracle,
  render: (v) => {
    const props = v.props as Pick<RowProps, 'type' | 'selected'>;
    return (
      <Row
        {...props}
        selectable
        expandable
        onSelectedChange={() => {}}
        onExpandedChange={() => {}}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <ColumnItem
            key={i}
            header={props.type === 'title'}
            // The first stands for the five (Figma's `repeat`), checked as Figma draws it.
            data-layer={i === 0 ? 'columnItem' : undefined}
          >
            Label
          </ColumnItem>
        ))}
      </Row>
    );
  },
} satisfies VisualCase;
