import oracle from '../../../../../spec/verify/tree-item.json';
import { Tag } from '../../../src/Tag.js';
import { TreeItem, type TreeItemProps } from '../../../src/TreeItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Every slot filled, so each is measured where the variant shows it: an unchecked checkbox, both
// icons probes, Figma's success dot, a status Tag, a count and both actions; editing, Figma's words
// in the rename field.
export default {
  oracle,
  render: (v) => (
    <TreeItem
      {...(v.props as Pick<TreeItemProps, 'selected' | 'expanded' | 'edit'>)}
      label="Label"
      onExpandedChange={() => {}}
      checked={false}
      onCheckedChange={() => {}}
      leadingIcon={icon}
      trailingIcon={icon}
      status="success"
      tag={
        <Tag status="success" indicator>
          Label
        </Tag>
      }
      count={3}
      onMore={() => {}}
      onAdd={() => {}}
    />
  ),
} satisfies VisualCase;
