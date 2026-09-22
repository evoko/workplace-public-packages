---
solar:
  reviewed: 2026-09-22
  figmaVersion: '2402047167094879156'
  sources:
    documentation/typography: 8db3b87449b6
    primitives/typography: d11813ce6771
---

# 06 · Typography

> Source: Figma pages "Visual Language › Typography" (principles, brand / app / code
> fonts, semantic typography, text styles and tokens, font weight, text color, role
> descriptions, applying text styles, golden rules, Desktop and Mobile tables) and
> "Primitives › Typography". Values verified against the Type variable collection and
> the 60 local text styles.

## Principles

| Principle                      | Meaning                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hierarchy before style**     | Typography is primarily a tool for hierarchy. Headings, body, labels and metadata are distinguishable through size, weight and spacing; style never compromises scanning. |
| **Context-aware typography**   | Text styles are designed for their usage: dense data, long-form reading, controls, glanceable UI. Tokens define these roles.                                              |
| **Legibility over aesthetics** | Size, line height, weight and contrast support comfortable reading at typical viewing distances. If a choice reduces clarity it does not belong.                          |

Typography is applied through tokens and text styles, never ad-hoc.

## Font families

| Family group | Primary / fallback          | Use for                                                                                                  | Avoid for                                                |
| ------------ | --------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Brand**    | Gotham / Montserrat         | Marketing and brand sites, campaigns, presentations, high-level branded product surfaces, large headings | Dense UI, tables, long-form reading in apps, small sizes |
| **App**      | Inter / Open Sans           | Product interfaces, forms, tables, settings, dashboards, long-form and dense content, cross-platform UI  | —                                                        |
| **Code**     | IBM Plex Mono / Roboto Mono | Tokens and variable names, hex/OKLCH/numeric values, CSS/JSON/code, technical docs, tabular system data  | UI copy, emphasis, decoration                            |

Primitive variables: `type/font-family/{gotham,montserrat,inter,opensans,ibmplexmono,robotomono}`.
In the Figma text styles, Display uses **Montserrat** (Gotham is the licensed brand
font; Montserrat is its open substitute), everything else uses **Inter**, and code uses
**IBM Plex Mono**. Family is fixed per text style and is not variable-bound; a new
typeface is a governance change, never a product choice.

## Font weight

SOLAR uses the CSS 100–900 scale. Tokens reference the number (engineering accuracy);
styles reference the token (design consistency).

| 100  | 200         | 300   | 400     | 500    | 600       | 700  | 800        | 900   |
| ---- | ----------- | ----- | ------- | ------ | --------- | ---- | ---------- | ----- |
| Thin | Extra Light | Light | Regular | Medium | Semi Bold | Bold | Extra Bold | Black |

Primitive variables: `type/font-weight/100…900` (string values are the Figma style
names, e.g. `Semi Bold`). The text styles use only Regular 400, Medium 500, Semi Bold 600
and Bold 700; the rest exist as primitives for completeness. Weight is fixed per text
style and is not variable-bound — emphasis comes from choosing another style, never from
a local override.

## Two layers: tokens define, styles apply

**Primitive type tokens** (`type/font-size/*`, `type/line-height/*`): 8, 10, 11, 12,
14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 64, 72, 80, 96, 112, 128 px.

**Semantic type tokens** (Type collection, modes **Desktop | Mobile**): `size/{role}/{size}`
and `line-height/{role}/{size}`, 41 variables in all. This is the only place responsive
typography lives; switching the collection mode changes every bound text style. Only size
and line height are variable-bound — family, weight and letter spacing are baked into the
text style.

**Text styles** compose family + weight + size + line height + letter spacing into a
named role. The chapter refers to them as `font.desktop.body.md.regular` /
`font.mobile.body.md.regular`; in Figma they are single styles named
`body/md/regular` whose size and line height follow the Type collection mode.

Semantic text styles are formally owned by SOLAR Web and SOLAR Native (Foundations
defines the primitives), but the Foundations file ships the canonical set below.

## Type roles

| Role        | Purpose                                                                    | Typical use                                                         |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Display** | High-impact, brand-expressive text; establishes strong presence            | Hero sections, major product moments, large marketing statements    |
| **Title**   | Structures content and defines hierarchy within interfaces                 | Section headers, card titles, dialog headers, page hierarchy        |
| **Body**    | Readability and sustained interaction; the foundation of most interfaces   | Paragraphs, descriptions, table content, system messages            |
| **Label**   | Concise, contextual identification                                         | Form field labels, control identifiers, micro-headings, descriptors |
| **Helper**  | Supportive guidance that does not compete for attention                    | Form assistance, non-critical validation hints, supplementary copy  |
| **Code**    | Technical precision; distinguishes system values from interface text       | Inline code, identifiers, tokens, developer-facing UI               |
| **Link**    | Inline interactive text with underline affordance and color shift on hover | Navigation and inline actions, not buttons or emphasis              |
| **Caption** | Smallest supporting text, below helper in the hierarchy                    | Image captions, footnotes, dense annotations                        |

## Type scale (Desktop mode)

Values: size / line height in px (rem at 16 px base), letter spacing in em.

| Style                                    | Family        | Weight  | Desktop size / lh    | Mobile size / lh | Letter spacing | Use case                                                   |
| ---------------------------------------- | ------------- | ------- | -------------------- | ---------------- | -------------- | ---------------------------------------------------------- |
| `display/lg`                             | Montserrat    | 500     | 56 / 72              | 40 / 52          | −0.03em        | Hero headlines                                             |
| `display/md`                             | Montserrat    | 500     | 40 / 52              | 32 / 40          | −0.03em        | Section headers                                            |
| `display/sm`                             | Montserrat    | 500     | 32 / 40              | 24 / 32          | −0.03em        | Supporting display text                                    |
| `display/xs/medium`                      | Montserrat    | 500     | 16 / 20              | 16 / 20          | −0.02em        | Compact display                                            |
| `display/xs/semibold`                    | Montserrat    | 600     | 16 / 20              | 16 / 20          | −0.02em        | Compact display                                            |
| `title/lg`                               | Inter         | 500     | 40 / 48              | 32 / 40          | −0.03em        | Page titles                                                |
| `title/md`                               | Inter         | 500     | 32 / 40              | 24 / 32          | −0.03em        | Section titles                                             |
| `title/sm`                               | Inter         | 500     | 20 / 28              | 18 / 24          | −0.03em        | Card titles                                                |
| `title/xs`                               | Inter         | 500     | 16 / 24              | 16 / 24          | −0.03em        | Compact section headers                                    |
| `title/2xs`                              | Inter         | 500     | 12 / 16              | 12 / 16          | **+0.08em**    | Overline / eyebrow label (pair with `color.text.tertiary`) |
| `body/lg/{regular,medium,semibold,bold}` | Inter         | 400–700 | 16 / 24              | 16 / 24          | −0.02em        | Default paragraph and emphasis levels                      |
| `body/md/*`                              | Inter         | 400–700 | 14 / 20              | 14 / 20          | −0.02em        | Secondary paragraph                                        |
| `body/sm/*`                              | Inter         | 400–700 | 12 / 16              | 12 / 16          | −0.02em        | Tertiary paragraph                                         |
| `body/xs/*`                              | Inter         | 400–700 | 10 / 14              | 10 / 14          | −0.02em        | Dense metadata                                             |
| `body/2xs/*`                             | Inter         | 400–700 | 8 / 12               | 8 / 12           | −0.02em        | Smallest body                                              |
| `label/md`                               | Inter         | 500     | 14 / 20              | 14 / 20          | −0.02em        | Default form labels                                        |
| `label/sm`                               | Inter         | 500     | 12 / 16              | 12 / 16          | −0.02em        | Compact form labels                                        |
| `helper/md`                              | Inter         | 400     | 14 / 20              | 14 / 20          | −0.02em        | Field descriptions, validation                             |
| `helper/sm`                              | Inter         | 400     | 12 / 16              | 12 / 16          | −0.02em        | Compact metadata                                           |
| `code/lg`                                | IBM Plex Mono | 500     | 16 / 20              | 14 / 20          | −0.01em        | Code blocks, tokens                                        |
| `code/md`                                | IBM Plex Mono | 500     | 14 / 16              | 12 / 16          | −0.01em        | Inline code                                                |
| `link/{lg,md,sm,xs,2xs}/{default,hover}` | Inter         | 500     | as body of same size | as body          | −0.02em        | Inline links                                               |
| `caption/xs`                             | Inter         | 400     | 10 / 14              | 10 / 14          | −0.02em        | Image captions, footnotes                                  |

Body weights: `regular` 400 (default), `medium` 500 (emphasis), `semibold` 600 (strong
emphasis), `bold` 700 (high emphasis).

Only Display, Title and Code change size between Desktop and Mobile; Body, Label,
Helper, Link and Caption are identical in both modes.

Detail from the Figma styles: `body/md/*`, `link/md/*` and `display/xs/*` store letter
spacing as a fixed −0.32 px rather than −2 %; the documentation tables say −2 % for all
of them. Treat −0.02em as the intended value.

The file also contains 13 `.[utility]/…` styles (H1–H5, Body M/S, Code M/S, Caption).
These are internal utility styles used by the documentation slides themselves and are
not part of the product ramp.

## Text color

Text color is never a raw hex. Text uses `color.text.*` semantic tokens, which map to
different palette steps per mode (see [05-color.md](05-color.md#text)). Rule: apply the
semantic role (primary/secondary/…); theme mapping handles the rest.

The Typography page's own "Text Color" table agrees with the variables: `text.primary`
neutral/900 | neutral/50, `text.secondary` neutral/500 | neutral/300, `text.tertiary`
neutral/300 | neutral/500, `text.disabled` alpha/black-20 | alpha/white-20,
`text.inverse` brand/white | neutral/900. Feedback text carries the `feedback` segment:
`color.text.feedback.success` green/600 | green/400, `.warning` orange/600 | orange/400,
`.danger` red/600 | red/300, `.info` turquoise/700 | turquoise/400. There is no
`color.text.success`, `.warning`, `.danger` or `.info` without it.

## Applying text styles

- Always use a SOLAR text style (Display, Title, Body, Label, Helper, Code, Link,
  Caption). Never construct typography manually.
- Do not override font size, weight, or letter spacing locally.
- Do not apply raw color values; use semantic text color tokens.
- Use Desktop or Mobile variants as defined (the Type collection mode).
- If a use case does not fit an existing style, propose a system update; do not
  create a one-off.

## Golden rules

1. **Avoid Display overuse.** Display anchors hierarchy (hero moments, major headings).
   If it appears repeatedly in UI layouts it is being misused.
2. **Always use text styles, never raw values.** Styles are connected to semantic
   variables and primitives.
3. **Maintain accessible contrast** in both modes; never override text color outside
   semantic tokens.
4. **Respect hierarchy before adding emphasis.** Scale and weight first. Do not stack
   bold + color + uppercase + tracking.
5. **Keep spacing proportional.** Vertical rhythm (stack tokens) must support the text
   scale.
6. **Optimize for readability, not density.** Healthy line-height ratios ≈ 1.25–1.4.
7. **Code styles are functional, not decorative.** Monospace only for technical meaning.
8. **Use Label and Helper intentionally.** Label = input context; Helper = supportive or
   validation guidance. Neither is a smaller body substitute.

## CSS mapping

| Figma                                         | Documentation                                                     | CSS                                        |
| --------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| Type › `size/body/md` (Desktop 14, Mobile 14) | `typography.font-size.body.md` or `font.{desktop,mobile}.body.md` | `--solar-type-size-body-md` (mode-swapped) |
| Type › `line-height/title/lg` (48 / 40)       | —                                                                 | `--solar-type-line-height-title-lg`        |
| Primitives › `type/font-family/inter`         | `typography.font-family.inter`                                    | `--solar-type-font-family-inter`           |
| Primitives › `type/font-weight/500`           | `typography.font-weight.500`                                      | `--solar-type-font-weight-500`             |

The exact CSS property naming for typography has not been finalised in the source; the
`--solar-` prefix rule and the Figma path are fixed, so the names above follow the
contract mechanically. Desktop/Mobile switching is expected to be a media-query
reassignment of the size and line-height properties at the tablet boundary, mirroring
how Light/Dark reassigns color.
