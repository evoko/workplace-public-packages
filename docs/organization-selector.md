# OrganizationSelector

A composable organization-switcher: container, list grouping, item row, trigger button, and a pre-positioned popover wrapper. The package owns the *shell* — layout, dimensions, scroll, dividers, accessibility. Consumers supply the data and the per-app decisions (which list scrolls, how the logo is rendered, where the trigger lives).

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.12
- `@bwp-web/assets` >= 1.0.2
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `OrganizationSelector`

Outer styled container — used inline (inside a sheet, drawer, etc.) or wrapped automatically by `OrganizationSelectorPopover`. Width capped at `min(370px, calc(100vw - 24px))`, height capped at `min(700px, 90vh)`, and `overflow: 'auto'` so long content scrolls inside the container. Extends MUI `StackProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Replaces children with a centered spinner |
| `children` | `React.ReactNode` | — | Content (typically one or more `OrganizationItemList`s + footer actions) |
| `sx` | `SxProps<Theme>` | — | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | — | All other MUI `Stack` props are forwarded |

### `OrganizationItemList`

Bordered list grouping. Auto-renders MUI `Divider`s between children and an optional labeled `Divider` below the list. Pass `maxHeight` to cap the list's height and enable list-level scrolling (sticky-footer pattern: only this list scrolls while footer/dividers stay anchored).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | `OrganizationItem` children — auto-divided |
| `label` | `React.ReactNode` | — | Renders a labeled `Divider` below the list (e.g. "Private organizations") |
| `maxHeight` | `number \| string` | — | Caps list height and enables vertical scrolling within the list |
| `sx` | `SxProps<Theme>` | — | MUI system styles passed to the underlying `List` |

### `OrganizationItem`

A single clickable row built on `ListItemButton`. Renders the logo (left), primary text + optional `meta` text (top-right), optional secondary text (below primary), and a trailing chevron. Extends MUI `ListItemButtonProps` — `onClick`, `component`, `to`, `href`, `disabled`, `selected`, `ref` all work natively.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `primaryText` | `React.ReactNode` | _(required)_ | Top-left text. Strings get default `body2` / `fontWeight: 600` / `color: 'primary'` styling; pass a node to override |
| `secondaryText` | `React.ReactNode` | — | Optional second line below `primaryText`. **No auto-prefix** — pass the full text you want (e.g. `` `ID: ${id}` ``) |
| `meta` | `React.ReactNode` | — | Optional right-side text on the same row as `primaryText` (e.g. a region tag) |
| `logo` | `React.ReactNode \| string` | — | Logo element (e.g. `<Avatar />`) or an image URL. Strings render as `<img>` filling the 40×40 logo box |
| `isCurrent` | `boolean` | `false` | Highlights the logo with an `info.main` ring, hides the trailing chevron, and disables interaction (without dimming — `'&.Mui-disabled': { opacity: 1 }` is overridden) |
| `sx` | `SxProps<Theme>` | — | MUI system styles passed to the underlying `ListItemButton` |
| _...rest_ | `ListItemButtonProps` | — | Forwarded to the underlying `ListItemButton` — use `component`, `to`, `href`, `onClick`, etc. |

### `OrganizationSelectorButton`

A minimal trigger intended to open `OrganizationSelectorPopover`. Renders `icon` inside a 20×20 fixed-size slot, then `name` in `caption` Typography (`fontWeight: 600`), then a trailing chevron that flips from `ChevronDownIcon` to `ChevronUpIcon` based on `open`. The text uses `noWrap` + `flexShrink: 0` so it never truncates or shrinks in tight flex containers. Extends `ButtonBaseProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | _(required)_ | Leading visual rendered inside a 20×20 fixed-size slot — typically an image of the current org's logo |
| `name` | `string` | _(required)_ | Text label rendered in `caption` variant with `fontWeight: 600`; never wraps or shrinks |
| `open` | `boolean` | `false` | When true, the trailing chevron switches from down to up |
| `sx` | `SxProps<Theme>` | — | MUI system styles passed to the underlying `ButtonBase` |
| _...rest_ | `ButtonBaseProps` | — | Forwarded to the underlying `ButtonBase` (e.g. `onClick`, `component`, `ref`) |

### `OrganizationSelectorPopover`

A `Popover` pre-positioned bottom-right of the anchor (`anchorOrigin: { vertical: 'bottom', horizontal: 'right' }`) with an 8px vertical offset (`transformOrigin: { vertical: -8, horizontal: 'right' }`) — both overridable. The popover's paper is transparent and shadowless; the visual chrome comes from the inner `OrganizationSelector` (rendered automatically around children).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | _(required)_ | Items rendered inside the wrapped `OrganizationSelector` |
| `loading` | `boolean` | `false` | Forwarded to the inner `OrganizationSelector`'s `loading` |
| _...rest_ | `PopoverProps` | — | Forwarded to MUI's `Popover` — `open`, `anchorEl`, `onClose`, etc. |

## Usage

### Header-Triggered Popover

The most common pattern — `OrganizationSelectorButton` in the header opens an `OrganizationSelectorPopover` anchored to itself:

```tsx
import { useState } from 'react';
import { Box, Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import {
  OrganizationItem,
  OrganizationItemList,
  OrganizationSelectorButton,
  OrganizationSelectorPopover,
} from '@bwp-web/components';

function OrgSwitcher({ orgs, currentOrgId }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const current = orgs.find((o) => o.id === currentOrgId);

  return (
    <>
      <OrganizationSelectorButton
        icon={
          <Box
            component="img"
            src={current.logo}
            sx={{ width: 20, height: 20, borderRadius: 0.5 }}
          />
        }
        name={current.name}
        open={open}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      />
      <OrganizationSelectorPopover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <OrganizationItemList maxHeight={400}>
          {orgs.map((org) => (
            <OrganizationItem
              key={org.id}
              primaryText={org.name}
              secondaryText={`ID: ${org.id}`}
              logo={org.logo}
              isCurrent={org.id === currentOrgId}
              component={RouterLink}
              to={`/org/${org.id}`}
              onClick={() => setAnchorEl(null)}
            />
          ))}
        </OrganizationItemList>
        <Divider sx={{ pt: 1, userSelect: 'none' }}>or</Divider>
        <Button variant="outlined" sx={{ mt: 1 }}>
          Manage organizations
        </Button>
      </OrganizationSelectorPopover>
    </>
  );
}
```

### Inline (Inside a Drawer, Sheet, etc.)

Use `OrganizationSelector` directly when you're already inside a positioned container:

```tsx
<Drawer open={open} onClose={() => setOpen(false)}>
  <OrganizationSelector loading={loading}>
    <OrganizationItemList label="Private organizations">
      {privateOrgs.map((org) => (
        <OrganizationItem
          key={org.id}
          primaryText={org.name}
          /* no secondaryText → no ID line */
          logo={<LockIcon />}
          isCurrent={org.id === currentOrgId}
          onClick={() => onSelect(org.id)}
        />
      ))}
    </OrganizationItemList>
    <OrganizationItemList maxHeight={400}>
      {sharedOrgs.map((org) => (
        <OrganizationItem
          key={org.id}
          primaryText={org.name}
          secondaryText={`ID: ${org.id}`}
          logo={org.logo}
          meta={org.region === 'EU' ? 'EU region' : undefined}
          isCurrent={org.id === currentOrgId}
          onClick={() => onSelect(org.id)}
        />
      ))}
    </OrganizationItemList>
  </OrganizationSelector>
</Drawer>
```

### Linking Items (React Router, plain anchor, onClick)

`OrganizationItem` extends `ListItemButtonProps`, so the standard MUI patterns work:

```tsx
{/* React Router */}
<OrganizationItem primaryText="Acme" component={RouterLink} to="/org/acme" />

{/* Plain anchor */}
<OrganizationItem primaryText="Acme" component="a" href={externalUrl} />

{/* onClick handler */}
<OrganizationItem primaryText="Acme" onClick={() => switchOrg('acme')} />

{/* Non-interactive current item */}
<OrganizationItem primaryText="Acme" isCurrent />
```

All four get hover state, focus rings, and keyboard activation from the underlying `ListItemButton`.

## Design Details

- **Container overflow safety net** — `OrganizationSelector` has `overflow: 'auto'` on its outer `Stack`, so content that exceeds `maxHeight` scrolls inside the container rather than overflowing visually.
- **List-level scroll is opt-in** — pass `maxHeight` to `OrganizationItemList` to enable the sticky-footer pattern (only that list scrolls; dividers and footer below stay pinned).
- **Logo rendering** — when `logo` is a string, it renders as `<img>` filling a 40×40 box with `objectFit: 'cover'`. When a `ReactNode`, it renders directly inside the box (custom Avatars, icons, etc.).
- **Current org treatment** — `isCurrent` does three things: rings the logo (`boxShadow: 0 0 0 2px info.main`), hides the chevron (`visibility: 'hidden'` — preserves layout space), and sets `disabled` on the underlying button. The disabled opacity is overridden to `1` so the row doesn't visually dim.
- **No auto-prefixes** — `secondaryText` is rendered as-is. The original "ID: ..." prefix is a consumer responsibility (`secondaryText={\`ID: ${id}\`}`).
- **Trigger button is minimal by design** — `OrganizationSelectorButton` has no padding, border, or background by default. The 20×20 icon slot and the no-shrink/no-wrap name are the only enforced properties. Style the rest via `sx`.

## Exports

- `OrganizationSelector` — Outer styled container; supports a `loading` spinner.
- `OrganizationItemList` — Bordered list grouping with auto-dividers and optional labeled divider.
- `OrganizationItem` — Single row built on `ListItemButton`; supports linking via `component`, `to`, `href`, `onClick`.
- `OrganizationSelectorButton` — Minimal `ButtonBase` trigger with `icon` + `name` + flipping chevron.
- `OrganizationSelectorPopover` — `Popover` pre-positioned bottom-right of the anchor, wrapping an `OrganizationSelector`.
