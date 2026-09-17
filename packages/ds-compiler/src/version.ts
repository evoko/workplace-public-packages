import { createRequire } from 'node:module';

const { version } = createRequire(import.meta.url)('../package.json') as {
  version: string;
};

/** The compiler's own package version, for --version and generated-file headers. */
export const COMPILER_VERSION: string = version;
