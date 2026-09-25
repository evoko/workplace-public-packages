import oracle from '../../../../../spec/verify/table.json';
import { ColumnItem } from '../../../src/ColumnItem.js';
import { Row, type RowProps } from '../../../src/Row.js';
import { Table, type TableProps } from '../../../src/Table.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string | undefined> };

/** The type Figma draws its first row in, in this variant. */
const firstRow = (v: OracleVariant) =>
  (v.layers?.row as ChildLayer | undefined)?.variant?.type as RowProps['type'];

/** Figma's five cells, each its words: headers in the header row; the first stands for them. */
const cells = (header: boolean) =>
  [0, 1, 2, 3, 4].map((i) => (
    <ColumnItem
      key={i}
      header={header}
      data-layer={i === 0 ? 'columnItem' : undefined}
    >
      Label
    </ColumnItem>
  ));

// Each breakpoint as Figma draws it, as wide: the header row and five rows of Figma's first row's
// type, the first standing for Figma's fifteen (its `repeat`).
export default {
  oracle,
  render: (v) => {
    const props = v.props as Pick<
      TableProps,
      'breakpoint' | 'expandable' | 'selectable'
    >;
    return (
      <Table
        {...props}
        style={{ width: props.breakpoint === 'mobile' ? 361 : 1020 }}
        header={<Row type="title">{cells(true)}</Row>}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Row
            key={i}
            type={firstRow(v)}
            data-layer={i === 0 ? 'row' : undefined}
            onExpandedChange={() => {}}
            onSelectedChange={() => {}}
          >
            {cells(false)}
          </Row>
        ))}
      </Table>
    );
  },
} satisfies VisualCase;
