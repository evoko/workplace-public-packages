# Judgement calls to review

Decisions taken while the owner was away (2026-09-26, and the workbench's on 2026-09-27), for the
owner to confirm or correct. Each names where it lives, so a correction knows what to change. The
lasting ones are also rows in `docs/engineering/decisions.md` marked `Taken`. Delete this file once
reviewed.

## Start here: the calls most worth a look

- **1**: the `&& > *` rule lets a group's rule beat its child's own, so a caller's `sx` width on a
  Button inside a group loses too.
- **60**: the Select and Dropdown panels are portaled into the picker to fix screen readers; the
  page is no longer locked while a panel is open, and the panel follows its field on scroll.
- **63, 68**: a vertical Divider is full only on both platforms (Figma draws inset and labelled
  for horizontal alone); the types and an assert refuse the other two.
- **69**: an Avatar of type photo or logo with no picture falls back to initials on both platforms
  (Figma is silent; the design review asks).
- **59**: the web visual check's `words` was tightened (clipped or collapsed words now fail).
- **71**: the scope of the bug-fix batch: bugs fixed, missing features recorded in open-work.md.
- **14, 34**: a `WORDS` table gives starting words to text slots Figma leaves empty.
- **13**: the Playground width box is a block at `auto` on both viewers.
- **89, 90**: `solar:codegen` writes only changed files and formats only its own outputs, never a
  hand-written file beside them, so the Prettier check covers `spec/**/*.md`;
  `.claude/skills/**/*.md` covers the committed skill.
- **109**: what an agent may and may not ask of the workbench service.
- **82**: the two workbench bars' parity is enforced exhaustively: a control one bar has and the
  shared scenarios do not name fails.
- **97**: no Send to agent on a component approved on the other platform, even with failing checks.
- **95**: `/solar-feedback` lists, not makes, a proposal that would cancel an approval or change a
  🔴 component.
- **86, 76**: one pending edit in the repository at a time, which holds every Approve and Undo
  approval.

## Viewer playgrounds, Batch A hardening and the component fixes

1. **Lg Buttons fill a full-width Button Group.** Figma's full-width variant draws its lg Buttons
   filling the group, though lg is otherwise fixed at 200 wide. Web fix in the MUI emitter
   (`packages/codegen/src/emit/mui-component.mjs`, `outranking()`): a slot that is a direct child of
   the root (`& > *`) is written `&& > *`, so the parent's rule wins over the child's own, as a
   Figma instance override does. Side effect: a caller's `sx` width on a Button inside a group
   loses too, unless written with `&&`. Flutter already filled.
2. **The Button gives its Counter the recipe's type** through a context (web
   `internal/composed.ts`, `CounterTypeContext`) and an InheritedWidget (Flutter
   `solar_composed.dart`, `SolarCounterTypeScope`, now exported). An explicit `type` on the
   Counter still wins. The helper lives in its own file so the approvals graph does not count
   Button as using Counter.
3. **The primary Button's invisible counter is a Figma defect**, left open and added to the design
   review ("The display primitives"): the inverted Counter's count is bound to the same colour as
   the primary Button's fill, in every state and both modes; no variable mode override exists on
   any instance (checked read-only through the Plugin API).
4. **Flutter number knobs with both bounds are sliders** (Widgetbook's inputs take no bounds); with
   one bound or none they are inputs whose description states the bounds, and `whole` clamps.
5. **`setChoice` exists only in Flutter** (writing an enum back to a select); the web writes the
   option string with `set`.
6. **The overlay Playwright test finds overlays by an `open` extra**, not an `open` IR axis (Select
   and Dropdown have an IR `open` and no trigger).
7. **Widgetbook's panel text boxes do not visibly update** when the component changes a text knob
   (a Widgetbook limitation with no public API); the value and the component are right.

## Viewer playgrounds, Task 8: buttons and display primitives

8. **Button Group has no `buttons` count extra** (the plan's 1–4): the IR already gives it two
   slot toggles, `tertiaryCTA` (off) and `secondaryCTA` (on), beside a primary (`button3`) that is
   always there, so the builders draw those. Each Button takes the role its name says (tertiary,
   secondary, primary; `button3`'s words Figma's "Label", having no slot), the primary last in a
   horizontal group and first in a vertical one, `lg` in a full-width group (as the Dialog pilot);
   not the per-variant roles of Figma's layers, which the recipe's composition records (the
   vertical variant draws `tertiaryCTA` as the primary and hides `button3`; the full-width one
   draws `tertiaryCTA` secondary and `secondaryCTA` primary), since a toggle named for the tertiary
   would then show a primary. A vertical group is always regular (Figma draws no vertical
   full-width one, and the types and the widget's assert refuse it), and the builders write
   `regular` back to `type`. Where: `stories/playground/button-group.tsx`,
   `widgetbook/lib/playground/button_group.dart`.
9. **Icon Button is always a toggle in its Playground**: `active` is a boolean control, so it is
   passed as `true` or `false`, never left unset (a plain action, announced as no toggle); a click
   flips it. An icon control at `_none` gives Flutter's required `icon` an empty `SizedBox`, as the
   web's empty icon (FAB too).
10. **The Counter is given its click callback** (logged, web `onClick`, Flutter `onPressed`), per
    "every callback is logged", so in its Playground it is a control of its own and shows its own
    hover and press states; in a Button it takes the Button's.
11. **RowExpand is not interactive**: it has no callback of its own (a Row draws it as its expand
    button), and its IR has no `expanded`, only the `type` values `collapsed` and `expanded`, which
    the tester picks. A `chevron` extra (on) gives its real prop: whether a collapsed or expanded
    cell draws its chevron.
12. **Words extras beyond the plan's list**: `label` for Link ("Link text"), Kbd ("⌘K") and
    Divider ("Or"), whose IRs hold their words in no text slot; Timestamp's `detail` (the absolute
    time `combined` shows on hover) beside `text`; Avatar's `name` (which names it and gives its
    initials), `initials` (empty: from the name) and `picture` (on: a photo or logo avatar gets the
    sample picture, now in `stories/playground/samples.ts` and `widgetbook/lib/playground/samples.dart`,
    shared with the Dialog).
13. **The width box is a block at `auto`, on both viewers**, the component at its start: a filling
    component takes the Playground's width, a hugging one (a Button) keeps its own, and a width
    picked is the box's, the component loosened in it (so a Button at 320 still hugs in Flutter,
    where the box used to force it to 320). Before, Storybook's box shrank to its content (a filler
    alone was 0 wide) and Widgetbook's gave the panel's width. Where: the web's
    `stories/playground/core.tsx` (`WidthBox`, `columnStyle`, shared by the adapter and the
    Playwright page, which now takes `#<slug>?width=320`), Flutter's `playground/adapter.dart`.
    Tested on both (Playwright: a ProgressBar fills the box and a Button hugs, at `auto` and 320;
    Flutter: `adapter_test.dart`). The Task 8 width workarounds are gone (Flutter's `IntrinsicWidth`
    around the Divider and the ProgressBar); the sample contexts stay, a Divider between two words
    (a vertical one needs the row's height to fill) and a ProgressBar under its number. The
    Divider's own defects stay worked around (reported, the shells untouched): on the web a
    vertical divider's recipe height, `100%`, fills only a parent of a set height, so the builder
    leaves it `auto` for the row to stretch; a vertical inset or labelled divider fills the width
    as well, on both, so in Flutter's row it is wrapped in a `Flexible` (at `auto` it now takes the
    row's whole width on both).

## Viewer playgrounds, Task 9: selection controls, tags and messages

14. **Sample words for a text slot Figma records none for**: a second table beside the extras,
    `WORDS` in `packages/codegen/src/playground/extras.mjs` (component → slot → words), gives the
    IR's text control its starting words where the IR has none (Figma's text layer carries no
    prop), instead of an empty field: Tag `label` "Label", Toast `message` "File saved" and
    `action` "Undo" (the description's examples), EmptyState `title` "No results" and
    `description` "Try another search, or clear the filters.". The control stays the IR's (no
    extra); an entry for a slot that is no text slot, or whose words Figma records, fails the
    build, so none goes stale (`controls.mjs` `checkedWords`, tested). Forty-odd components have
    such slots (Accordion, cards, Coachmark…); later tasks may add theirs.
15. **Radio: `checked` is whether the group holds a choice, `selected` which.** The IR's `checked`
    is one radio's, but a group decides its radios (Flutter's Radio has no `checked` at all), so
    in the group of three the `selected` extra (Option 1–3) names the chosen one and `checked` off
    empties the group. A click chooses a radio and sets both. `disabled` disables all three, so a
    disabled radio shows both states. Each radio is a `<label>` with its words, in a box of
    `size.target.min`, the room Flutter's SolarTarget gives it: on the web the shell's 44 × 44
    input overflows the 18px ring, and MUI's FormControlLabel (which the shell's comment and the
    README suggest) stacks rows 20 apart, so the targets overlap (a click on Option 2's ring chose
    Option 3) and its -11px margin pulls the radio out of its box. Reported below.
16. **Segmented Control Item is played in its control**, first of three (its words the `label`
    extra, "Day"; its siblings "Week" and "Month" at its size). `selected` on chooses it; off
    chooses the sibling chosen last (the first at first), which the builder keeps as its own state
    (a hook on the web, a State in Flutter), since the IR has one boolean and a control must always
    hold a choice. The Segmented Control's `selected` extra is Day, Week or Month; its `track`
    content toggle shows or empties the track of segments.
17. **Slider and Slider Range values are whole percents** (`value`; `low` and `high`), as
    ProgressBar's: the web's MUI Slider steps by 1 on 0–100; Flutter's drags continuously on 0–1,
    so its builder rounds to a whole percent and sets and logs nothing for a move within one (as
    MUI fires nothing), keeping the log to real changes. Flutter's arrow keys move 10 (the input's
    step), the web's 1. Logged: web `onChange` and `onChangeCommitted`; Flutter `onChanged`,
    `onChangeStart` and `onChangeEnd`. A `low` above `high` from the panel draws the range from
    the lower.
18. **Tag's type follows two boolean extras**, `indicator` and `closable` (the shells derive
    Figma's five types from a dot, a close callback, an icon and words); `indicator` is left off
    on an inverted tag, which the types refuse. Without words it is named "Label".
19. **An icon control stands for a part the shell draws with its own icon**: Banner's `close` and
    Toast's `chevron` are icon slots in the IR, but the shells draw SOLAR's close and chevron
    whatever is picked, so the control shows or hides the part (`_none` hides it: the Banner gets
    no `onClose`, the Toast no `chevron`).
20. **Toast's Tag words are a `tag label` extra** ("Upload"): the IR's `tag` slot names no
    component, so the derivation gives it a toggle alone. Banner's and EmptyState's Buttons are
    SOLAR Buttons at sm (Banner's primary and secondary, EmptyState's secondary), their clicks
    logged with the slot (`onClick: "primaryButton"`; Flutter `onPressed`). DragHandle has no
    callback to log (the drag is its list's). Toast is drawn in place, not in a Snackbar.

Defects found, reported and left alone:

- **Alert, Alert Small and Toast draw their action as a native button** (a grey box with a
  border) in Storybook: their MUI descriptors write the button reset under
  `& button.Solar<Name>-action` and then spread `targetArea('& button.Solar<Name>-action')`,
  whose key is the same selector, so the target's `{ position: 'relative' }` replaces the reset
  (`packages/codegen/src/components/shared/alert.mjs`, `toast.mjs`). Banner's survives because its
  reset's key names two selectors. The visual checks do not see it.
- **The web Radio's target overlaps its neighbours in MUI's layout** (15 above): the README's
  FormControlLabel rows are 20 tall around a 44 × 44 input, a later radio's input on top, and the
  label's -11px margin (for MUI's padded radio) shifts SOLAR's radio out of its box. Checkbox and
  Toggle in a FormControlLabel likely share it.

## Viewer playgrounds, Task 10: text fields

21. **A label the IR holds as a toggle alone gets a `label text` extra**: Password Input, Number
    Input and PIN Input draw their label in a `/Label` frame the IR records as a component slot
    naming no component, so the derivation gives it a toggle and no words (as Toast's `tag`); the
    extra carries them ("Password", "Label", "Label"), shown while the toggle is on. FileUpload's
    IR has no label at all, so it gets a `label` extra ("Upload a file"). GlobalSearch, a trigger
    with no text slot, gets `placeholder` ("Search Workplace", Figma's; cleared, the shell's
    "Search"), `query` (filled where it holds any) and `shortcut` ("⌘K"; cleared, no Kbd). Sample
    words (`WORDS`): the helpers Figma draws with no prop ("Helper text"), Password's "Forgot
    password?" and PIN's "Code is incorrect or expired.".
22. **Text Area's `charCount` is words, the shells' a boolean and a `maxLength`**: the count shows
    while the control holds any words, and counts against the number after a slash (Figma's
    "0/500" is at most 500; "12" counts with no maximum). The `footer` toggle shows or hides the
    helper and the count together. Its `cta` is a primary send Icon Button, disabled while the area
    is empty (as Figma's empty variants draw it), its `attachment` a secondary attach one; clicks
    logged with the slot (`onClick: "cta"`; Flutter `onPressed`).
23. **Number Input's `value` is a text extra, not the plan's number**: the shells hold
    `number | null`, and a number control cannot hold null, so the control holds the number's words
    ('' for an empty field). Words from the panel that are no number give an empty field; they are
    not written back (rewriting "1." or "-" to the number would fight the tester typing in the
    panel). `min` and `max` integer extras (0 and 10) give the steppers a range to clamp to (typing
    is not clamped: validating on blur is the app's); it starts at 1, not Figma's 0, so both
    steppers start enabled.
24. **PIN Input's `length` is an integer extra, 4 to 6** (a slider in Widgetbook), not a select:
    Flutter's `choice` maps a select to an enum, and there is none for 4, 5 and 6. The builders give
    the field the digits the `value` words hold, up to the length, and write them back where the
    words held more (a letter from the panel, a longer code after a shorter length): the one
    transform written back, after the render (web effect, Flutter post-frame callback).
25. **Token Input's entries are one comma-separated `tokens` text**; an entry typed with a comma
    in it becomes two, as the control reads it, so the control and the field hold the same (an
    entry cannot hold a comma here). The draft is the `draft` extra, two-way; the web logs its
    `onInputChange`, Flutter has no draft callback (the draft is its controller's), so
    `PlaygroundText` (`widgetbook/lib/playground/typing.dart`) gained an `onChanged` that hears the
    controller change (typing, or the widget clearing it once added) and nothing is logged. It
    tracks the words it last reported, so a field that clears itself right after typing, before the
    rebuild, is not put back. A `maxVisible` extra (3) shows the Counter of the rest. No entry is
    added on a comma: the shells add on Enter (Flutter: the keyboard's action) only.
26. **Nothing is logged where the shells give no callback**: Password Input's eye (both shells
    keep whether the words show to themselves) and Inline Input's opening for edit (both); the plan
    asked for both. Password's typing is logged with its words, as Text Input's, despite the shell's
    "never log what is typed": it is the tester's sample, which the `value` control shows anyway.
    Password's link: on the web a SOLAR Link (the shell takes a node), its click logged
    `onClick: "forgotPassword"`; in Flutter `onForgotPassword`. Inline Input's `value` is the IR's
    text control (no extra); every confirm is accepted; it is named "Value".
27. **FileUpload chooses on each platform as an app does**: on the web Browse opens the browser's
    own picker (and a file dropped is taken), the names chosen set `files`, logged with `onChange`,
    and names from the panel stand for empty files; in Flutter, which has no picker, `onBrowse` is
    logged and the Playground stands in for the app's picker, choosing Figma's sample
    "Filename.jpg"; remove is logged (`onRemove`) and empties it. SearchField's `filter` is the
    picked icon, as Figma draws it (an icon, not a button), so it has no callback.

Defects found, reported and left alone:

- **The web Inline Input reopens after Enter confirms it**: `close()` moves the focus to the edit
  button in an effect React flushes during the keydown, and the key then activates that button,
  whose click calls `begin()` (`packages/components/src/InlineInput.tsx`; the input's `onKeyDown`
  does not `preventDefault()` on Enter). Confirm's button and Flutter's Enter close it. The
  Playwright test confirms with the button, and says why.
- **Flutter's Token Input loses the focus once an entry is added**: its draft's TextField takes
  `TextInputAction.done` with the default `onEditingComplete`, which unfocuses it, so a second entry
  needs a tap (`solar_token_input.dart`); the web keeps the focus. The widget test taps again, and
  says why.

## Viewer playgrounds, Task 11: menus, lists and pickers

28. **DatePicker's and TimePicker's date and time are the IR's `value`, not `date` and `time`
    extras**: both IRs already hold a `value` text slot (the field's words), and an extra may not
    take an IR control's name, so the IR's control holds them, as Inline Input's does. DatePicker's
    Figma words, `2026-05-11`, are already `YYYY-MM-DD`; TimePicker's, `12:00 AM`, are read on the
    12-hour clock too, and a pick writes `HH:MM` (24-hour). Both platforms read and write through one
    pair of helpers (`stories/playground/dates.ts`, `widgetbook/lib/playground/dates.dart`): words
    that are no real date or time (`2026-02-30`, `25:00`) give the component no value, not a
    failure. The same helpers read Date Picker Open's IR `month` (a month's English name, whole or
    three letters, and its year: Figma's `April 2026`) as the month it opens on; the calendar is
    opened afresh (keyed) when the control changes, since the shells read it only as they open. Date
    Picker Open's day is a `value` extra (`2026-04-15`, in Figma's month), TimePicker Dropdown's a
    `value` extra (`09:00`). Logged: web `onChange`, `onOpen`, `onClose`; Flutter `onDateChanged` or
    `onTimeChanged`, and `onChanged` for the words typed (Flutter's only).
29. **Select's and Dropdown's IR `open` is their panel's**, with a `value` select extra (`none`,
    then `Option 1`–`3`; `none` shows Figma's placeholder, "Placeholder" and "Text"). On the web it
    is two-way: the shells' `open`, `onOpen` and `onClose` (logged). In Flutter the widgets read
    `open` only as they are first built and say nothing when the panel opens or closes, so the
    builders key the widget on `open` (turning it on rebuilds it open, off closed), and a tap's
    opening does not reach the control (reported below). Select's `trailingIcon` is read and has no
    effect: both shells draw their own chevron and take no icon (reported). Dropdown's and
    Autocomplete's label, a toggle alone in the IR, gets a `label text` extra ("Label"), as Task 10's
    fields.
30. **The menus open in their own anchored menus**: Dropdown Menu and Context Menu (each an `open`
    extra) float under the "Open" trigger, on the web in the shells' Popover (`anchorEl`, the
    trigger's wrapper, since `overlayOf`'s trigger takes no ref), in Flutter in the widgets'
    `SolarMenuAnchor`, through a new shared `PlaygroundMenu` (`playground/overlay.dart`: a
    MenuController kept in step with `open`, `close(event, detail)`, Escape or a tap outside logged
    `onClose`). The Context Menu opens at its trigger, as at the object it acts on, not at a pointer.
    Choosing a row closes it and logs it with its words (web `onClick`, Flutter `onPressed`). The
    Flutter open-state test (`playground_test.dart`) now counts an open MenuAnchor as shown, since a
    menu pushes no ModalBarrier. Their content toggles show sample rows (a heading over three
    options; Cut, Copy, Paste with shortcuts, a Divider, a destructive Delete) or an empty menu.
31. **A part is drawn in its parent**: Dropdown Item and Dropdown Group Label in a Dropdown Menu of
    their size, in place (the heading over two sample rows, their clicks logged); Context Menu Item in
    a Context Menu; a radio Option Row in a RadioGroup of its own; Date Picker Day Cell in a grid's
    row on the web (a gridcell needs a grid), alone in Flutter, named by a sample whole date. ListItem
    is drawn alone, not in a List, since a List gives its rows its own compactness, which would
    override the `compact` control. A click chooses where the IR has the choice: Dropdown Item flips
    `selected` with its checkbox and sets it without; ListItem and the Day Cell set `selected`. List's
    three sample rows (Inbox, Drafts, Sent) log their clicks, none current.
32. **Autocomplete's `value` is the words in the field**, not an option chosen: Flutter's
    RawAutocomplete keeps whatever is typed, so the web's field is made free (`freeSolo`) to hold the
    same (MUI would otherwise put back the last option's words on blur). Typing sets it, choosing a
    suggestion fills it; logged web `onInputChange`, `onChange`, `onOpen`, `onClose`, Flutter
    `onChanged`, `onSelected`. Five sample cities, each holding an "n". **Autocomplete Open** is
    Autocomplete's Playground held open: on the web its `open` forced, in Flutter the field focused
    as it is built, since the widget suggests only for words typed and cannot be opened otherwise;
    its `value` extra starts at "n" on both, which every suggestion matches (the web alone would show
    all five for no words). In Flutter a choice or a tap outside still closes it.
33. **Words and extras for the rest**: Figma's words as extras where the IR holds none (Dropdown
    Item's and Option Row's `label` "Option label", Group Label's "Group Label", ListItem's "List
    item label") and as `WORDS` for the second lines Figma draws with no prop ("Helper text", "Helper
    Text", "Supporting description for this option"). Option Row's `checked` and `disabled` extras
    (its IR has only the control's kind); Options List's `label` (the legend a screen reader reads,
    "Notify me by") and `checked`, the checked rows' words comma-separated (three checkbox rows: Email,
    SMS, Push), as Token Input's entries. TimePicker Dropdown's `content` off offers no time (a range
    that ends before it starts), since the shells make its rows themselves. The Playwright page now
    records every `log` on `window.__logs`, beside `window.__sets`.

Defects found, reported and left alone:

- **The web Select's and Dropdown's open panel is hidden from the accessibility tree**: the shells
  draw MUI's modal Menu inside the component (`disablePortal`), and MUI's modal then sets
  `aria-hidden` on the page's top element, the one the panel sits in, so a screen reader cannot
  reach the options while it is open (`packages/components/src/Select.tsx`, `Dropdown.tsx`). The
  Playwright test finds them with `includeHidden`, and says why.
- **Flutter's Select and Dropdown read `open` only as they are first built** and have no open or
  close callback, so the IR's `open` cannot follow the panel (`solar_select.dart`,
  `solar_dropdown.dart`); the web's can.
- **Select takes no trailing icon on either platform**, though its IR has a `trailingIcon` icon
  slot: the chevron is fixed.
- **Date Picker Open tells no one the month it shows** on either platform, so its arrows cannot set
  `month`.
- **The Autocomplete shells differ with no words typed**: the web suggests every option once it is
  opened, Flutter none (its `optionsBuilder` returns nothing for empty words).

## Viewer playgrounds, Task 12: navigation, paging and cards

34. **A child's words start at the child's sample words** where Figma records none: `controls.mjs`
    now gives a component slot's words control the child's `WORDS` entry (Tag's "Label") instead of
    '', so Card's, Launch Card's and Tree Item's `tag label` start at "Label" (tested in
    `playground-controls.test.mjs`).
35. **A part is drawn in its parent, placed by its controls**: Tab Item first of three in a Tabs
    (its siblings Activity and Settings), `selected` choosing it or the sibling chosen last, as
    Segmented Control Item (16), the strip given the item's size, since a tab takes its strip's;
    Breadcrumb Item after a sample Home, its `type` placing it (a link in the middle, a sample current
    page after it; the current page last), since the trail decides the type by place; PaginationItem
    first of a row of three (its page and the next two), `selected` as Tab Item's, the row's gap
    SOLAR's `stack.2xs`. **Step is the second of three in a Stepper**: the Stepper makes its Steps
    from labels and takes none from a caller, so the Step's `status` places the Stepper's active
    step (upcoming 0, active 1, complete 2; error: active and error 1) and its `type` picks the
    Stepper (round: `with label`, horizontal: `line+text`); its words the `label` extra, its siblings
    Account and Confirm. A completed step pressed goes back to it (`onStepClick`), and the Step's
    `status` follows. PaginationEllipsis and Stepper Indicator (a `number` extra) are drawn alone.
36. **Stepper has no `steps` extra** (the plan's): the IR's `step3`–`step5` toggles already give two
    to five steps (as Button Group, 8); sample labels Account, Profile, Devices, Review, Done.
    `activeStep` is an integer extra, 0–4 (a slider in Widgetbook), kept within the steps shown and
    written back. Under it, an app's Back and Next Buttons (the Stepper has none: they are the
    Multi-step Wizard's) move it, logged `onClick: "Next"` (Flutter `onPressed`); a completed step
    goes back to it (`onStepClick`).
37. **PageNavigator holds its page in the IR's `pageIndicator` words**, no `page` or `count` extras:
    their first two whole numbers are the page and the count ("1 of 10", "Step 1/10"), shown as
    typed (the shells' `indicator`); going back or on rewrites the first number in the tester's
    wording; words with fewer than two numbers are one page; a page past the count is written back.
38. **Breadcrumbs' `items` extra is 1–7** (3 at first; past five the middle collapses to the
    shells' ellipsis menu), over seven sample pages; choosing a page goes to it, as an app's trail
    does: `items` becomes its place, and the click is logged with its words.
39. **Tree Item**: `label`, `depth` (0–10), `checked` and `counter count` extras (the IR holds none
    of them); its `chevron` icon control stands for whether it has children, since both shells draw
    their own chevron (`_none`: a leaf, as 19); its status a success StatusIndicator; `buttons` shows
    both actions (`onMore`, `onAdd`, logged). A click selects it, the chevron expands it, the
    checkbox checks it, each set and logged; on the web F2 starts a rename (`onRenameStart` sets
    `edit`), Enter renames it (`label` set, `edit` cleared), Escape cancels. Flutter's widget has no
    F2 (reported below), so there `edit` from the panel starts one.
40. **The cards**: each pressable card logs its press (web `onClick`, Flutter `onPressed`). A press
    makes Insight Card and Option Card the current one of their set (`selected` set true, as a
    List's row, 31); Image Card is selected by its Checkbox (shown on hover), its press (opening
    it) only logged; Interactive Card by its control or its press (toggling it; a radio's press only
    chooses it). Interactive Card's control is the `control` select's, drawn while that control's
    slot toggle (`checkbox`, `radioButton`, `toggle`) is on; its `actions` three sample Icon Buttons
    (Edit, Duplicate, Delete). Every More menu offers the same sample actions (Edit, Duplicate,
    Delete), each logged with its words (web `onSelect`, Flutter `onSelected`), from a shared helper
    (`stories/playground/cards.ts`, `widgetbook/lib/playground/cards.dart`); where the IR has a
    `more` icon control (Card, Event Row) it shows or hides the menu, as 19.
41. **Content toggles**: Card's, Container's and Split Dropdown's zones hold a SOLAR Skeleton (a
    neutral placeholder, as the Dialog's); Accordion's, Expandable Card's and Action Card's hold
    their `description` words, the content slot's own text layer. Action Card's `cta` toggle gates
    both calls to action (each also its own toggle and words); its primary is drawn as Figma draws it
    per status (a secondary once `done`, a danger primary in `danger`).
42. **Extras and words for the rest**: Tabs' `selected` (Overview, Activity, Settings; a
    `SampleTab` enum in Flutter's samples); Tab Item's `counter count` (3, as Button's); Breadcrumb
    Item's and Step's `label` (Figma's "Label", "Step"); Device Card's `tag` ("Online"; its IR has
    no tag; cleared, none); Launch Card Full Screen's `features` (0–3 of Figma's sample paragraphs;
    its picture always shown, having no toggle). `WORDS` from Figma's words as the visual cases
    carry them: titles, descriptions, Card's helper "Helper", Status Card's "5", Image Card's,
    Device Card's and the Launch Cards' words. Insight Row's action is a Button in Figma's words,
    "Label", with no words control (its slot names no component). Device Card's devices Dropdown
    logs a choice and keeps none (choosing goes to that device). Launch Card's one favourite sits on
    the picture (`favourite`) or beside the name where there is none (`favouriteNoImage`), which
    toggle applying by `image`; its actions Learn more and Open. Nav Item is given no `iconSolid`:
    the builder interface has no icon by name, and the tester can pick a solid icon.
43. **An app's icon differs by platform**: the web's Launch Cards show Workplace's App Icon
    (`@bwp-web/assets`); solar_flutter ships no App Icons, so Flutter's show the sample picture.

Defects found, reported and left alone:

- **The web Device Card and Launch Card never show their name**: the shared card descriptor writes
  a visually hidden rule for `& .Solar<Name>-name` (the loading action's name, Insight Row's
  severity word), which is also the public class of a slot called `name` (`Solar<Name>-<slot>`), so
  the name slot is always 1px and clipped (`packages/codegen/src/components/shared/card.mjs`, "A
  name read and never seen"). The visual checks do not see it.
- **Flutter's Tree Item has no F2 to start a rename** (the web's `onRenameStart`); `edit` is the
  caller's alone (`solar_tree_item.dart`).
- **Flutter's Breadcrumbs redraws its last item as a plain current page**, dropping its `disabled`
  (`solar_breadcrumbs.dart`); the web clones it with `type: 'current'` and keeps it.

## Viewer playgrounds, Task 13: tables, overlays and dialogs, calendar, charts

44. **A table's part is drawn in its parent, the parent deciding what it decides**: a Row in a Table,
    whose `selectable` and `expandable` are the Row's `checkBox` and `expand` toggles (a Table says
    which cells its rows draw); a title Row is the Table's header, any other sits under a sample
    header row. Column Item in a Row in a Table (in the header row where `header` is on). RowSelect
    as the first cell of its Row beside a sample cell, since a Row draws its own RowSelect and takes
    none; its `selected` and `mixed` extras (its row's), a click clearing `mixed`. PropertyRow in a
    PropertyList, whose `inCard` is the row's own control (the list gives its rows its look).
45. **Table and Row are live**: Table's `selected` extra holds the selected sample rows' names
    comma-separated (as Options List's `checked`, 33), which the rows' and the header's select cells
    set (the header's mixed where some are); its `expanded` extra shows the sample group: expandable,
    the first of the three sample devices is a group's top row over the other two (middle, bottom).
    Row has the same `expanded` extra, for a top row. A row's press is logged with its name.
46. **A cell's or a property's control keeps no value**: Column Item's, PropertyRow's and
    PropertyList's composed controls (Dropdown, Toggle, Select, Segmented Control, Buttons) are the
    row's or the entity's data, drawn at sample values, their callbacks logged and kept by none (as
    Device Card's devices Dropdown, 42); a Text Input types as it does alone. What a Column Item or
    PropertyRow holds decides its type in the shells' order, so with every toggle on (Figma's
    visibility) Column Item is a user cell, and a later part shows once the earlier ones are hidden.
    PropertyRow's `trailing` toggle gates all six controls. Column Item's header sort is logged.
47. **A slot drawn twice by breakpoint or cta is shown by the toggle of the one drawn**: the shells
    draw the caller's one part in whichever layer the breakpoint or cta draws, so TableHeader reads
    `segmentedControl` or `segmentedControlMobile`, `actions` or `actionsMobile`; TableFooter
    `rowsPerPage` or `rowsPerPageMobile`, `pagination` or `paginationMobile`; Split Dialog `left` or
    `leftRegular`, `actions` or `actionsRegular`. TableHeader's `query` and `view` (All, Online,
    Offline) and TableFooter's `rows` (10, 25, 50) and `page` (of twelve) are extras, so its
    SearchField, Segmented Control, Dropdown and Pagination are live.
48. **The dialogs log their own callbacks**: ConfirmationDialog `onConfirm` and `onCancel`; its
    Escape and Scrim, which the web shell reports as `onCancel`, are logged `onCancel` in Flutter too,
    through a new `dismissEvent` on `PlaygroundRoute` (`widgetbook/lib/playground/overlay.dart`,
    `onClose` by default). Split Dialog's and Drawer's actions, Cancel and Continue, close them and
    log the Button's callback with its words (web `onClick`, Flutter `onPressed`), not the Dialog
    pilot's `actions`, which could be aligned. Their panes and content are a Skeleton, as the
    Dialog's.
49. **Scrim is shown alone over the page** (an `open` extra): a click dismisses it (web `onClick`,
    Flutter `onDismiss`); Escape, which the surface above it would take, hides it, logged `onClose`:
    on the web a key listener in the builder, in Flutter a route of its own
    (`PageRouteBuilder`, not opaque, dismissible), its page the SolarScrim, which Escape pops.
50. **Tooltip's trigger is the "Open" button**, which it describes. The shells take no `open`
    (reported). On the web it is reached through MUI's theme default props for the one MuiTooltip
    under the builder (`open`, `onOpen`, `onClose`), which the shell does not set: a hover shows it
    after its delay and sets `open` (logged `onOpen`), leaving or Escape clears it (`onClose`), and
    `open` from the panel or the button's press forces it until a hover ends or Escape. MUI's own
    quirk stays: Escape does not cancel a hover's pending open. In Flutter `open` forces it by giving
    the trigger the focus (the widget shows on focus), Escape clears `open` (a keyboard handler), and
    a hover shows it without telling the panel, since the widget tells no one; nothing is logged.
51. **Popover's `title` and `body` are extras** (Figma's "Popover Title" and its sample line; its
    IR has no text slot), a cleared body left out. Coachmark is a step about the "Open" button; its
    Back and Next only log (the tour is the app's).
52. **The Flutter open-state test counts a floating surface as shown** (a tooltip, popover or
    coachmark: a `CompositedTransformFollower` more than before). The Widgetbook tests of these
    builders load solar_flutter's bundled fonts (`loadBundledFonts` in `widgetbook/test/helpers.dart`,
    as the visual checks do), since the test font's square glyphs overflow fixed-width parts (a Time
    Axis Label, a Day Cell's date pill) and the Calendar Toolbar at the test's 800 wide.
53. **The calendar parts**: on the web those with a grid role (Calendar Day Cell, Weekday Header,
    Time Axis Label, Time Slot) are drawn in a grid's row, as Date Picker Day Cell (31); in Flutter
    alone. A Day Cell takes no click on either (Flutter's takes none; reported below); its events are
    three sample Event Chips (Team standup, Design review, Lunch). Time Slot's and Agenda Row's press
    sets `selected` and is logged. Event Chip's `repeating` icon control stands for whether it repeats
    (as Tree Item's chevron, 39). Calendar Toolbar's `view` extra (Day, Week, Month, Agenda) makes its
    switcher live; previous, next and Today only log (the range is the tester's words).
54. **The charts' data are extras**: Sparkline's `data` (a rising sample series), its `trend` the
    control's always, which colours the line whatever the values do (the shells derive a trend only
    where none is given). Bar and Bar Stack fill the box their chart gives them and have no size of
    their own, so each is drawn in a box of `length` × `thickness` extras, in px (Figma's 32 × 80 at
    first; a Bar a column, a stack along its orientation): the chart's data, as the description says,
    like the width box. Bar Stack's shares are the `segments` text (Figma's sample 24, 32, 20, 48), in
    Figma's four sample colours in turn. Data Legend's `items` (1–4) and Chart Tooltip's `rows` (1–3)
    add sample series (Active users, Sessions, Bookings; 60.4k, 42.7k, 18.9k), coloured by the SOLAR
    chart theme's series palette (`solarChartTheme`, `SolarChartTheme`), as a SOLAR chart colours
    them; the first series is the IR's `label` (and `value`).
55. **Sample words** (`WORDS`, Figma's where it records no prop): Column Item's `name` "Daniel
    Salmonsson", TableFooter's "rows per page", Split Dialog's "Dialog Title", Coachmark's "Title",
    "Tutorial step text" and "1 / 6 steps", Day Cell's "15", Agenda Row's times and meta, Data
    Legend's "Active users", Chart Tooltip's "Jan 2026" and "60.4k" (its `label` left empty, so it
    starts as Figma's single tooltip).
56. **Both registries are checked complete now**: a web unit test (`test/playground.test.mjs`) and
    the Flutter `playground_test.dart` assert that the builders are exactly the components with
    Playground controls, ahead of Task 14's generated registries.

Defects found, reported and left alone:

- **Tooltip takes no `open` and tells no one when it shows or hides**, on either platform
  (`packages/components/src/Tooltip.tsx`, `solar_tooltip.dart`): an app cannot show it on demand
  (a first-run hint) or follow it. The web builder reaches MUI's through the theme (50).
- **Flutter's Sparkline crashes on a `List<double>`**: `sparklinePoints` reduces its `List<num>`
  parameter with `math.min`, which a `List<double>` at run time refuses (a TypeError), so
  `SolarSparkline(data: [1.0, 2.0])` throws (`solar_sparkline.dart`). The builder passes `num`s.
- **Flutter's Calendar Day Cell, Event Chip and All-Day Bar take no press**, where the web's take
  `onClick` (their props extend Box's), though each says what a click does is the caller's.

## Web component fixes the Playgrounds surfaced

57. **A target and a button's reset are one rule**: `targetArea(selector, { rules })`
    (`packages/codegen/src/components/shared/target.mjs`, with `BUTTON_RESET`) writes the element's
    own declarations into the target's rule, since a second key of the same selector replaces the
    first. The bug was wider than reported: besides Alert, Alert Small and Toast (reset lost, grey
    native buttons), Counter's and Step's buttons lost their reset the same way, and Coachmark's and
    Tag's close buttons lost the target's `position: relative` (their 44 × 44 targets were placed
    around the component's root). All six fixed; `test/target.test.mjs` now checks every target in
    every descriptor (element positioned; a native button's reset beside it), and
    `test/messages.test.mjs` the callouts' and Toast's emitted rule.
58. **The cards' visually hidden words are `Solar<Name>-visuallyHidden`** (MUI's word;
    `VISUALLY_HIDDEN` in `shared/card.mjs`, written by the Card, Device Card, Insight Card, Insight
    Card Small, Status Card and Insight Row shells), a class of the shell's own in the single-dash
    space as `-press` is, where `-name` was the public class of Device Card's and Launch Card's
    `name` slot. Stepper's own `-name` is left (it has no `name` layer); a test in
    `test/classes.test.mjs` fails any recipe rule that hides words on a slot's or layer's class.
59. **The visual check's `words` now requires the words to be seen**: not clipped (`clip-path`)
    and more than 1px wide and tall (`components.spec.mjs`, with a self-test). A tightening, not a
    loosening. The checks had missed the hidden card name because a text layer is compared on its
    colour and type (which a clipped element keeps) and `words` asked only for text content. The
    tightened check at once found a second, older bug: **Device Card's batch Dropdown drew its words
    0 wide**, because the cards raise every control above the stretched action with `position:
relative`, which also caught MUI Select's hidden native input (absolute under the field), put it
    in the field's row and squeezed the combobox to nothing. The raise now skips
    `[aria-hidden="true"]` (`shared/card.mjs`), tested in `test/cards.test.mjs`.
60. **Select's and Dropdown's panels are portaled into a host in the picker's root**, not drawn in
    place (`components/src/internal/panel.tsx`, `usePickerPanel`; the host
    `Solar<Name>-panelHost` is first in the root, `display: contents` from `pickerResets`). MUI's
    modal hides the siblings of its own element in its container; with the host as its container
    it has none, so nothing is hidden, and the recipe still reaches Select's panel and the visual
    check still measures it (both were why `disablePortal` was used). Portaling to the body would
    have lost both for Select, and Dropdown takes the same path for one behaviour. Costs: the page
    is no longer locked while a panel is open (the modal would lock the host), so the panel follows
    its field on any scroll (Popover's `updatePosition`, from a capture-phase scroll listener), and
    the rest of the page stays reachable to a screen reader while the listbox holds the focus (the
    APG's combobox popup is not modal either). The panel is also no longer trapped in the field's
    stacking context (the field's target makes it `isolation: isolate`). Tested in the Playwright
    playground spec (the listbox has no `aria-hidden` ancestor, Select and a new Dropdown test).
61. **Inline Input spends Enter and Escape** (`preventDefault` in the input's `onKeyDown`), so the
    key does not press the edit button the focus moves to; the playground test now confirms with
    Enter and checks it stays closed with the focus on the edit button.
62. **A vertical Divider stretches in its row on the web**: a new descriptor table,
    `mui.stretch` (`MUI_STRETCH` in `src/emit/mui-component.mjs`; Divider's `stretch:
['height']`), writes the root's FILL as `height: auto; align-self: stretch`, which a flex or
    grid parent stretches (and a stretched size is definite, so the rule's `100%` resolves).
    Divider only, not every root FILL: Drawer and Scrim are fixed boxes whose `100%` is right. A
    divider in a block parent of a set height now gets no height, where `100%` gave it that
    height; the README says the row or grid cell stretches it. The builder's `height: auto`
    workaround is gone; a Playwright test checks the stretch.
63. **A vertical Divider is full only, on the web** (Divider.tsx types, as Button Group's refuse
    a vertical full-width group; the shell draws a vertical divider full whatever `type` a caller
    or theme gives; the builder writes `full` back). `solar:explain` shows why the vertical inset
    and labelled dividers filled the width: Figma draws four variants (horizontal full, inset,
    labelled; vertical full) and its description names the three types for a horizontal divider
    only, so Figma's data is right; the IR composes the two missing looks from the independent axes
    (direction follows orientation, the inset and gap follow type) while the extent follows both
    axes, which only vertical-full supplies, so they fell back to the horizontal base (width
    `100%`, and a 1px root on the web), and the labelled one's second rule and words lack their
    colour too. No overlay rule can remove a combination; defining the two looks in the overlay
    would design what Figma does not draw, so the design review now asks (display primitives, and
    decision 7). **Flutter's `SolarDivider` still draws those two looks** and should refuse them
    the same way (an assert, and its builder writing `full` back), for the Flutter agent.
64. **Selection controls in a list are labelled by Option Rows**, or a `<label>` at least
    `size.target.min` tall with no negative margin; never MUI's FormControlLabel (README, Checkbox,
    Radio and Toggle sections, and the three shells' comments). Option Row is exactly 44 tall
    (inset.sm 12 twice around a 20px line), so its rows' targets meet without overlapping. No
    theme override of FormControlLabel: it would restyle it around stock controls too, and could
    not space its rows.

## Flutter component fixes the Playgrounds surfaced

65. **Flutter's Token Input keeps the focus after adding an entry**, as the web's does: the draft
    field adds on `onEditingComplete`, not `onSubmitted`, since a field given an
    `onEditingComplete` calls it in place of its default (which, for `TextInputAction.done`,
    lets the focus go). The keyboard's key still reads Done; on a phone the keyboard stays up
    between entries, which is the point (entries come in runs). The Widgetbook test no longer
    taps the draft again before Backspace, and `test/solar_token_input_test.dart` adds two
    entries in a row with no tap between.
66. **Flutter's Sparkline takes any list of numbers**: `sparklinePoints` turns the values into
    doubles before reducing them by `math.min`/`math.max` (a `List<double>` or `List<int>` given
    as `List<num>` refused `math.min` at run time). `data` stays `List<num>?`. The Widgetbook
    builder passes its `List<double>` straight; the Sparkline bullet under "Defects found" above is
    fixed by this.
67. **Flutter's Breadcrumbs keep the last item's `disabled`** when redrawing it as the current
    page (the web clones it, keeping every prop but `type`). It changes no pixel today: Figma
    draws a disabled look for a link only, so the recipe has no current-and-disabled cell. One
    difference is left: the web's item says `aria-disabled` on a disabled current page, Flutter's
    announces a current page as plain text either way.
68. **Flutter's vertical Divider is full only**, as the web's (63): `SolarDivider` asserts against
    a vertical inset or labelled divider (as `SolarButtonGroup` asserts against a vertical
    full-width group) and, past the assert in a release build, draws a vertical divider full
    whatever `type` it is given. The Widgetbook builder writes `full` back to `type` when vertical
    (as Button Group's writes `regular`), and its `Flexible` is gone: a full vertical divider is
    one border wide, so the row no longer has an unbounded width to share. README row "A vertical
    divider"; tests in `test/solar_divider_test.dart` and the Widgetbook primitives test.
69. **An Avatar of type photo or logo given no picture is drawn as the initials avatar, on both
    platforms.** Figma is silent: its photo and logo variants are drawn only with an image fill (the
    IR's `root.image`; no initials layer; a transparent fill, the photo with the medium border, the
    logo with none), and the description ("initials, photo, or company logo") says nothing of a
    missing picture. The web drew MUI's Person glyph, which is not a SOLAR icon and is coloured by
    MUI's palette, not a token; Flutter drew an empty ring (photo) or nothing to see (logo). The
    initials avatar is how Figma draws an avatar with no picture (the text type), what the web
    shell's own comment already promised ("the initials as its fallback"), and what apps do. Both
    shells draw `type` as `text` where there is no picture (web: no `src` or `srcSet`; Flutter: no
    `image`), so the caller's colour and the initials apply. Left alone: a picture that fails to
    load (the web's MUI shows the first letter of `alt` in the photo's look; Flutter's
    `DecorationImage` draws nothing), a state Figma does not draw either. The design review now asks
    (display primitives). Tests: `Avatar.test.mjs`, `solar_avatar_test.dart`, the Widgetbook Avatar
    test.
70. **Autocomplete with no words typed keeps each platform's idiom**: the web suggests every
    option when the field is clicked or ArrowDown is pressed (MUI's `useAutocomplete`; it never
    opens on focus alone), Flutter suggests nothing until words are typed (the shell's
    `optionsBuilder`, as Flutter's own Autocomplete example). SOLAR describes a field that
    "suggests matching options ... as the user types", and Autocomplete Open as the panel "shown
    while Autocomplete is filtering", with the typed words highlighted; neither platform goes
    against that, so behaviour follows the platform and nothing changed. The web's caller can
    choose (`filterOptions`, `openOnFocus`); Flutter's cannot, since the widget takes no options
    builder: listed in open-work.md's "Component API gaps the Playgrounds found".

## Wrapping up

71. **The bug-fix batch fixed bugs and recorded features.** Broken rendering, broken behaviour and
    a screen-reader fault were fixed (entries 57–69); what a component cannot do yet, because its
    API lacks it (Tooltip's `open`, Select's trailing icon, Date Picker Open's month callback,
    Flutter Select's open callbacks, Flutter Tree Item's F2, Flutter calendar parts' press,
    Password's show/hide and Inline Input's edit callbacks, Flutter Autocomplete's options
    builder), is listed in open-work.md's "Component API gaps the Playgrounds found", not built.
72. **Prettier now checks every Markdown file under `packages/solar_flutter`**: `.prettierignore`
    ignored the folders themselves (`packages/solar_flutter/**`), and a file inside an ignored
    folder cannot be let back in, so only the package's top README was ever checked. It now ignores
    the files (`packages/solar_flutter/**/*`), lets the folders and `*.md` back in, and Dart and YAML
    stay ignored. `fonts/README.md`, never checked before, was reformatted (its table's alignment
    only).

## The viewer workbench (2026-09-27)

Taken while building the workbench; the owner's own decisions for it are rows in
`docs/engineering/decisions.md` marked `Owner 2026-09-27`. How it works:
`docs/engineering/architecture.md`, The workbench; how to use it: `docs/engineering/workflows.md`,
Fix a component in the viewer.

73. **The service's logic lives in `packages/codegen/src/workbench/`**, the process in
    `scripts/workbench.mjs`, the launcher in `scripts/workbench-launch.mjs`. Alternative: the
    spec's `scripts/workbench/`. Why: the logic imports the generator's modules and `yaml`, and
    codegen's vitest runs its tests with the rest.
74. **The bars hear the service by long-polling** (`GET /events?after=<seq>`, answered within 25 s).
    Alternative: the spec's server-sent events. Why: Dart's `http` long-polls identically on the VM
    (widget tests) and the web, with no conditional imports.
75. **Inspect and Report need the component 🟡 on both platforms**, or 🟡 on one and absent from the
    other (`session.mjs`, `gateOf`). Alternative: 🟡 on the bar's own platform only. Why: a look
    edit reaches both platforms, so 🟢 on the other would be cancelled and 🔴 there means it waits
    on an unapproved component.
76. **One pending edit in the repository at a time**, persisted with the overlay's bytes before it
    in `.workbench/pending.json` (git-ignored). Alternative: one per component, or held in memory.
    Why: each edit regenerates everything, and Undo must survive a restart of the service.
77. **The sidebars' circles refresh only when the viewer next starts**; the bar shows the live one.
    Alternative: push the circle to the sidebars. Why: Widgetbook's use-case names carry the
    circle, so changing it live would change the URL. Listed in open-work.md, Workbench gaps.
78. **The bar's sections are SOLAR Buttons** (the open one `secondary`, the others `tertiary`), not
    Tabs, and **the circle is an emoji** beside the bar's title (`🟢 Workbench`), not a SOLAR
    component. Alternative: the spec's Tabs and a drawn status circle. Why (the plan recorded none):
    two sections that may both be closed act as toggles, not tabs, and the emoji is the sidebars'
    own character.
79. **The web's per-component visual check is chosen with `SOLAR_VISUAL_ONLY=<Name>`**, read by
    `components.spec.mjs`, which throws for an unknown name or a chart library's component.
    Alternative: a Playwright grep alone. Why: a grep that matches nothing passes by measuring
    nothing; unset (CI, Verify), every component runs as before.
80. **`.gitignore`'s `.claude/skills/` became `.claude/skills/*` plus `!.claude/skills/solar-feedback/`**,
    so the project skill is committed while personal skills stay ignored. Alternative: commit the
    skill elsewhere. Why: Claude Code finds project skills only there.
81. **Each bar's end-to-end tests run against a fake service**; that a chosen token reaches the
    component was proved by the batch-end smoke runs against the real service. Alternative: an
    automated test against the real service. Why: a real run regenerates the repository and takes
    minutes, and no test may write the real overlays or approvals.
82. **Behaviour parity is enforced exhaustively** (the owner's "behave the same, need not look the
    same"): at each expectation naming actions, and at every scenario's last, a bar's offered
    controls must be exactly those named; `platformActions` lists the controls one platform alone
    has (today only the web's Point). Alternative: check only the actions a scenario names. Why:
    otherwise one bar could grow a control the other lacks and no test would notice.
83. **Inspect offers only the scopes the build accepts**, through the overlay reader's own
    `setMayAdd` (`scopes.mjs`). Alternative: offer every scope from `base` to the combined look.
    Why: a scope the build refuses would be written, regenerated and undone, seconds lost for an
    error the bar could have prevented.
84. **A cell whose raw value the overlay allows (`allowLiteral`) offers nothing**, with a note
    saying to use Report. Alternative: offer tokens there. Why: a token leaves the `allowLiteral`
    rule nothing to allow, which fails the build as stale.
85. **A `set` entry whose reason another rule borrows (`reason: { as: set … }`) cannot be deleted**
    from the workbench; replacing it is allowed, and the bar names the borrowers whose reason then
    changes. Alternative: delete it and rewrite the borrowers. Why: rewriting another rule's reason
    is a person's call, made in the file.
86. **Approve and Undo approval are refused while any edit is pending**, on any component.
    Alternative: refuse only for the edited component. Why: the checks and the fingerprint read the
    generated files, which the pending edit has changed.
87. **A component with no overlay file cannot be edited.** Alternative: create one. Why: which
    Figma address names the new file is a person's call.
88. **Approve needs `git config user.name`**, and is refused where it is unset. Alternative: a
    default or a name typed in the dialog. Why: an approval records who gave it, and the pasted line
    `solar:status` prints takes the same name.
89. **`solar:codegen` writes only the files whose formatted text differs, and formats only its own
    outputs**, never a hand-written file beside them (`spec/overlay/README.md`). Alternative: run
    Prettier over `spec/**/*.{json,md}` after writing, which formats those files too. Why: a regeneration after one edit must touch that component's files
    alone, or Storybook re-indexes everything and Widgetbook reloads for nothing.
90. **CI's and the Verify block's Prettier check cover `spec/**/*.md`**, since the generator formats
    only its own outputs, never a hand-written file beside them; **`.claude/skills/**/*.md` covers
    the committed skill.** Alternative: leave `spec/**/*.md` unchecked. Why: with 89, nothing else
    formats those files.
91. **The launchers ping the service every 30 s** (`ensureWorkbench`), which keeps it alive and
    starts it again where it has stopped. Alternative: the spec's exit a minute after the last
    viewer disconnects, with nothing to restart it. Why: a developer on a Variants page makes no
    request for minutes, and the bar should be there when they return.
92. **Report is offered with Inspect, on the same terms, and works while an edit is pending.**
    Alternative: Report on any 🟡 component, or held during an edit. Why: a note leads to a change
    that would cancel an approval, and it touches only `spec/feedback/`, so it cannot collide with
    the edit.
93. **A note names a layer and a variant only once the component has been inspected.**
    Alternative: always name the Playground's. Why: the Playground shows the resting state only, so
    only Inspect's choice is a variant the person pointed at.
94. **A Flutter colour in a note is `#rrggbb`, or `#aarrggbb` (alpha first) where not opaque.**
    Alternative: CSS's `#rrggbbaa`. Why: it is how Flutter writes a `Color`; the skill says so.
95. **`/solar-feedback` lists, rather than makes, a proposal that would cancel an approval or change
    a 🔴 component's output.** Alternative: make it and let the check fail. Why: approvals are the
    owner's, and a 🔴 component is not worked on.
96. **`/solar-feedback` stops on a pending edit** (or any `TODO(reason)`), and reviews the `set`
    rules added since the last commit. Alternative: the spec's "since its last run". Why: only a
    person presses Keep or Undo, and the last commit is the one mark the repository has.
97. **Send to agent is gated like Report**: never on a component approved on the other platform,
    even where Approve's checks failed on this one. Alternative: offer it wherever checks fail. Why:
    the agent works only on components that may change.
98. **Send to agent has one body** (`{ component, platform, note?, failures? }`). After a failing
    Keep the service uses the pending edit's own failures, ignoring the body's, records the rule
    and its value in the note, and ends the pending state with the edit kept. Alternative: separate
    routes for Keep and Approve. Why: one note shape for the skill, and the Keep path cannot send
    failures the checks did not report.
99. **An empty Send to agent note becomes a default sentence** ("The checks failed where the person
    judged the component right."). Alternative: require words. Why: the failures already say what
    to settle.
100.  **The limits**: a note of 10 000 characters, 200 failures per answer or note (the first 199 and
      one counting the rest, naming the `solar:explain` command), a request body of 1 MiB, 15
      minutes per command the service runs. Alternative: no limits. Why: one knock-on fails every
      variant (hundreds), and a hung check would hold every job.
101.  **The parity suite runs whole** behind Keep and Approve. Alternative: filter it to the
      component. Why: each of its tests covers every component, so it cannot be filtered to one.
102.  **A chart library's component runs the parity suite and `charts.test.mjs`**, having no visual
      check. Alternative: nothing. Why: the chart theme's test is what stands for it.
103.  **A failed plain regeneration at Keep leaves the edit pending**, to Undo or to fix and Keep
      again. Alternative: undo it, as a failed Set does. Why: the reason is already written, and the
      failure may be elsewhere (a Dart SDK missing).
104.  **Failing checks at Keep keep the edit pending, with its failures; Keep again reruns them.**
      Alternative: undo on failure. Why: a knock-on may be the person's intent, which Send to agent
      settles; Undo stays one press away.
105.  **Widgetbook is hot-reloaded only** (`SIGUSR1`), never hot-restarted. Alternative: the spec's
      hot restart where a reload cannot apply. Why (the plan recorded none): the service cannot tell
      when a reload is not enough, and a restart (`SIGUSR2`) loses the Playground's state; listed in
      open-work.md, Workbench gaps.
106.  **Each visual check's reports are deleted before it runs.** Alternative: read whatever is
      there. Why: a check that stops before writing would otherwise be reported by an earlier run.
107.  **An overlay edit splices the file's text** (`overlay-edit.mjs`): the yaml document finds the
      entry's lines and renders the one entry. Alternative: the spec's yaml document API re-printing
      the file. Why: re-printing re-folds every reason, so a save would move lines it did not change.
108.  **The service answers only a `Host` of `127.0.0.1` or `localhost`, and pages on `localhost` or
      `127.0.0.1`.**
      Alternative: the port on 127.0.0.1 alone. Why: a web page can rebind its own name to
      127.0.0.1; the Host check refuses it.
109.  **An agent never calls the service's Keep, Approve, Undo approval, Report or Send** (a
      person's decisions and words), and calls Set only in a test or smoke run it undoes, leaving
      no pending edit; it may run the viewers and read from the service (the controller's
      decision, in CLAUDE.md, workflows.md, the skill and a `Taken` row). Alternative: forbid all
      use. Why: then an agent could not even start a viewer, whose launcher pings `/health`; this
      keeps every decision a person's while letting agents test the tool.

### For the owner to do

- `spec/approvals.yaml`'s header comment mentions only pasting the lines `solar:status` prints, not
  the viewers' Approve and Undo approval buttons. An agent may not edit the file; update it if you
  want the header to name them.
