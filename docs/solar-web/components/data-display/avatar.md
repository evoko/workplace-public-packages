# Avatar

> SOLAR Web · Figma page `↳ 🟢 Avatar` (id `2163:3676`) · section `components/data-display` · raw data: [`raw/components/data-display/avatar.json`](../../raw/components/data-display/avatar.json)

## Component set: Avatar

User/entity avatar showing initials, photo, or company logo. Color axis provides 9 distinct seeds for initial-based avatars; seed from a stable hash of user ID — never random. Dark toggle inverts colors for dark surfaces and inverse cards. Photo and Logo are content-aware content modes. Use in activity feeds, comment threads, user lists, presence indicators, and permissioned resources. See also: Badge / Status for small inline status dots.

### Props

| Prop    | Type    | Options / default                                                              |
| ------- | ------- | ------------------------------------------------------------------------------ |
| `size`  | variant | **lg** · md · sm · xs                                                          |
| `type`  | variant | **text** · photo · logo                                                        |
| `color` | variant | **neutral** · red · orange · yellow · green · turquoise · blue · purple · pink |
| `Shade` | variant | Logo · Dark · **Light** · Medium · Image                                       |

Default variant: `size=lg, type=text, color=neutral, Shade=Light` · 114 variants · default size 44×44px

### Anatomy (default variant)

- **size=lg, type=text, color=neutral, Shade=Light** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 44×44  
  fill `color.neutral.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
  - **DS** · text `body/lg/medium` "DS" · HUG/HUG · 22×12  
    fill `color.neutral.700` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.blue.500`, `color.blue.50`, `color.blue.800`, `color.green.500`, `color.green.50`, `color.green.800`, `color.neutral.400`, `color.neutral.50`, `color.neutral.800`, `color.orange.500`, `color.orange.50`, `color.orange.800`, `color.pink.500`, `color.pink.50`, `color.pink.800`, `color.purple.500`, `color.purple.50`, `color.purple.800`, `color.red.500`, `color.red.50`, `color.red.800`, `color.turquoise.500`, `color.turquoise.50`, `color.turquoise.800`, `color.yellow.50`, `color.yellow.600`, `color.yellow.800` |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Text color      | `color.blue.100`, `color.blue.50`, `color.blue.700`, `color.green.100`, `color.green.50`, `color.green.700`, `color.neutral.100`, `color.neutral.50`, `color.neutral.700`, `color.orange.100`, `color.orange.50`, `color.orange.700`, `color.pink.100`, `color.pink.50`, `color.pink.700`, `color.purple.100`, `color.purple.50`, `color.purple.700`, `color.red.100`, `color.red.50`, `color.red.700`, `color.turquoise.100`, `color.turquoise.50`, `color.turquoise.700`, `color.yellow.100`, `color.yellow.50`, `color.yellow.700` |
| Radius          | `radius.pill`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Border width    | `border.default`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.lg`, `type.size.body.lg`                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Text styles     | `body/lg/medium`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

### Variant matrix

| size | type  | color     | Shade  | size  | fill                  | stroke                | effect | text                  | icon |
| ---- | ----- | --------- | ------ | ----- | --------------------- | --------------------- | ------ | --------------------- | ---- |
| lg   | text  | neutral   | Light  | 44×44 | `color.neutral.50`    | `color.border.subtle` |        | `color.neutral.700`   |      |
| md   | text  | neutral   | Light  | 32×32 | `color.neutral.50`    | `color.border.subtle` |        | `color.neutral.700`   |      |
| sm   | text  | neutral   | Light  | 24×24 | `color.neutral.50`    | `color.border.subtle` |        | `color.neutral.700`   |      |
| xs   | text  | neutral   | Light  | 16×16 | `color.neutral.50`    | `color.border.subtle` |        | `color.neutral.700`   |      |
| lg   | text  | neutral   | Dark   | 44×44 | `color.neutral.800`   | `color.border.subtle` |        | `color.neutral.100`   |      |
| lg   | text  | neutral   | Medium | 44×44 | `color.neutral.400`   | `color.border.subtle` |        | `color.neutral.50`    |      |
| md   | text  | neutral   | Dark   | 32×32 | `color.neutral.800`   | `color.border.subtle` |        | `color.neutral.100`   |      |
| md   | text  | neutral   | Medium | 32×32 | `color.neutral.400`   | `color.border.subtle` |        | `color.neutral.50`    |      |
| sm   | text  | neutral   | Dark   | 24×24 | `color.neutral.800`   | `color.border.subtle` |        | `color.neutral.100`   |      |
| sm   | text  | neutral   | Medium | 24×24 | `color.neutral.400`   | `color.border.subtle` |        | `color.neutral.50`    |      |
| xs   | text  | neutral   | Dark   | 16×16 | `color.neutral.800`   | `color.border.subtle` |        | `color.neutral.100`   |      |
| xs   | text  | neutral   | Medium | 16×16 | `color.neutral.400`   | `color.border.subtle` |        | `color.neutral.50`    |      |
| lg   | photo | neutral   | Image  | 44×44 | `IMAGE` ⚠️ hard-coded | `color.border.medium` |        |                       |      |
| md   | photo | neutral   | Image  | 32×32 | `IMAGE` ⚠️ hard-coded | `color.border.medium` |        |                       |      |
| sm   | photo | neutral   | Image  | 24×24 | `IMAGE` ⚠️ hard-coded | `color.border.medium` |        |                       |      |
| xs   | photo | neutral   | Image  | 16×16 | `IMAGE` ⚠️ hard-coded | `color.border.medium` |        |                       |      |
| md   | logo  | neutral   | Logo   | 32×32 | `IMAGE` ⚠️ hard-coded |                       |        |                       |      |
| sm   | logo  | neutral   | Logo   | 24×24 | `IMAGE` ⚠️ hard-coded |                       |        |                       |      |
| lg   | text  | red       | Light  | 44×44 | `color.red.50`        | `color.border.subtle` |        | `color.red.700`       |      |
| md   | text  | red       | Light  | 32×32 | `color.red.50`        | `color.border.subtle` |        | `color.red.700`       |      |
| sm   | text  | red       | Light  | 24×24 | `color.red.50`        | `color.border.subtle` |        | `color.red.700`       |      |
| xs   | text  | red       | Light  | 16×16 | `color.red.50`        | `color.border.subtle` |        | `color.red.700`       |      |
| lg   | text  | red       | Dark   | 44×44 | `color.red.800`       | `color.border.subtle` |        | `color.red.100`       |      |
| lg   | text  | red       | Medium | 44×44 | `color.red.500`       | `color.border.subtle` |        | `color.red.50`        |      |
| md   | text  | red       | Dark   | 32×32 | `color.red.800`       | `color.border.subtle` |        | `color.red.100`       |      |
| md   | text  | red       | Medium | 32×32 | `color.red.500`       | `color.border.subtle` |        | `color.red.50`        |      |
| sm   | text  | red       | Dark   | 24×24 | `color.red.800`       | `color.border.subtle` |        | `color.red.100`       |      |
| sm   | text  | red       | Medium | 24×24 | `color.red.500`       | `color.border.subtle` |        | `color.red.50`        |      |
| xs   | text  | red       | Dark   | 16×16 | `color.red.800`       | `color.border.subtle` |        | `color.red.100`       |      |
| xs   | text  | red       | Medium | 16×16 | `color.red.500`       | `color.border.subtle` |        | `color.red.50`        |      |
| lg   | text  | orange    | Light  | 44×44 | `color.orange.50`     | `color.border.subtle` |        | `color.orange.700`    |      |
| md   | text  | orange    | Light  | 32×32 | `color.orange.50`     | `color.border.subtle` |        | `color.orange.700`    |      |
| sm   | text  | orange    | Light  | 24×24 | `color.orange.50`     | `color.border.subtle` |        | `color.orange.700`    |      |
| xs   | text  | orange    | Light  | 16×16 | `color.orange.50`     | `color.border.subtle` |        | `color.orange.700`    |      |
| lg   | text  | orange    | Dark   | 44×44 | `color.orange.800`    | `color.border.subtle` |        | `color.orange.100`    |      |
| lg   | text  | orange    | Medium | 44×44 | `color.orange.500`    | `color.border.subtle` |        | `color.orange.50`     |      |
| md   | text  | orange    | Dark   | 32×32 | `color.orange.800`    | `color.border.subtle` |        | `color.orange.100`    |      |
| md   | text  | orange    | Medium | 32×32 | `color.orange.500`    | `color.border.subtle` |        | `color.orange.50`     |      |
| sm   | text  | orange    | Dark   | 24×24 | `color.orange.800`    | `color.border.subtle` |        | `color.orange.100`    |      |
| sm   | text  | orange    | Medium | 24×24 | `color.orange.500`    | `color.border.subtle` |        | `color.orange.50`     |      |
| xs   | text  | orange    | Dark   | 16×16 | `color.orange.800`    | `color.border.subtle` |        | `color.orange.100`    |      |
| xs   | text  | orange    | Medium | 16×16 | `color.orange.500`    | `color.border.subtle` |        | `color.orange.50`     |      |
| lg   | text  | yellow    | Light  | 44×44 | `color.yellow.50`     | `color.border.subtle` |        | `color.yellow.700`    |      |
| md   | text  | yellow    | Light  | 32×32 | `color.yellow.50`     | `color.border.subtle` |        | `color.yellow.700`    |      |
| sm   | text  | yellow    | Light  | 24×24 | `color.yellow.50`     | `color.border.subtle` |        | `color.yellow.700`    |      |
| xs   | text  | yellow    | Light  | 16×16 | `color.yellow.50`     | `color.border.subtle` |        | `color.yellow.700`    |      |
| lg   | text  | yellow    | Dark   | 44×44 | `color.yellow.800`    | `color.border.subtle` |        | `color.yellow.100`    |      |
| lg   | text  | yellow    | Medium | 44×44 | `color.yellow.600`    | `color.border.subtle` |        | `color.yellow.50`     |      |
| md   | text  | yellow    | Dark   | 32×32 | `color.yellow.800`    | `color.border.subtle` |        | `color.yellow.100`    |      |
| md   | text  | yellow    | Medium | 32×32 | `color.yellow.600`    | `color.border.subtle` |        | `color.yellow.50`     |      |
| sm   | text  | yellow    | Dark   | 24×24 | `color.yellow.800`    | `color.border.subtle` |        | `color.yellow.100`    |      |
| sm   | text  | yellow    | Medium | 24×24 | `color.yellow.600`    | `color.border.subtle` |        | `color.yellow.50`     |      |
| xs   | text  | yellow    | Dark   | 16×16 | `color.yellow.800`    | `color.border.subtle` |        | `color.yellow.100`    |      |
| xs   | text  | yellow    | Medium | 16×16 | `color.yellow.600`    | `color.border.subtle` |        | `color.yellow.50`     |      |
| lg   | text  | green     | Light  | 44×44 | `color.green.50`      | `color.border.subtle` |        | `color.green.700`     |      |
| md   | text  | green     | Light  | 32×32 | `color.green.50`      | `color.border.subtle` |        | `color.green.700`     |      |
| sm   | text  | green     | Light  | 24×24 | `color.green.50`      | `color.border.subtle` |        | `color.green.700`     |      |
| xs   | text  | green     | Light  | 16×16 | `color.green.50`      | `color.border.subtle` |        | `color.green.700`     |      |
| lg   | text  | green     | Dark   | 44×44 | `color.green.800`     | `color.border.subtle` |        | `color.green.100`     |      |
| lg   | text  | green     | Medium | 44×44 | `color.green.500`     | `color.border.subtle` |        | `color.green.50`      |      |
| md   | text  | green     | Dark   | 32×32 | `color.green.800`     | `color.border.subtle` |        | `color.green.100`     |      |
| md   | text  | green     | Medium | 32×32 | `color.green.500`     | `color.border.subtle` |        | `color.green.50`      |      |
| sm   | text  | green     | Dark   | 24×24 | `color.green.800`     | `color.border.subtle` |        | `color.green.100`     |      |
| sm   | text  | green     | Medium | 24×24 | `color.green.500`     | `color.border.subtle` |        | `color.green.50`      |      |
| xs   | text  | green     | Dark   | 16×16 | `color.green.800`     | `color.border.subtle` |        | `color.green.100`     |      |
| xs   | text  | green     | Medium | 16×16 | `color.green.500`     | `color.border.subtle` |        | `color.green.50`      |      |
| lg   | text  | turquoise | Light  | 44×44 | `color.turquoise.50`  | `color.border.subtle` |        | `color.turquoise.700` |      |
| md   | text  | turquoise | Light  | 32×32 | `color.turquoise.50`  | `color.border.subtle` |        | `color.turquoise.700` |      |
| sm   | text  | turquoise | Light  | 24×24 | `color.turquoise.50`  | `color.border.subtle` |        | `color.turquoise.700` |      |
| xs   | text  | turquoise | Light  | 16×16 | `color.turquoise.50`  | `color.border.subtle` |        | `color.turquoise.700` |      |
| lg   | text  | turquoise | Dark   | 44×44 | `color.turquoise.800` | `color.border.subtle` |        | `color.turquoise.100` |      |
| lg   | text  | turquoise | Medium | 44×44 | `color.turquoise.500` | `color.border.subtle` |        | `color.turquoise.50`  |      |
| md   | text  | turquoise | Dark   | 32×32 | `color.turquoise.800` | `color.border.subtle` |        | `color.turquoise.100` |      |
| md   | text  | turquoise | Medium | 32×32 | `color.turquoise.500` | `color.border.subtle` |        | `color.turquoise.50`  |      |
| sm   | text  | turquoise | Dark   | 24×24 | `color.turquoise.800` | `color.border.subtle` |        | `color.turquoise.100` |      |
| sm   | text  | turquoise | Medium | 24×24 | `color.turquoise.500` | `color.border.subtle` |        | `color.turquoise.50`  |      |
| xs   | text  | turquoise | Dark   | 16×16 | `color.turquoise.800` | `color.border.subtle` |        | `color.turquoise.100` |      |
| xs   | text  | turquoise | Medium | 16×16 | `color.turquoise.500` | `color.border.subtle` |        | `color.turquoise.50`  |      |
| lg   | text  | blue      | Light  | 44×44 | `color.blue.50`       | `color.border.subtle` |        | `color.blue.700`      |      |
| md   | text  | blue      | Light  | 32×32 | `color.blue.50`       | `color.border.subtle` |        | `color.blue.700`      |      |
| sm   | text  | blue      | Light  | 24×24 | `color.blue.50`       | `color.border.subtle` |        | `color.blue.700`      |      |
| xs   | text  | blue      | Light  | 16×16 | `color.blue.50`       | `color.border.subtle` |        | `color.blue.700`      |      |
| lg   | text  | blue      | Dark   | 44×44 | `color.blue.800`      | `color.border.subtle` |        | `color.blue.100`      |      |
| lg   | text  | blue      | Medium | 44×44 | `color.blue.500`      | `color.border.subtle` |        | `color.blue.50`       |      |
| md   | text  | blue      | Dark   | 32×32 | `color.blue.800`      | `color.border.subtle` |        | `color.blue.100`      |      |
| md   | text  | blue      | Medium | 32×32 | `color.blue.500`      | `color.border.subtle` |        | `color.blue.50`       |      |
| sm   | text  | blue      | Dark   | 24×24 | `color.blue.800`      | `color.border.subtle` |        | `color.blue.100`      |      |
| sm   | text  | blue      | Medium | 24×24 | `color.blue.500`      | `color.border.subtle` |        | `color.blue.50`       |      |
| xs   | text  | blue      | Dark   | 16×16 | `color.blue.800`      | `color.border.subtle` |        | `color.blue.100`      |      |
| xs   | text  | blue      | Medium | 16×16 | `color.blue.500`      | `color.border.subtle` |        | `color.blue.50`       |      |
| lg   | text  | purple    | Light  | 44×44 | `color.purple.50`     | `color.border.subtle` |        | `color.purple.700`    |      |
| md   | text  | purple    | Light  | 32×32 | `color.purple.50`     | `color.border.subtle` |        | `color.purple.700`    |      |
| sm   | text  | purple    | Light  | 24×24 | `color.purple.50`     | `color.border.subtle` |        | `color.purple.700`    |      |
| xs   | text  | purple    | Light  | 16×16 | `color.purple.50`     | `color.border.subtle` |        | `color.purple.700`    |      |
| lg   | text  | purple    | Dark   | 44×44 | `color.purple.800`    | `color.border.subtle` |        | `color.purple.100`    |      |
| lg   | text  | purple    | Medium | 44×44 | `color.purple.500`    | `color.border.subtle` |        | `color.purple.50`     |      |
| md   | text  | purple    | Dark   | 32×32 | `color.purple.800`    | `color.border.subtle` |        | `color.purple.100`    |      |
| md   | text  | purple    | Medium | 32×32 | `color.purple.500`    | `color.border.subtle` |        | `color.purple.50`     |      |
| sm   | text  | purple    | Dark   | 24×24 | `color.purple.800`    | `color.border.subtle` |        | `color.purple.100`    |      |
| sm   | text  | purple    | Medium | 24×24 | `color.purple.500`    | `color.border.subtle` |        | `color.purple.50`     |      |
| xs   | text  | purple    | Dark   | 16×16 | `color.purple.800`    | `color.border.subtle` |        | `color.purple.100`    |      |
| xs   | text  | purple    | Medium | 16×16 | `color.purple.500`    | `color.border.subtle` |        | `color.purple.50`     |      |
| lg   | text  | pink      | Light  | 44×44 | `color.pink.50`       | `color.border.subtle` |        | `color.pink.700`      |      |
| md   | text  | pink      | Light  | 32×32 | `color.pink.50`       | `color.border.subtle` |        | `color.pink.700`      |      |
| sm   | text  | pink      | Light  | 24×24 | `color.pink.50`       | `color.border.subtle` |        | `color.pink.700`      |      |
| xs   | text  | pink      | Light  | 16×16 | `color.pink.50`       | `color.border.subtle` |        | `color.pink.700`      |      |
| lg   | text  | pink      | Dark   | 44×44 | `color.pink.800`      | `color.border.subtle` |        | `color.pink.100`      |      |
| lg   | text  | pink      | Medium | 44×44 | `color.pink.500`      | `color.border.subtle` |        | `color.pink.50`       |      |
| md   | text  | pink      | Dark   | 32×32 | `color.pink.800`      | `color.border.subtle` |        | `color.pink.100`      |      |
| md   | text  | pink      | Medium | 32×32 | `color.pink.500`      | `color.border.subtle` |        | `color.pink.50`       |      |
| sm   | text  | pink      | Dark   | 24×24 | `color.pink.800`      | `color.border.subtle` |        | `color.pink.100`      |      |
| sm   | text  | pink      | Medium | 24×24 | `color.pink.500`      | `color.border.subtle` |        | `color.pink.50`       |      |
| xs   | text  | pink      | Dark   | 16×16 | `color.pink.800`      | `color.border.subtle` |        | `color.pink.100`      |      |
| xs   | text  | pink      | Medium | 16×16 | `color.pink.500`      | `color.border.subtle` |        | `color.pink.50`       |      |

### Issues detected

- Primitive color bound directly (CLR-002): `color.blue.500`, `color.blue.50`, `color.blue.800`, `color.green.500`, `color.green.50`, `color.green.800`, `color.neutral.400`, `color.neutral.50` … (+37 more).

## Documentation card

**Description**

User/entity avatar rendered as initials, photo, or logo. Color axis assigns a deterministic seed from the user's name.

**Modes**

Initials Default. 1–2 uppercase characters. Color seeded from user ID.  
Photo Uploaded image. Cropped to circle.  
Logo Company/team mark. Centered, not cropped.

**Dark**

Toggle Dark on when rendering on inverted surfaces (dark sidebars, photo headers). Swaps surface and text tokens for contrast.

**Color**

Neutral, Red, Orange, Yellow, Green, Turquoise, Blue, Purple, Pink.  
Seed from a stable hash of user ID — never random per render.

**Labels & Content**

Initials: 1–2 characters, uppercase (first letter of given name + family name).  
Strip diacritics; fall back to first two letters of display name.  
Always pair with aria-label containing the full user/entity name.

**Rules**

- DO: Seed color from a stable user ID hash
- DO: Use 1–2 uppercase initials
- DO: Provide aria-label with full name
- DO: Toggle Dark on inverted surfaces

- DON'T: Randomize color on each render
- DON'T: Stretch non-square photos
- DON'T: Use initials longer than 2 characters
- DON'T: Rely on color alone to distinguish users
