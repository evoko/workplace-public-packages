/**
 * Tree Item's Playground: its words (the `label` extra) at the `depth` extra, its icons, state and
 * parts from their controls. Its chevron control stands for whether it has children, since the shell
 * draws its own chevron: `_none` makes it a leaf. Its checkbox, shown by the `checkbox` toggle, is
 * checked by the `checked` extra; its status a success StatusIndicator; its Tag the `tag label`
 * words; its Counter the `counter count` extra; its actions (more and add) shown by `buttons`.
 * Live as in an app's tree: a click selects it, the chevron and the arrow keys expand and collapse
 * it, the checkbox checks it, F2 starts a rename (`edit`), and Enter renames it (`label`), Escape
 * cancels; each is set and logged.
 */

import { Tag } from '../../src/Tag.js';
import { TreeItem } from '../../src/TreeItem.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const checkbox = p.child('checkbox');
    const status = p.child('status');
    const tag = p.child('tag');
    const counter = p.child('counter');
    const buttons = p.child('buttons');
    const checked = p.flag('checked');
    const count = p.whole('counter count');
    return (
      <TreeItem
        selected={p.flag('selected')}
        expanded={p.flag('expanded')}
        edit={p.flag('edit')}
        label={p.text('label')}
        depth={p.whole('depth')}
        expandable={p.icon('chevron') !== undefined}
        onExpandedChange={(expanded) => {
          p.set('expanded', expanded);
          p.log('onExpandedChange', expanded);
        }}
        onSelect={() => {
          p.set('selected', true);
          p.log('onSelect');
        }}
        checked={checkbox.shown ? checked : undefined}
        onCheckedChange={(next) => {
          p.set('checked', next);
          p.log('onCheckedChange', next);
        }}
        leadingIcon={p.icon('leadingIcon')}
        trailingIcon={p.icon('trailingIcon')}
        status={status.shown ? 'success' : undefined}
        tag={tag.shown && tag.text ? <Tag>{tag.text}</Tag> : undefined}
        count={counter.shown ? count : undefined}
        onMore={buttons.shown ? () => p.log('onMore') : undefined}
        onAdd={buttons.shown ? () => p.log('onAdd') : undefined}
        onRenameStart={() => {
          p.set('edit', true);
          p.log('onRenameStart');
        }}
        onRename={(name) => {
          p.set('label', name);
          p.set('edit', false);
          p.log('onRename', name);
        }}
        onRenameCancel={() => {
          p.set('edit', false);
          p.log('onRenameCancel');
        }}
      />
    );
  },
} satisfies PlaygroundBuilder;
