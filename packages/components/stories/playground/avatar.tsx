/**
 * Avatar's Playground: its size, type and colour (none, SOLAR's neutral avatar, at first); named by
 * the `name` extra, whose initials it shows unless `initials` holds the app's own; a photo or logo
 * avatar shows the sample picture while `picture` is on.
 */

import { Avatar, type AvatarProps } from '../../src/Avatar.js';
import { picture } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const color = p.value('color');
    return (
      <Avatar
        size={p.choice<NonNullable<AvatarProps['size']>>('size')}
        type={p.choice<NonNullable<AvatarProps['type']>>('type')}
        color={typeof color === 'string' ? color : undefined}
        name={p.text('name')}
        src={p.flag('picture') ? picture : undefined}
      >
        {p.words('initials')}
      </Avatar>
    );
  },
} satisfies PlaygroundBuilder;
