# OrganizationsPanel

Organization selection **on a landing page** — the standalone screen shown before entering an app, where the user picks which organization to open (or joins/creates one). The package owns the *shell*: layout, the shared outline, dividers, scroll, and the empty-state treatment. Consumers supply the rows, the copy, and every application-level decision.

For switching organizations from *inside* an app, use the [`OrganizationSelector`](./organization-selector.md) family instead — those are built to live in the package's `BiampHeader`. The two families are complements, not versions of each other.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.13
- `@bwp-web/assets` >= 1.0.2
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `OrganizationsPanel`

Content-sized card holding the search field, the organization groups, and the join/create actions. Width defaults to 441px, capped to the viewport.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `search` | `{ value: string; onChange: (e) => void; placeholder: string }` | — | Controlled search field. The panel renders the input and nothing else — filtering is the consumer's job. Omit to render no search field. The field has no visible label, so `placeholder` also becomes its accessible name (`aria-label` on the `<input>`), overridable via `slotProps.search.slotProps.htmlInput` |
| `personalOrgItem` | `React.ReactNode` | — | The user's personal organization row (an `OrganizationRow`). Omit (or pass `undefined`) to hide the group entirely |
| `organizationsLabel` | `React.ReactNode` | — | Label for the divider above the organizations list. Omit for an unlabelled list |
| `organizationItems` | `React.ReactNode` | — | The user's other organizations, as `OrganizationRow`s. Omit (or pass `undefined`) to hide both the list and its label |
| `orLabel` | `React.ReactNode` | — | Label for the divider between the org list and the join/create actions. Omit to drop the divider |
| `empty` | `boolean \| React.ReactNode` | `false` | When truthy, shown in place of the `orLabel` divider — for a search that matched nothing. `true` renders the default `OrganizationsEmptyState`; a node renders as-is. Join/create stay visible either way |
| `joinAction` | `React.ReactNode` | — | Pre-built `OrganizationRow` for the "Join organization" row. Omit to hide the group — e.g. a user with no right to join |
| `createAction` | `React.ReactNode` | — | Pre-built `OrganizationRow` for the "Create organization" row. Omit to hide the group |
| `width` | `number \| string` | `441` | Panel width, capped to the viewport |
| `maxListHeight` | `number \| string` | `3 * 64 + 2` | Height cap on the scrollable organizations group — three 64px rows plus borders. Raise it when passing taller rows |
| `slotProps` | `OrganizationsPanelSlotProps` | — | Props for the parts the panel builds itself — see [Slots](#slots) below |
| `sx` | `SxProps<Theme>` | — | MUI system styles, merged over the panel's own (which set the fill, radius and padding). All three forms work — object, theme callback, and array of either |
| _...rest_ | `StackProps` | — | Forwarded to the root `Stack`. `children` and `width` are excluded — the panel has no children slot, and `width` is typed above |

Every slot is optional. A panel with nothing but `organizationItems` is valid, and so is one with only the two action rows — each group, divider and the search field render only when their prop is passed.

### `OrganizationRow`

A single clickable row — logo, text, chevron — built on `ListItemButton`. Extends MUI `ListItemButtonProps`, so `onClick`, `component`, `to`, `href`, `disabled`, and `ref` all work natively.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `primaryText` | `React.ReactNode` | _(required)_ | Organization name. Rendered `body2` / `fontWeight: 600` |
| `secondaryText` | `React.ReactNode` | — | Optional second line below the name, in `caption` / `text.secondary`. **No auto-prefix** — pass the full text (e.g. `"Last opened 2h ago"`) |
| `logo` | `React.ReactNode \| string` | — | Logo element or an image URL. Strings render as `<img>` filling the 40×40 logo box with `objectFit: 'cover'`, marked `alt=""` since `primaryText` already names the organization. Pass a node (`<img alt="…" />`) when the artwork carries meaning of its own |
| `logoBackground` | `boolean` | `true` | Whether the logo sits on a filled square (organization logos) or transparently (action icons such as join/create) |
| `disabled` | `boolean` | `false` | Not selectable — e.g. a membership awaiting approval. Halves the logo's opacity, drops the name to `text.secondary`, and hides the chevron, on top of MUI's own disabled handling |
| `sx` | `SxProps<Theme>` | — | MUI system styles passed to the underlying `ListItemButton` |
| _...rest_ | `ListItemButtonProps` | — | Forwarded to the underlying `ListItemButton` |

### `OrganizationRowGroup`

Bordered grouping that carries the shared outline and auto-renders MUI `Divider`s between its children. The outline belongs to the **group**, never to the rows — a list of ten organizations has one outline around all of them.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | `OrganizationRow` children — auto-divided |
| `maxHeight` | `number \| string` | — | Caps the group's height and enables vertical scrolling within it |
| `sx` | `SxProps<Theme>` | — | Merged over the group's own styles (the outline, fill and overflow) |
| _...rest_ | `BoxProps` | — | Forwarded to the root `Box`. `children` and `maxHeight` are typed above |

### `OrganizationsEmptyState`

The status message `OrganizationsPanel` renders for `empty={true}`. Export it directly to override the copy while keeping the layout.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | `<SearchIcon />` | Icon above the title, normalized to 24×24 and `text.secondary`. Marked `aria-hidden` |
| `title` | `React.ReactNode` | `'No results found'` | Primary line, `body2` / `fontWeight: 600` |
| `description` | `React.ReactNode` | — | Optional second line, `caption` / `text.secondary` |
| _...rest_ | `StackProps` | — | Forwarded to the root `Stack` (which carries `role="status"`) |

### `OrganizationJoinPanel`

The join flow behind the panel's join action row: a labelled text field for the organization's domain, an outlined button on the left and a contained button on the right. See `OrganizationCreatePanel` for the create action's equivalent.

**Not an overlay.** It is the same card as `OrganizationsPanel` — same radius, padding and width — and takes the panel's place while a flow is open, with cancel returning to it. The app decides which of the two is rendered; there is no `open` prop.

Its fill is `grey[100]` (`#F5F5F5`) — the same as `OrganizationsPanel` — with the field a step brighter on `background.paper` (`#FFFFFF`), so the input reads as raised out of the card.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `React.ReactNode` | _(required)_ | The field's label — 12px / 600, rendered as a `<label>` bound to the input, so it names the field and focuses it when clicked |
| `field` | `{ value: string; onChange: (e) => void; placeholder: string }` | _(required)_ | The single controlled text field. `placeholder` is an example value, since `title` already names the field |
| `error` | `React.ReactNode` | — | Message shown beneath the field, which also switches the field to its error state |
| `cancelLabel` | `React.ReactNode` | _(required)_ | Label for the outlined button on the left — typically returns to the panel |
| `submitLabel` | `React.ReactNode` | _(required)_ | Label for the contained button on the right |
| `onCancel` | `() => void` | _(required)_ | Fired by the cancel button |
| `onSubmit` | `() => void` | _(required)_ | Fired by the submit button or Enter in the field. Never fires while the field is empty |
| `submitting` | `boolean` | `false` | A submit is in flight: spinner in the submit button, both buttons disabled, so `onSubmit` can't fire twice for one request |
| `slotProps` | `OrganizationJoinPanelSlotProps` | — | Props for `label`, `field`, `actions`, `cancelButton`, `submitButton` — see [Slots](#slots) |
| `width` | `number \| string` | `441` | Card width, capped to the viewport — matches the panel |
| _...rest_ | `StackProps` | — | Forwarded to the root `Stack`, which is the `<form>` element (minus `onSubmit`) |

### `OrganizationCreatePanel`

The create flow behind the panel's other action row: a region dropdown, the organization's name and domain, one checkbox, then cancel and confirm. Same card as `OrganizationsPanel` and `OrganizationJoinPanel` — same fill, radius, padding and width — and it takes the panel's place the same way, with no `open` prop.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `region` | `{ label; value: string; onChange; placeholder: string; options: { value: string; label: ReactNode }[]; error? }` | _(required)_ | The dropdown. Starts unselected, showing `placeholder` in `text.secondary` until an option is picked |
| `name` | `{ label; value: string; onChange; placeholder: string; error? }` | _(required)_ | The organization's display name |
| `domain` | `{ label; value: string; onChange; placeholder: string; error? }` | _(required)_ | The organization's domain |
| `checkbox` | `{ checked: boolean; onChange: (e, checked) => void; label: ReactNode }` | _(required)_ | One checkbox with its label to the right. Does **not** gate submission |
| `cancelLabel` | `React.ReactNode` | _(required)_ | Label for the outlined button on the left |
| `submitLabel` | `React.ReactNode` | _(required)_ | Label for the contained button on the right |
| `onCancel` | `() => void` | _(required)_ | Fired by the cancel button |
| `onSubmit` | `() => void` | _(required)_ | Fired by the submit button or Enter in a field. Never fires until a region is chosen and both text fields have content |
| `submitting` | `boolean` | `false` | A submit is in flight: spinner in the submit button, both buttons disabled, so `onSubmit` can't fire twice for one request |
| `slotProps` | `OrganizationCreatePanelSlotProps` | — | Props for `label`, `regionField`, `nameField`, `domainField`, `checkbox`, `checkboxLabel`, `actions`, `cancelButton`, `submitButton` — see [Slots](#slots) |
| `width` | `number \| string` | `441` | Card width, capped to the viewport |
| _...rest_ | `StackProps` | — | Forwarded to the root `Stack`, which is the `<form>` element (minus `onSubmit`) |

Each field's `label` is a 12px/600 `<label>` bound to its input, and each takes its own optional `error` so the app can mark just the field at fault.

## Usage

### Full Panel

```tsx
import { useState } from 'react';
import { AddIcon, BuildingIcon, LoginIcon } from '@bwp-web/assets';
import { OrganizationRow, OrganizationsPanel } from '@bwp-web/components';

function OrgPicker({ personalOrg, orgs }) {
  const [query, setQuery] = useState('');

  const matches = (name: string) =>
    name.toLowerCase().includes(query.toLowerCase());

  const visibleOrgs = orgs.filter((org) => matches(org.name));
  const visiblePersonal = matches(personalOrg.name);

  return (
    <OrganizationsPanel
      search={{
        value: query,
        onChange: (event) => setQuery(event.target.value),
        placeholder: 'Search...',
      }}
      personalOrgItem={
        visiblePersonal ? (
          <OrganizationRow
            primaryText={personalOrg.name}
            secondaryText="Last opened 20m ago"
            logo={<BuildingIcon sx={{ width: 20, height: 20 }} />}
          />
        ) : undefined
      }
      organizationsLabel="My organizations"
      organizationItems={
        visibleOrgs.length > 0
          ? visibleOrgs.map((org) => (
              <OrganizationRow
                key={org.id}
                primaryText={org.name}
                secondaryText={org.pending ? 'Awaiting approval' : org.lastOpened}
                disabled={org.pending}
                logo={org.logo}
                onClick={() => open(org.id)}
              />
            ))
          : undefined
      }
      orLabel="or"
      empty={
        query.trim().length > 0 && !visiblePersonal && visibleOrgs.length === 0
      }
      joinAction={
        <OrganizationRow
          primaryText="Join organization"
          logo={<LoginIcon sx={{ color: 'text.primary' }} />}
          logoBackground={false}
          onClick={onJoin}
        />
      }
      createAction={
        <OrganizationRow
          primaryText="Create organization"
          logo={<AddIcon sx={{ color: 'text.primary' }} />}
          logoBackground={false}
          onClick={onCreate}
        />
      }
    />
  );
}
```

### The Empty State

`empty` is a signal, not an inference. The panel receives JSX, not data — only the app holds the query and the unfiltered list, so only the app can distinguish "no matches for this search" from "this user has no organizations" or "still loading". Pass the answer:

```tsx
{/* Default copy */}
empty={query !== '' && matches.length === 0}

{/* Your own copy, same layout */}
empty={
  noMatches && (
    <OrganizationsEmptyState
      title="No organizations found"
      description="Join an existing one, or create your own below"
    />
  )
}

{/* Something else entirely */}
empty={noMatches && <MyCustomEmptyState onClear={() => setQuery('')} />}
```

When `empty` is truthy the `orLabel` divider is replaced, and the join/create rows stay put — a dead-end search still offers a way forward.

### Slots

The rows are yours — style those at the call site, since you construct them. Everything else on these cards is built internally, and `slotProps` is how you reach it without forking the component.

```tsx
<OrganizationsPanel
  // The root Stack.
  sx={{ maxWidth: 520 }}
  slotProps={{
    search: { autoFocus: true, size: 'small', inputRef },
    organizationsGroup: { maxHeight: 400 },
    orLabel: { sx: { fontSize: 12 } },
    actions: { gap: 2 },
  }}
  /* …slots… */
/>
```

| Component | Slots |
|-----------|-------|
| `OrganizationsPanel` | `search` (`TextFieldProps`), `organizationsLabel` / `orLabel` (`DividerProps`), `personalOrgGroup` / `organizationsGroup` / `joinGroup` / `createGroup` (`OrganizationRowGroupProps`), `actions` (`StackProps`) |
| `OrganizationJoinPanel` | `label` (`TypographyProps`), `field` (`TextFieldProps`), `actions` (`StackProps`), `cancelButton` / `submitButton` (`ButtonProps`) |
| `OrganizationCreatePanel` | `label` (`TypographyProps`, applied to all three), `regionField` / `nameField` / `domainField` (`TextFieldProps`), `checkbox` (`CheckboxProps`), `checkboxLabel` (`FormControlLabelProps`), `actions` (`StackProps`), `cancelButton` / `submitButton` (`ButtonProps`) |

Three rules govern the merge:

- **Each bag is spread after the component's own props**, so it wins on conflict. That includes the wiring — passing `disabled` to `submitButton` overrides the card's own enable/disable logic, and passing `value` to a field overrides the controlled value. That's deliberate, but it means a slot can break behaviour as well as restyle it.
- **`sx` merges, it doesn't replace.** Slot styles layer over the component's own rather than wiping them, and all three `sx` forms are supported — object, theme callback, and array of either.
- **A slot's own nested `slotProps` layers per key, it doesn't replace.** Three defaults are produced this way: the panel's search field puts the search icon in `slotProps.input` and its accessible name in `slotProps.htmlInput`, and the create panel's region field puts the placeholder in `slotProps.select`. Passing your own `slotProps` to either field keeps those defaults — your individual keys win, the rest survive:

  ```tsx
  // The search icon stays; the clear button is added alongside it.
  slotProps={{ search: { slotProps: { input: { endAdornment: <ClearButton /> } } } }}

  // The region placeholder stays; only autoWidth is added.
  slotProps={{ regionField: { slotProps: { select: { autoWidth: true } } } }}
  ```

  Override `input.startAdornment` or `select.renderValue` explicitly and yours replaces the default, as you'd expect. The callback form (`select: (ownerState) => ({ … })`) composes the same way.

### Unselectable Rows

`disabled` carries both the interaction and the visual treatment — one prop for a row that can't be opened yet, such as a membership awaiting approval:

```tsx
<OrganizationRow
  primaryText="Globex Industries"
  secondaryText="Awaiting approval"
  logo={org.logo}
  disabled
/>
```

The row states *why* it isn't selectable through `secondaryText`; the component only supplies the treatment.

### The Join / Create Flows

The action rows don't open an overlay — they swap the panel out for `OrganizationJoinPanel`, so one card is on screen at a time and cancel comes back. One form serves both rows; only the copy differs:

```tsx
const [flow, setFlow] = useState<'join' | 'create' | null>(null);
const [value, setValue] = useState('');
const [error, setError] = useState<string>();
const [submitting, setSubmitting] = useState(false);

const openFlow = (next: 'join' | 'create') => {
  setValue('');
  setError(undefined);
  setFlow(next);
};

return flow !== null ? (
  <OrganizationJoinPanel
    // The field's label. The screen itself is named by the page heading above
    // this card, which the app swaps alongside the card.
    title={flow === 'create' ? 'Organization name' : 'Organization domain'}
    field={{
      value,
      onChange: (event) => setValue(event.target.value),
      placeholder: flow === 'create' ? 'Acme Corporation' : 'acme.com',
    }}
    error={error}
    cancelLabel="Cancel"
    submitLabel={flow === 'create' ? 'Create' : 'Ask to Join'}
    onCancel={() => setFlow(null)}
    submitting={submitting}
    onSubmit={async () => {
      setSubmitting(true);
      try {
        await submit(flow, value);
        setFlow(null);
      } catch {
        setError('No organization found with that ID');
      } finally {
        setSubmitting(false);
      }
    }}
  />
) : (
  <OrganizationsPanel
    /* ...as above... */
    joinAction={<OrganizationRow primaryText="Join organization" onClick={() => openFlow('join')} /* ... */ />}
    createAction={<OrganizationRow primaryText="Create organization" onClick={() => openFlow('create')} /* ... */ />}
  />
);
```

The submit button is disabled until the field has non-whitespace content — the component derives that from `field.value`, which is data it holds rather than something inferred about the caller. `submitting` covers the other half: while it is `true` the submit button shows a spinner and both buttons are disabled, so one request can't be fired twice. The component can't know when its own submit resolves, so the app owns the flag. Everything else is the app's too: which card is shown, whether it succeeded, and what the failure says.

## Design Details

- **One outline per group** — `border: 0.6px` in `palette.dividers.secondary` (`rgba(17, 17, 17, 0.4)` light / white at 0.4 dark), `6px` radius, and a `0 1px 1px` shadow at 5% black. Rows inside a group are separated by plain `Divider`s so the group edge stays the dominant line. This is the same recipe as `BiampListPopover`.
- **One fill throughout, outlines do the work** — the panel, its row groups and the rows inside them are all `grey[100]` (`#F5F5F5`) in light and `grey[700]` in dark. Nothing is separated by a tonal step; the group outline and the dividers between rows are the only boundaries. The search field is the single exception, sitting a step brighter on `background.paper` (`#FFFFFF` / `grey[800]`) so it reads as an input rather than a surface. Note Figma's `--Background-background_default` (`#F5F5F5`) is `grey[100]` here — `palette.background.default` is `#FFFFFF` in light mode, so the token name and the value don't line up.
- **Field resting outline** — the theme supplies outlined inputs with the 6px radius, 0.6px width and matching shadow, but leaves the resting border at MUI's fainter default. The panel's search field and the form's field each raise it to `dividers.secondary` — the token the theme already uses for their hover state — so fields match the cards at rest. The form's copy excludes `Mui-error`, so a field in its error state keeps the theme's error colour.
- **The two cards swap without moving anything** — `OrganizationJoinPanel` repeats the panel's `borderRadius: 4`, `p: 1.5` and 441px width, so replacing one with the other doesn't shift or resize its surroundings. Its root `Stack` is the `<form>` element, which is what makes Enter submit.
- **All three cards share one fill** — `OrganizationJoinPanel` and `OrganizationCreatePanel` use the same `grey[100]` / `grey[700]` as `OrganizationsPanel`, with their inputs on `background.paper` like the panel's search field. Swapping one card for another changes nothing but the contents. The rule across the family: inputs are a step brighter, every surface is `#F5F5F5`.
- **The form card has no heading of its own** — `title` is the field's label (12px / 600, the weight the panel uses for its dividers), grouped with the input at `gap: 0.5` so it reads as attached to it. Naming the screen is the page's job, above the card.
- **Row height is logo-driven** — the 40px logo plus 12px padding sets 64px, with or without `secondaryText`. That's why `maxListHeight` defaults to `3 * 64 + 2`.
- **Chevron artwork** — rows use `ChevronRightIcon` with `variant="xs"`. The default `md` variant is a 24px viewBox; rendered in a 16px box its stroke scales down to a hairline.
- **Slots are rendered when provided** — every slot on `OrganizationsPanel` is a plain conditional: the search field, each row group, each divider and the actions column appear only when their prop is passed, and the actions column collapses entirely when neither action row is. Pass `undefined` (not `[]` or `null` wrappers) when a group has nothing to show; the panel does not introspect children to decide.
- **`Children` is used only for dividers** — `OrganizationRowGroup` counts its children to place dividers, which is layout the group alone can know. No component in this family derives application state from its children.

## Exports

- `OrganizationsPanel` — The full card: search field, org groups, join/create actions.
- `OrganizationRow` — Single row built on `ListItemButton`; supports linking via `component`, `to`, `href`, `onClick`.
- `OrganizationRowGroup` — Bordered grouping with the shared outline and auto-dividers.
- `OrganizationsEmptyState` — Status message for `empty`, with overridable icon/title/description.
- `OrganizationJoinPanel` — Single-field form for the join flow, shaped to replace the panel in place; submit disabled until the field is filled.
- `OrganizationCreatePanel` — Region dropdown, name, domain and a checkbox for the create flow; submit disabled until all three fields are filled.
