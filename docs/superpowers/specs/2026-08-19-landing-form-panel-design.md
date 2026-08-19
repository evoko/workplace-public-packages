# LandingFormPanel — design

## Problem

`OrganizationJoinPanel` and `OrganizationCreatePanel` are two bespoke components
that differ only in which fields they render. A third — a login panel with a
conditionally revealed password field — was requested, which would have made
three implementations of the same card.

The three share everything that belongs in a design-system package: the card
shell, the 12px/600 field label, the outlined-input treatment, the actions row,
and the checkbox rhythm fix. They differ only in flow logic — which fields
exist, when they appear, what gates submission — which belongs to the consuming
app.

`OrganizationsPanel` in the same folder already resolves this tension the right
way: it exports `OrganizationRow` / `OrganizationRowGroup` and takes `ReactNode`
slots. The two form panels are the outliers.

## Decision

Replace all three with four composable primitives. Ship no `LoginPanel`.

Deleting the two published components is a breaking change to
`@bwp-web/components` (currently 1.10.2). The repo has no changesets tooling and
versions are bumped by hand, so the implementation sets
`packages/components/package.json` to `2.0.0`. This
was chosen deliberately over keeping them as thin presets: a preset that only
ever appears in one consumer's code is indirection without payoff, and Storybook
carries the reference compositions instead.

## The primitives

All four live in `packages/components/src/LandingPage/LandingFormPanel.tsx` and
are exported from `LandingPage/index.ts`.

### `LandingFormPanel`

The card. Takes children; owns no field or flow knowledge.

```ts
export type LandingFormPanelProps = Omit<StackProps, 'onSubmit'> & {
  children: ReactNode;
  /** Fires on submit — Enter in any field, or a `type="submit"` control. */
  onSubmit?: () => void;
  /** Card width, capped to the viewport. Default: 441. */
  width?: number | string;
};
```

Renders `Stack component="form"` with `gap={2} p={1.5} borderRadius={4}`,
`width`, `maxWidth="100%"`, and the `grey[700]`/`grey[100]` background — the
same values the three panels use today, `sx` merged via `mergeSx`.

The submit handler always calls `preventDefault()`, whether or not `onSubmit`
was passed, so a panel without a handler never triggers a page navigation.
Submit *gating* is the consumer's: the panel does not inspect field values.

### `LandingFormField`

A labelled input. Extends `TextFieldProps` rather than taking a config object,
so `select`, `type="password"`, `error` / `helperText`, and `slotProps.input`
adornments all work without new props.

```ts
export type LandingFormFieldProps = TextFieldProps & {
  /** Rendered as a 12px/600 `<label>` bound to the input. */
  label: ReactNode;
  /** Props for that `<label>`. */
  labelProps?: TypographyProps;
};
```

Wraps a `Stack gap={0.5} width="100%"` around the `<label>` and a `fullWidth`
`variant="outlined"` `TextField`. Falls back to a `useId()` value when `id` is
omitted, so the label binding always holds.

Carries the panel's outline treatment: `background.paper` fill, resting border
pulled up to `palette.dividers.secondary`, with `:not(.Mui-error)` so an errored
field keeps the theme's error colour. The consumer's `sx` merges over it.

`fieldSx` stays module-private — it is an implementation detail of this field.

### `LandingFormActions`

Layout only: `Stack direction="row" gap={1} width="100%"` around whatever
buttons the consumer passes. It does not encode variant, width, or disabled
state — the outlined-left / contained-right convention lives in the stories and
the docs as the reference, not as enforced behaviour.

```ts
export type LandingFormActionsProps = StackProps;
```

### `LandingFormCheckbox`

`Checkbox` + `FormControlLabel` with the rhythm fixes baked in: `p: 0` on the
checkbox (the theme's 12px padding breaks the card's 16px gap) and
`m: 0, gap: 1, alignItems: 'center'` on the label (MUI's own -11px/16px margins
break the same rhythm). The label node is wrapped in a `variant="body2"`
`Typography`.

```ts
export type LandingFormCheckboxProps = Omit<FormControlLabelProps, 'control'> & {
  slotProps?: { checkbox?: CheckboxProps };
};
```

`checked` / `onChange` pass through `FormControlLabel`, which forwards them to
the control.

## Removed

- `LandingPage/OrganizationJoinPanel.tsx` and its stories
- `LandingPage/OrganizationCreatePanel.tsx` and its stories
- `OrganizationJoinPanel`, `OrganizationJoinPanelProps`,
  `OrganizationJoinPanelSlotProps`, `OrganizationCreatePanel`,
  `OrganizationCreatePanelProps`, `OrganizationCreatePanelSlotProps` from
  `LandingPage/index.ts`

`OrganizationsPanel`, `OrganizationRow`, `OrganizationRowGroup`, and
`OrganizationsEmptyState` are untouched — they are a list, not a form.

The per-panel `slotProps` bags disappear with their components. Composition
replaces them: a consumer who needs to style the submit button now holds that
`<Button>` directly.

## Storybook

`LandingFormPanel.stories.tsx` must reproduce the full set, so nothing is lost
visually by the deletion:

- **JoinOrganization** — one field, cancel + submit row. Pixel-equivalent to
  today's `OrganizationJoinPanel`, including the disabled-until-non-empty
  behaviour, now written in the story's own `useState`.
- **JoinWithError** — the same with `error` / `helperText` set.
- **CreateOrganization** — region `select`, name, domain, checkbox, actions.
  Equivalent to today's `OrganizationCreatePanel`, empty and filled variants.
- **CreateWithError** — domain field in its error state.
- **Login** — the flow that prompted this: an email field, a password field
  revealed conditionally, and a small `ArrowRightIcon` `IconButton`
  (`type="submit"`) as the `endAdornment` of whichever field is currently last.
  No footer buttons, no visibility toggle.

Each story's demo component is the reference implementation a consumer copies,
so the gating logic in them should be written to be read, not minimised.

`OrganizationSelectorLandingPage.stories.tsx` currently imports both deleted
panels at lines 25–26 and renders them at 216 and 229. It is rewritten to
compose the primitives inline.

## Docs

- New `docs/landing-form-panel.md`, following the shape of
  `docs/organizations-panel.md`: intro, peer deps, one section per primitive
  with a props table, then a composition example for each of join, create, and
  login.
- New row in the README docs table.
- `docs/organizations-panel.md` references the deleted panels and is updated to
  point at the primitives.

## Verification

The package has no unit tests, so verification is:

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — clean
- `npm run storybook` — each story above renders, and join/create are compared
  against the current components' rendering before the deletion lands

## Out of scope

- Any change to `OrganizationsPanel` and its row primitives
- Any change to the `@bwp-web/styles` theme
- Publishing to npm. The version in `package.json` is bumped to `2.0.0` as part
  of this work; running the release is a separate decision
