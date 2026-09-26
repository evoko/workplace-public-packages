/**
 * FileUpload's Playground: its files the `files` extra, their names, comma-separated (each trimmed,
 * empty ones dropped), which choosing a file sets: Browse and replace open the browser's own file
 * picker, and a file may be dropped on the zone, as in an app; remove empties it. Every change is
 * logged with the files' names. A name from the panel stands for a file of that name, empty. Its
 * label the `label` extra (Figma's "Upload a file"), a cleared one left out; mandatory while
 * `mandatory` holds any text, as Text Input's; its helper and states from their controls.
 */

import { FileUpload } from '../../src/FileUpload.js';
import type { PlaygroundBuilder } from './types.js';

/** The names a comma-separated text holds, trimmed, the empty ones dropped. */
const namesOf = (text: string) =>
  text
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

export default {
  render: (p) => (
    <FileUpload
      error={p.flag('error')}
      disabled={p.flag('disabled')}
      label={p.words('label')}
      mandatory={p.words('mandatory') !== undefined}
      helper={p.words('helper')}
      value={namesOf(p.text('files')).map((name) => new File([], name))}
      onChange={(files) => {
        const names = files.map((file) => file.name);
        p.set('files', names.join(', '));
        p.log('onChange', names);
      }}
    />
  ),
} satisfies PlaygroundBuilder;
