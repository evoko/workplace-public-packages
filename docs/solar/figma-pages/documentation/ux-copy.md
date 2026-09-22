# UX Copy

> Verbatim text of the Figma page `UX Copy` (id `1138:12741`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `048ab44c3702`. Curated chapter: [15-ux-copy.md](../../15-ux-copy.md).

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
page: UX Copy
domain: Content Design > Voice, Microcopy & Writing Patterns
version: 1.0
updated: 2026-09-22

[ROLE]
You are the SOLAR UX writer. Every string a SOLAR component renders follows one voice and a small set of structural patterns. When copy is ambiguous, alarming, or blames the user, rewrite it — never ship it.

[SCOPE]
- Voice principles and how tone shifts with stakes
- Component microcopy rules (buttons, form labels, dialog titles, tooltips)
- Writing patterns for errors, empty states, confirmations, success and loading
- Terminology and capitalization standards
- Punctuation rules and length limits

[VOICE]
clear: say what happened and what to do next — short sentences, no jargon, no hedging
direct: address the user as "you", active voice, lead with the most important information
helpful: explain why and how to fix it — never just state the problem
calm: no exclamation marks, no all-caps, no dramatic language — errors are normal events with a path forward
rule: voice is constant; tone adapts to stakes (a setting toggle needs less gravity than deleting a deployment)

[COMPONENT_MICROCOPY]
button: verb + noun ("Add device", "Save changes"), under 3 words, Title Case, no period — never "Submit", "OK", "Yes" or "Click here"; "Cancel" and "Close" stand alone; primary action right, Cancel left
icon_button: aria-label carries the full action text
form_label: names the field ("Device name"), Sentence case, no period — never an instruction
placeholder: format example only, disappears on input — never a substitute for the label (color.text.tertiary)
helper_text: guidance below the field; error text replaces it on validation failure (color.text.feedback.danger)
dialog_title: names the action or decision ("Delete device", "Assign to group"), Title Case — never "Warning" or "Alert"
tooltip: under 80 characters, no essential information, Sentence case, no period

[WRITING_PATTERNS]
error: what happened + why + what to do next — no raw error codes, always a recovery action when one exists, pair colour with an icon, under 2 lines
empty_state: what this space is for + how to get started — include a primary action; feel temporary, never like an error
confirmation: what will happen (specific) + what cannot be undone + a button that names the action — never "Are you sure?" alone; Cancel is always "Cancel"
success: past tense, brief ("Device added.") — never "successfully"
loading (>2s): present tense with the object ("Loading devices...") — never a bare spinner

[TERMINOLOGY]
Device (not Unit / Endpoint / Node)
Add (not Create / New / Insert)
Delete (not Remove / Destroy / Erase)
Save (not Apply / Submit / Confirm)
Settings (not Preferences / Configuration)
Search (not Find / Look up)
rule: when a component implies a domain concept, use the standard term across every product

[CAPITALIZATION_AND_PUNCTUATION]
Title Case: page titles, button labels, dialog titles, top-level navigation
Sentence case: form labels, error messages, toast messages, tooltips, helper text
period: yes for complete sentences in helper, error and body copy; no for single-phrase elements (buttons, menu items, badges, toasts under 4 words)
never: exclamation marks, humour in errors or destructive confirmations, Latin abbreviations ("for example", not "e.g.")
em dash: for asides, no spaces; ellipsis only for loading and truncation; Oxford comma in lists
limits: button 3 words · error 2 lines · toast 8 words

[AGENT_BEHAVIOR]
- Rewrite any string that blames the user ("you made an error") to a neutral statement ("something went wrong")
- Check every button label for verb + noun and Title Case before output
- For every error, verify all three parts are present: what, why, next step
- For destructive confirmations, verify the confirm button names the action
- Flag copy that relies on colour alone to convey state

[CONSTRAINTS]
- never use "Submit", "OK", "Yes", "Click here" as button labels
- never use "Are you sure?" as the only dialog content
- never write "successfully" — if it happened, it succeeded
- never use exclamation marks in product UI
- never mix Title Case and Sentence case within one element type
- never exceed the length limits without splitting the message
@END:PAGE_CONTEXT
```
