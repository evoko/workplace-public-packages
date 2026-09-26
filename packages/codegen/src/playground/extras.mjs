/**
 * Each component's own Playground controls: the values its IR does not hold, but an app gives it
 * (a Text Input's typed words, a Pagination's page, an overlay's `open`). One hand-written table,
 * which `controlsOf` (controls.mjs) appends after the width, so Storybook's `virtual:solar` and
 * Widgetbook's generated `controls.dart` both carry them and the two viewers offer the same
 * extras by construction. A builder reads them as it reads any control.
 *
 * Each entry: `{ name, kind, default, options?, min?, max?, step? }`, where `kind` is `text`,
 * `number`, `integer`, `boolean` or `select` (a select's `options` hold its default). An extra
 * whose name is one of the component's IR controls, or an entry for a component with no
 * Playground, fails the build (controls.mjs). A comment per component says why it needs each.
 *
 * `WORDS` beside it gives a text slot sample words where Figma records none (its words are the
 * caller's, and Figma's text layer carries no prop), so its control does not start empty: the
 * control is still the IR's, at these words instead of ''. An entry for a slot that is no text slot,
 * or whose words Figma records, fails the build, so none outlives the reason for it.
 */

export const EXTRA_KINDS = ['text', 'number', 'integer', 'boolean', 'select'];

export const EXTRAS = {
  // The label's words (the IR holds the label as a toggle alone, no text slot); the words in the
  // field, the app's, which typing sets and choosing a suggestion fills (the IR draws Figma's
  // placeholder, in no text slot).
  Autocomplete: [
    { name: 'label text', kind: 'text', default: 'Label' },
    { name: 'value', kind: 'text', default: '' },
  ],
  // An open Autocomplete, which the IR composes from Figma's instances and holds nothing of: the
  // words typed are the app's, starting at a query every sample suggestion matches, since the
  // suggestions show only for words typed in Flutter.
  'Autocomplete Open': [{ name: 'value', kind: 'text', default: 'n' }],
  // The picture is the app's: a photo or logo avatar shows it where `picture` is on (off, as where
  // an app has none yet). Its name, which names it and gives its initials, and initials of the
  // app's own, are the caller's words; the IR holds only the size, type and colour.
  Avatar: [
    { name: 'name', kind: 'text', default: 'Dana Scully' },
    { name: 'initials', kind: 'text', default: '' },
    { name: 'picture', kind: 'boolean', default: true },
  ],
  // The Counter a Button holds shows a number its shell takes, which the Counter's IR holds in
  // no text slot, so the `counter` slot's words cannot carry it.
  Button: [{ name: 'counter count', kind: 'integer', default: 3, min: 0 }],
  // A menu is shut until its trigger opens it; the IR draws it open, and holds no state.
  'Context Menu': [{ name: 'open', kind: 'boolean', default: false }],
  // The count is a number its shell takes, which the Counter's IR holds in no text slot.
  Counter: [{ name: 'count', kind: 'integer', default: 3, min: 0 }],
  // The date chosen is the app's, ISO (`YYYY-MM-DD`); the IR draws the grid with no choice. Its
  // `month` text is the month shown.
  'Date Picker Open': [{ name: 'value', kind: 'text', default: '2026-04-15' }],
  // An overlay is shut until its trigger opens it; the IR draws it open, and holds no state.
  Dialog: [{ name: 'open', kind: 'boolean', default: false }],
  // A labelled divider's words are the caller's; the IR draws Figma's sample, in no text slot.
  Divider: [{ name: 'label', kind: 'text', default: 'Or' }],
  // The label's words (the IR holds the label as a toggle alone, no text slot), and which of the
  // three sample options is chosen, the app's (`none`: the placeholder shows).
  Dropdown: [
    { name: 'label text', kind: 'text', default: 'Label' },
    {
      name: 'value',
      kind: 'select',
      default: 'none',
      options: ['none', 'Option 1', 'Option 2', 'Option 3'],
    },
  ],
  // A heading's words are the caller's; the IR draws Figma's sample, in no text slot.
  'Dropdown Group Label': [
    { name: 'label', kind: 'text', default: 'Group Label' },
  ],
  // A row's words are the caller's; the IR draws Figma's sample, in no text slot.
  'Dropdown Item': [{ name: 'label', kind: 'text', default: 'Option label' }],
  // A menu is shut until its trigger opens it; the IR draws it open, and holds no state.
  'Dropdown Menu': [{ name: 'open', kind: 'boolean', default: false }],
  // Its label's words are the caller's; the IR draws Figma's sample label in no slot. The files'
  // names are what the app's picker chose (the browser's own on the web; in Flutter the app's, which
  // the Playground's Browse stands in for), comma-separated; the IR draws Figma's sample name, in no
  // text slot.
  FileUpload: [
    { name: 'label', kind: 'text', default: 'Upload a file' },
    { name: 'files', kind: 'text', default: '' },
  ],
  // What it searches, the query the app's search holds and the key that opens it are the app's; the
  // IR draws Figma's sample words and key, in no text slot. A trigger, not a field: nothing is typed
  // in it.
  GlobalSearch: [
    { name: 'placeholder', kind: 'text', default: 'Search Workplace' },
    { name: 'query', kind: 'text', default: '' },
    { name: 'shortcut', kind: 'text', default: '⌘K' },
  ],
  // The key's label is the caller's; the IR draws Figma's sample key, in no text slot.
  Kbd: [{ name: 'label', kind: 'text', default: '⌘K' }],
  // The link's words are the caller's; the IR draws Figma's sample, in no text slot.
  Link: [{ name: 'label', kind: 'text', default: 'Link text' }],
  // A row's words are the caller's; the IR draws Figma's sample, in no text slot.
  ListItem: [{ name: 'label', kind: 'text', default: 'List item label' }],
  // A row's words are the caller's, and whether its control is on, or disabled, the app's; the IR
  // draws Figma's sample words, in no text slot, and each control off and enabled.
  'Option Row': [
    { name: 'label', kind: 'text', default: 'Option label' },
    { name: 'checked', kind: 'boolean', default: false },
    { name: 'disabled', kind: 'boolean', default: false },
  ],
  // The question the rows answer (the fieldset's legend, read by a screen reader) and which of the
  // three sample rows are checked, comma-separated, are the app's; the IR draws Figma's sample rows,
  // all off.
  'Options List': [
    { name: 'label', kind: 'text', default: 'Notify me by' },
    { name: 'checked', kind: 'text', default: 'Email' },
  ],
  // The label's words (the IR holds the label as a toggle alone, no text slot); the number typed,
  // the app's, as words, so that an empty field (null) is '' and the control holds exactly what the
  // field shows; and the range the steppers clamp to, the app's.
  'Number Input': [
    { name: 'label text', kind: 'text', default: 'Label' },
    { name: 'value', kind: 'text', default: '1' },
    { name: 'min', kind: 'integer', default: 0 },
    { name: 'max', kind: 'integer', default: 10 },
  ],
  // Which page is current, and how many there are, are the app's; the IR draws one sample row.
  Pagination: [
    { name: 'page', kind: 'integer', default: 1, min: 1 },
    { name: 'count', kind: 'integer', default: 12, min: 1 },
  ],
  // The label's words (the IR holds the label as a toggle alone, no text slot), and the words typed,
  // the app's.
  'Password Input': [
    { name: 'label text', kind: 'text', default: 'Password' },
    { name: 'value', kind: 'text', default: '' },
  ],
  // The label's words (the IR holds the label as a toggle alone, no text slot); how many digits the
  // code has (SOLAR's 4 to 6), the app's; and the digits typed, the app's.
  'PIN Input': [
    { name: 'label text', kind: 'text', default: 'Label' },
    { name: 'length', kind: 'integer', default: 6, min: 4, max: 6, step: 1 },
    { name: 'value', kind: 'text', default: '' },
  ],
  // How far along is the app's; the IR draws each feedback at one sample length. In percent on
  // both platforms (the web takes 0 to 100, Flutter 0 to 1).
  ProgressBar: [
    { name: 'value', kind: 'integer', default: 40, min: 0, max: 100 },
  ],
  // Which radio of the group is chosen is the group's (its value), the app's; the IR draws one
  // radio, and its `checked` says whether the group holds a choice at all.
  Radio: [
    {
      name: 'selected',
      kind: 'select',
      default: 'Option 1',
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
  ],
  // Whether a collapsed or expanded cell draws its chevron is its table's (a flat row's cell draws
  // none); the IR draws it always.
  RowExpand: [{ name: 'chevron', kind: 'boolean', default: true }],
  // The query typed is the app's; the IR's slots are its size, states and filter icon.
  SearchField: [{ name: 'value', kind: 'text', default: '' }],
  // Which of the three sample options is chosen is the app's (`none`: the placeholder shows); the
  // IR draws Figma's placeholder, and its `open` is the panel's.
  Select: [
    {
      name: 'value',
      kind: 'select',
      default: 'none',
      options: ['none', 'Option 1', 'Option 2', 'Option 3'],
    },
  ],
  // Which segment is chosen is the control's value, the app's; the IR draws a track of Figma's
  // sample segments, and holds no choice.
  'Segmented Control': [
    {
      name: 'selected',
      kind: 'select',
      default: 'Day',
      options: ['Day', 'Week', 'Month'],
    },
  ],
  // A segment's words are the caller's; the IR draws Figma's sample, in no text slot.
  'Segmented Control Item': [{ name: 'label', kind: 'text', default: 'Day' }],
  // The value is the app's; the IR draws the handle at one sample place. In percent on both
  // platforms (the web takes 0 to 100, Flutter 0 to 1), as ProgressBar's.
  Slider: [{ name: 'value', kind: 'integer', default: 50, min: 0, max: 100 }],
  // The range's two ends are the app's; the IR draws them at sample places. In percent, as
  // Slider's.
  'Slider Range': [
    { name: 'low', kind: 'integer', default: 20, min: 0, max: 100 },
    { name: 'high', kind: 'integer', default: 80, min: 0, max: 100 },
  ],
  // A tag's status dot, and its close button (a user's entry, removable), are the caller's to ask
  // for (the dot by a prop, the button by a callback): the shells derive Figma's five types from
  // them, and the IR holds neither. Its icon is the IR's `icon`.
  Tag: [
    { name: 'indicator', kind: 'boolean', default: false },
    { name: 'closable', kind: 'boolean', default: false },
  ],
  // The words typed are the app's; the IR's text slots are its label, helper and count.
  'Text Area': [{ name: 'value', kind: 'text', default: '' }],
  // The words typed in the field are the app's; the IR's text slots are its label and helper.
  'Text Input': [{ name: 'value', kind: 'text', default: '' }],
  // The time chosen is the app's, `HH:MM` (24-hour); the IR draws Figma's sample times with none
  // chosen.
  'TimePicker Dropdown': [{ name: 'value', kind: 'text', default: '09:00' }],
  // The words for the time, and for `combined` the absolute time they abbreviate, are the app's,
  // formatted in the user's locale; the IR draws Figma's sample words, in no text slot.
  Timestamp: [
    { name: 'text', kind: 'text', default: '2 min ago' },
    { name: 'detail', kind: 'text', default: 'Apr 18, 2026, 14:32' },
  ],
  // The entries it holds and the draft being typed are the app's, as are how many entries it draws
  // before a Counter counts the rest; the IR draws Figma's sample Tags. The entries are one text,
  // comma-separated, which both viewers can hold.
  'Token Input': [
    { name: 'tokens', kind: 'text', default: 'Design, Research' },
    { name: 'draft', kind: 'text', default: '' },
    { name: 'maxVisible', kind: 'integer', default: 3, min: 1 },
  ],
  // What the toast is about, the words of its Tag, are the caller's; the IR names no component for
  // the slot, so the derivation gives it a toggle alone.
  Toast: [{ name: 'tag label', kind: 'text', default: 'Upload' }],
  // A trail's length is the app's (how deep the page sits); the IR draws Figma's variants of two to
  // five pages. Past five the middle collapses to an ellipsis, so it goes to seven.
  Breadcrumbs: [
    { name: 'items', kind: 'integer', default: 3, min: 1, max: 7, step: 1 },
  ],
  // A page's name is the caller's; the IR draws Figma's sample, in no text slot.
  'Breadcrumb Item': [{ name: 'label', kind: 'text', default: 'Label' }],
  // Which device health the batch or device shows, a Tag's words, is the app's; the IR draws Figma's
  // sample Tag in no slot. Cleared, no Tag.
  'Device Card': [{ name: 'tag', kind: 'text', default: 'Online' }],
  // How many of the three feature paragraphs Figma draws the app gives; the IR draws Figma's sample
  // paragraphs, in no text slot.
  'Launch Card Full Screen': [
    { name: 'features', kind: 'integer', default: 3, min: 0, max: 3, step: 1 },
  ],
  // A step's words are the caller's; the IR draws Figma's sample, in no text slot.
  Step: [{ name: 'label', kind: 'text', default: 'Step' }],
  // Which step is active is the app's (its flow's); the IR draws each type at one sample step.
  Stepper: [
    {
      name: 'activeStep',
      kind: 'integer',
      default: 1,
      min: 0,
      max: 4,
      step: 1,
    },
  ],
  // The step's number is the Step's, the app's; the IR draws Figma's sample, in no text slot.
  'Stepper Indicator': [
    { name: 'number', kind: 'integer', default: 1, min: 1 },
  ],
  // The count a tab's Counter shows is a number its shell takes, which the Counter's IR holds in no
  // text slot, so the `counter` slot's words cannot carry it (as Button's `counter count`).
  'Tab Item': [{ name: 'counter count', kind: 'integer', default: 3, min: 0 }],
  // Which tab is selected is the strip's value, the app's; the IR draws a strip of Figma's sample
  // tabs, and holds no choice.
  Tabs: [
    {
      name: 'selected',
      kind: 'select',
      default: 'Overview',
      options: ['Overview', 'Activity', 'Settings'],
    },
  ],
  // The row's words (which a rename changes), how deep it sits, whether its checkbox is checked and
  // the count its Counter shows are the app's; the IR draws Figma's sample words, one depth, the
  // checkbox unchecked and a count in no text slot.
  'Tree Item': [
    { name: 'label', kind: 'text', default: 'Label' },
    { name: 'depth', kind: 'integer', default: 0, min: 0, max: 10, step: 1 },
    { name: 'checked', kind: 'boolean', default: false },
    { name: 'counter count', kind: 'integer', default: 3, min: 0 },
  ],
  // Which sample rows are selected, their names comma-separated (as Options List's `checked`), and
  // whether the sample group is expanded, are the app's; the IR draws a table of Figma's sample
  // rows, none selected, no group open.
  Table: [
    { name: 'selected', kind: 'text', default: '' },
    { name: 'expanded', kind: 'boolean', default: false },
  ],
  // Whether a top row's group is shown is the app's; the IR draws the row with no group.
  Row: [{ name: 'expanded', kind: 'boolean', default: false }],
  // Whether its row is selected, or (in the header row) some rows are and some not, is its row's,
  // the app's; the IR holds only whether it is the header's.
  RowSelect: [
    { name: 'selected', kind: 'boolean', default: false },
    { name: 'mixed', kind: 'boolean', default: false },
  ],
  // The query typed in its SearchField and the view its Segmented Control shows are the app's; the
  // IR draws Figma's samples, with no query and no view chosen.
  TableHeader: [
    { name: 'query', kind: 'text', default: '' },
    {
      name: 'view',
      kind: 'select',
      default: 'All',
      options: ['All', 'Online', 'Offline'],
    },
  ],
  // How many rows a page shows (its Dropdown's choice) and which page is current are the app's;
  // the IR draws Figma's samples, 10 rows and the first of twelve pages.
  TableFooter: [
    {
      name: 'rows',
      kind: 'select',
      default: '10',
      options: ['10', '25', '50'],
    },
    { name: 'page', kind: 'integer', default: 1, min: 1, max: 12, step: 1 },
  ],
  // An overlay is shut until its trigger opens it; the IR draws it open, and holds no state.
  ConfirmationDialog: [{ name: 'open', kind: 'boolean', default: false }],
  // An overlay is shut until its trigger opens it; the IR draws it open, and holds no state.
  'Split Dialog': [{ name: 'open', kind: 'boolean', default: false }],
  // An overlay is shut until its trigger opens it; the IR draws it open, and holds no state.
  Drawer: [{ name: 'open', kind: 'boolean', default: false }],
  // The layer behind a blocking surface shows only while that surface does; the IR draws it shown.
  Scrim: [{ name: 'open', kind: 'boolean', default: false }],
  // A tooltip shows while its trigger is hovered or focused, which `open` stands for and forces;
  // the IR draws the bubble alone.
  Tooltip: [{ name: 'open', kind: 'boolean', default: false }],
  // An overlay is shut until its trigger opens it; the IR draws it open, and holds no state. Its
  // title and words are the caller's; the IR draws Figma's sample words, in no text slot.
  Popover: [
    { name: 'open', kind: 'boolean', default: false },
    { name: 'title', kind: 'text', default: 'Popover Title' },
    {
      name: 'body',
      kind: 'text',
      default: 'Popover content goes here. This is a short description.',
    },
  ],
  // A tour's step shows only while the tour is on it; the IR draws the card alone, open.
  Coachmark: [{ name: 'open', kind: 'boolean', default: false }],
  // Which view its view switcher shows is the app's; the IR draws Figma's sample switcher, with no
  // view chosen.
  'Calendar Toolbar': [
    {
      name: 'view',
      kind: 'select',
      default: 'Week',
      options: ['Day', 'Week', 'Month', 'Agenda'],
    },
  ],
  // The values it draws are the app's, comma-separated numbers; the IR draws Figma's sample line
  // (cleared, it is drawn again).
  Sparkline: [{ name: 'data', kind: 'text', default: '4, 6, 5, 8, 7, 10' }],
  // A bar fills the box its chart gives it, its length and thickness the data's: the IR draws it in
  // Figma's 32 × 80, and holds neither.
  Bar: [
    { name: 'length', kind: 'integer', default: 80, min: 0, max: 400 },
    { name: 'thickness', kind: 'integer', default: 32, min: 1, max: 200 },
  ],
  // The segments' shares are the app's, comma-separated numbers, each in Figma's sample colours in
  // turn; the stack fills the box its chart gives it, its length and thickness the data's: the IR
  // draws Figma's sample breakdown in 32 × 80, and holds neither.
  'Bar Stack': [
    { name: 'segments', kind: 'text', default: '24, 32, 20, 48' },
    { name: 'length', kind: 'integer', default: 80, min: 0, max: 400 },
    { name: 'thickness', kind: 'integer', default: 32, min: 1, max: 200 },
  ],
  // How many series the chart names is the app's: Figma draws two to four, the first named by the
  // IR's `label`.
  'Data Legend': [
    { name: 'items', kind: 'integer', default: 2, min: 1, max: 4, step: 1 },
  ],
  // How many series the point has is the app's: Figma draws one (single) or three (multi), the first
  // in the IR's `label` and `value`.
  'Chart Tooltip': [
    { name: 'rows', kind: 'integer', default: 1, min: 1, max: 3, step: 1 },
  ],
};

/**
 * Sample words for a text slot whose words Figma records no prop for, by component and slot: the
 * words the control starts at instead of ''. Content, never a design value; SOLAR's own examples
 * where its descriptions give some.
 */
export const WORDS = {
  // Figma's title and content say "Label" and "Content", with no prop to fill either.
  Accordion: { title: 'Label', description: 'Content' },
  // Figma's title and content say "Label" and "Description goes here", with no prop to fill either.
  'Action Card': { title: 'Label', description: 'Description goes here' },
  // Figma's helper says "Helper", with no prop to fill it.
  Card: { helper: 'Helper' },
  // Figma's device, its details and a batch's count, with no prop to fill any.
  'Device Card': {
    name: 'Cambridge Qt X',
    details: 'Sound masking · PL5432109 · Auditorium 100',
    count: '3 devices',
  },
  // Figma's title and content say "Label" and "Content", with no prop to fill either.
  'Expandable Card': { title: 'Label', description: 'Content' },
  // Figma's words for the image, its details and the unfilled tile's action, with no prop to fill
  // any.
  'Image Card': {
    title: 'Title',
    subtitle: 'Last modified: 2h ago',
    label: 'Create new',
  },
  // Figma's title and description, with no prop to fill either.
  'Insight Card': { title: 'Label', description: 'Description goes here' },
  // Figma's title and description, with no prop to fill either.
  'Insight Card Small': {
    title: 'Label',
    description: 'Description goes here',
  },
  // Figma's headline and description, with no prop to fill either.
  'Interactive Card': { title: 'Headline', description: 'Description' },
  // Figma's app and what it does, with no prop to fill either.
  'Launch Card': {
    name: 'Workplace',
    bodyText: 'Book rooms and desks, and find your colleagues.',
  },
  // Figma's app and its first paragraph, with no prop to fill either.
  'Launch Card Full Screen': {
    name: 'Workplace',
    intro: 'Book rooms and desks, and find your colleagues.',
  },
  // Figma's tile says "New design", with no prop to fill it.
  'Option Card': { label: 'New design' },
  // Figma's title and figure, "Label" and "5", with no prop to fill either.
  'Status Card': { title: 'Label', value: '5' },
  // Figma's helper layer says "Helper text", with no prop to fill it.
  Autocomplete: { helper: 'Helper text' },
  // Figma's helper layer says "Helper text", with no prop to fill it.
  Dropdown: { helper: 'Helper text' },
  // Figma's second line says "Helper text", with no prop to fill it.
  'Dropdown Item': { helper: 'Helper text' },
  // Figma's second line says "Helper Text", with no prop to fill it.
  ListItem: { helper: 'Helper Text' },
  // Figma's second line says "Supporting description for this option", with no prop to fill it.
  'Option Row': { supportingText: 'Supporting description for this option' },
  // "Say why it is empty and what to do next", says the description.
  EmptyState: {
    title: 'No results',
    description: 'Try another search, or clear the filters.',
  },
  // Figma's helper layer says "Helper text", with no prop to fill it.
  'Number Input': { helper: 'Helper text' },
  // Figma's helper layer says "Helper text", and its link "Forgot password?", with no prop to fill
  // either.
  'Password Input': {
    helper: 'Helper text',
    forgotPassword: 'Forgot password?',
  },
  // Figma's helper layer says "Helper text", and its error "Code is incorrect or expired.", with no
  // prop to fill either.
  'PIN Input': {
    helper: 'Helper text',
    errorMessage: 'Code is incorrect or expired.',
  },
  // One to three words, says the description; Figma's sample layer is "Label".
  Tag: { label: 'Label' },
  // The description's own examples: "File saved", and "Undo" for the action.
  Toast: { message: 'File saved', action: 'Undo' },
  // Figma's user cell names "Daniel Salmonsson", with no prop to fill it.
  'Column Item': { name: 'Daniel Salmonsson' },
  // Figma's words beside the Dropdown say "rows per page", with no prop to fill them.
  TableFooter: { rowsPerPageLabel: 'rows per page' },
  // Figma's title says "Dialog Title", with no prop to fill it.
  'Split Dialog': { title: 'Dialog Title' },
  // Figma's step: "Title", "Tutorial step text" and "1 / 6 steps", with no prop to fill any.
  Coachmark: {
    title: 'Title',
    body: 'Tutorial step text',
    counter: '1 / 6 steps',
  },
  // Figma's date says "15", with no prop to fill it.
  'Calendar Day Cell': { day: '15' },
  // Figma's times and the event's details, with no prop to fill any.
  'Agenda Row': {
    start: '9:00',
    end: '10:00',
    range: '9:00 – 10:00',
    meta: 'Conference room A · 6 attendees',
  },
  // Figma names its sample series "Active users", with no prop to fill it.
  'Data Legend': { label: 'Active users' },
  // Figma's point and value, "Jan 2026" and "60.4k", with no prop to fill either.
  'Chart Tooltip': { title: 'Jan 2026', value: '60.4k' },
};
