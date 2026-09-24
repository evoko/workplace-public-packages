import oracle from '../../../../../spec/verify/list.json';
import { Divider } from '../../../src/Divider.js';
import { List, type ListProps } from '../../../src/List.js';
import { ListItem } from '../../../src/ListItem.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string };

/** The rows and dividers Figma draws in the variant, in its order, each with its layer. */
const held = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === 'ListItem' || l.component === 'Divider',
  );

// Figma's rows and dividers, each marked with its layer, so the list draws none of its own; every
// row's slots filled so its look is measured: an icon probe, the second line and a trailing icon.
export default {
  oracle,
  render: (v) => (
    <List {...(v.props as Pick<ListProps, 'inCard'>)} dividers={false}>
      {held(v).map(([name, l]) =>
        l.component === 'Divider' ? (
          <Divider key={name} data-layer={name} />
        ) : (
          <ListItem
            key={name}
            data-layer={name}
            icon={icon}
            helper="Supporting text"
            trailing={icon}
          >
            Label
          </ListItem>
        ),
      )}
    </List>
  ),
} satisfies VisualCase;
