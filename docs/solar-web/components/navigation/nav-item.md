# Nav Item

> SOLAR Web · Figma page `↳ 🟢 Nav Item` (id `6481:69`) · section `components/navigation` · raw data: [`raw/components/navigation/nav-item.json`](../../raw/components/navigation/nav-item.json)

## Component set: Nav Item

Nav Item — generic interactive nav primitive used in both Sidebar and Top Bar (and any other nav surface).

Anatomy: 40×40 collapsed (icon-only) / full-width × 40 expanded (icon + label). 20×20 icon slot.

Variant axes (lowercase):
selected — true/false — drives outline (false) ↔ solid (true) icon swap
hover — true/false — hover background
expanded — true/false — collapsed (icon-only) vs expanded (icon + label)

Icon swap (two-property pattern, required by Figma constraint — see auto-memory feedback\_figma\_instance\_swap\_variant\_override.md):
iconOutline — INSTANCE\_SWAP. Bound to selected=false variants.
iconSolid — INSTANCE\_SWAP. Bound to selected=true variants.
Designers set BOTH to matching outline+solid pair of one Icon/\* metaphor.

Consumers: Sidebar (Layout & Shell), Top Bar (Layout & Shell). 540+ instances across views.

— KNOWN GAPS (1.0 promotion gate) —
Class D states incomplete. Per CLAUDE.md §7 Class D requires {default, hover, focus, disabled, selected} as MUTUALLY EXCLUSIVE states (single `state` axis with 5 values), but current structure has selected/hover as INDEPENDENT booleans. Adding focus+disabled as booleans would be conceptually wrong (32-variant matrix of misleading state combinations). Correct fix is a structural restructure to a single `state` axis — breaking change requiring instance-override migration script. Designer-led.

Optical fineness pass at 12/16/20px on icon ramps. Strokes scale mathematically (1.5px × scale = 0.75 at size=12) which is too thin for crisp small-size rendering. Each size needs hand-tuned per-size stroke weight. Designer-led.

Renamed from Sidebar Item 2026-05-04. Component key b7d724b6… preserved.

### Props

| Prop          | Type          | Options / default    |
| ------------- | ------------- | -------------------- |
| `selected`    | variant       | **false** · true     |
| `hover`       | variant       | **false** · true     |
| `expanded`    | variant       | **false** · true     |
| `label`       | text          | default `Label`      |
| `iconOutline` | instance swap | default `10148:6975` |
| `iconSolid`   | instance swap | default `10148:6976` |

Default variant: `selected=false, hover=false, expanded=false` · 8 variants · default size 40×40px

### Anatomy (default variant)

- **selected=false, hover=false, expanded=false** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
  itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
  - **Icon/Home** · instance of **Icon/Home** (solid=false) · FIXED/FIXED · 20×20  
    width `icon.md` · prop mainComponent←iconOutline

### Tokens used

| Role       | Tokens                                        |
| ---------- | --------------------------------------------- |
| Fills      | `color.surface.active`, `color.surface.hover` |
| Text color | `color.text.primary`, `color.text.secondary`  |
| Icon color | `color.icon.primary`, `color.icon.secondary`  |
| Spacing    | `inset.none`                                  |
| Radius     | `radius.control`                              |
| Sizes      | `icon.md`                                     |

### Slots and prop-controlled layers

| Layer     | Controlled property | Prop          |
| --------- | ------------------- | ------------- |
| Icon/Home | mainComponent       | `iconOutline` |

### Composes

- Icon/Home

### Variant matrix

| selected | hover | expanded | size   | fill                   | stroke | effect | text                   | icon                   |
| -------- | ----- | -------- | ------ | ---------------------- | ------ | ------ | ---------------------- | ---------------------- |
| false    | false | false    | 40×40  |                        |        |        |                        | `color.icon.secondary` |
| false    | false | true     | 182×40 |                        |        |        | `color.text.secondary` | `color.icon.secondary` |
| false    | true  | false    | 40×40  | `color.surface.hover`  |        |        |                        | `color.icon.primary`   |
| false    | true  | true     | 182×40 | `color.surface.hover`  |        |        | `color.text.primary`   | `color.icon.primary`   |
| true     | false | false    | 40×40  | `color.surface.active` |        |        |                        | `color.icon.primary`   |
| true     | false | true     | 182×40 | `color.surface.active` |        |        | `color.text.primary`   | `color.icon.primary`   |
| true     | true  | false    | 40×40  | `color.surface.active` |        |        |                        | `color.icon.primary`   |
| true     | true  | true     | 182×40 | `color.surface.active` |        |        | `color.text.primary`   | `color.icon.primary`   |

## Documentation card

**Usage**

Nav Item — generic interactive nav primitive used in both Sidebar and Top Bar (and any other nav surface). Anatomy: 40×40 collapsed (icon-only) / full-width × 40 expanded (icon + label). 20×20 icon slot. Designers set BOTH to matching outline+solid pair of one Icon/\* metaphor. Consumers: Sidebar (Layout & Shell), Top Bar (Layout & Shell). 540+ instances across views. — KNOWN GAPS (1.0 promotion gate) — Class D states incomplete. Per CLAUDE.md §7 Class D requires {default, hover, focus, disabled, selected} as MUTUALLY EXCLUSIVE states (single `state` axis with 5 values), but current structure has selected/hover as INDEPENDENT booleans. Correct fix is a structural restructure to a single `state` axis — breaking change requiring instance-override migration script. Designer-led. Optical fineness pass at 12/16/20px on icon ramps. Strokes scale mathematically (1.5px × scale = 0.75 at size=12) which is too thin for crisp small-size rendering. Each size needs hand-tuned per-size stroke weight. Designer-led. Renamed from Sidebar Item 2026-05-04. Component key b7d724b6… preserved.

**Anatomy**

Top-level layers of the first variant: Icon/Home. Instances keep their SOLAR component names.

**Specification**

8 variants.  
• selected — false | true  
• hover — false | true  
• expanded — false | true  
Props: label (text), iconOutline (instance swap), iconSolid (instance swap).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Variant axes (lowercase): selected — true/false — drives outline (false) ↔ solid (true) icon swap hover — true/false — hover background expanded — true/false — collapsed (icon-only) vs expanded (icon + label) Icon swap (two-property pattern, required by Figma constraint — see auto-memory feedback\_figma\_instance\_swap\_variant\_override.md): iconOutline — INSTANCE\_SWAP. Bound to selected=false variants. iconSolid — INSTANCE\_SWAP. Bound to selected=true variants. Adding focus+disabled as booleans would be conceptually wrong (32-variant matrix of misleading state combinations).
