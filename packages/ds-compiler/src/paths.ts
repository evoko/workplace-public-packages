/** File and directory names inside a source root. Kept separate so entry.ts and build.ts do not import each other. */
export const IR_FILE = 'design.ir.json';
/** The source-of-truth directory. Nothing a generator writes may live here. */
export const SRC_DIR = 'src';
export const TOKENS_DIR = 'src/tokens';
export const COMPONENTS_DIR = 'src/components';
export const ENTRY_FILE = 'src/index.css';
/** Committed defaults catalogs, one `<target>.json` per opinionated target, written by `bwp-ds capture-defaults`. */
export const CATALOGS_DIR = 'catalogs';
