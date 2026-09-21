# Typography

> Verbatim text of the Figma page `Typography` (id `763:51711`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `f6bd55d8994b`. Curated chapter: [06-typography.md](../../06-typography.md).

## Slide 1

### Visual Language Typography

## Typography Principles

#### Typography in SOLAR is not decorative. It communicates hierarchy, meaning, and readability, and must be applied through tokens — not ad-hoc styles. If a typographic choice cannot be justified by purpose or structure, it does not belong.

##### Hierarchy before style

##### Context-aware typography

##### Legibility over aesthetics

Typography is primarily a tool for hierarchy. Headings, body text, labels, and metadata must be clearly distinguishable through size, weight, and spacing. Visual style should never compromise clarity of structure or scanning behavior.

Typography must adapt to context. Text styles are designed with their usage in mind—dense data views, long-form reading, controls, or glanceable UI. Tokens define these roles so typography remains appropriate across platforms, layouts, and environments.

Readability and legibility take precedence over visual expression. Font size, line height, weight, and contrast must support comfortable reading at typical viewing distances and lighting conditions. If a typographic choice reduces clarity, it does not belong in the system.

## Brand Fonts

01

#### Gotham and Montserrat are SOLAR’s brand fonts. They express Biamp’s personality and are primarily used in brand-led contexts where identity and tone matter more than density or long-form readability.

Brand fonts are designed to create recognition and emotional consistency across marketing and brand-facing touchpoints, not to solve complex UI or data-heavy scenarios.

Use brand fonts for:\
Marketing and brand websites\
Campaigns, presentations, and storytelling content\
High-level product surfaces where branding is the primary goal\
Large headings and short-form copy

Avoid using brand fonts for:\
Dense UI, tables, or data-heavy views\
Long-form reading inside applications\
Small text sizes or complex interaction-heavy layouts

- Gotham
- 02
- Montserrat

## App Fonts

01

#### Inter and Open Sans are SOLAR’s application fonts. They are optimized for legibility, clarity, and consistency across platforms, devices, and resolutions. App fonts prioritize usability over expression and are designed to perform well in real product environments.

These fonts are the default choice for interfaces where users read, scan, and interact for extended periods of time.

Use app fonts for:\
Product interfaces and applications\
Forms, tables, settings, and dashboards\
Long-form reading and dense information\
Responsive and cross-platform UI

Why app fonts:\
High legibility at small sizes\
Strong hinting and screen optimization\
Broad language and symbol support\
Reliable rendering across platforms

- Inter
- 02
- Open Sans

## Code Fonts

01

#### IBM Plex Mono and Roboto Mono are SOLAR’s code fonts. They are optimized for precision, character distinction, and alignment when displaying structured and technical content. Code fonts prioritize clarity of values over visual expression and are designed to support implementation, documentation, and developer workflows.

These fonts are the default choice for environments where tokens, variables, and code need to be displayed accurately and consistently.

Use code fonts for:\
Design tokens and variable names\
Hex, OKLCH, and numeric values\
CSS, JSON, and code snippets\
Technical documentation\
Tabular system data

Why code fonts:\
Monospaced alignment for structured content\
Clear differentiation between similar characters (1 / l / I / 0 / O)\
Improved readability of numeric and symbolic data\
Consistent rendering across technical environment

- IBM Plex Mono
- 02
- Roboto Mono

## Semantic Typography

_[image: Table Container]_

#### Semantic typography styles are defined in SOLAR Web and SOLAR Native rather than in SOLAR Foundations. They translate typography tokens into meaningful interface roles such as titles, body text, labels, and helper text.

SOLAR Foundations defines the primitive typography tokens — font families, scale, weights, spacing, and other atomic values. SOLAR Web, SOLAR Native, and domain libraries use these primitives to build semantic text styles that reflect how typography is used in real interfaces.

Each library defines its own semantic styles to match its component patterns and interaction contexts. All styles reference the same foundational tokens, ensuring typographic consistency across the entire SOLAR ecosystem while allowing platform- and domain-specific implementation.

## Text Styles and Tokens

#### In SOLAR, typography is structured in two layers: tokens define the system, and styles apply the system. This separation ensures scalability, responsive behavior (Desktop/Mobile), and alignment between design and engineering.

Typography tokens are atomic variables:\
Scale (rem-like sizes)\
Font family\
Font weight\
Letter spacing (%)

Tokens define the rules.

Typography styles combine these tokens into structured patterns such as:\
desktop.display.lg (\*.md, \*.sm, \*x-sm)\
mobile.title.lg (\*.md, \*.sm, \*x-sm)\
desktop.body.md.regular (\*.medium, \*.semibold, \*.bold)

Each size (lg, md, sm) references different scale tokens while preserving consistent weight and spacing logic.

Tokens create consistency.\
Styles + sizes create hierarchy and flexibility.

_[image: Screenshot 2026-02-24 at 13.42.22 1]_

## Font Weight

#### Font weight in SOLAR is defined using standardized numeric values that map to human-readable names. This ensures clarity in design, consistency in implementation, and alignment with web standards.

SOLAR uses the standard CSS font-weight scale from 100 to 900.\
Each numeric value corresponds to a commonly recognized weight name:\
100 — Thin\
200 — Extra Light\
300 — Light\
400 — Regular\
500 — Medium\
600 — Semibold\
700 — Bold\
800 — Extra Bold\
900 — Black

The numbers are the technical reference used in code (CSS font-weight).\
The names are the semantic reference used in design discussions and documentation.

In SOLAR:\
Tokens reference the numeric value (for engineering accuracy)\
Styles reference the token (for design consistency)

This keeps typography aligned across Figma, tokens, and frontend implementation.

_[image: Screenshot 2026-02-23 at 10.39.00 1]_

## Text Color

#### Text color in SOLAR is applied through semantic text tokens that map to different palette steps in Light and Dark mode. This keeps meaning consistent (primary, secondary, danger, etc.) while automatically adapting contrast per theme.

Font color is never set as raw HEX. Text styles reference color.text.\* tokens, which map like this:\
color.text.primary → Light: color/neutral/900 · Dark: color/neutral/50\
color.text.secondary → Light: color/neutral/500 · Dark: color/neutral/500\
color.text.tertiary → Light: color/neutral/300 · Dark: color/neutral/700\
color.text.disabled → Light: color/mono/black-alpha-40 · Dark: color/mono/white-alpha-40\
color.text.inverse → Light: color/neutral/50 · Dark: color/neutral/900

Feedback text:\
color.text.success → Light: color/green/700 · Dark: color/green/300\
color.text.warning → Light: color/orange/700 · Dark: color/orange/300\
color.text.danger → Light: color/red/700 · Dark: color/red/300\
color.text.info → Light: color/blue/700 · Dark: color/blue/300

Rule: Apply semantic text tokens (primary/secondary/etc.) — theme mapping handles the rest.

_[image: Screenshot 2026-02-23 at 10.43.20 1]_

## Display

#### Display styles are used for high-impact, large-scale text that establishes strong visual presence and brand expression.

Display is used for:\
Hero sections\
Major product moments\
Large marketing statements

Characteristics:\
Largest scale tokens\
Strong weight contrast (often Semibold or Bold)\
Tight, controlled letter spacing\
Optimized separately for Desktop and Mobile

Display creates emphasis and first impression.

_[image: Screenshot 2026-02-25 at 11.21.46 1]_

_[image: Screenshot 2026-02-25 at 11.22.31 1]_

## Title

#### Title styles structure content and define hierarchy within interfaces. They guide users through sections, panels, and grouped information.

Title is used for:\
Section headers\
Card titles\
Dialog headers\
Structured page hierarchy

Characteristics:\
Mid-to-large scale tokens\
Medium or Semibold weight\
Balanced letter spacing for readability\
Responsive Desktop/Mobile variants

Titles create structure and navigational clarity.

_[image: Screenshot 2026-02-25 at 12.03.27 1]_

_[image: Screenshot 2026-02-25 at 14.03.27 1]_

## Body

#### Body styles are designed for readability and sustained interaction. They form the foundation of most product interfaces.

Body is used for:\
Paragraphs and descriptions\
Form labels and helper text\
Table content\
System messages

Characteristics:\
Moderate scale tokens\
Regular or Medium weight\
Comfortable line-height\
Optimized for long-form readability

Body prioritizes clarity, accessibility, and functional communication.

_[image: Screenshot 2026-02-25 at 14.04.58 1]_

_[image: Image]_

## Label

#### Label styles are designed for concise, contextual identification. They support inputs, controls, and UI elements where clarity and hierarchy matter more than volume.

Label is used for:\
Form field labels\
Control identifiers (toggles, checkboxes, radios)\
Section micro-headings inside components\
Compact UI descriptors

Characteristics:\
Slightly smaller than body scale\
Medium weight for clarity\
Tighter line-height\
Optimized for quick scanning

Label prioritizes precision, hierarchy, and structural clarity.

_[image: Screenshot 2026-02-25 at 14.11.06 1]_

_[image: Screenshot 2026-02-25 at 14.11.38 1]_

## Helper

#### Helper styles are designed for supportive guidance. They provide contextual information that enhances understanding without competing for attention.

Helper is used for:\
Form assistance text\
Validation hints (non-critical)\
Secondary explanatory copy\
Supplementary UI guidance

Characteristics:\
Small scale tokens\
Medium weight\
Comfortable but compact line-height\
Lower visual emphasis than body

Helper prioritizes subtlety, clarity, and supportive communication.

_[image: Screenshot 2026-02-25 at 14.15.30 1]_

_[image: Screenshot 2026-02-25 at 14.16.19 1]_

## Code

#### Code styles are designed for technical precision. They distinguish system values, identifiers, and machine-readable content from standard interface text.

Code is used for:\
Inline code references\
Technical identifiers and tokens\
System values and variables\
Developer-facing UI contexts

Characteristics:\
Monospace typeface\
Consistent character width\
Clear differentiation from body text\
Optimized for legibility of symbols and numbers

Code prioritizes accuracy, distinction, and technical clarity.

_[image: Screenshot 2026-02-25 at 14.17.50 1]_

_[image: Screenshot 2026-02-25 at 14.19.09 1]_

## Applying Text Styles

_[image: Screenshot 2026-02-25 at 12.02.30 1]_

#### Text styles in SOLAR must always be applied through predefined styles — never constructed manually. This ensures consistency, accessibility, and alignment between design and engineering.

When applying typography:\
Always use a SOLAR text style (Display, Title, Body, Label, Code)\
Do not override font size, weight, or letter spacing locally\
Do not apply raw color values — use semantic text color tokens\
Use Desktop or Mobile variants as defined

Text styles already combine:\
Scale tokens\
Font family tokens\
Weight tokens\
Letter-spacing tokens

If a use case doesn’t fit an existing style, propose a system update — do not create a one-off.

Consistency in application protects the integrity of the system.

## Golden Rules

##### Always use Text Styles — never raw values

##### Respect hierarchy before adding emphasis

##### Optimize for readability, not density

##### Use Label and Helper intentionally

Text styles are connected to semantic variables and primitives. Avoid manual font sizes, weights, or line-heights in components.

Use scale and weight first. Avoid stacking multiple emphasis methods (bold + color + uppercase + tracking).

Body and helper text must prioritize comfort over compression. Maintain healthy line-height ratios (≈1.25–1.4 depending on size).

Label = input context. Helper = supportive or validation guidance. Do not use them as smaller body substitutes.

##### Avoid Display overuse

##### Maintain accessible contrast

##### Keep spacing proportional

##### Code styles are functional, not decorative

Display styles are for anchoring hierarchy (hero moments, major headings). If Display appears repeatedly in UI layouts, it is being misused.

Text tokens must meet WCAG contrast requirements in both light and dark modes. Never override text color outside semantic tokens.

Vertical rhythm (stack tokens) must support text scale.\
Spacing should feel structurally aligned with typography scale.

Use monospace only for technical meaning (IDs, values, snippets). Never mix code typography into UI copy.

## Slide 18

#### Display

Use display typography only when you need to create strong emphasis or anchor attention at the top of a hierarchy. It is intended for hero headings and key moments, not for navigation, dense layouts, or repeated UI patterns. If display type appears more than occasionally, it is being overused.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- display.lg
- font.desktop.display.lg
- Gotham / Montserrat
- Medium / 500
- 3.5rem / 56px
- 4.5rem / 72px
- -0.03em / -3%
- Hero headlines
- display.md
- font.desktop.display.md
- Gotham / Montserrat
- Medium / 500
- 2.5rem / 40px
- 3.25rem / 52px
- -0.03em / -3%
- Section headers
- display.sm
- font.desktop.display.sm
- Gotham / Montserrat
- Medium / 500
- 2rem / 32px
- 2.5rem / 40px
- -0.03em / -3%
- Supporting display text
- display.xs.medium
- font.desktop.display.xs.medium
- Gotham / Montserrat
- Medium / 500
- 1rem / 16px
- 1.25rem / 20px
- -0.02em / -2%
- Compact display
- display.xs.semibold
- font.desktop.display.xs.semibold
- Gotham / Montserrat
- Semibold / 600
- 1rem / 16px
- 1.25rem / 20px
- -0.02em / -2%
- Compact display

#### Title

Use title typography to establish clear structure within a page or section. It is intended for headings that introduce content blocks and guide scanning, not for decoration or emphasis. Titles should create hierarchy without competing with display typography.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- title.lg
- font.desktop.title.lg
- Inter / Open Sans
- Medium / 500
- 2.5rem / 40px
- 3rem / 48px
- -0.03em / -3%
- Page titles
- title.md
- font.desktop.title.md
- Inter / Open Sans
- Medium / 500
- 2rem / 32px
- 2.5rem / 40px
- -0.03em / -3%
- Section titles
- title.sm
- font.desktop.title.sm
- Inter / Open Sans
- Medium / 500
- 1.25rem / 20px
- 1.75rem / 28px
- -0.03em / -3%
- Card titles
- title.xs
- font.desktop.title.xs
- Inter / Open Sans
- Medium / 500
- 1rem / 16px
- 1.5rem / 24px
- -0.03em / -3%
- Compact section headers
- title.2xs
- font.desktop.title.2xs
- Inter / Open Sans
- Medium / 500
- 0.75rem / 12px
- 1rem / 16px
- 0.08em / 8%
- Overline / eyebrow label

#### Body

Use body typography for all long-form and functional content. It is optimized for readability, density, and sustained interaction across contexts such as forms, tables, and content-heavy views. If users need to read it, scan it, or rely on it, body text is the correct choice.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- body.lg.regular
- font.desktop.body.lg.regular
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Default paragraph
- body.lg.medium
- font.desktop.body.lg.medium
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Emphasis
- body.lg.semibold
- font.desktop.body.lg.semibold
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Strong emphasis
- body.lg.bold
- font.desktop.body.lg.bold
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- High emphasis
- body.md.regular
- font.desktop.body.md.regular
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Secondary paragraph
- body.md.medium
- font.desktop.body.md.medium
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Emphasis
- body.md.semibold
- font.desktop.body.md.semibold
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Strong emphasis
- body.md.bold
- font.desktop.body.md.bold
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- High emphasis
- body.sm.regular
- font.desktop.body.sm.regular
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Tertiary paragraph
- body.sm.medium
- font.desktop.body.sm.medium
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Emphasis
- body.sm.semibold
- font.desktop.body.sm.semibold
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Strong emphasis
- body.sm.bold
- font.desktop.body.sm.bold
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- High emphasis
- body.xs.regular
- font.desktop.body.xs.regular
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Default paragraph
- body.xs.medium
- font.desktop.body.xs.medium
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Emphasis
- body.xs.semibold
- font.desktop.body.xs.semibold
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Strong emphasis
- body.xs.bold
- font.desktop.body.xs.bold
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- High emphasis
- body.2xs.regular
- font.desktop.body.2xs.regular
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Default paragraph
- body.2xs.medium
- font.desktop.body.2xs.medium
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Emphasis
- body.2xs.semibold
- font.desktop.body.2xs.semibold
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Strong emphasis
- body.2xs.bold
- font.desktop.body.2xs.bold
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- High emphasis

#### Label

Use label typography to define structure and clarify relationships between controls and content. Labels identify inputs, toggles, filters, and grouped UI elements — they are functional, not expressive. Labels should remain concise and scannable. They are not headings, promotional text, or descriptive copy. If a label requires a sentence, it is likely helper text instead.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- label.md
- font.desktop.label.md
- Inter / Open Sans
- Medium / 500
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Default form labels
- label.sm
- font.desktop.label.sm
- Inter / Open Sans
- Medium / 500
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Compact form labels

#### Helper

Use helper typography to provide supporting context, guidance, or validation beneath primary UI elements. Helper text explains how something works, why input is required, or what an error means. It should support decision-making without competing for attention. Helper text is secondary by definition — if it becomes visually dominant, hierarchy is broken.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- helper.md
- font.desktop.helper.md
- Inter / Open Sans
- Regular / 400
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Field descriptions, validation text
- helper.sm
- font.desktop.helper.sm
- Inter / Open Sans
- Regular / 400
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Compact metadata, dense layouts

#### Code

Use code typography exclusively for technical content such as tokens, variables, snippets, commands, and system references. Code type preserves alignment and character clarity in contexts where precision matters. It is not a stylistic alternative to body text and should never be used for emphasis or decoration. If the content is readable as normal prose, it should not use code typography.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- code.lg
- font.desktop.code.lg

IBM Plex Mono /\
Roboto Mono

- Medium / 500
- 1rem / 16px
- 1.25rem / 20px
- -0.01em / -1%
- Code blocks, tokens
- code.md
- font.desktop.code.md

IBM Plex Mono /\
Roboto Mono

- Medium / 500
- 0.875rem / 14px
- 1rem / 16px
- -0.01em / -1%
- Inline code

#### Link

Use link typography for interactive text that navigates or triggers an action inline. Links inherit body sizing with a medium weight, and gain an underline affordance and color shift on hover. Reserve links for navigation and inline actions — not for buttons or emphasis.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- link.lg.default
- font.desktop.link.lg.default
- Inter / Open Sans
- Medium / 500
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Inline links in large body text
- link.md.default
- font.desktop.link.md.default
- Inter / Open Sans
- Medium / 500
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Default inline links
- link.sm.default
- font.desktop.link.sm.default
- Inter / Open Sans
- Medium / 500
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Compact inline links
- link.xs.default
- font.desktop.link.xs.default
- Inter / Open Sans
- Medium / 500
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Dense metadata links
- link.2xs.default
- font.desktop.link.2xs.default
- Inter / Open Sans
- Medium / 500
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Smallest inline links

#### Caption

Use caption typography for the smallest supporting text — image captions, footnotes, and dense annotations. It sits at the bottom of the type hierarchy, below helper text. Keep captions short; never use them for primary content.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- caption.xs
- font.desktop.caption.xs
- Inter / Open Sans
- Regular / 400
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Image captions, footnotes

## Slide 19

#### Display

Use display typography only when you need to create strong emphasis or anchor attention at the top of a hierarchy. It is intended for hero headings and key moments, not for navigation, dense layouts, or repeated UI patterns. If display type appears more than occasionally, it is being overused.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- display.lg
- font.mobile.display.lg
- Gotham / Montserrat
- Medium / 500
- 2.5rem / 40px
- 3.25rem / 52px
- -0.03em / -3%
- Hero headlines
- display.md
- font.mobile.display.md
- Gotham / Montserrat
- Medium / 500
- 2rem / 32px
- 2.5rem / 40px
- -0.03em / -3%
- Section headers
- display.sm
- font.mobile.display.sm
- Gotham / Montserrat
- Medium / 500
- 1.5rem / 24px
- 2rem / 32px
- -0.03em / -3%
- Supporting display text
- display.xs.medium
- font.mobile.display.xs.medium
- Gotham / Montserrat
- Medium / 500
- 1rem / 16px
- 1.25rem / 20px
- -0.02em / -2%
- Compact display
- display.xs.semibold
- font.mobile.display.xs.semibold
- Gotham / Montserrat
- Semibold / 600
- 1rem / 16px
- 1.25rem / 20px
- -0.02em / -2%
- Compact display

#### Title

Use title typography to establish clear structure within a page or section. It is intended for headings that introduce content blocks and guide scanning, not for decoration or emphasis. Titles should create hierarchy without competing with display typography.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- title.lg
- font.mobile.title.lg
- Inter / Open Sans
- Medium / 500
- 2rem / 32px
- 2.5rem / 40px
- -0.03em / -3%
- Page titles
- title.md
- font.mobile.title.md
- Inter / Open Sans
- Medium / 500
- 1.5rem / 24px
- 2rem / 32px
- -0.03em / -3%
- Section titles
- title.sm
- font.mobile.title.sm
- Inter / Open Sans
- Medium / 500
- 1.125rem / 18px
- 1.5rem / 24px
- -0.03em / -3%
- Card titles
- title.xs
- font.mobile.title.xs
- Inter / Open Sans
- Medium / 500
- 1rem / 16px
- 1.5rem / 24px
- -0.03em / -3%
- Compact section headers
- title.2xs
- font.mobile.title.2xs
- Inter / Open Sans
- Medium / 500
- 0.75rem / 12px
- 1rem / 16px
- 0.08em / 8%
- Overline / eyebrow label

#### Body

Use body typography for all long-form and functional content. It is optimized for readability, density, and sustained interaction across contexts such as forms, tables, and content-heavy views. If users need to read it, scan it, or rely on it, body text is the correct choice.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- body.lg.regular
- font.mobile.body.lg.regular
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Default paragraph
- body.lg.medium
- font.mobile.body.lg.medium
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Emphasis
- body.lg.semibold
- font.mobile.body.lg.semibold
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Strong emphasis
- body.lg.bold
- font.mobile.body.lg.bold
- Inter / Open Sans
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- High emphasis
- body.md.regular
- font.mobile.body.md.regular
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Secondary paragraph
- body.md.medium
- font.mobile.body.md.medium
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Emphasis
- body.md.semibold
- font.mobile.body.md.semibold
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Strong emphasis
- body.md.bold
- font.mobile.body.md.bold
- Inter / Open Sans
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- High emphasis
- body.sm.regular
- font.mobile.body.sm.regular
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Tertiary paragraph
- body.sm.medium
- font.mobile.body.sm.medium
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Emphasis
- body.sm.semibold
- font.mobile.body.sm.semibold
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Strong emphasis
- body.sm.bold
- font.mobile.body.sm.bold
- Inter / Open Sans
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- High emphasis
- body.xs.regular
- font.mobile.body.xs.regular
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Default paragraph
- body.xs.medium
- font.mobile.body.xs.medium
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Emphasis
- body.xs.semibold
- font.mobile.body.xs.semibold
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Strong emphasis
- body.xs.bold
- font.mobile.body.xs.bold
- Inter / Open Sans
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- High emphasis
- body.2xs.regular
- font.mobile.body.2xs.regular
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Default paragraph
- body.2xs.medium
- font.mobile.body.2xs.medium
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Emphasis
- body.2xs.semibold
- font.mobile.body.2xs.semibold
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Strong emphasis
- body.2xs.bold
- font.mobile.body.2xs.bold
- Inter / Open Sans
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- High emphasis

#### Label

Use label typography to define structure and clarify relationships between controls and content. Labels identify inputs, toggles, filters, and grouped UI elements — they are functional, not expressive. Labels should remain concise and scannable. They are not headings, promotional text, or descriptive copy. If a label requires a sentence, it is likely helper text instead.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- label.md
- font.mobile.label.md
- Inter / Open Sans
- Medium / 500
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Default form labels
- label.sm
- font.mobile.label.sm
- Inter / Open Sans
- Medium / 500
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Compact form labels

#### Helper

Use helper typography to provide supporting context, guidance, or validation beneath primary UI elements. Helper text explains how something works, why input is required, or what an error means. It should support decision-making without competing for attention. Helper text is secondary by definition — if it becomes visually dominant, hierarchy is broken.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- helper.md
- font.mobile.helper.md
- Inter / Open Sans
- Regular / 400
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Field descriptions, validation text
- helper.sm
- font.mobile.helper.sm
- Inter / Open Sans
- Regular / 400
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Compact metadata, dense layouts

#### Code

Use code typography exclusively for technical content such as tokens, variables, snippets, commands, and system references. Code type preserves alignment and character clarity in contexts where precision matters. It is not a stylistic alternative to body text and should never be used for emphasis or decoration. If the content is readable as normal prose, it should not use code typography.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- code.lg
- font.mobile.code.lg

IBM Plex Mono /\
Roboto Mono

- Medium / 500
- 0.875rem / 14px
- 1.25rem / 20px
- -0.01em / -1%
- Code blocks, tokens
- code.md
- font.mobile.code.md

IBM Plex Mono /\
Roboto Mono

- Medium / 500
- 0.75rem / 12px
- 1rem / 16px
- -0.01em / -1%
- Inline code

#### Link

Use link typography for interactive text that navigates or triggers an action inline. Links inherit body sizing with a medium weight, and gain an underline affordance and color shift on hover. Reserve links for navigation and inline actions — not for buttons or emphasis.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- link.lg.default
- font.mobile.link.lg.default
- Inter / Open Sans
- Medium / 500
- 1rem / 16px
- 1.5rem / 24px
- -0.02em / -2%
- Inline links in large body text
- link.md.default
- font.mobile.link.md.default
- Inter / Open Sans
- Medium / 500
- 0.875rem / 14px
- 1.25rem / 20px
- -0.02em / -2%
- Default inline links
- link.sm.default
- font.mobile.link.sm.default
- Inter / Open Sans
- Medium / 500
- 0.75rem / 12px
- 1rem / 16px
- -0.02em / -2%
- Compact inline links
- link.xs.default
- font.mobile.link.xs.default
- Inter / Open Sans
- Medium / 500
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Dense metadata links
- link.2xs.default
- font.mobile.link.2xs.default
- Inter / Open Sans
- Medium / 500
- 0.5rem / 8px
- 0.75rem / 12px
- -0.02em / -2%
- Smallest inline links

#### Caption

Use caption typography for the smallest supporting text — image captions, footnotes, and dense annotations. It sits at the bottom of the type hierarchy, below helper text. Keep captions short; never use them for primary content.

- Text Style
- Token
- Typeface
- Weight
- Size
- Line height
- Letter spacing
- Use case
- caption.xs
- font.mobile.caption.xs
- Inter / Open Sans
- Regular / 400
- 0.625rem / 10px
- 0.875rem / 14px
- -0.02em / -2%
- Image captions, footnotes
