#!/usr/bin/env node
// Committed shim so npm can link the bin on a fresh install, before dist/ exists.
// The real CLI is built by tsup into dist/cli.js.
import '../dist/cli.js';
