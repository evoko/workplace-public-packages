# UserInitialsIcon

An avatar-style icon that displays a user's initials over a deterministic background color. The background and text colors are seeded by the user's `id` so the same user always receives the same color combination, regardless of name changes.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `randomcolor` >= 0.6.2

## Props

| Prop     | Type       | Default | Description                                                        |
| -------- | ---------- | ------- | ------------------------------------------------------------------ |
| `name`   | `string`   | —       | Full name; initials are derived from the first two words            |
| `id`     | `string`   | —       | Seed for deterministic background and text color                   |
| `width`  | `number`   | `40`    | Icon width in pixels                                               |
| `height` | `number`   | `40`    | Icon height in pixels                                              |
| `sx`     | `SxProps`  | —       | MUI `sx` style overrides                                           |
| `...`    | `BoxProps` | —       | All other MUI `Box` props are forwarded to the root element        |

## Basic Usage

```tsx
import { UserInitialsIcon } from '@bwp-web/components';

function MemberList() {
  return (
    <UserInitialsIcon name="Jane Doe" id="user-123" />
  );
}
```

## Custom Size

The font size scales proportionally with the icon dimensions (40% of the width by default).

```tsx
<UserInitialsIcon name="Jane Doe" id="user-123" width={64} height={64} />
```

## How Initials Are Derived

| Input                 | Initials |
| --------------------- | -------- |
| `"Jane Doe"`          | `JD`     |
| `"Alice"`             | `A`      |
| `"Three Word Name"`   | `TW`     |
| `"  Padded  Name  "` | `PN`     |
| `""`                  | `--`     |

- The name is trimmed and split on whitespace.
- The first character of the first two words is uppercased.
- An empty string falls back to `--`.

## Color Behavior

Colors are generated using the [`randomcolor`](https://github.com/davidmerfield/randomColor) library with the `id` prop as the seed:

- **Background** — `randomColor({ luminosity: 'light', seed: id })`
- **Text** — `darken(randomColor({ luminosity: 'dark', seed: id }), 0.3)` via MUI's `darken` utility

This means:

- The same `id` always produces the same color pair.
- Different names with the same `id` share the same colors.
- Different `id` values produce visually distinct colors.

## Storybook

Interactive demos are available in Storybook under **Components / UserInitialsIcon**:

- **Playground** — tweak props via controls
- **UserGrid** — gallery of sample users
- **Sizes** — proportional scaling from 24px to 96px
- **EdgeCases** — single word, three words, empty string, whitespace
- **ConsistentColors** — same `id` = same color regardless of name
