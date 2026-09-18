# Intermediate representation

`bwp-ds build` compiles the CSS source into `packages/styles-css/design.ir.json`.
Every target plugin reads this file, never the CSS. The TypeScript types live
in `packages/ds-compiler/src/ir/types.ts`.

## Shape

```
DesignIR
  irVersion: 1
  meta: { name, prefix, modes, defaultMode, rootFontSize, modeSelector, sourceHash }
  tokens: { [tokenId]: Token }
  components: { [name]: ComponentIR }
```

`modeSelector` is the configured selector for non-default modes with `{mode}`
as the placeholder, so generators need only the IR.

`sourceHash` is a SHA-256 over every source file (config, token files,
component CSS and manifests) sorted by path. Two builds of identical sources
produce identical files; the JSON has sorted keys and a trailing newline. All
object keys in `design.ir.json` are sorted alphabetically; only arrays carry meaningful order.

## Tokens

Token ids are dot paths with the category first: `--bwp-color-text-default`
becomes `color.text.default`.

```
Token
  $type: color | dimension | fontFamily | fontWeight | number | duration | cubicBezier | shadow
  $value: <value> when modeInvariant, else { [mode]: <value> }
  modeInvariant: boolean
  category, path, cssName
  alias?: tokenId when modeInvariant, else { [mode]: tokenId } for the modes whose source used var()
  source: { file, line, column }
```

`$type` and `$value` follow the W3C Design Tokens Community Group format so a
formatter can emit standard token JSON without an IR change. Values are
normalized:

| Type        | Value                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| color       | `{ hex: "#rrggbbaa" }`                                                                                          |
| dimension   | `{ value, unit }` with unit `px`, `rem`, `em`, or `%`                                                           |
| fontFamily  | `{ families: [...] }`                                                                                           |
| fontWeight  | `{ weight }`                                                                                                    |
| number      | `{ value }`                                                                                                     |
| duration    | `{ ms }`                                                                                                        |
| cubicBezier | `{ points: [x1, y1, x2, y2] }`                                                                                  |
| shadow      | `{ layers: [{ inset, offsetX, offsetY, blur, spread, color }] }` where color is `{ hex }` or `{ ref: tokenId }` |

Aliases are resolved: `$value` is always a concrete value. A token declared
only in `:root` that aliases a mode-varying token is itself mode-varying.

## Components

```
ComponentIR
  name, displayName, description?
  axes: { [axis]: { values, default } }
  axisOrder: string[]                         manifest key order for axes (see below)
  states: [...]                               manifest order
  slots: { [slot]: { element, optional } }    keys sorted alphabetically in the file; root is always present
  slotOrder: string[]                         manifest key order for slots, root first (see below)
  preview: { [key]: string }                  manifest verbatim
  rules: Rule[]                               in cascade order
  targets: manifest targets, verbatim
```

```
Rule
  slot: "root" | slot name
  axes: { [axis]: value }      only the axes this rule selects
  states: [...]                sorted canonically
  declarations: { [cssProperty]: IRValue }
  source: { file, line, column }
```

`axisOrder` and `slotOrder` hold the manifest key order for axes and slots
(`root` first). `design.ir.json` sorts object keys, so generators that need
authored order (the MUI shells render slots in `slotOrder`) read these
instead of the record keys.

Declarations use canonical longhand CSS property names. Shorthands from the
source are expanded. Values:

```
IRValue
  { kind: "token", ref: tokenId }
  { kind: "literal", type: "keyword" | "dimension" | "number" | "color" | "string", value }
```

Rule order is fixed by the compiler: slot order (root first, then manifest
order), fewer axes first, axis values in manifest order, fewer states first,
then canonical state order. Generators emit in this order so specificity
matches across targets.
