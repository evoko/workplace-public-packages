# Autocomplete

> SOLAR Web · Figma page `↳ 🟢 Autocomplete` (id `2163:3664`) · section `components/inputs` · raw data: [`raw/components/inputs/autocomplete.json`](../../raw/components/inputs/autocomplete.json)

## Component set: Autocomplete

Text input that suggests matching options from a data set as the user types. Pair with Dropdown Menu + Dropdown Item for the open-state suggestion list.

Use for: free-text search with hints, large picklists where Select is impractical, tag/entity pickers.
Do not use for: ≤ ~8 static options (use Select), pure search without suggestions (use Search), authoring with rich cell types (use Combobox / tag input patterns).

Props:
• size — md (field 40px, default) · sm (field 32px, dense contexts); with label and helper the component measures 76 / 66px. Drawn heights are the visible control; the 44×44px WCAG hit area is padded in code (no target-size variable exists yet).
• state — default · hover · focus · filled · disabled · error
• show label / show mandatory / show helper / show leading icon / show trailing icon — toggles for Label, \*, Helper, and the Icon/None slots inside Field.

Behavior:
• Leading icon is typically Icon/Search (swap the Icon/None slot).
• Trailing icon is typically Icon/X (clear) once the user has typed, or Icon/ChevronDown if paired with a fixed suggestion set.
• The suggestion list is NOT part of this component. Compose with Dropdown Menu positioned directly below the Field, using Dropdown Item rows for suggestions.

### Props

| Prop                 | Type          | Options / default                                       |
| -------------------- | ------------- | ------------------------------------------------------- |
| `size`               | variant       | **md** · sm                                             |
| `state`              | variant       | **default** · hover · focus · filled · disabled · error |
| `show label`         | boolean       | default `true`                                          |
| `show mandatory`     | boolean       | default `true`                                          |
| `show helper`        | boolean       | default `true`                                          |
| `show leading icon`  | boolean       | default `true`                                          |
| `show trailing icon` | boolean       | default `true`                                          |
| `Leading Icon`       | instance swap | default `10148:444`                                     |
| `Trailing Icon`      | instance swap | default `10148:444`                                     |

Default variant: `size=md, state=default` · 12 variants · default size 240×76px

### Anatomy (default variant)

- **size=md, state=default** · component · column gap 8 pad 0/0/0/0 FIXED/HUG · 240×76  
  itemSpacing `stack.xs`
  - **Label** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10  
    itemSpacing `inset.2xs` · prop visible←show label
    - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show label
    - **\*** · text `label/md` "\*" · HUG/HUG · 8×10  
      fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←show mandatory
  - **Field** · frame · row gap 8 pad 0/16/0/16 FILL/FIXED · 240×40  
    fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.md`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm` · prop visible←show leading icon, mainComponent←Leading Icon
    - **Search...** · text `body/md/regular` "Search..." · FILL/HUG · 160×10  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm` · prop visible←show trailing icon, mainComponent←Trailing Icon
  - **Helper text** · text `helper/md` "Helper text" · FILL/HUG · 240×10  
    fill `color.text.secondary` · lineHeight `type.line-height.helper.md` · fontFamily `type.font-family.inter` · fontSize `type.size.helper.md` · fontStyle `type.font-weight.400` · prop visible←show helper

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                                                                                                                              |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                             |
| Text color      | `color.text.disabled`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                              |
| Icon color      | `color.icon.disabled`, `color.icon.feedback.danger`, `color.icon.primary`, `color.icon.tertiary`                                                                                                                                  |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.xs`, `stack.xs`                                                                                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                  |
| Sizes           | `icon.sm`                                                                                                                                                                                                                         |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.helper.md`, `type.line-height.label.md`, `type.size.body.md`, `type.size.helper.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                                                                                                                                                  |
| Text styles     | `body/md/regular`, `helper/md`, `label/md`                                                                                                                                                                                        |

### Slots and prop-controlled layers

| Layer             | Controlled property | Prop                 |
| ----------------- | ------------------- | -------------------- |
| Label             | visible             | `show label`         |
| Label › Label     | visible             | `show label`         |
| Label › *         | visible             | `show mandatory`     |
| Field › Icon/None | visible             | `show leading icon`  |
| Field › Icon/None | mainComponent       | `Leading Icon`       |
| Field › Icon/None | visible             | `show trailing icon` |
| Field › Icon/None | mainComponent       | `Trailing Icon`      |
| Helper text       | visible             | `show helper`        |

### Composes

- Icon/None

### Variant matrix

| size | state    | size   | fill | stroke | effect | text                                                                                                  | icon                         |
| ---- | -------- | ------ | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| md   | default  | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary`        |
| sm   | default  | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary`        |
| md   | hover    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary`        |
| sm   | hover    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary`        |
| md   | focus    | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| sm   | focus    | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| md   | filled   | 240×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| sm   | filled   | 160×66 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.secondary`                          | `color.icon.primary`         |
| md   | disabled | 240×76 |      |        |        | `color.text.disabled`                                                                                 | `color.icon.disabled`        |
| sm   | disabled | 160×66 |      |        |        | `color.text.disabled`                                                                                 | `color.icon.disabled`        |
| md   | error    | 240×76 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.icon.feedback.danger` |
| sm   | error    | 160×66 |      |        |        | `color.text.feedback.danger`<br>`color.text.primary`                                                  | `color.icon.feedback.danger` |

## Component: Autocomplete Open

Expanded panel shown while Autocomplete is filtering. Lists matched options with the typed substring highlighted. Supports grouped sections, recent-search rows, and 'No matches' empty state. Positions under the input, flips above when it would clip. Max height triggers internal scroll.

### Anatomy (default variant)

- **Autocomplete Open** · component · column gap 4 pad 0/0/0/0 HUG/HUG · 320×214  
  itemSpacing `stack.2xs`
  - **Autocomplete** · instance of **Autocomplete** (size=md, state=focus) · column gap 8 pad 0/0/0/0 FILL/HUG · 320×40  
    itemSpacing `stack.xs`
  - **Dropdown Menu** · instance of **Dropdown Menu** (size=md) · column gap 0 pad 0/0/0/0 FIXED/HUG · 320×170  
    fill `color.surface.overlay` · stroke `color.border.medium` 1px · effect `shadow/overlay` · padding `inset.none` · strokeWeight `border.default` · radius `radius.container`

### Tokens used

| Role         | Tokens                                |
| ------------ | ------------------------------------- |
| Fills        | `color.surface.overlay`               |
| Strokes      | `color.border.medium`                 |
| Spacing      | `inset.none`, `stack.2xs`, `stack.xs` |
| Radius       | `radius.container`                    |
| Border width | `border.default`                      |
| Effects      | `shadow/overlay`                      |

### Composes

- Autocomplete
- Dropdown Menu

## Documentation card

**Description**

Text input that suggests matching options from a data set as the user types. Use when the option count exceeds what fits in a Select (~7), or when fuzzy matching on long strings (users, emails, cities) is the point. Pair with Autocomplete Open for the suggestion panel.

**Sizes & States**

size=sm (36px) / size=md (44px)  
States: default, hover, focus, filled, disabled, error.  
When focused with input → the Autocomplete Open panel renders below (flips above when clipped).

**Content**

Label: what's being searched ("Assign to", "Search cities"). Placeholder: give an example, not instructions ("e.g. alice@", not "Type to search"). Highlight matched substring in the suggestion list. Empty state: "No matches" with a CTA if creation is allowed ("Create \"Acme Corp\"").

**Accessibility**

role="combobox" with aria-autocomplete="list", aria-expanded, aria-activedescendant pointing at the highlighted option. Listbox: role="listbox" with role="option" children. Keyboard: type to filter; ↑/↓ moves highlight; Enter commits; Esc closes. Screen reader announces result count via aria-live.

**Rules**

Do  
• Debounce requests (~150-250ms) to avoid flooding  
• Highlight the matched substring in results  
• Show an empty state with a creation CTA when applicable  
• Announce result count via aria-live

Don't  
• Don't fire a request on every keystroke — debounce  
• Don't clear the user's typed value when the panel closes  
• Don't use for < ~7 fixed options — use Select  
• Don't auto-select the first result — the user commits
