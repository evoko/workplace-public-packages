/**
 * What a SOLAR Table tells the rows in it, and a Row the cells in it. A part takes its ARIA role
 * (table, row, cell, columnheader) only inside its parent, where the role is valid; a Row drawn
 * alone, in a story, is a box.
 *
 * Hand written. Row, RowSelect, Column Item and Table read these.
 */

import { createContext, useContext } from 'react';

/** What a Table draws in each of its rows: the select and expand cells, and at which breakpoint. */
export interface SolarTableScope {
  selectable: boolean;
  expandable: boolean;
  breakpoint: 'desktop' | 'mobile';
}

export const SolarTableContext = createContext<SolarTableScope | null>(null);

/** The Table a part is in, or null. */
export const useSolarTable = () => useContext(SolarTableContext);

/** Whether a cell is in a Row, and whether that row is the header row. */
export interface SolarRowScope {
  header: boolean;
}

export const SolarRowContext = createContext<SolarRowScope | null>(null);

/** The Row a cell is in, or null. */
export const useSolarRow = () => useContext(SolarRowContext);
