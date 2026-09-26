/**
 * Options List's Playground: three sample checkbox rows (one kind of control a list), shown by the
 * `content` toggle; which are checked the `checked` extra, their words comma-separated (each
 * trimmed; words naming no row ignored), which a click on a row sets, in the rows' order. The
 * question they answer, the fieldset's legend a screen reader reads, is the `label` extra.
 */

import { OptionRow } from '../../src/OptionRow.js';
import { OptionsList } from '../../src/OptionsList.js';
import { channels } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

/** The rows a comma-separated text names, trimmed. */
const namedIn = (text: string) =>
  new Set(text.split(',').map((name) => name.trim()));

export default {
  render: (p) => {
    const checked = namedIn(p.text('checked'));
    return (
      <OptionsList label={p.text('label')}>
        {p.flag('content')
          ? channels.map((channel) => (
              <OptionRow
                key={channel}
                control="checkbox"
                checked={checked.has(channel)}
                onChange={(_, on) => {
                  const next = channels.filter((c) =>
                    c === channel ? on : checked.has(c),
                  );
                  p.set('checked', next.join(', '));
                  p.log('onChange', { [channel]: on });
                }}
              >
                {channel}
              </OptionRow>
            ))
          : null}
      </OptionsList>
    );
  },
} satisfies PlaygroundBuilder;
