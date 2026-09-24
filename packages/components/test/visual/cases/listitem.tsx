import oracle from '../../../../../spec/verify/listitem.json';
import { Avatar } from '../../../src/Avatar.js';
import { ListItem, type ListItemProps } from '../../../src/ListItem.js';
import { icon, picture } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string | undefined> };

/** The Avatar Figma draws in an avatar row: its size, as the recipe names it. */
const avatarOf = (v: OracleVariant) =>
  (v.layers?.avatar as ChildLayer | undefined)?.variant;

// Every slot filled so its look is measured: an icon probe, or the Avatar Figma draws in an avatar
// row (a logo, a picture probe), the second line and a trailing icon probe.
export default {
  oracle,
  render: (v) => {
    const props = v.props as Pick<
      ListItemProps,
      'selected' | 'disabled' | 'compact'
    >;
    // An avatar row is one given an avatar (the oracle's content).
    const avatarRow = v.content?.includes('avatar') ?? false;
    const a = avatarOf(v);
    return (
      <ListItem
        {...props}
        icon={icon}
        avatar={
          avatarRow ? (
            <Avatar
              size={a?.size as 'md'}
              type="logo"
              name="Biamp"
              src={picture}
            />
          ) : undefined
        }
        helper="Supporting text"
        trailing={icon}
      >
        Label
      </ListItem>
    );
  },
} satisfies VisualCase;
