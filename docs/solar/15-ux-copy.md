---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/ux-copy: c6836718d2ce
---

# 15 · UX Copy

> Source: Figma page "UX Copy" (voice principles, terminology & capitalization,
> component microcopy, writing patterns). Note: the `@SOLAR:PAGE_CONTEXT` block on this
> page is a copy of the Governance block; there is no UX-Copy-specific agent context.

## Voice

SOLAR interfaces speak with one voice across all Biamp products. Voice is constant;
**tone** adapts to the stakes of the moment.

| Principle   | Meaning                                                                                                          | Do                                                   | Don't                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Clear**   | Say what happened and what to do next. No jargon, hedging or filler. Short sentences                             | "Enter a name for this device."                      | "Please provide a value for the device name field in order to proceed."       |
| **Direct**  | Address the user as "you". Active voice. Lead with the most important information                                | "You can't delete this device while it's online."    | "Deletion of devices that are currently in an online state is not permitted." |
| **Helpful** | Anticipate what the user needs. Explain why and how to fix, not just the problem                                 | "This name is already in use. Try a different name." | "Error: duplicate name."                                                      |
| **Calm**    | Never alarm unnecessarily. No exclamation marks, all-caps or drama. Errors are normal events with a path forward | "Something went wrong. Please try again."            | "CRITICAL FAILURE! An unexpected error has occurred!"                         |

## Terminology

Use one standard term across all products:

| Use      | Not                        |
| -------- | -------------------------- |
| Device   | Unit, Endpoint, Node       |
| Add      | Create, New, Insert        |
| Delete   | Remove, Destroy, Erase     |
| Save     | Apply, Submit, Confirm     |
| Settings | Preferences, Configuration |
| Search   | Find, Look up              |

## General rules

- Never blame the user: "something went wrong", not "you made an error".
- Never use humour in error messages or destructive confirmations.
- Avoid Latin abbreviations: "for example", not "e.g.".
- Don't say "successfully"; if it happened, it succeeded.
- Match tone to stakes: low-risk settings need less gravity than deleting a deployment.

## Punctuation

- Periods at the end of complete sentences in helper text, error messages, body copy.
- No period on single-phrase elements: buttons, menu items, badges, toasts under 4 words.
- **No exclamation marks in product UI. Ever.**
- Oxford comma in lists.
- Em dashes for asides, no spaces around them.
- Ellipsis only for loading states and truncation.

## Capitalization and length

| Element       | Case          | Example                            | Period              | Max length | Notes                                       |
| ------------- | ------------- | ---------------------------------- | ------------------- | ---------- | ------------------------------------------- |
| Page title    | Title Case    | "Device Settings"                  | No                  | —          | Top-level navigation labels                 |
| Button label  | Title Case    | "Add Device"                       | No                  | 3 words    | Verb + noun                                 |
| Dialog title  | Title Case    | "Delete Device"                    | No                  | —          | Names the action or decision, not "Warning" |
| Form label    | Sentence case | "Device name"                      | No                  | —          | Names the field, not an instruction         |
| Tooltip       | Sentence case | "Assigns device to selected group" | No (single phrase)  | 80 chars   | No essential information                    |
| Error message | Sentence case | "Enter a valid IP address."        | Yes                 | 2 lines    | What happened + how to fix                  |
| Toast message | Sentence case | "Device added."                    | Yes (< 4 words: no) | 8 words    | Auto-dismiss; include undo if reversible    |

## Component microcopy

**Buttons**: verb + noun ("Add device", not "Add" or "New device"); "Cancel" and
"Close" stand alone. Under 3 words. Never "Click here", "Submit", "OK", "Yes". Primary
action on the right, Cancel on the left. Icon-only buttons carry the full action text in
`aria-label`.

**Forms**: the label names the field and is always visible; the placeholder shows a
format example and disappears on input (never a label substitute); helper text sits
below the field; error text replaces helper on validation failure. Placeholders use
`color.text.tertiary`; errors use `color.text.feedback.danger`.

## Writing patterns

| Moment                  | Structure                                                                           | Rules                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Error message**       | What happened + why + what to do next                                               | No raw error codes or technical IDs. Always a recovery action when one exists. `color.text.feedback.danger` + icon, never color alone. ≤ 2 lines |
| **Empty state**         | What this space is for + how to get started                                         | Include a primary action ("Add device"). Feels temporary, not permanent. No illustrations that look like errors                                  |
| **Confirmation dialog** | What will happen (specific) + what can't be undone + a button that names the action | Never "Are you sure?" alone. Confirm button says "Delete device", not "OK". Cancel is always "Cancel"                                            |
| **Success toast**       | Past tense, brief                                                                   | "Device added."                                                                                                                                  |
| **Loading (> 2 s)**     | Present tense                                                                       | "Loading devices..." with spinner + text, `color.text.secondary`                                                                                 |

Examples:

| Context          | Do                                                                     | Don't                                               | Component          | Token                        |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------------------------- | ------------------ | ---------------------------- |
| Validation error | "Enter an IP address in the format 192.168.x.x."                       | "Invalid input."                                    | TextInput (error)  | `color.text.feedback.danger` |
| Empty list       | "No devices yet. Add your first device to get started."                | "No data."                                          | Card (empty state) | `color.text.secondary`       |
| Delete single    | "Delete 'Conference Room A'? This device will be permanently removed." | "Are you sure?"                                     | Dialog (danger)    | `action.primary-danger`      |
| Success toast    | "Device added."                                                        | "Success! Your device has been successfully added." | Toast              | `color.text.primary`         |
| Loading (> 2 s)  | "Loading devices..."                                                   | No text, just a spinner                             | Spinner + text     | `color.text.secondary`       |
