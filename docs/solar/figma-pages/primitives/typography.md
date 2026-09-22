# Typography

> Verbatim text of the Figma page `Typography` (id `27:296`, section primitives, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `d11813ce6771`. Curated chapter: [06-typography.md](../../06-typography.md).

## Font Size

Font size tokens define the type scale used across the SOLAR Design System. They provide the fixed set of pixel sizes that text styles reference for display, title, body, label, helper, code, and caption text. Sizes are consumed through the size/\* variables in the Type collection, which carry Desktop and Mobile modes, so a text style resolves to the right size per platform without manual overrides. A shared size scale keeps hierarchy consistent and prevents one-off font sizes across products.

**Token**

**Value, px**

****MAJOR****

**8**

****MAJOR****

**10**

****MAJOR****

**11**

****MAJOR****

**12**

****MAJOR****

**14**

****MAJOR****

**16**

****MAJOR****

**18**

****MAJOR****

**20**

****MAJOR****

**24**

****MAJOR****

**28**

****MAJOR****

**32**

****MAJOR****

**36**

****MAJOR****

**40**

****MAJOR****

**44**

****MAJOR****

**52**

****MAJOR****

**56**

****MAJOR****

**64**

****MAJOR****

**72**

****MAJOR****

**80**

****MAJOR****

**96**

****MAJOR****

**112**

****MAJOR****

**128**

## Line Height

Line height tokens define the vertical rhythm of text. Each font size pairs with a line height that keeps multi-line text readable and aligns to the 4px spatial grid. Line heights are consumed through the line-height/\* variables in the Type collection, with Desktop and Mobile modes, alongside their matching size. Applying line height through text styles rather than manual values keeps paragraph rhythm consistent across components and layouts.

**Token**

**Value, px**

****MAJOR****

**8**

****MAJOR****

**10**

****MAJOR****

**11**

****MAJOR****

**12**

****MAJOR****

**14**

****MAJOR****

**16**

****MAJOR****

**18**

****MAJOR****

**20**

****MAJOR****

**24**

****MAJOR****

**28**

****MAJOR****

**32**

****MAJOR****

**36**

****MAJOR****

**40**

****MAJOR****

**44**

****MAJOR****

**52**

****MAJOR****

**56**

****MAJOR****

**64**

****MAJOR****

**72**

****MAJOR****

**80**

****MAJOR****

**96**

****MAJOR****

**112**

****MAJOR****

**128**

## Font Family

Font family tokens define the typefaces available in SOLAR. Display text uses Gotham, with Montserrat as the fallback; interface text uses Inter, with Open Sans as the fallback; code uses IBM Plex Mono, with Roboto Mono as the fallback. Family is fixed per text style and is not variable-bound. Products never introduce additional typefaces — a new family is a governance change.

**Token**

**Value**

****MAJOR****

**Gotham**

****MAJOR****

**Montserrat**

****MAJOR****

**Inter**

****MAJOR****

**Open Sans**

****MAJOR****

**IBM Plex Mono**

****MAJOR****

**Roboto Mono**

## Font Weight

Font weight tokens map the CSS numeric weight scale to the named styles Figma uses. SOLAR text styles use Regular (400), Medium (500), Semi Bold (600), and Bold (700); the remaining weights exist as primitives for completeness. Weight is fixed per text style and is not variable-bound. Emphasis comes from the scale and weight of the chosen text style, not from local overrides.

**Token**

**Value**

****MAJOR****

**Thin**

****MAJOR****

**Extra Light**

****MAJOR****

**Light**

****MAJOR****

**Regular**

****MAJOR****

**Medium**

****MAJOR****

**Semi Bold**

****MAJOR****

**Bold**

****MAJOR****

**Extra Bold**

****MAJOR****

**Black**

## Swatches bound to variables

Containers on this page whose fill is bound to a Figma variable, with their labels. Variable ids are local to the Foundations file; names come from [../../tokens/figma-variables.json](../../tokens/figma-variables.json).

| Labels    | Rendered  | Variable id          |
| --------- | --------- | -------------------- |
| Token     | `#f5f5f5` | `VariableID:27:723`  |
| Value, px | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| Token     | `#f5f5f5` | `VariableID:27:723`  |
| Value, px | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| Token     | `#f5f5f5` | `VariableID:27:723`  |
| Value     | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| Token     | `#f5f5f5` | `VariableID:27:723`  |
| Value     | `#f5f5f5` | `VariableID:27:723`  |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
| MAJOR     | `#00b600` | `VariableID:34:3281` |
