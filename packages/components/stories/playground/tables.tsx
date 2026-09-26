/**
 * What the table Playground builders share: the sample header row's cells and a sample device's
 * cells, words alone (samples.ts), and the rows a comma-separated text names. As Flutter's
 * (widgetbook/lib/playground/tables.dart).
 */

import { ColumnItem } from '../../src/ColumnItem.js';
import { columns } from './samples.js';

/** The header row's cells: the sample columns' names. */
export const headerCells = () =>
  columns.map((name) => (
    <ColumnItem key={name} header>
      {name}
    </ColumnItem>
  ));

/** A sample device's cells, its words by column. */
export const deviceCells = (device: readonly string[]) =>
  device.map((words, i) => <ColumnItem key={columns[i]}>{words}</ColumnItem>);

/** The names a comma-separated text holds, trimmed. */
export const namedIn = (text: string) =>
  new Set(text.split(',').map((name) => name.trim()));
