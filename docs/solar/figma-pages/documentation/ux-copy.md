# UX Copy

> Verbatim text of the Figma page `UX Copy` (id `1138:12741`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `c6836718d2ce`. Curated chapter: [15-ux-copy.md](../../15-ux-copy.md).

## Slide 1

### UX Copy

## Writing Patterns

#### These patterns define how SOLAR communicates in the most common UI moments — errors, empty states, confirmations, loading, and success. Each pattern follows a consistent structure so users always know what happened, why, and what to do next.

##### Error Messages

Structure: What happened + Why + What to do next.

Never show raw error codes or technical IDs.\
Always include a recovery action when one exists.\
Use color.text.feedback.danger for error text and pair with an icon — never rely on color alone.\
Keep under 2 lines.

##### Empty States

Structure: What this space is for + How to get started.

Include a primary action when possible (e.g., “Add device” button).\
Empty states should feel temporary, not permanent.\
Don’t use illustrations that look like errors.

##### Confirmation Dialogs

Structure: What will happen (specific) + What can’t be undone + Action button that names the action.

Never use “Are you sure?” as the only content.\
Confirm button names the action: “Delete device” not “OK.”\
Cancel is always “Cancel.”

| Context          | Do                                                                     | Don’t                                               | Pattern                 | Component          | Token                      |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- | ------------------ | -------------------------- |
| Validation error | "Enter an IP address in the format 192.168.x.x."                       | "Invalid input."                                    | What + How to fix       | TextInput (error)  | color.text.feedback.danger |
| Empty list       | "No devices yet. Add your first device to get started."                | "No data."                                          | What + Action           | Card (empty state) | color.text.secondary       |
| Delete single    | "Delete 'Conference Room A'? This device will be permanently removed." | "Are you sure?"                                     | Specific + Irreversible | Dialog (danger)    | action.primary-danger      |
| Success toast    | "Device added."                                                        | "Success! Your device has been successfully added." | Past tense, brief       | Toast              | color.text.primary         |
| Loading (>2s)    | "Loading devices..."                                                   | No text (just spinner)                              | Present tense           | Spinner + text     | color.text.secondary       |

## Component Microcopy

#### Every SOLAR component that displays text has specific copy rules. These rules ensure labels, messages, and feedback are consistent, scannable, and accessible across all Biamp products.

##### Button Labels

Use verb + noun: “Add device” not “Add” or “New device.” Exception: “Cancel” and “Close” stand alone.\
Keep labels under 3 words. Never use “Click here” or “Submit” as generic labels. Primary action goes right, Cancel goes left.\
Icon-only buttons must have aria-label with the full action text.

##### Form Copy

Label names the field (always visible).\
Placeholder shows format example (disappears on input — never a substitute for label).\
Helper text provides guidance below the field.\
Error text replaces helper on validation failure.\
Use color.text.tertiary for placeholders, color.text.feedback.danger for errors.

| Element      | Rule                               | Do                                  | Don’t                    | Case          | Punctuation               |
| ------------ | ---------------------------------- | ----------------------------------- | ------------------------ | ------------- | ------------------------- |
| Button       | Verb + noun, under 3 words         | "Add Device" / "Save Changes"       | "Submit" / "OK" / "Yes"  | Title Case    | No period                 |
| Form label   | Name the field, not an instruction | "Device name"                       | "Enter device name"      | Sentence case | No period                 |
| Dialog title | Name the action or decision        | "Delete Device" / "Assign to Group" | "Warning" / "Alert"      | Title Case    | No period                 |
| Tooltip      | Under 80 chars, no essential info  | "Assigns device to selected group"  | "Click to assign device" | Sentence case | No period (single phrase) |

## Terminology & Capitalization

#### Consistent terminology and capitalization make interfaces feel unified across all Biamp products. These standards apply to all user-facing text in SOLAR components.

##### Standard Terms

Use consistent terms across all products. When a SOLAR component implies a domain concept, use the standard term.\
Device (not Unit/Endpoint/Node)\
Add (not Create/New/Insert)\
Delete (not Remove/Destroy/Erase)\
Save (not Apply/Submit/Confirm)\
Settings (not Preferences/Configuration)\
Search (not Find/Look up)

##### Punctuation Rules

Use periods at the end of complete sentences in helper text, error messages, and body copy. No period for single-phrase elements: buttons, menu items, badges, toasts under 4 words.\
No exclamation marks in product UI. Ever.\
Use Oxford comma in lists.\
Em dashes (—) for asides, no spaces.\
Ellipsis (...) only for loading states and truncation.

##### General Rules

Never blame the user — say “something went wrong” not “you made an error.”\
Never use humor in error messages or destructive confirmations.\
Avoid Latin abbreviations in UI: “for example” not “e.g.”\
Don’t use “successfully” — if it happened, it succeeded.\
Match tone to stakes: low-risk settings need less gravity than deleting a deployment.

| Element       | Capitalization | Example                     | Period                | Max Length | Notes                                    |
| ------------- | -------------- | --------------------------- | --------------------- | ---------- | ---------------------------------------- |
| Page title    | Title Case     | "Device Settings"           | No                    | —          | Top-level navigation labels              |
| Button label  | Title Case     | "Add Device"                | No                    | 3 words    | Verb + noun pattern                      |
| Form label    | Sentence case  | "Device name"               | No                    | —          | Names the field, not an instruction      |
| Error message | Sentence case  | "Enter a valid IP address." | Yes                   | 2 lines    | What happened + how to fix               |
| Toast message | Sentence case  | "Device added."             | Yes (&lt;4 words: no) | 8 words    | Auto-dismiss, include undo if reversible |

## Voice Principles

#### SOLAR interfaces speak with one voice across all Biamp products. That voice is defined by four principles. Voice stays constant regardless of context — what shifts is tone, which adapts to the stakes of the moment.

##### Clear

##### Direct

##### Helpful

##### Calm

Say what happened and what to do next. Avoid jargon, hedging, and unnecessary words. Prefer short sentences. If a user has to re-read something, it’s too complex.

Do: "Enter a name for this device."\
Don’t: "Please provide a value for the device name field in order to proceed."

Address the user as “you.” Use active voice. Lead with the most important information. Don’t bury actions in long explanations.

Do: "You can’t delete this device while it’s online."\
Don’t: "Deletion of devices that are currently in an online state is not permitted."

Anticipate what the user needs to know. When something goes wrong, explain why and how to fix it. Don’t just state the problem.

Do: "This name is already in use. Try a different name."\
Don’t: "Error: duplicate name."

Don’t alarm the user unnecessarily. Avoid exclamation marks, all-caps, and dramatic language. Treat errors as normal events that have a path forward.

Do: "Something went wrong. Please try again."\
Don’t: "CRITICAL FAILURE! An unexpected error has occurred!"

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Governance
domain: Contribution Model & Change Management
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR governance advisor. The design system is a shared product with a structured change process. When the system has a gap, the correct response is a governance request — never a one-off workaround.

[SCOPE]
- Contribution and change request process
- Change types and review requirements
- Semantic versioning policy
- Deprecation and migration procedures
- Roles and responsibilities
- Quality gates for system additions

[CONTRIBUTION_FLOW]
1_request: anyone can propose additions or changes — file a request with rationale and use case
2_triage: DS team reviews for alignment, feasibility, and priority
3_design: spec created — includes tokens, variants, states, accessibility, responsive behavior
4_review: cross-functional review — design, engineering, accessibility, product
5_approval: DS team grants final approval
6_implementation: built in Figma + code with full parity
7_release: published with documentation, changelog, and migration guide (if applicable)
rule: no addition ships without completing all gates

[CHANGE_TYPES]
new_token: adding a new primitive, semantic, or component token
new_component: adding a new component to the library
component_modification: adding variants, props, or states to an existing component
pattern_addition: documenting a new composition pattern
deprecation: marking a token/component for removal with a sunset timeline
breaking_change: removing or renaming tokens/components — requires migration guide
documentation: updating guidelines, examples, or usage notes

[REVIEW_REQUIREMENTS]
new_token: token naming review + theme coverage check
new_component: design spec + token mapping + accessibility audit + code implementation + documentation
component_modification: impact analysis on existing usage + backward compatibility check
deprecation: migration guide + sunset period (minimum 1 major version cycle)
breaking_change: requires major version bump + migration guide + advance notice

[VERSIONING]
model: semantic versioning (SemVer) — MAJOR.MINOR.PATCH
patch: bug fix, token value tweak, typo correction — backward compatible
minor: new addition (token, component, variant) — backward compatible
major: breaking change (removal, rename, restructure) — may require migration
rule: consumers should pin to minor version ranges for stability

[DEPRECATION_PROCESS]
announce: mark deprecated in documentation and Figma (visual indicator)
sunset_period: minimum one major version cycle before removal
migration_guide: provide step-by-step replacement instructions
tooling: lint rules flag deprecated token/component usage in code
removal: only in a major version release after sunset period expires

[ROLES]
ds_team: owns the system, triages requests, maintains quality, publishes releases
designers: propose additions, create specs, review visual consistency
engineers: implement components, validate token parity, maintain tooling
accessibility: reviews all additions for WCAG compliance
product: validates that additions serve real user/product needs
agents: flag gaps, propose additions through governance, never bypass

[QUALITY_GATES]
design_spec: complete Figma spec with all variants, states, and responsive behavior
token_mapping: all visual values traced to tokens — no hardcoded values
accessibility_review: WCAG 2.1 AA compliance verified — keyboard, screen reader, contrast
code_implementation: component built with full token and theme support
documentation: usage guidelines, do/don't examples, API reference
testing: visual regression tests, unit tests, cross-browser/theme verification

[AGENT_BEHAVIOR]
- When identifying a gap in the system (missing token, component, or pattern), document it as a governance request
- Never invent one-off solutions — always propose through the governance process
- Include in proposals: name, category, rationale, use case, suggested token/component spec
- Flag deprecated tokens or components when encountered — recommend the replacement
- When reviewing designs, check that all elements use system-approved tokens and components
- If a request is urgent, flag it as high-priority but still route through governance

[CONSTRAINTS]
- never bypass governance for expediency — one-offs create tech and design debt
- breaking changes require a major version bump and migration guide
- deprecated items must have a sunset period — never remove without notice
- all additions must include: design spec, token mapping, accessibility review, documentation
- cross-functional review is mandatory for components — no single-function approval
- the DS team owns final approval — escalation path exists for disputes
@END:PAGE_CONTEXT
```
