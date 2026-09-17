# Verification

What checks exist today, what each one proves, and how to read its output.
The full verification design is section 10 of the spec; steps arrive with the
plans that add the pieces they check.

## Today

| Command                                                  | Proves                                                                                                                                                       | Needs   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `bwp-ds lint`                                            | Every authoring rule holds: config, token structure and values, aliases, manifests, selector grammar, property table, no TODO leftovers, entry file current. | Node 22 |
| `bwp-ds build`                                           | Lint plus a complete IR was produced and written, and `src/index.css` is regenerated.                                                                        | Node 22 |
| `npm run test`                                           | The compiler behaves as specified, including one deliberately invalid input per error code.                                                                  | Node 22 |
| CI "Check generated files are up to date"                | The committed `design.ir.json` and `src/index.css` equal a fresh build.                                                                                      | CI      |
| CI `npm run lint`, `npm run typecheck`, `npm run format` | Every package's ESLint, TypeScript, and Prettier checks pass.                                                                                                | CI      |

## Reading a diagnostic

```
src/components/button/button.css:14:3 error DS-E041 Token required: "color: #fff" must reference a color token (or one of: transparent, currentColor, inherit)
  hint: This property must reference a token: var(--<prefix>-<category>-…). If no token fits, add one to the category file first.
```

File, line, column, severity, code, title, message, then the fix hint. The CLI
prints errors to stderr and warnings plus the summary to stdout, sorted by
file, line, and column. With `--json`, `lint` and `build` print one object to
stdout: `diagnostics` (same order), `summary`, and for `build` the `wrote` and
`entry` paths. `scaffold --json` prints `{ "wrote": [...] }` or
`{ "error": "..." }`; if the config cannot be loaded it prints the
`diagnostics` object instead.

## From a symptom to the code

- "This value is wrong in target X" and the CSS is right: the target plugin's
  handler for that property (`packages/ds-compiler/src/targets/<x>/…`, from
  Plan 2 on).
- "This value is wrong everywhere": the source CSS, or the IR normalization in
  `packages/ds-compiler/src/tokens/values.ts` and
  `src/components/parse-component.ts`.
- "Lint rejects something valid": the rule in `src/tokens/parse-tokens.ts`,
  `src/tokens/resolve-tokens.ts`, `src/components/selector.ts`, or
  `src/components/properties.ts`, in that order of likelihood.

## Planned steps

| Step                       | Plan | Proves                                                                                                 |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------ |
| `bwp-ds verify` drift      | 2    | Regenerating every target produces no diff against committed output.                                   |
| `bwp-ds verify` roundtrip  | 2    | Each target's output re-parses to the source IR.                                                       |
| `bwp-ds verify` coverage   | 2    | Every component is supported, partial with listed ignores, or excluded with a reason for every target. |
| `bwp-ds verify --rendered` | 4    | Computed styles match across web targets in a browser.                                                 |
| Flutter checks             | 5    | `dart analyze`, `dart format --set-exit-if-changed`, `dart test` when the SDK is present.              |
