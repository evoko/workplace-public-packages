# solar_flutter

Biamp SOLAR design tokens and icons for Flutter, generated from the same specs as the web
packages: `spec/tokens.json` and `spec/icons.json`.

Consume it by git dependency:

    dependencies:
      solar_flutter:
        git:
          url: https://github.com/evoko/workplace-public-packages.git
          path: packages/solar_flutter
          ref: v2-SOLAR

It needs Flutter 3.47 or later (Dart 3.13), the version CI pins in `.github/workflows/solar.yml`.

Everything in `lib/src/generated` is produced by `npm run solar:codegen` at the repository
root. Do not edit it. The types, the widgets and the SVG path parser beside it are hand written.
See [the design spec](../../docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md).

## Tokens

Mode-varying tokens are instances, one per mode: `SolarColors.light` / `.dark`, `SolarShadows`
the same, and `SolarType` / `SolarTypography` as `.desktop` / `.mobile`. Mode-invariant ones are
`static const` fields — `SolarInset.md`, `SolarRadius.control`, `SolarMotion.durationFast`. The
`SolarTheme` extension bundles the mode-varying sets so widgets read them from the ambient theme.

```dart
MaterialApp(
  builder: (context, child) => Theme(
    data: Theme.of(context).copyWith(extensions: [
      SolarTheme.resolve(
        brightness: Theme.of(context).brightness,
        width: MediaQuery.sizeOf(context).width,
      ),
    ]),
    child: child!,
  ),
)
```

**Follow the viewport with `SolarTheme.resolve`.** Below `SolarViewport.sm` (768) it picks the
Mobile type scale, at the same width the web's `@media (max-width: 767.98px)` switches, because
both are derived from the one `viewport.sm` token. `SolarTheme.light` and `SolarTheme.dark` are
constants for the Desktop scale, for when the viewport does not matter. SOLAR changes only
`display`, `title` and `code` between the two; body, label, caption and helper text stay put.

## Components

`SolarButton`, `SolarIconButton`, `SolarButtonGroup`, `SolarFAB`, `SolarBackButton`,
`SolarSplitButton`, `SolarLink` and `SolarSpinner`, and the display primitives
(`SolarStatusIndicator`, `SolarCounter`, `SolarKbd`, `SolarTimestamp`, `SolarAvatar`,
`SolarTrendBadge`, `SolarDivider`, `SolarSkeleton`, `SolarProgressBar`, `SolarNodeEnd`,
`SolarRowExpand` and `SolarTreeIndent`), and the selection controls (`SolarCheckbox`,
`SolarRadio`, `SolarToggle`, `SolarSlider`, `SolarSliderRange`, `SolarDragHandle`,
`SolarSegmentedControl` and `SolarSegmentedControlItem`), and the tags and messages (`SolarTag`,
`SolarAlert`, `SolarAlertSmall`, `SolarBanner`, `SolarToast` and `SolarEmptyState`), and the
text fields (`SolarTextInput`, `SolarTextArea`, `SolarSearchField`, `SolarGlobalSearch`,
`SolarPasswordInput`, `SolarNumberInput`, `SolarInlineInput`, `SolarTokenInput`, `SolarPINInput`
and `SolarFileUpload`), and the menus and lists (`SolarDropdownItem`, `SolarDropdownGroupLabel`,
`SolarDropdownMenu`, `SolarContextMenuItem`, `SolarContextMenu`, `SolarOptionRow`,
`SolarOptionsList`, `SolarListItem` and `SolarList`), and the pickers (`SolarSelect`,
`SolarDropdown`, `SolarAutocomplete`, `SolarDatePicker`, `SolarDatePickerOpen`,
`SolarDatePickerDayCell`, `SolarTimePicker` and `SolarTimePickerDropdown`), and navigation
(`SolarTabs`, `SolarTabItem`, `SolarNavItem`, `SolarSectionNavItem`, `SolarSectionNavGroupHeader`,
`SolarBreadcrumbs`, `SolarBreadcrumbItem` and `SolarTreeItem`), and paging and steps
(`SolarPagination`, `SolarPaginationItem`, `SolarPaginationNav`, `SolarPaginationEllipsis`,
`SolarPageNavigator`, `SolarPageNavButton`, `SolarStepper`, `SolarStep` and
`SolarStepperIndicator`), and the cards (`SolarCard`, `SolarContainer`, `SolarSplitDropdown`,
`SolarStatusCard`, `SolarInsightCard`, `SolarInsightCardSmall`, `SolarInsightRow`,
`SolarExpandableCard`, `SolarAccordion`, `SolarEventRow`, `SolarOptionCard`, `SolarFileCard`,
`SolarImageCard`, `SolarActionCard`, `SolarInteractiveCard`, `SolarDeviceCard`, `SolarLaunchCard`
and `SolarLaunchCardFullScreen`) take the same props as the React components
(a group takes its buttons as `children`, and asserts against the vertical full-width group Figma
does not draw), in Flutter's terms where they differ: a `SolarProgressBar`'s `value` is 0 to 1, a
`SolarAvatar`'s `color` a `Color` and its picture an `ImageProvider`, a `SolarTimestamp` takes
the app's words (`text`) with no `DateTime`, since Flutter has no machine-readable time, and a
drawn component (`SolarSplitButton`, `SolarLink`) takes its words as a `String`, `label`. A
control takes what a tap asks for as Flutter's do (`onChanged` on a `SolarCheckbox` or
`SolarToggle`, null disabling it), and is disabled as Flutter's are: a `SolarButton`,
`SolarIconButton`, `SolarFAB`, `SolarBackButton`, `SolarSplitButton` or `SolarLink`, a menu or list
row, a pagination item or a calendar's day by a null `onPressed`, with no `disabled` parameter
(each has a `disabled` getter that says so). A field (`SolarTextInput`, `SolarSelect`, the pickers
and the rest of the text fields) takes Flutter's `enabled`, `true` by default, as `TextField` and
`DropdownMenu` do, and so does a Select's or Dropdown's option; `disabled` is its getter. A card, a
tab and a breadcrumb keep their `disabled`, a look of its own, not the absence of an action. A slider is on `min` to `max`, 0 to 1
by default. A
`SolarRadio<T>` and a `SolarSegmentedControlItem<T>` are checked by the `RadioGroup` around them,
by their `value`, as Flutter's own Radio is, so they take no `checked` or `selected`; the group
also moves between them with the arrow keys. A `SolarTextInput` holds its words in a
`TextEditingController` (`controller`), where the web takes a `value`, and is drawn filled while it
holds any; its words are an undecorated `TextField`, a tap anywhere in the field focuses them, and
they are read as one text field, named by its label and described by its helper, a control in the
field (a clear button) its own. A `SolarTextArea` is the same, many lines tall, with the caller's
Icon Buttons in its bottom corners. `SolarField` (`lib/src/solar_field.dart`) holds a field's words,
focus and states for them all: hovered and focused as the field is, not as the TextField's own box.
A `SolarNumberInput` takes a `num? value` and `onChanged`; a `SolarTokenInput` its entries as
`value`, its draft in a `controller`; a `SolarPINInput` its digits in a `controller`; and a
`SolarFileUpload` shows the names the app's picker chose, calling `onBrowse` for it to open one,
since Flutter has none of its own. A menu (`SolarDropdownMenu`, `SolarContextMenu`) draws where it
is put, its rows in a `SolarMenuList` (`lib/src/solar_menu.dart`) that the arrow keys move along,
scrolling past `solarMenuMaxHeight` (300, a flagged raw value, as the description asks); to float
one, give it to a `SolarMenuAnchor`, Flutter's MenuAnchor with its panel giving way to the menu,
opened by the controller its builder is given (at a point, `controller.open(position: …)`, for a
context menu), which focuses the first row and closes on Escape or a tap outside. Its rows take its
size and are announced as menu items (`SolarMenuScope`), a focused row drawing Figma's hover; a
`SolarDropdownItem`'s checkbox is a `SolarCheckbox` drawn in the row's states (`inStates`), inert.
A `SolarSplitButton` given `items` opens them in a menu of its own. A `SolarOptionRow<T>` is its
control's target: a tap on the row is the control's, hovering it hovers it, and a radio row is
checked by its `RadioGroup<T>`. A `SolarList` puts a `SolarDivider` between each two rows unless
`dividers` is false, and gives its rows its compactness (`SolarListScope`, `lib/src/solar_list.dart`),
as Figma draws them; a `SolarListItem` is an avatar row where it is given an `avatar`.
A `SolarSelect<T>` and a `SolarDropdown<T>` take their choices as `options` (`SolarSelectOption`,
`SolarDropdownOption`: a value, a label, a helper, an icon), and float them under the field with a
`SolarMenuAnchor`, opened by a tap, Enter or the down arrow; the field reads as a button named by
its label, its value the choice. A `SolarAutocomplete<T>` is Flutter's `RawAutocomplete` in a Text
Input's field, its suggestions a `SolarDropdownMenu`, the highlighted one drawn hovered; where
nothing matches it shows no panel, as RawAutocomplete does (the web says `noOptionsText`). A
`SolarDatePicker` holds a `DateTime? value` and calls `onDateChanged`, as Flutter's
`CalendarDatePicker` does (`onChanged` is its words'), its words MaterialLocalizations' compact
date; its calendar icon, or the down arrow, floats a `SolarDatePickerOpen` under the field, the
focus on the chosen day. `SolarDatePickerOpen` takes `initialMonth`, `firstDate`, `lastDate` and
`selectableDayPredicate`, as CalendarDatePicker does, its month from MaterialLocalizations, its
weekdays two letters in the app's locale (`intl`, as the web writes them) from the locale's first
day (`firstDayOfWeekIndex`, or `weekStartsOn`), each day a
`SolarDatePickerDayCell` the arrow keys move the focus to; `dayBuilder` wraps a day (a test's
key). A `SolarTimePicker` holds a `TimeOfDay? value` and calls `onTimeChanged`, its words
`formatTimeOfDay` on the platform's clock, read back on either (`parseSolarTime`,
`lib/src/solar_time.dart`); its list, a `SolarTimePickerDropdown`, is every `step` minutes from
`first` to `last`, the chosen one scrolled into sight.
A `SolarTabs` holds `SolarTabItem`s with a `value` each, and says which is selected by its own
(`value`, `onChanged`), through `SolarTabsScope` (`lib/src/solar_tabs.dart`), as a RadioGroup
does its radios; `SolarTabList` makes the row a tab bar the arrow keys move along, Enter or Space
selecting. It is not Flutter's TabBar, which needs a TabController, draws its own label style and
ink, and has no arrow keys. A `SolarNavItem` takes `iconOutline` and `iconSolid` widgets, and a
`SolarBreadcrumbs` its trail as `SolarBreadcrumbItem`s, reading their labels and `onPressed` for
the menu of a collapsed trail's middle. A `SolarTreeItem` holds its rename's words in a controller
of its own, starting from its label. A `SolarPagination` and a `SolarPageNavigator` take `page` and
`count` and call `onChanged` (`solarPagesOf` says which pages show); their arrows are named by
MaterialLocalizations and mirrored right to left. A `SolarStepper` takes `steps` (labels) and
`activeStep`, and a `SolarStepperIndicator` its step's `number`. A pressable card (given `onPressed`) is a button
as a whole, named by its title, its own controls (a More menu, Buttons, a Checkbox) controls of
their own inside it; its More menu takes `moreItems`, `SolarCardMoreItem`s. A card's pictures are
`ImageProvider`s, its caller's parts (Buttons, a Dropdown, an Avatar) widgets, and its content
(`children`, an Interactive Card's `actions`) a list laid out as Figma lays it out. A
`SolarExpandableCard` and a `SolarAccordion` take `expanded` and call `onExpandedChanged`; a
`SolarImageCard` and a `SolarInteractiveCard` take `selected` and call `onSelectedChanged`.
`SolarFAB` is a FilledButton, which a Scaffold's `floatingActionButton` takes:

```dart
SolarButton(
  prio: SolarButtonPrio.secondary,
  size: SolarButtonSize.sm,
  loading: saving,
  onPressed: save,
  child: const Text('Save changes'),
)
```

Each is a widget written by hand, its behaviour in Dart, styled by a generated recipe it never
copies values from; its layer tree is the recipe's too (`SolarButtonRecipe.tree`), so a layer Figma
adds reaches it with no edit. They read the `SolarTheme` the app
installed, or Light or Dark for the app's brightness if it installed none. An icon-only
`SolarButton` needs a `semanticLabel`, and `SolarIconButton` requires one; either way the name and
the button's tap action are one node for a screen reader. While loading the label keeps its room and its semantics
but is not drawn, and the spinner Figma picks for the variant shows; disabled wins over loading. Given
`active`, a `SolarIconButton` is a toggle, as Flutter's own `IconButton(isSelected:)` is: `true`
draws Figma's active state, the persistent on state, announced selected; null, an ordinary action.

The recipe can also style a stock control directly. `SolarButtonRecipe.style(theme, props)` is a
`ButtonStyle` that makes a `FilledButton` draw SOLAR's Button, resolving hover, pressed, focus and
disabled through `WidgetState`, including states that hold together (a mouse press is hovered and
pressed at once, and draws Figma's pressed look):

```dart
FilledButton(
  style: SolarButtonRecipe.style(
    Theme.of(context).extension<SolarTheme>()!,
    const SolarButtonProps(prio: SolarButtonPrio.secondary, size: SolarButtonSize.sm),
  ),
  onPressed: save,
  child: const Text('Save changes'),
)
```

The recipe is generated from `spec/components/button.json` and regenerates on every run. The
background and shadow are painted in `backgroundBuilder`, because `ButtonStyle` has no box shadow.
Presence (the spinner while loading, the label hidden) is `SolarButtonRecipe.present`, and which
Spinner is `SolarButtonRecipe.lookup('spinner.variant.size', …)`, for the widget that composes the
button's content, as `SolarButton` does.

A shape a component draws itself (Spinner's ring, StatusIndicator's marks, Checkbox's tick and
dash, Radio's dot) is a `SolarGlyph`: Figma's path data for the fill and for the stroke's outline, read
from the recipe with `Solar<Name>Recipe.glyph(layer, props, states)`. `SolarGlyphView` draws one at
its own size, the fill's outline in the fill colour and the stroke's in the stroke colour, by
`SolarVectorPainter` as the icons are.

A display primitive draws Figma's layer tree itself with `SolarLayers` (`lib/src/solar_layers.dart`):
each layer, keyed `<component>.<layer>`, as a `SolarGlyphView`, a `SolarIcon`, a `Text` or a box,
laid out by its auto layout or placed at the recipe's `x` and `y` where it has none, translucent
where the recipe gives it an opacity, and holding the caller's children in place of Figma's
examples where the shell gives them (`content`: Segmented Control's track). A placed layer is set
in from its parent's border and padding, since Figma measures from the parent's outer edge.
A layer that is another SOLAR component (Tag's StatusIndicator, Toast's Tag) is drawn as the widget
the shell builds for it (`composed`), a text may wrap (`wraps`: EmptyState's words), and a Tag
takes the colours a Toast draws it in (`restyle`), and a text the user edits is the shell's field,
in the layer's text style, taking the room its row leaves (`fields`: Text Input's words). A layer
Figma places in a parent that grows keeps its distance from the nearer edge (Text Area's buttons,
pinned to the field's bottom corners), placed over the laid-out ones where its parent has an auto
layout; a control the caller gives there is drawn at its own size, centred in Figma's box, so a
touch target around it does not move it.
`SolarLayerRecipe` is the component's generated recipe as closures, under its props and states. Avatar, Skeleton and Divider are drawn so too; ProgressBar
wraps `LinearProgressIndicator`.

A control's states are shared with what it holds (`lib/src/solar_states.dart`): `SolarButton` gives
its states to a `SolarStatesScope`, and a `SolarCounter` in it reads them with a
`SolarStatesBuilder`, so it follows the button's hover, press and disabled colours, as Figma draws
it. `SolarPressable` gives a drawn widget states of its own where it is a control (a counter with
`onPressed`), announced as a button, a link, a checkbox (`checked`, `mixed`) or a switch
(`toggled`). Every control has a target at least 44 × 44, WCAG's floor, as SOLAR asks ("the 44×44px WCAG hit
area is padded in code"): `SolarTarget` (`lib/src/solar_target.dart`). A control on its own takes
that room where the theme pads tap targets (on touch platforms, as Material's controls do) and draws
centred in it; a part of another component (a Tag's close button, `SolarTarget.inside`) reaches past
itself as far as the component lets a pointer reach, taking no room. The FilledButton-based buttons
are padded by Material itself. `solarTargetSize` is SOLAR's `size.target.min`, `SolarSize.targetMin`. `SolarSliderInput` (`lib/src/solar_slider_input.dart`) is the same for the sliders:
it drags the nearest handle, gives each handle the focus, the arrow keys and a slider's semantics,
and leaves the drawing to `SolarLayers`, the value placing the fill and handles. `solarInkOn`
(`lib/src/solar_ink.dart`) is the Avatar initials' ink, the web's rule step for step.

Every variant of every widget is checked against what Figma draws (`spec/verify/`) by
`flutter test`: see [test/visual/README.md](test/visual/README.md). To look at them instead,
`npm run widgetbook` from the repository root: every Figma variant with its state forced, in Light
and Dark, and a playground with a knob per prop ([widgetbook/README.md](widgetbook/README.md)). How
a widget is built in one variant is shared by both, in the small `variants/` package
(`solar_flutter_variants`), a dev dependency only.

**Component themes.** The widgets on Flutter's buttons take a component theme the Flutter way, a
`ThemeExtension` in the app's `ThemeData` whose `ButtonStyle` is merged over the recipe (what it
sets wins, what it leaves null is Figma's): `SolarButtonThemeData`, `SolarIconButtonThemeData`,
`SolarFABThemeData` and `SolarBackButtonThemeData` (`lib/src/solar_button_themes.dart`). Flutter's
own `filledButtonTheme` cannot do it, since a button's own style, the recipe, wins over it.

```dart
ThemeData(extensions: [
  SolarTheme.light,
  const SolarButtonThemeData(
    style: ButtonStyle(minimumSize: WidgetStatePropertyAll(Size(120, 40))),
  ),
])
```

**Size in a layout that stretches.** Every widget keeps Figma's size wherever it is put: in a
`ListView`, which makes each child as wide as the list, a `SolarCheckbox` is still 16px, a
`SolarTag` hugs its words, and a `SolarButton` or `SolarIconButton` hugs its label or icon, unlike
Flutter's own buttons, which span the list (owner decision 2026-09-25). What fills in Figma fills
(a card, a field, a progress bar's width). A widget given more room than it takes sits at the
room's start, top and leading edge, and a tap there reaches it only within its 44 × 44 target
(`SolarOwnSize`, `lib/src/solar_own_size.dart`). A parent that sizes a SOLAR widget itself wraps it
in `SolarFill`, as `SolarButtonGroup` does for its buttons.

**Icons take their colour and size from the icon theme around them**, as Flutter's `Icon` does: a
`SolarIcon` in a `SolarIconButton` is the button's ink at the button's size. Outside any widget
that tints it, it is the app theme's icon colour; set `iconTheme: IconThemeData(color:
SolarTheme.light.colors.iconPrimary)` in the app's `ThemeData` (and Dark's) for SOLAR's
`color.icon.primary` there.

**Keys.** A drawn widget keys each layer `<component>.<layer>` (`tabItem.counter`), after
SOLAR's Figma layer names, so the visual check can measure it. They are test hooks, not an API: a
designer's rename in Figma changes them. Build on a widget's parameters and its slots instead.

## Fonts

Inter, Montserrat and IBM Plex Mono ship inside the package, at the weights SOLAR's text styles
use, so an app renders in them with no font setup of its own. The `SolarTypography` styles already
name the package (`package: 'solar_flutter'`), which is how Flutter finds a font a package
bundles. Building a style from a `SolarFont` family yourself, pass `solarFontPackage`:

```dart
TextStyle(fontFamily: SolarFont.fontFamilyInter, package: solarFontPackage)
```

All three are SIL OFL 1.1. Gotham, SOLAR's commercially licensed brand typeface, is not shipped
and no text style uses it. Sources, licences and checksums are in [fonts/README.md](fonts/README.md).

## Icons

340 SOLAR icons, each as two `SolarVector` constants — `chevronRightOutline` and
`chevronRightSolid` — on `SolarIcons`, drawn by the `SolarIcon` widget.

```dart
const SolarIcon(SolarIcons.chevronRightOutline)
```

There is deliberately no `Map<String, SolarVector>`: Dart tree-shakes static fields
individually, so taking one icon costs one icon, while a map would reference every field and
retain all 358 KB of path data.

**Colour is inherited, never baked in.** No icon carries a colour of its own — the same contract
as `currentColor` on the web. The first of these that is set wins:

1. the explicit `color` argument;
2. the ambient `SolarTheme` extension's `colors.iconPrimary`;
3. `IconTheme.of(context).color`, so an icon inside a button or a list tile matches the Material
   icons beside it;
4. black, reached only if a caller has removed the default icon theme.

```dart
SolarIcon(SolarIcons.deleteSolid, color: Theme.of(context).colorScheme.error)
```

**Size** is the side of a square box and defaults to `SolarIconSize.lg` (24). The drawing is
scaled to fit with its aspect ratio kept, so an icon drawn off the 24 grid is letterboxed rather
than squashed.

**Semantics.** `semanticLabel` names the icon for assistive technology. Without one it is
excluded from the semantics tree, which is right for an icon sitting beside a label that already
says what it means.

## Logos

`SolarLogos` carries `biampDarkSm`, `biampLightSm`, `osGoogle` and `osMicrosoft`, drawn by
`SolarLogo`.

```dart
const SolarLogo(SolarLogos.biampDarkSm)
```

Two things differ from `SolarIcon`, and both are enforced by the type rather than by a comment:

- **`SolarLogo` takes no `color`.** Every path carries the colour SOLAR drew it in, and a tinted
  brand mark is a brand violation.
- **`size` sets the height**, and the width follows the mark's ratio. The Biamp wordmark is
  36 × 12; one length on both axes would squash it. SOLAR publishes no logo scale, so the
  default is `SolarIconSize.lg`.

**The Teams variant is deliberately absent.** `os-logo/teams` is drawn with 11 radial gradients,
one linear gradient and per-path opacity, which the vector data this package ships cannot
represent; redrawing it in a hand-written painter is disproportionate for one third-party mark,
and flattening it would invent a brand colour. The web targets carry it, so this is the one
asset the platforms do not share — recorded as the `logo.os-logo.teams` row in
[`spec/deviations.md`](../../spec/deviations.md), where the other four icon findings live too.
The emitter asserts it is the only variant it skipped, so a second one fails the build.
